import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { gsap } from 'gsap';

export class RadioScene extends EventTarget {
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.isSpinning = false;
    this.recordSpeed = 0;
    this.speakerPulse = 0;
    this.screenInfo = { title: 'RETRO CYBER RADIO', artist: 'STANDBY', current: 0, duration: 0, playing: false };
    this.parallax = { x: 0, y: 0 };
    this.clickable = [];
    this.scene = new THREE.Scene();
    this.scene.background = null;
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    // A more frontal hero angle keeps the record circular instead of visibly squashed.
    this.camera.position.set(5.4, 5.7, 13.8);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.set(0, 2.35, 0);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    // Full product inspection: unrestricted azimuth for a complete 360° orbit;
    // keep only the poles blocked so the camera never flips upside-down.
    this.controls.minAzimuthAngle = -Infinity;
    this.controls.maxAzimuthAngle = Infinity;
    this.controls.minPolarAngle = 0.12;
    this.controls.maxPolarAngle = Math.PI - 0.12;
    this.controls.minDistance = 14.8;
    this.controls.maxDistance = 14.8;
    this.addLights();
    this.model = this.buildRadio();
    // Product-showcase default framing: leave generous breathing room around the radio.
    this.model.scale.setScalar(0.8);
    this.scene.add(this.model);
    this.addFloor();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    canvas.addEventListener('pointerup', (event) => this.pick(event));
    window.addEventListener('pointermove', (event) => {
      this.parallax.x = (event.clientX / window.innerWidth - 0.5) * 2;
      this.parallax.y = (event.clientY / window.innerHeight - 0.5) * 2;
    });
    window.addEventListener('resize', () => this.resize());
    this.resize();
    this.render();
  }

  addLights() {
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xdfe4ec, 2.5));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(6, 9, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -8; key.shadow.camera.right = 8;
    key.shadow.camera.top = 8; key.shadow.camera.bottom = -8;
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 1.5);
    fill.position.set(-6, 4, 4);
    this.scene.add(fill);
  }

  addFloor() {
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(2.8, 64),
      new THREE.MeshBasicMaterial({ color: 0x8594aa, transparent: true, opacity: 0.15, depthWrite: false })
    );
    shadow.name = 'ContactShadow'; shadow.scale.set(1.65, 0.46, 1); shadow.position.set(0, 0.1, 0); shadow.rotation.x = -Math.PI / 2; this.scene.add(shadow);
  }

  buildRadio() {
    const root = new THREE.Group();
    root.name = 'RetroCyberRadio';
    root.rotation.y = -0.14;
    const blue = new THREE.MeshPhysicalMaterial({ color: 0x155dea, roughness: 0.23, metalness: 0.16, clearcoat: 0.9, clearcoatRoughness: 0.11 });
    const blueDark = new THREE.MeshPhysicalMaterial({ color: 0x0d3eb9, roughness: 0.28, metalness: 0.16, clearcoat: 0.72 });
    const black = new THREE.MeshPhysicalMaterial({ color: 0x0b0d13, roughness: 0.25, metalness: 0.4, clearcoat: 0.3 });
    const interactiveBlue = new THREE.MeshPhysicalMaterial({ color: 0x1748a8, roughness: 0.18, metalness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08, emissive: 0x08245e, emissiveIntensity: 0.35 });
    const rubber = new THREE.MeshPhysicalMaterial({ color: 0x10131a, roughness: 0.58, metalness: 0.02, clearcoat: 0.12 });
    const brushedMetal = new THREE.MeshPhysicalMaterial({ color: 0xb5bdc8, metalness: 0.92, roughness: 0.3, clearcoat: 0.25, anisotropy: 0.45 });
    const metal = brushedMetal;
    const matteMetal = new THREE.MeshPhysicalMaterial({ color: 0x6e7787, metalness: 0.82, roughness: 0.42, clearcoat: 0.12 });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x9bd8ea, metalness: 0.02, roughness: 0.08, transmission: 0.22, transparent: true, opacity: 0.86, clearcoat: 1, ior: 1.45 });
    const gold = new THREE.MeshPhysicalMaterial({ color: 0xc99850, metalness: 0.72, roughness: 0.2 });
    const cyan = new THREE.MeshPhysicalMaterial({ color: 0x41e1ff, emissive: 0x1489a8, emissiveIntensity: 0, roughness: 0.2, transmission: 0.1, clearcoat: 0.65 });
    const makeBox = (name, size, position, material, radius = 0.08) => {
      const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 6, radius), material);
      mesh.name = name; mesh.position.set(...position); mesh.castShadow = mesh.receiveShadow = true;
      return mesh;
    };
    const makeCylinder = (name, radius, depth, position, material, rotation = [Math.PI / 2, 0, 0]) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, 64), material);
      mesh.name = name; mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = mesh.receiveShadow = true;
      return mesh;
    };
    const interactive = (mesh, action) => { mesh.userData.action = action; this.clickable.push(mesh); return mesh; };
    const addButtonIcon = (button, kind) => {
      const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 96;
      const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, 128, 96); ctx.strokeStyle = '#f4f7ff'; ctx.fillStyle = '#f4f7ff'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (kind === 'play') { ctx.beginPath(); ctx.moveTo(44, 20); ctx.lineTo(92, 48); ctx.lineTo(44, 76); ctx.closePath(); ctx.fill(); }
      if (kind === 'pause') { ctx.fillRect(38, 20, 14, 56); ctx.fillRect(76, 20, 14, 56); }
      if (kind === 'next') { ctx.beginPath(); ctx.moveTo(24, 20); ctx.lineTo(54, 48); ctx.lineTo(24, 76); ctx.stroke(); ctx.beginPath(); ctx.moveTo(58, 20); ctx.lineTo(88, 48); ctx.lineTo(58, 76); ctx.stroke(); ctx.beginPath(); ctx.moveTo(98, 18); ctx.lineTo(98, 78); ctx.stroke(); }
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
      // Keep the icon on a dedicated, slightly proud face so it cannot z-fight with the button shell.
      const icon = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.15), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
      icon.name = `${button.name}Icon`; icon.position.z = 0.082; icon.renderOrder = 10; button.add(icon);
      // Geometry fallback keeps the symbol legible even when a browser drops canvas textures.
      const iconMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      if (kind === 'play') {
        const shape = new THREE.Shape(); shape.moveTo(-0.045, -0.055); shape.lineTo(0.06, 0); shape.lineTo(-0.045, 0.055); shape.closePath();
        const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), iconMat); mesh.position.set(0, 0, 0.084); mesh.scale.setScalar(0.72); button.add(mesh);
      } else if (kind === 'pause') {
        [-0.03, 0.03].forEach((x) => { const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.022, 0.09), iconMat); mesh.position.set(x, 0, 0.084); button.add(mesh); });
      } else if (kind === 'next') {
        const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        const line = (points) => { const geometry = new THREE.BufferGeometry().setFromPoints(points.map(([x, y]) => new THREE.Vector3(x, y, 0.084))); const mesh = new THREE.Line(geometry, lineMat); button.add(mesh); };
        line([[-0.055, -0.05], [0, 0], [-0.055, 0.05]]); line([[0, -0.05], [0.055, 0], [0, 0.05]]); line([[0.075, -0.055], [0.075, 0.055]]);
      }
    };

    const body = makeBox('Body', [5.8, 4.25, 2.3], [0, 2.35, 0], blue, 0.3);
    root.add(body);
    root.add(makeBox('TopPanel', [4.7, 0.24, 1.75], [0, 4.58, 0], blueDark, 0.12));
    // Controlled assembly seams and molded ABS panel breaks.
    const seamMat = new THREE.MeshBasicMaterial({ color: 0x0a2b83, transparent: true, opacity: 0.42 });
    root.add(makeBox('BodySeamTop', [4.85, 0.025, 0.025], [0, 4.42, 1.17], seamMat, 0.01));
    root.add(makeBox('BodySeamRight', [0.025, 2.3, 0.025], [2.72, 2.45, 1.17], seamMat, 0.01));

    // Lift the FM display into the upper fascia so it no longer masks the transport row.
    this.screenFrame = makeBox('ScreenModule', [2.72, 1.03, 0.2], [-1.2, 4.02, 1.2], black, 0.15);
    this.screenGlow = makeBox('Screen', [2.3, 0.66, 0.025], [0, 0, 0.12], cyan, 0.05);
    this.screenGlass = makeBox('ScreenGlass', [2.34, 0.7, 0.018], [0, 0, 0.145], glass, 0.06);
    this.screenFrame.add(this.screenGlow, this.screenGlass); root.add(this.screenFrame);

    const displayCanvas = document.createElement('canvas'); displayCanvas.width = 512; displayCanvas.height = 160; this.displayCanvas = displayCanvas; this.displayCtx = displayCanvas.getContext('2d');
    const ctx = this.displayCtx; ctx.fillStyle = '#062436'; ctx.fillRect(0, 0, 512, 160); ctx.fillStyle = '#7cf0ff';
    ctx.font = 'bold 46px monospace'; ctx.fillText('FM  89.5', 28, 68); ctx.font = '22px monospace'; ctx.fillText('RETRO CYBER RADIO', 28, 120);
    const display = new THREE.Mesh(new THREE.PlaneGeometry(2.22, 0.62), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(displayCanvas), transparent: true, opacity: 0 }));
    display.position.z = 0.145; this.screenGlow.add(display); this.screenText = display;
    this.updateScreen();

    const record = new THREE.Group(); record.name = 'Record'; record.position.set(-0.86, 1.65, 1.43); root.add(record); this.record = record;
    record.add(makeCylinder('RecordBezel', 1.48, 0.13, [0, 0, -0.09], blueDark));
    record.add(makeCylinder('VinylDisc', 1.37, 0.085, [0, 0, 0.04], rubber));
    const label = makeCylinder('Label', 0.79, 0.095, [0, 0, 0.1], new THREE.MeshStandardMaterial({ color: 0xf8f9fc, roughness: 0.55 }));
    record.add(label); this.label = label;
    const artwork = new THREE.Mesh(new THREE.CircleGeometry(0.76, 64), new THREE.MeshBasicMaterial({ transparent: true }));
    artwork.name = 'AlbumArtwork'; artwork.position.z = 0.155; record.add(artwork); this.artwork = artwork;
    for (let index = 0; index < 4; index += 1) {
      const angle = index * Math.PI / 2 + 0.24;
      record.add(makeCylinder('RecordScrew', 0.055, 0.045, [Math.cos(angle) * 1.15, Math.sin(angle) * 1.15, 0.11], gold));
    }
    // The record is display/playback output only; it is intentionally not a click target.

    const tonearm = new THREE.Group(); tonearm.name = 'Tonearm'; tonearm.position.set(-2.17, 2.34, 1.58); root.add(tonearm); this.tonearm = tonearm;
    tonearm.add(makeCylinder('TonearmPivot', 0.18, 0.16, [0, 0, 0], black));
    tonearm.add(makeCylinder('TonearmHub', 0.1, 0.18, [0, 0, 0.085], gold));
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.04, 0.03, 0.13), new THREE.Vector3(0.55, -0.12, 0.15), new THREE.Vector3(1.15, -0.42, 0.15), new THREE.Vector3(1.45, -0.59, 0.15)]);
    tonearm.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 28, 0.036, 8, false), metal));
    tonearm.add(makeBox('Needle', [0.24, 0.15, 0.18], [1.5, -0.62, 0.15], black, 0.03));

    const tweeter = makeCylinder('Speaker', 0.76, 0.16, [1.73, 3.25, 1.19], black); root.add(tweeter); this.speaker = tweeter;
    root.add(makeCylinder('SpeakerBadge', 0.22, 0.18, [1.73, 3.25, 1.3], gold));
    const speakerRim = makeCylinder('SpeakerRim', 0.83, 0.05, [1.73, 3.25, 1.28], matteMetal); root.add(speakerRim);
    // A dedicated, visible control strip sits between the display and record.
    const panel = new THREE.Group(); panel.name = 'ControlPanel'; panel.position.set(-1.2, 3.38, 1.2); root.add(panel);
    const controls = [
      ['PowerButton', -1.02, 0, 'PowerButton'], ['PlayButton', -0.42, 0, 'PlayButton'], ['PauseButton', 0.08, 0, 'PauseButton'], ['NextButton', 0.58, 0, 'NextButton']
    ];
    controls.forEach(([name, x, y, action]) => {
      const material = name === 'PowerButton' ? gold : interactiveBlue;
      const button = interactive(makeBox(name, [0.38, 0.25, 0.13], [x, y, 0], material, 0.045), action);
      button.userData.interactiveMaterial = material;
      if (action === 'PlayButton') addButtonIcon(button, 'play'); if (action === 'PauseButton') addButtonIcon(button, 'pause'); if (action === 'NextButton') addButtonIcon(button, 'next'); panel.add(button);
    });
    // Volume is intentionally controlled by the right-side slider; remove the old decorative knob.

    const door = interactive(makeBox('SideDoor', [1.08, 1.9, 0.19], [2.42, 1.72, 1.19], blue, 0.12), 'SideDoor'); root.add(door);
    door.add(makeBox('DoorInset', [0.62, 1.35, 0.025], [0, 0, 0.11], blueDark, 0.08));
    [-0.63, 0.63].forEach((y) => door.add(makeCylinder('DoorHinge', 0.1, 0.27, [-0.61, y, 0.05], blueDark, [0, 0, 0])));
    // Right-side profile pass: recessed service door, vertical rails and latch details.
    const sideShell = makeBox('RightSideShell', [0.16, 3.1, 1.92], [2.94, 2.25, 0], blueDark, 0.12); root.add(sideShell);
    sideShell.add(makeBox('RightSideInset', [0.045, 1.85, 1.22], [0.09, -0.08, 0], blue, 0.1));
    sideShell.add(makeBox('RightSideRecess', [0.035, 1.35, 0.72], [0.115, -0.12, 0], blueDark, 0.08));
    const sideRailMat = new THREE.MeshPhysicalMaterial({ color: 0x2647c8, roughness: 0.2, metalness: 0.2, clearcoat: 0.75 });
    [-0.68, 0.68].forEach((y, index) => sideShell.add(makeCylinder(`RightSideRail_${index + 1}`, 0.07, 1.75, [0.13, y, 0], sideRailMat, [0, 0, 0])));
    sideShell.add(makeBox('RightSideLatch', [0.06, 0.28, 0.22], [0.16, -0.95, 0], gold, 0.04));
    sideShell.add(makeBox('RightSideIndicator', [0.055, 0.42, 0.06], [0.16, 0.72, 0], cyan, 0.02));

    const screwMat = new THREE.MeshPhysicalMaterial({ color: 0xbfc6d1, metalness: 0.95, roughness: 0.28, clearcoat: 0.2 });
    [[-2.42, 4.04], [2.42, 4.04], [-2.42, 0.7], [2.42, 0.7]].forEach(([x, y], index) => root.add(makeCylinder(`BodyScrew_${index + 1}`, 0.07, 0.035, [x, y, 1.18], screwMat)));
    const labelCanvas = document.createElement('canvas'); labelCanvas.width = 512; labelCanvas.height = 128;
    const labelCtx = labelCanvas.getContext('2d'); labelCtx.fillStyle = '#e7edf5'; labelCtx.fillRect(0, 0, 512, 128); labelCtx.fillStyle = '#18316a'; labelCtx.font = 'bold 34px sans-serif'; labelCtx.fillText('RETRO CYBER RADIO', 26, 48); labelCtx.font = '20px monospace'; labelCtx.fillText('ABS / 10W / 3000mAh  •  RCR-01', 26, 90);
    const labelTexture = new THREE.CanvasTexture(labelCanvas); labelTexture.colorSpace = THREE.SRGBColorSpace;
    const productLabel = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.36), new THREE.MeshBasicMaterial({ map: labelTexture })); productLabel.name = 'ProductSpecificationLabel'; productLabel.position.set(0.45, 0.55, 1.19); root.add(productLabel);

    const antenna = new THREE.Group(); antenna.name = 'Antenna'; antenna.position.set(-2.2, 4.7, 0); root.add(antenna);
    antenna.add(makeCylinder('AntennaBase', 0.12, 0.22, [0, 0, 0], black, [0, 0, 0]));
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 1.8, 12), metal); rod.position.y = 0.9; antenna.add(rod);
    // Top-right headphone stand and wearable headphones, derived from the supplied reference.
    const headsetGold = new THREE.MeshPhysicalMaterial({ color: 0xc18c2b, metalness: 0.82, roughness: 0.17, clearcoat: 0.7 });
    const headsetBlack = new THREE.MeshPhysicalMaterial({ color: 0x151923, metalness: 0.2, roughness: 0.32, clearcoat: 0.45 });
    const headsetRed = new THREE.MeshPhysicalMaterial({ color: 0xa72d43, metalness: 0.35, roughness: 0.2, clearcoat: 0.75 });
    const stand = new THREE.Group(); stand.name = 'HeadphoneStand'; stand.position.set(1.35, 4.62, 0.05); root.add(stand);
    stand.add(makeCylinder('HeadphoneStandBase', 0.32, 0.16, [0, -0.08, 0], headsetGold, [Math.PI / 2, 0, 0]));
    stand.add(makeCylinder('HeadphoneStandPost', 0.08, 1.05, [0, 0.44, 0], headsetGold, [0, 0, 0]));
    stand.add(makeCylinder('HeadphoneStandTop', 0.18, 0.24, [0, 0.98, 0], headsetGold, [Math.PI / 2, 0, 0]));
    const headphones = new THREE.Group(); headphones.name = 'Headphones'; headphones.position.set(1.35, 5.48, 0.05); root.add(headphones);
    // Front-view arch: the ear cups sit at both ends of the band and face each other inward.
    const bandCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.66, 0, 0), new THREE.Vector3(-0.56, 0.56, 0), new THREE.Vector3(0, 0.82, 0), new THREE.Vector3(0.56, 0.56, 0), new THREE.Vector3(0.66, 0, 0)]);
    headphones.add(new THREE.Mesh(new THREE.TubeGeometry(bandCurve, 32, 0.07, 12, false), headsetBlack));
    [-0.62, 0.62].forEach((x, index) => {
      const cup = new THREE.Group(); cup.name = index === 0 ? 'HeadphoneLeftEarCup' : 'HeadphoneRightEarCup'; cup.position.set(x, 0, 0.02); headphones.add(cup);
      // Cylinders are rotated so their cushion faces point inward toward the listener/centerline.
      cup.rotation.y = index === 0 ? Math.PI / 2 : -Math.PI / 2;
      cup.add(makeCylinder(index === 0 ? 'HeadphoneLeftHousing' : 'HeadphoneRightHousing', 0.3, 0.22, [0, 0, 0], headsetRed, [0, Math.PI / 2, 0]));
      cup.add(makeCylinder(index === 0 ? 'HeadphoneLeftPad' : 'HeadphoneRightPad', 0.22, 0.24, [index === 0 ? 0.12 : -0.12, 0, 0], headsetBlack, [0, Math.PI / 2, 0]));
      cup.add(makeCylinder(index === 0 ? 'HeadphoneLeftAccent' : 'HeadphoneRightAccent', 0.13, 0.26, [index === 0 ? 0.16 : -0.16, 0, 0], headsetGold, [0, Math.PI / 2, 0]));
    });
    const rear = makeBox('RearPanel', [4.72, 2.65, 0.16], [0, 2.5, -1.18], blueDark, 0.1); root.add(rear);
    for (let x = -1.7; x <= 1.7; x += 0.27) for (let y = 1.6; y <= 3.25; y += 0.23) rear.add(makeBox('Vent', [0.15, 0.05, 0.02], [x, y - 2.5, -0.1], black, 0));
    root.userData.parts = ['Body', 'Record', 'Tonearm', 'PowerButton', 'PlayButton', 'PauseButton', 'NextButton', 'VolumeKnob'];
    return root;
  }

  pick(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.clickable, true)[0];
    if (!hit) return;
    let target = hit.object;
    while (target && !target.userData.action) target = target.parent;
    if (target?.userData.action) {
      gsap.timeline().to(target.scale, { x: 0.88, y: 0.88, z: 0.88, duration: 0.08 }).to(target.scale, { x: 1, y: 1, z: 1, duration: 0.2, ease: 'back.out(2)' });
      this.dispatchEvent(new CustomEvent('partclick', { detail: target.userData.action }));
    }
  }

  setLabel(track) {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = track.accent; ctx.fillRect(0, 0, 512, 512);
      ctx.save(); ctx.beginPath(); ctx.arc(256, 256, 232, 0, Math.PI * 2); ctx.clip();
      const scale = Math.max(512 / image.width, 512 / image.height); const w = image.width * scale; const h = image.height * scale;
      ctx.drawImage(image, (512 - w) / 2, (512 - h) / 2, w, h); ctx.restore();
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
      this.artwork.material.map = texture; this.artwork.material.needsUpdate = true;
    };
    image.onerror = () => { if (track.localCover && image.src !== new URL(track.localCover, location.href).href) image.src = track.localCover; };
    image.src = track.cover;
  }

  powerOn() {
    return new Promise((resolve) => {
      const button = this.model.getObjectByName('PowerButton');
      gsap.timeline({ onComplete: resolve })
        .to(button.position, { z: -0.06, duration: 0.12, yoyo: true, repeat: 1 })
        .to(this.screenGlow.material, { emissiveIntensity: 1.5, duration: 0.28 }, '<0.04')
        .to(this.screenText.material, { opacity: 1, duration: 0.32 }, '<0.1');
    });
  }

  powerOff() { this.isSpinning = false; gsap.to(this, { recordSpeed: 0, duration: 0.7, ease: 'power2.out' }); gsap.to(this.speaker.scale, { x: 1, y: 1, z: 1, duration: 0.35 }); gsap.to(this.screenText.material, { opacity: 0, duration: 0.2 }); gsap.to(this.screenGlow.material, { emissiveIntensity: 0, duration: 0.2 }); }
  dropNeedle() { return gsap.to(this.tonearm.rotation, { z: -0.3, duration: 0.8, ease: 'power2.out' }); }
  liftNeedle() { return gsap.to(this.tonearm.rotation, { z: 0, duration: 0.65, ease: 'power2.inOut' }); }
  setSpinning(value) { this.isSpinning = value; this.screenInfo.playing = value; this.updateScreen(); gsap.to(this, { recordSpeed: value ? 0.055 : 0, duration: value ? 0.45 : 0.8, ease: 'power2.out' }); if (value) this.dropNeedle(); else this.liftNeedle(); }
  setTrackInfo(track) { this.screenInfo.title = track.title; this.screenInfo.artist = track.artist; this.updateScreen(); }
  updateScreen() {
    if (!this.displayCtx) return;
    const ctx = this.displayCtx; ctx.fillStyle = '#062436'; ctx.fillRect(0, 0, 512, 160); ctx.fillStyle = '#7cf0ff';
    ctx.font = 'bold 30px monospace'; ctx.fillText(this.screenInfo.title.slice(0, 22), 24, 42); ctx.font = '18px monospace'; ctx.fillText(this.screenInfo.artist.slice(0, 28), 24, 70); ctx.textAlign = 'right'; ctx.font = 'bold 16px monospace'; ctx.fillText(this.screenInfo.playing ? 'PLAYING' : 'PAUSED', 488, 28); ctx.textAlign = 'left';
    ctx.fillStyle = '#9feaff'; ctx.font = '16px monospace'; const now = `${Math.floor(this.screenInfo.current / 60)}:${String(Math.floor(this.screenInfo.current % 60)).padStart(2, '0')}`; const total = this.screenInfo.duration ? `${Math.floor(this.screenInfo.duration / 60)}:${String(Math.floor(this.screenInfo.duration % 60)).padStart(2, '0')}` : '--:--'; ctx.fillText(`${now} / ${total}`, 24, 98);
    ctx.strokeStyle = '#64d9f2'; ctx.lineWidth = 3; for (let i = 0; i < 34; i += 1) { const x = 24 + i * 13.5; const h = 7 + ((i * 17 + Math.floor(this.screenInfo.current * 9)) % 20); ctx.beginPath(); ctx.moveTo(x, 138); ctx.lineTo(x, 138 - h); ctx.stroke(); }
    if (this.screenText?.material) this.screenText.material.map.needsUpdate = true;
  }
  resize() { const { clientWidth, clientHeight } = this.canvas; this.camera.aspect = clientWidth / clientHeight; this.camera.updateProjectionMatrix(); this.renderer.setSize(clientWidth, clientHeight, false); }
  render() {
    requestAnimationFrame(() => this.render());
    const elapsed = this.clock.getElapsedTime();
    this.record.rotation.z -= this.recordSpeed;
    if (this.isSpinning) { const pulse = 1 + Math.sin(elapsed * 18) * 0.012; this.speaker.scale.set(pulse, pulse, pulse); }
    const idleY = Math.sin(elapsed * Math.PI * 2 / 7) * 0.045;
    const idleX = Math.sin(elapsed * Math.PI * 2 / 7 + 0.8) * 0.0035;
    this.model.position.y = -0.2 + Math.sin(elapsed * Math.PI * 2 / 7) * 0.035;
    this.model.rotation.x = idleX + this.parallax.y * 0.035;
    this.model.rotation.y = -0.3 + idleY + this.parallax.x * 0.087;
    this.controls.update(); this.renderer.render(this.scene, this.camera);
  }
  exportGLB() { const exporter = new GLTFExporter(); exporter.parse(this.model, (result) => { const blob = new Blob([result], { type: 'model/gltf-binary' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'retro-cyber-radio.glb'; link.click(); URL.revokeObjectURL(link.href); }, (error) => console.error(error), { binary: true }); }
}
