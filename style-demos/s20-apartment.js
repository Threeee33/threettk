const loading = document.querySelector('#scene-message');
const errorMessage = document.querySelector('#scene-error');
const controls = [...document.querySelectorAll('[data-action], #period-toggle, #motion-toggle')].filter(element => element.tagName === 'BUTTON');

async function openApartment() {
  const THREE = await import('./vendor/three.module.min.js');
  const canvas = document.querySelector('#scene-canvas');
  const container = document.querySelector('#scene-wrap');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  const room = new THREE.Group();
  scene.add(room);
  const camera = new THREE.OrthographicCamera(-8, 8, 6, -6, .1, 100);
  camera.position.set(17, 15, 20);
  camera.lookAt(5.2, 1, 2.8);
  camera.updateMatrixWorld();
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const materials = new Map();
  function material(color) {
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: .92 }));
    return materials.get(color);
  }
  function box(parent, x, y, z, width, height, depth, color, cast = true) {
    const mesh = new THREE.Mesh(cube, typeof color === 'string' ? material(color) : color);
    mesh.position.set(x, y, z);
    mesh.scale.set(width, height, depth);
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function cylinder(parent, x, y, z, top, bottom, height, color, segments = 8) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, segments), typeof color === 'string' ? material(color) : color);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function group(parent, x = 0, y = 0, z = 0) {
    const result = new THREE.Group();
    result.position.set(x, y, z);
    parent.add(result);
    return result;
  }
  function texture(width, height, paint) {
    const source = document.createElement('canvas');
    source.width = width;
    source.height = height;
    paint(source.getContext('2d'), width, height);
    const result = new THREE.CanvasTexture(source);
    result.colorSpace = THREE.SRGBColorSpace;
    result.magFilter = THREE.NearestFilter;
    result.minFilter = THREE.NearestFilter;
    return result;
  }
  function picture(parent, x, y, z, width, height, map, rotation = 0) {
    const frame = group(parent, x, y, z);
    frame.rotation.y = rotation;
    box(frame, 0, 0, 0, width + .12, height + .12, .09, '#775e46');
    const image = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map }));
    image.position.z = .051;
    frame.add(image);
    return frame;
  }
  function plant(parent, x, y, z, scale = 1, potColor = '#ba7556') {
    const plantGroup = group(parent, x, y, z);
    plantGroup.scale.setScalar(scale);
    cylinder(plantGroup, 0, .21, 0, .24, .17, .42, potColor);
    cylinder(plantGroup, 0, .425, 0, .205, .205, .02, '#5c4d3b');
    box(plantGroup, 0, .76, 0, .055, .68, .055, '#637246');
    const leaves = [[-.22, .73, 0, -.6], [.2, .98, .06, .7], [-.13, 1.22, -.06, -.45], [.12, 1.42, 0, .4]];
    leaves.forEach(([lx, ly, lz, angle], index) => {
      const leaf = box(plantGroup, lx, ly, lz, .36, .14, .25, ['#667853', '#778a59', '#87996c', '#6b8359'][index]);
      leaf.rotation.z = angle;
    });
    return plantGroup;
  }

  const ambient = new THREE.HemisphereLight('#fff1d8', '#888574', 2.7);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight('#fff0d1', 3.3);
  sun.position.set(7, 11, 7);
  sun.target.position.set(4, 0, 2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 9, bottom: -9, near: .5, far: 35 });
  sun.shadow.normalBias = .035;
  sun.shadow.bias = -.0003;
  sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight('#cededd', .65);
  fill.position.set(-4, 5, 7);
  scene.add(fill);
  const shadowGround = new THREE.Mesh(new THREE.PlaneGeometry(32, 28), new THREE.ShadowMaterial({ color: '#5a4b37', opacity: .13 }));
  shadowGround.rotation.x = -Math.PI / 2;
  shadowGround.position.set(5, -.31, 3);
  shadowGround.receiveShadow = true;
  scene.add(shadowGround);

  box(room, 4, -.14, 3.2, 8.16, .3, 6.56, '#8a6950');
  box(room, 4, -.025, 3.2, 8.08, .1, 6.48, '#b78d64');
  const wood = ['#bd976b', '#c6a378', '#bc9469', '#d0ad80', '#c29c70', '#c7a477'];
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 8; col++) {
      const x = col + .5;
      box(room, x, .04, row * .4 + .2, .985, .045, .387, wood[(row * 5 + col * 3 + Math.floor(row / 2)) % wood.length], false);
    }
  }
  box(room, 4, 1.72, -.075, 8.16, 3.45, .15, '#c1c7b5');
  box(room, -.075, 1.72, 3.2, .15, 3.45, 6.55, '#ded6c6');
  box(room, 4, 3.48, -.075, 8.21, .1, .23, '#e6e1d4');
  box(room, -.075, 3.48, 3.2, .23, .1, 6.6, '#e6e1d4');
  box(room, 4, .17, .03, 8, .2, .07, '#8e947f');
  box(room, .03, .17, 3.2, .07, .2, 6.4, '#b8ad99');

  const dayWindow = texture(128, 128, context => {
    context.fillStyle = '#d4dfd4'; context.fillRect(0, 0, 128, 128);
    context.fillStyle = '#f5deb2'; context.fillRect(88, 17, 17, 17);
    const buildings = [[0, 60, 24, '#b1c4bd'], [22, 77, 25, '#a2b5ae'], [53, 43, 32, '#a4bbb5'], [87, 68, 23, '#b3c4b9'], [107, 51, 21, '#91aaa4']];
    buildings.forEach(([x, y, width, color]) => {
      context.fillStyle = color; context.fillRect(x, y, width, 128 - y);
      context.fillStyle = '#c9d5c5';
      for (let wx = x + 5; wx < x + width - 3; wx += 9) for (let wy = y + 8; wy < 124; wy += 14) context.fillRect(wx, wy, 3, 6);
    });
  });
  const nightWindow = texture(128, 128, context => {
    context.fillStyle = '#283d4c'; context.fillRect(0, 0, 128, 128);
    context.fillStyle = '#f3db9d'; context.fillRect(87, 17, 15, 15);
    context.fillStyle = '#283d4c'; context.fillRect(92, 13, 14, 14);
    context.fillStyle = '#8d9c9b'; [[13, 19], [51, 13], [34, 41], [111, 42]].forEach(([x, y]) => context.fillRect(x, y, 2, 2));
    [[0, 60, 24], [22, 77, 25], [53, 43, 32], [87, 68, 23], [107, 51, 21]].forEach(([x, y, width], index) => {
      context.fillStyle = index % 2 ? '#354a51' : '#41555b'; context.fillRect(x, y, width, 128 - y);
      for (let wx = x + 5; wx < x + width - 3; wx += 9) for (let wy = y + 8; wy < 124; wy += 14) {
        context.fillStyle = (wx + wy) % 3 ? '#e1b477' : '#5b6869'; context.fillRect(wx, wy, 3, 6);
      }
    });
  });
  box(room, 2.07, 2.38, .07, 2.6, 1.84, .12, '#eee6d6');
  const windowMaterial = new THREE.MeshBasicMaterial({ map: dayWindow });
  const windowPane = new THREE.Mesh(new THREE.PlaneGeometry(2.38, 1.62), windowMaterial);
  windowPane.position.set(2.07, 2.38, .137);
  room.add(windowPane);
  box(room, 2.07, 2.38, .18, .055, 1.67, .07, '#f0e9db');
  box(room, 2.07, 2.38, .18, 2.43, .055, .07, '#f0e9db');
  box(room, 2.07, 1.48, .2, 2.85, .1, .4, '#e8dfca');
  for (let index = 0; index < 3; index++) {
    box(room, .67 + index * .09, 2.4, .23 + index % 2 * .04, .09, 2.0, .13, index % 2 ? '#d1c3a8' : '#e8dec9');
    box(room, 3.27 + index * .09, 2.4, .23 + index % 2 * .04, .09, 2.0, .13, index % 2 ? '#d1c3a8' : '#e8dec9');
  }
  cylinder(room, 2.07, 3.46, .25, .025, .025, 2.98, '#8c765b').rotation.z = Math.PI / 2;

  const art = texture(80, 112, context => {
    context.fillStyle = '#ecdfc4'; context.fillRect(0, 0, 80, 112);
    context.fillStyle = '#b96947'; context.fillRect(30, 16, 25, 25);
    context.fillStyle = '#657866'; context.fillRect(5, 59, 70, 34); context.fillRect(15, 51, 46, 9);
    context.fillStyle = '#a0ab8b'; context.fillRect(0, 71, 43, 25);
    context.fillStyle = '#6d624d'; context.fillRect(15, 102, 49, 2);
  });
  picture(room, .06, 2.39, 3.17, .85, 1.19, art, Math.PI / 2);
  picture(room, .06, 2.17, 4.44, .47, .66, texture(48, 64, context => {
    context.fillStyle = '#ede6d4'; context.fillRect(0, 0, 48, 64);
    context.fillStyle = '#899477'; context.fillRect(12, 18, 25, 30);
    context.fillStyle = '#cfb391'; context.fillRect(5, 40, 32, 12);
  }), Math.PI / 2);

  const bed = group(room, 1.95, 0, 2.55);
  box(bed, 0, .33, 0, 2.25, .45, 3.8, '#8c6b50');
  [[-.93, -1.63], [.93, -1.63], [-.93, 1.63], [.93, 1.63]].forEach(([x, z]) => box(bed, x, .15, z, .15, .3, .15, '#71563f'));
  box(bed, 0, .79, -1.86, 2.28, 1.24, .17, '#8f7456');
  for (let index = 0; index < 7; index++) box(bed, -.91 + index * .3, .87, -1.755, .025, .89, .02, '#a88b69', false);
  box(bed, 0, .65, 0, 2.19, .24, 3.63, '#e4ddc9');
  box(bed, 0, .83, -1.22, 1.13, .21, .63, '#f3ebd9');
  box(bed, -.18, .941, -1.21, .045, .015, .55, '#dbd1bd', false);
  const duvet = group(bed, 0, .89, .58);
  box(duvet, 0, 0, 0, 2.22, .24, 2.37, '#728575');
  box(duvet, 0, .13, -.99, 2.23, .055, .34, '#b5c0a7');
  for (let index = 0; index < 7; index++) box(duvet, -.97 + index * .32, .126, .03, .025, .006, 1.89, '#98a58b', false);
  for (let index = 0; index < 5; index++) box(duvet, 0, .13, -.71 + index * .41, 2.2, .007, .023, '#95a28a', false);
  box(bed, 0, .84, 1.55, 2.23, .11, .48, '#bcaa86');
  for (let index = 0; index < 12; index++) box(bed, -1.02 + index * .18, .69, 1.81, .025, .26, .025, '#bdab89', false);

  box(room, 3.64, .4, 1.03, .81, .77, .75, '#9c7b58');
  box(room, 3.64, .81, 1.03, .87, .09, .8, '#b49971');
  box(room, 3.64, .55, 1.415, .66, .24, .025, '#a68a66');
  box(room, 3.64, .55, 1.44, .1, .035, .04, '#554f42');
  box(room, 3.59, .91, 1.06, .43, .07, .35, '#d7c6a6');
  box(room, 3.59, .96, 1.06, .43, .025, .35, '#8c9b89');
  cylinder(room, 3.68, 1.02, .99, .14, .17, .09, '#817158');
  cylinder(room, 3.68, 1.25, .99, .025, .025, .45, '#817158');
  const shadeMaterial = new THREE.MeshStandardMaterial({ color: '#ecd9b2', emissive: '#eab979', emissiveIntensity: .12, roughness: 1 });
  cylinder(room, 3.68, 1.52, .99, .22, .32, .35, shadeMaterial);
  const bedsideLight = new THREE.PointLight('#ffc07a', .1, 4.5, 2);
  bedsideLight.position.set(3.68, 1.5, 1.18);
  scene.add(bedsideLight);

  const desk = group(room, 5.97, 0, 1.44);
  box(desk, 0, 1.23, 0, 2.94, .15, 1.37, '#a68661');
  box(desk, 0, 1.315, 0, 2.97, .04, 1.39, '#c0a17a');
  [[-1.24, -.49], [1.24, -.49], [-1.24, .49], [1.24, .49]].forEach(([x, z]) => box(desk, x, .63, z, .095, 1.2, .095, '#46564f'));
  box(desk, 1.04, .94, -.02, .62, .45, 1.1, '#bc9e78');
  box(desk, 1.04, .94, .545, .19, .04, .025, '#655f4d');
  box(desk, -.15, 1.365, .05, 1.57, .023, .99, '#566c61');
  box(desk, -.1, 1.405, -.3, .57, .045, .35, '#333e3b');
  box(desk, -.1, 1.63, -.39, .1, .44, .09, '#3e4942');
  box(desk, -.1, 1.99, -.44, 1.47, .92, .11, '#313d38');
  const codeMap = texture(192, 112, context => {
    context.fillStyle = '#263c38'; context.fillRect(0, 0, 192, 112);
    context.fillStyle = '#38514b'; context.fillRect(0, 0, 192, 12); context.fillRect(0, 12, 29, 100);
    context.fillStyle = '#c79473'; context.fillRect(5, 4, 4, 4);
    context.fillStyle = '#c1bb85'; context.fillRect(13, 4, 4, 4);
    context.fillStyle = '#8eaf95'; context.fillRect(21, 4, 4, 4);
    context.font = '8px monospace';
    const lines = ['const home = {', '  mood: "peaceful",', '  dog: "dreaming",', '  coffee: true', '};', '', 'while (inspired) {', '  makeSomething();', '}'];
    lines.forEach((line, index) => {
      context.fillStyle = '#799184'; context.fillText(String(index + 1), 14, 24 + index * 9);
      context.fillStyle = ['#bac69c', '#a2baaa', '#d6b08b'][index % 3]; context.fillText(line, 35, 24 + index * 9);
    });
  });
  const screenMaterial = new THREE.MeshBasicMaterial({ map: codeMap });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.34, .78), screenMaterial);
  screen.position.set(-.1, 2.01, -.379);
  desk.add(screen);
  const cursor = box(desk, .06, 1.72, -.374, .018, .045, .008, new THREE.MeshBasicMaterial({ color: '#d5dbb8' }), false);
  box(desk, -.16, 1.404, .4, .89, .07, .31, '#e2dac6');
  for (let row = 0; row < 3; row++) for (let col = 0; col < 10; col++) box(desk, -.55 + col * .084, 1.445, .304 + row * .085, .06, .02, .056, col === 0 ? '#9caa94' : '#eee7d4', false);
  box(desk, .54, 1.41, .38, .12, .085, .19, '#ded5bf');
  cylinder(desk, 1.1, 1.53, .23, .13, .115, .38, '#c58a63');
  cylinder(desk, 1.1, 1.728, .23, .107, .107, .009, '#564237');
  box(desk, 1.248, 1.54, .23, .065, .21, .09, '#c58a63');
  box(desk, 1.24, 1.54, .23, .05, .11, .1, '#c0a17a', false);
  box(desk, -.99, 1.37, .04, .48, .055, .63, '#b77e61');
  box(desk, -.99, 1.405, .04, .43, .02, .58, '#e4d7bb');
  box(desk, -.91, 1.425, .06, .018, .018, .31, '#536755', false);

  const chair = group(room, 5.88, 0, 2.76);
  box(chair, 0, .82, 0, .79, .18, .76, '#5d7167');
  box(chair, 0, 1.16, .34, .78, .68, .13, '#61796c');
  box(chair, 0, .42, 0, .09, .7, .09, '#4b544b');
  box(chair, 0, .13, 0, .96, .07, .12, '#4b544b');
  box(chair, 0, .13, 0, .12, .07, .93, '#4b544b');
  [[-.41, 0], [.41, 0], [0, -.4], [0, .4]].forEach(([x, z]) => box(chair, x, .09, z, .12, .13, .12, '#3f4942'));

  box(room, 5.84, 2.94, .29, 2.88, .11, .5, '#9b815f');
  const bookColors = ['#927560', '#c1b495', '#5f7669', '#bba57e', '#a56e51', '#d6c6a7'];
  bookColors.forEach((color, index) => box(room, 4.65 + index * .14, 3.18 + index % 2 * .035, .29, .105, .38 + index % 2 * .07, .29, color));
  plant(room, 6.92, 3.0, .27, .31, '#d2bf9c');
  box(room, 6.11, 3.08, .3, .43, .12, .31, '#b1896c');
  box(room, 6.11, 3.165, .3, .38, .05, .31, '#dbc9aa');
  box(room, 4.06, 2.28, .06, .35, .42, .025, '#e8dabc', false);
  box(room, 4.06, 2.5, .077, .13, .06, .015, '#bba278', false);
  for (let index = 0; index < 3; index++) box(room, 4.06, 2.38 - index * .09, .078, .2 - index * .025, .013, .009, '#b4a48b', false);

  box(room, 4.8, .082, 4.47, 3.05, .025, 2.55, '#c8ad83', false);
  box(room, 4.8, .098, 4.47, 2.82, .011, 2.32, '#c0a278', false);
  for (let index = 0; index < 14; index++) {
    box(room, 3.48 + index * .205, .099, 3.105, .03, .013, .23, '#c8ad83', false);
    box(room, 3.48 + index * .205, .099, 5.825, .03, .013, .23, '#c8ad83', false);
  }
  plant(room, .64, .07, 5.55, 1.07, '#b87957');
  box(room, 1.49, .095, 5.66, .56, .055, .4, '#6b7e70');
  box(room, 1.47, .134, 5.68, .53, .035, .36, '#d4c2a2');

  const balcony = group(room, 8, 0, 0);
  box(balcony, 1.4, -.14, 2.8, 2.8, .29, 5.65, '#92988a');
  const tiles = ['#b9b9a6', '#b0b3a0', '#bfc0ad'];
  for (let x = 0; x < 4; x++) for (let z = 0; z < 8; z++) box(balcony, .35 + x * .7, .025, .35 + z * .7, .68, .06, .68, tiles[(x + z * 2) % 3], false);
  box(balcony, .025, .08, 2.8, .1, .08, 5.6, '#747d6d');
  const railColor = '#52655c';
  box(balcony, 2.77, 1.16, 2.8, .085, .085, 5.65, railColor);
  box(balcony, 2.77, .28, 2.8, .055, .055, 5.6, railColor);
  for (let index = 0; index <= 12; index++) box(balcony, 2.77, .7, index * .46, .035, .92, .035, railColor);
  for (const z of [0, 5.6]) {
    box(balcony, 1.4, 1.16, z, 2.85, .085, .085, railColor);
    box(balcony, 1.4, .28, z, 2.8, .055, .055, railColor);
    for (let index = 0; index <= 6; index++) box(balcony, .05 + index * .45, .7, z, .035, .92, .035, railColor);
  }
  for (const z of [.03, 1.5]) box(balcony, -.02, 1.72, z, .09, 3.44, .085, '#657569');
  box(balcony, -.02, 3.42, .76, .09, .1, 1.55, '#657569');
  box(balcony, -.02, .13, .76, .09, .1, 1.55, '#657569');
  const glass = new THREE.MeshStandardMaterial({ color: '#b0c9bc', transparent: true, opacity: .14, roughness: .3, depthWrite: false });
  box(balcony, -.015, 1.75, .76, .025, 3.23, 1.39, glass, false);
  box(balcony, .05, 1.35, 1.35, .035, .27, .045, '#bdbda3');
  plant(balcony, 1.98, .055, .58, .87, '#ab8e6e');
  box(balcony, 1.98, .26, 4.98, .95, .43, .64, '#a88761');
  box(balcony, 1.98, .486, 4.98, .83, .015, .53, '#6b6049', false);
  for (let index = 0; index < 5; index++) {
    const stem = box(balcony, 1.65 + index * .16, .71 + index % 2 * .08, 4.97, .08, .47, .16, ['#708058', '#8f9a6b', '#647854'][index % 3]);
    stem.rotation.z = (index - 2) * .14;
  }
  cylinder(balcony, 1.46, .38, 1.82, .24, .28, .66, '#928c75');
  cylinder(balcony, 1.46, .75, 1.82, .37, .37, .07, '#baa888');
  cylinder(balcony, 1.46, .818, 1.82, .12, .1, .055, '#63756a');

  const dog = group(room, 4.79, .11, 4.7);
  box(dog, 0, .07, 0, 1.96, .15, 1.32, '#807e64');
  box(dog, 0, .15, 0, 1.8, .13, 1.16, '#ded1ae');
  box(dog, 0, .2, 0, 1.55, .1, .93, '#c9bc98');
  const dogChest = group(dog, .15, .22, -.03);
  box(dogChest, 0, .2, 0, .92, .37, .63, '#bb8c59');
  box(dogChest, 0, .32, -.04, .71, .2, .53, '#cba574');
  box(dogChest, -.28, .13, .25, .29, .17, .32, '#e6cf9c');
  box(dog, -.46, .43, .14, .49, .38, .46, '#cfa774');
  box(dog, -.46, .36, .42, .36, .21, .2, '#eddbb4');
  box(dog, -.46, .415, .533, .14, .075, .055, '#514839');
  box(dog, -.69, .4, .17, .14, .32, .27, '#8b6948');
  box(dog, -.23, .4, .17, .13, .31, .27, '#a97b50');
  for (const x of [-.59, -.33]) box(dog, x, .5, .379, .09, .025, .018, '#5c4b36', false);
  box(dog, -.6, .24, .48, .28, .12, .29, '#e4cba0');
  box(dog, -.23, .24, .45, .24, .12, .29, '#dfc599');
  box(dog, .7, .38, -.04, .2, .2, .55, '#cfa873');
  box(dog, .62, .39, .27, .35, .19, .2, '#e9d4a9');

  const sleepMap = texture(32, 32, context => {
    context.fillStyle = '#8a9b80'; context.font = 'bold 26px monospace'; context.fillText('z', 7, 25);
  });
  const sleepSigns = [];
  for (let index = 0; index < 3; index++) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: sleepMap, transparent: true, opacity: .6, depthWrite: false }));
    sprite.scale.setScalar(.24 + index * .05);
    sprite.position.set(4.2 + index * .13, 1.1 + index * .29, 4.72);
    room.add(sprite);
    sleepSigns.push(sprite);
  }

  function person(pose) {
    const actor = group(room);
    const skin = '#d5a783', hair = '#3e3830', shirt = '#526d67', pants = '#b6a98d';
    const sitting = pose === 'code';
    const torsoHeight = sitting ? 1.28 : 1.23;
    box(actor, 0, torsoHeight, 0, .62, .68, .4, shirt);
    box(actor, 0, torsoHeight - .34, 0, .63, .08, .42, '#435e58');
    box(actor, 0, torsoHeight + .42, .01, .22, .2, .24, skin);
    const head = group(actor, 0, torsoHeight + .78, .015);
    box(head, 0, 0, 0, .61, .57, .52, skin);
    box(head, 0, .27, -.025, .65, .19, .57, hair);
    box(head, 0, .12, -.245, .63, .31, .12, hair);
    box(head, -.285, .1, 0, .1, .29, .5, hair);
    box(head, .285, .13, -.02, .1, .24, .48, hair);
    box(head, -.16, .17, .265, .27, .13, .055, hair);
    box(head, .095, .205, .265, .23, .07, .055, hair);
    box(head, -.33, -.01, .015, .085, .16, .15, skin);
    box(head, .33, -.01, .015, .085, .16, .15, skin);
    for (const x of [-.13, .13]) {
      box(head, x, .005, .27, pose === 'sleep' ? .095 : .045, pose === 'sleep' ? .022 : .055, .018, '#443e34', false);
      if (pose !== 'sleep') {
        box(head, x, .07, .284, .18, .026, .025, '#535248', false);
        box(head, x, -.075, .284, .18, .021, .025, '#535248', false);
        for (const side of [-1, 1]) box(head, x + side * .085, -.002, .284, .019, .15, .025, '#535248', false);
      }
    }
    if (pose !== 'sleep') box(head, 0, .025, .285, .1, .022, .022, '#535248', false);
    box(head, 0, -.055, .295, .065, .075, .065, '#c99876', false);
    box(head, 0, -.18, .274, .075, .023, .02, '#93654f', false);
    for (const side of [-1, 1]) {
      if (sitting) {
        box(actor, side * .18, .9, .18, .26, .26, .57, pants);
        box(actor, side * .18, .59, .4, .25, .54, .25, pants);
        box(actor, side * .18, .3, .47, .28, .17, .41, '#5e6151');
      } else {
        box(actor, side * .17, .5, 0, .27, .78, .3, pants);
        if (pose !== 'sleep') box(actor, side * .17, .1, .09, .31, .18, .43, '#555e50');
      }
    }
    const hands = [];
    if (sitting) {
      for (const side of [-1, 1]) {
        box(actor, side * .39, 1.36, .04, .19, .38, .25, shirt);
        const forearm = group(actor, side * .38, 1.36, .29);
        box(forearm, 0, 0, 0, .18, .18, .36, shirt);
        box(forearm, 0, -.02, .23, .16, .13, .15, skin);
        hands.push(forearm);
      }
    } else if (pose === 'smoke') {
      box(actor, -.4, 1.12, .01, .18, .59, .23, shirt);
      box(actor, -.4, .79, .01, .17, .18, .2, skin);
      box(actor, .39, 1.27, .03, .2, .5, .23, shirt);
      const arm = box(actor, .37, 1.54, .24, .18, .19, .45, shirt);
      arm.rotation.x = -.7;
      box(actor, .33, 1.74, .39, .15, .17, .16, skin);
      box(actor, .28, 1.8, .56, .03, .032, .23, '#e9dfc7');
      box(actor, .28, 1.8, .683, .032, .034, .029, new THREE.MeshBasicMaterial({ color: '#ce885a' }));
    } else {
      for (const side of [-1, 1]) {
        box(actor, side * .39, 1.2, .03, .18, .56, .24, shirt);
        box(actor, side * .39, .88, .03, .16, .17, .2, skin);
      }
    }
    return { actor, head, hands };
  }
  const coding = person('code');
  coding.actor.position.set(5.88, .035, 2.77);
  coding.actor.rotation.y = Math.PI;
  const sleeping = person('sleep');
  sleeping.actor.position.set(1.95, 1.095, 3.34);
  sleeping.actor.rotation.x = -Math.PI / 2;
  sleeping.actor.visible = false;
  const smoking = person('smoke');
  smoking.actor.position.set(9.93, .06, 3.04);
  smoking.actor.rotation.y = Math.PI / 2;
  smoking.actor.visible = false;
  const smokePuffs = [];
  for (let index = 0; index < 7; index++) {
    const puffMaterial = new THREE.MeshBasicMaterial({ color: '#d9d6c4', transparent: true, opacity: .16, depthWrite: false });
    const puff = box(smoking.actor, .28, 1.85, .7, .06, .06, .06, puffMaterial, false);
    smokePuffs.push(puff);
  }
  const monitorLight = new THREE.PointLight('#b4d6bd', .08, 3, 2);
  monitorLight.position.set(5.87, 2.0, 1.78);
  scene.add(monitorLight);
  const nightFill = new THREE.PointLight('#efbb7b', 0, 8, 2);
  nightFill.position.set(3, 3.2, 3.5);
  scene.add(nightFill);

  let action = 'code';
  let night = false;
  let paused = false;
  let visible = true;
  let lostContext = false;
  let animationTime = 0;
  let frameId = 0;
  let lastTime = 0;
  let lastPaint = 0;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionPreference.matches;
  const captions = {
    code: '键盘轻响，咖啡还温着。狗狗正在旁边做梦。',
    sleep: '暂时下线，把今天交给柔软的被子。狗狗也没醒。',
    smoke: '去阳台抽支烟，看一会儿城市。狗狗还在原地熟睡。'
  };
  function animate(time) {
    const breathe = Math.sin(time * 1.7);
    dogChest.scale.y = 1 + breathe * .045;
    coding.head.rotation.x = -.06 + Math.sin(time * .7) * .018;
    coding.hands.forEach((hand, index) => { hand.position.y = 1.36 + Math.sin(time * 12 + index * Math.PI) * .022; });
    duvet.position.y = action === 'sleep' ? 1.04 : .89;
    duvet.scale.y = action === 'sleep' ? 2.4 + breathe * .045 : 1;
    cursor.visible = Math.floor(time * 1.6) % 2 === 0;
    sleepSigns.forEach((sign, index) => {
      sign.position.y = 1.03 + index * .28 + Math.sin(time * .8 + index) * .05;
      sign.material.opacity = .48 + Math.sin(time * .8 + index) * .16;
    });
    smokePuffs.forEach((puff, index) => {
      const phase = (time * .19 + index / smokePuffs.length) % 1;
      puff.position.set(.28 + Math.sin(phase * 5 + index) * phase * .12, 1.86 + phase * 1.15, .7 + phase * .24);
      puff.scale.setScalar(.035 + phase * .11);
      puff.material.opacity = (1 - phase) * .2;
      puff.rotation.set(phase, phase * 2, phase * .8);
    });
  }
  function isAnimating() { return !paused && !reducedMotion; }
  function requestRender() {
    if (!frameId && visible && !document.hidden && !lostContext) frameId = requestAnimationFrame(render);
  }
  function render(now) {
    frameId = 0;
    if (!visible || document.hidden || lostContext) { lastTime = 0; return; }
    if (isAnimating() && now - lastPaint < 1000 / 30) { requestRender(); return; }
    if (isAnimating() && lastTime) animationTime += Math.min((now - lastTime) / 1000, .1);
    lastTime = now;
    lastPaint = now;
    animate(animationTime);
    renderer.render(scene, camera);
    if (isAnimating()) requestRender();
  }
  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    const scale = Math.min(1.35, 1100 / width);
    renderer.setSize(Math.round(width * scale), Math.round(height * scale), false);
    const bounds = new THREE.Box3(new THREE.Vector3(-.4, -.4, -.3), new THREE.Vector3(11.2, 3.85, 6.75));
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
      const point = new THREE.Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse);
      minX = Math.min(minX, point.x); maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y); maxY = Math.max(maxY, point.y);
    }
    const aspect = width / height;
    const halfHeight = Math.max((maxY - minY) / 2, (maxX - minX) / (2 * aspect)) * 1.035;
    const centerX = (minX + maxX) / 2, centerY = (minY + maxY) / 2;
    camera.left = centerX - halfHeight * aspect;
    camera.right = centerX + halfHeight * aspect;
    camera.top = centerY + halfHeight;
    camera.bottom = centerY - halfHeight;
    camera.updateProjectionMatrix();
    requestRender();
  }
  function changeAction(nextAction) {
    action = nextAction;
    coding.actor.visible = action === 'code';
    sleeping.actor.visible = action === 'sleep';
    smoking.actor.visible = action === 'smoke';
    document.body.dataset.action = action;
    document.querySelectorAll('button[data-action]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.action === action)));
    document.querySelector('#stage-caption').textContent = captions[action];
    canvas.setAttribute('aria-label', `固定斜俯视角的都市公寓，包含床、书桌和露天阳台。${captions[action]}`);
    renderer.shadowMap.needsUpdate = true;
    requestRender();
  }
  document.querySelectorAll('button[data-action]').forEach(button => button.addEventListener('click', () => changeAction(button.dataset.action)));
  document.querySelector('#period-toggle').addEventListener('click', event => {
    night = !night;
    document.body.dataset.period = night ? 'night' : 'day';
    event.currentTarget.setAttribute('aria-pressed', String(night));
    event.currentTarget.textContent = night ? '切换日景' : '切换夜景';
    ambient.color.set(night ? '#a2bbce' : '#fff1d8');
    ambient.groundColor.set(night ? '#666e73' : '#888574');
    ambient.intensity = night ? .74 : 2.7;
    sun.color.set(night ? '#bbcddd' : '#fff0d1');
    sun.intensity = night ? .48 : 3.3;
    fill.intensity = night ? .32 : .65;
    bedsideLight.intensity = night ? 5 : .1;
    nightFill.intensity = night ? 4 : 0;
    monitorLight.intensity = night ? 1.4 : .08;
    shadeMaterial.emissiveIntensity = night ? 1.25 : .12;
    windowMaterial.map = night ? nightWindow : dayWindow;
    shadowGround.material.opacity = night ? .21 : .13;
    renderer.toneMappingExposure = night ? 1.3 : 1.2;
    renderer.shadowMap.needsUpdate = true;
    requestRender();
  });
  const pauseButton = document.querySelector('#motion-toggle');
  function updateMotionControl() {
    pauseButton.setAttribute('aria-pressed', String(paused || reducedMotion));
    pauseButton.textContent = reducedMotion ? '已跟随系统静止' : paused ? '播放动态' : '暂停动态';
    pauseButton.disabled = reducedMotion;
    lastTime = 0;
    requestRender();
  }
  pauseButton.addEventListener('click', () => { paused = !paused; updateMotionControl(); });
  motionPreference.addEventListener('change', event => {
    reducedMotion = event.matches;
    updateMotionControl();
  });
  document.addEventListener('visibilitychange', () => { lastTime = 0; requestRender(); });
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    lastTime = 0;
    requestRender();
  }, { threshold: .02 });
  observer.observe(container);
  new ResizeObserver(resize).observe(container);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    lostContext = true;
    controls.forEach(button => { button.disabled = true; });
    errorMessage.textContent = '图形渲染暂时中断，请刷新页面重新打开房间。';
    errorMessage.hidden = false;
  });
  function updateClock() {
    document.querySelector('#local-time').textContent = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  }
  updateClock();
  setInterval(updateClock, 30000);
  controls.forEach(button => { button.disabled = false; });
  updateMotionControl();
  changeAction('code');
  resize();
  renderer.shadowMap.needsUpdate = true;
  animate(0);
  renderer.render(scene, camera);
  loading.hidden = true;
  canvas.dataset.ready = 'true';
  requestRender();
}

openApartment().catch(error => {
  console.error('Apartment preview could not start:', error);
  loading.hidden = true;
  errorMessage.hidden = false;
  controls.forEach(button => { button.disabled = true; });
});
