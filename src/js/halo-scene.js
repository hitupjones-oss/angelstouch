import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * "The Circle of Care" — four sculpted pillars (Activities, Dining, Living spaces, Memory care)
 * resting on a glowing halo, a nod to the halo in the Angels Touch logo.
 */

const C = {
  blue: 0x2b59c3,
  blueDeep: 0x1a3778,
  blueSoft: 0x9db8ee,
  porcelain: 0xfaf8f4,
  ivory: 0xf3ead8,
  sunrise: 0xf2a97f,
  coral: 0xe9765f,
  gold: 0xe9c47a,
  sage: 0x8fae93,
  rose: 0xe7a3b0,
  wood: 0x8a5a3b,
};

const RADIUS = 2.15;

const mat = (color, o = {}) =>
  new THREE.MeshPhysicalMaterial({ color, roughness: 0.38, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.25, ...o });

/* ── Pillar sculptures ───────────────────────────────────── */

function makePalette() {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(0.05, -0.62);
  s.bezierCurveTo(0.62, -0.66, 0.92, -0.2, 0.84, 0.22);
  s.bezierCurveTo(0.76, 0.64, 0.2, 0.78, -0.3, 0.66);
  s.bezierCurveTo(-0.78, 0.55, -0.92, 0.08, -0.74, -0.24);
  s.bezierCurveTo(-0.62, -0.46, -0.42, -0.4, -0.3, -0.26);
  s.bezierCurveTo(-0.2, -0.14, -0.06, -0.2, -0.1, -0.36);
  s.bezierCurveTo(-0.14, -0.52, -0.16, -0.6, 0.05, -0.62);
  const hole = new THREE.Path();
  hole.absellipse(-0.42, 0.18, 0.13, 0.11, 0, Math.PI * 2, true);
  s.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.035, bevelSegments: 6, curveSegments: 48 });
  geo.center();
  const board = new THREE.Mesh(geo, mat(C.ivory, { roughness: 0.5, clearcoat: 0.3, sheen: 0.4 }));
  g.add(board);
  const dabs = [
    [C.blue, 0.2, 0.42],
    [C.sunrise, 0.52, 0.18],
    [C.gold, 0.5, -0.22],
    [C.sage, 0.16, -0.38],
    [C.rose, -0.16, 0.46],
  ];
  dabs.forEach(([color, x, y], i) => {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.13 + (i % 2) * 0.02, 32, 16), mat(color, { roughness: 0.22, clearcoat: 1 }));
    d.scale.set(1, 1, 0.42);
    d.position.set(x, y, 0.08);
    g.add(d);
  });
  // Brush resting across the board
  const brush = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 1.15, 24), mat(C.blueDeep, { clearcoat: 1, roughness: 0.2 }));
  const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.048, 0.16, 24), mat(0xc9ced8, { metalness: 0.9, roughness: 0.25 }));
  ferrule.position.y = 0.65;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.22, 24), mat(C.sunrise, { roughness: 0.6, clearcoat: 0 }));
  tip.position.y = 0.84;
  brush.add(handle, ferrule, tip);
  brush.rotation.z = -1.05;
  brush.rotation.x = 0.2;
  brush.position.set(-0.05, 0.02, 0.22);
  g.add(brush);
  g.rotation.x = -0.55;
  g.scale.setScalar(0.92);
  return g;
}

function makeApple() {
  const g = new THREE.Group();
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const a = t * Math.PI;
    // apple profile: wider shoulders, dimpled top & bottom
    const r = Math.sin(a) * (0.58 + 0.1 * Math.sin(a * 1.0 + 0.6)) * (1 - 0.18 * Math.pow(Math.cos(a), 8));
    const y = -Math.cos(a) * 0.56 + 0.06 * Math.sin(a * 2);
    pts.push(new THREE.Vector2(Math.max(0.001, r), y));
  }
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), mat(C.coral, { roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.6, sheenColor: new THREE.Color(C.sunrise) }));
  g.add(body);
  const stemCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.46, 0), new THREE.Vector3(0.02, 0.62, 0), new THREE.Vector3(0.08, 0.74, 0)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 16, 0.025, 12), mat(C.wood, { clearcoat: 0, roughness: 0.7 })));
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.bezierCurveTo(0.12, 0.1, 0.3, 0.12, 0.42, 0);
  leafShape.bezierCurveTo(0.3, -0.1, 0.12, -0.1, 0, 0);
  const leaf = new THREE.Mesh(
    new THREE.ExtrudeGeometry(leafShape, { depth: 0.01, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3, curveSegments: 24 }),
    mat(C.sage, { roughness: 0.45 }),
  );
  leaf.position.set(0.05, 0.66, 0);
  leaf.rotation.set(0.3, -0.4, 0.45);
  g.add(leaf);
  return g;
}

function makeHouse() {
  const g = new THREE.Group();
  const wall = mat(C.porcelain, { roughness: 0.55, clearcoat: 0.2 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.68, 0.78, 1, 1, 1), wall);
  body.position.y = -0.1;
  g.add(body);
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-0.62, 0);
  roofShape.lineTo(0, 0.48);
  roofShape.lineTo(0.62, 0);
  roofShape.lineTo(-0.62, 0);
  const roof = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roofShape, { depth: 0.92, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 4 }),
    mat(C.blue, { roughness: 0.3, clearcoat: 1 }),
  );
  roof.position.set(0, 0.22, -0.46);
  g.add(roof);
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.12), wall);
  chimney.position.set(0.3, 0.5, -0.12);
  g.add(chimney);
  const glow = new THREE.MeshStandardMaterial({ color: 0xffe2b8, emissive: 0xffc98f, emissiveIntensity: 1.6, roughness: 0.4 });
  [-0.27, 0.27].forEach((x) => {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.02), glow);
    w.position.set(x, -0.02, 0.4);
    g.add(w);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.015), mat(C.blueDeep, { clearcoat: 0.6 }));
    frame.position.set(x, -0.02, 0.394);
    g.add(frame);
  });
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.34, 0.03), mat(C.blueDeep, { clearcoat: 1, roughness: 0.25 }));
  door.position.set(0, -0.27, 0.4);
  g.add(door);
  const lawn = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.86, 0.08, 48), mat(C.sage, { roughness: 0.8, clearcoat: 0 }));
  lawn.position.y = -0.48;
  g.add(lawn);
  g.rotation.y = -0.45;
  g.scale.setScalar(0.92);
  return g;
}

function makeHeart() {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(0, -0.5);
  s.bezierCurveTo(-0.15, -0.36, -0.68, -0.1, -0.68, 0.22);
  s.bezierCurveTo(-0.68, 0.52, -0.42, 0.66, -0.22, 0.62);
  s.bezierCurveTo(-0.08, 0.6, 0, 0.48, 0, 0.38);
  s.bezierCurveTo(0, 0.48, 0.08, 0.6, 0.22, 0.62);
  s.bezierCurveTo(0.42, 0.66, 0.68, 0.52, 0.68, 0.22);
  s.bezierCurveTo(0.68, -0.1, 0.15, -0.36, 0, -0.5);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.13, bevelSegments: 14, curveSegments: 64 });
  geo.center();
  const heart = new THREE.Mesh(geo, mat(C.blue, { roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, iridescence: 0.35, iridescenceIOR: 1.3, sheen: 0.4, sheenColor: new THREE.Color(C.blueSoft) }));
  g.add(heart);
  // Little memories orbiting the heart
  const sparks = new THREE.Group();
  const sparkMat = new THREE.MeshStandardMaterial({ color: C.gold, emissive: C.gold, emissiveIntensity: 0.9, roughness: 0.3 });
  for (let i = 0; i < 7; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.035 + (i % 3) * 0.012, 16, 8), sparkMat);
    const a = (i / 7) * Math.PI * 2;
    m.position.set(Math.cos(a) * 0.95, Math.sin(a * 2) * 0.2, Math.sin(a) * 0.95);
    sparks.add(m);
  }
  sparks.rotation.x = 0.35;
  g.add(sparks);
  g.userData.spin = sparks;
  return g;
}

/* ── Soft textures ───────────────────────────────────────── */

function radialTexture(inner, outer, size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, inner);
  grd.addColorStop(1, outer);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ── Scene ───────────────────────────────────────────────── */

export function createHaloScene(canvas, { onSelect, reduced = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 1.55, 8.8);
  camera.lookAt(0, 0.15, 0);

  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0xf6e3d3, 0.7));
  const key = new THREE.DirectionalLight(0xfff1e2, 1.6);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9db8ee, 1.2);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  const world = new THREE.Group();
  world.rotation.x = 0.16;
  scene.add(world);
  const halo = new THREE.Group();
  world.add(halo);

  // Halo ring + soft glow ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(RADIUS, 0.03, 24, 240),
    new THREE.MeshStandardMaterial({ color: 0xffe9c2, emissive: C.gold, emissiveIntensity: 1.1, roughness: 0.3, metalness: 0.4 }),
  );
  ring.rotation.x = Math.PI / 2;
  halo.add(ring);
  const glowRing = new THREE.Mesh(
    new THREE.TorusGeometry(RADIUS, 0.16, 16, 200),
    new THREE.MeshBasicMaterial({ color: C.gold, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  glowRing.rotation.x = Math.PI / 2;
  halo.add(glowRing);

  // Twinkling light motes along the halo
  const COUNT = 420;
  const pos = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = RADIUS + (Math.random() - 0.5) * 0.5;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 0.35;
    pos[i * 3 + 2] = Math.sin(a) * r;
    seed[i] = Math.random();
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const pMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPixel: { value: renderer.getPixelRatio() } },
    vertexShader: /* glsl */ `
      attribute float seed; uniform float uTime; uniform float uPixel; varying float vA;
      void main(){
        vec3 p = position; p.y += sin(uTime*0.8 + seed*12.0)*0.05;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        gl_Position = projectionMatrix * mv;
        vA = 0.35 + 0.65*abs(sin(uTime*(0.6+seed) + seed*20.0));
        gl_PointSize = (4.0 + seed*7.0) * uPixel * (6.0 / -mv.z);
      }`,
    fragmentShader: /* glsl */ `
      varying float vA;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(1.0, 0.86, 0.6, a*vA*0.9);
      }`,
  });
  halo.add(new THREE.Points(pGeo, pMat));

  // Floor shadow
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(7.5, 7.5),
    new THREE.MeshBasicMaterial({ map: radialTexture('rgba(43,89,195,0.16)', 'rgba(43,89,195,0)'), transparent: true, depthWrite: false }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.95;
  world.add(floor);

  // Pillars
  const makers = [makePalette, makeApple, makeHouse, makeHeart];
  const glowTex = radialTexture('rgba(255,236,200,0.9)', 'rgba(255,236,200,0)');
  const pillars = makers.map((make, i) => {
    const holder = new THREE.Group();
    const a = (i / makers.length) * Math.PI * 2;
    holder.position.set(Math.sin(a) * RADIUS, 0, Math.cos(a) * RADIUS);
    const model = make();
    holder.add(model);
    const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    aura.scale.set(2.4, 2.4, 1);
    aura.position.z = -0.3;
    holder.add(aura);
    holder.userData = { index: i, angle: a, model, aura, hover: 0, active: 0 };
    halo.add(holder);
    return holder;
  });

  /* — State — */
  let active = 0;
  let target = 0; // target rotation of halo
  let rot = 0;
  let velocity = 0;
  let dragging = false;
  let dragX = 0;
  let pointer = new THREE.Vector2(0, 0);
  let tilt = new THREE.Vector2(0, 0);
  let hovered = -1;
  const raycaster = new THREE.Raycaster();

  const angleFor = (i) => -(i / pillars.length) * Math.PI * 2;
  const nearest = (r) => {
    const step = (Math.PI * 2) / pillars.length;
    return ((Math.round(-r / step) % pillars.length) + pillars.length) % pillars.length;
  };

  function setActive(i, { silent = false } = {}) {
    // choose the shortest way around the circle
    const base = angleFor(i);
    const turns = Math.round((rot - base) / (Math.PI * 2));
    target = base + turns * Math.PI * 2;
    active = i;
    if (!silent) onSelect?.(i);
  }

  /* — Input — */
  const toNdc = (e) => {
    const r = canvas.getBoundingClientRect();
    return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const pick = (ndc) => {
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(pillars.map((p) => p.userData.model), true)[0];
    if (!hit) return -1;
    let o = hit.object;
    while (o && o.userData.index === undefined) o = o.parent;
    return o ? o.userData.index : -1;
  };

  let downAt = 0;
  let moved = 0;
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    moved = 0;
    downAt = performance.now();
    dragX = e.clientX;
    velocity = 0;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    pointer = toNdc(e);
    if (dragging) {
      const dx = e.clientX - dragX;
      dragX = e.clientX;
      moved += Math.abs(dx);
      const delta = (dx / canvas.clientWidth) * Math.PI * 1.4;
      rot += delta;
      target = rot;
      velocity = delta;
    } else if (e.pointerType === 'mouse') {
      hovered = pick(pointer);
      canvas.style.cursor = hovered >= 0 ? 'pointer' : 'grab';
    }
  });
  const release = (e) => {
    if (!dragging) return;
    dragging = false;
    const tap = moved < 6 && performance.now() - downAt < 400;
    if (tap) {
      const i = pick(toNdc(e));
      if (i >= 0) setActive(i);
      return;
    }
    const projected = rot + velocity * 8;
    setActive(nearest(projected));
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', () => {
    hovered = -1;
    pointer.set(0, 0);
  });

  /* — Resize — */
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the whole halo in frame on narrow screens
    camera.position.z = w / h < 1 ? 8.8 + (1 - w / h) * 7 : 8.8;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  /* — Loop — */
  const clock = new THREE.Clock();
  let running = false;
  let raf = 0;
  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    if (!dragging) rot += (target - rot) * (1 - Math.pow(0.0025, dt));
    halo.rotation.y = rot;

    tilt.x += (pointer.y * 0.08 - tilt.x) * 0.05;
    tilt.y += (pointer.x * 0.12 - tilt.y) * 0.05;
    world.rotation.x = 0.16 - tilt.x;
    world.rotation.z = -tilt.y * 0.35;

    const live = dragging ? nearest(rot) : active;
    pillars.forEach((p, i) => {
      const u = p.userData;
      u.active += ((i === live ? 1 : 0) - u.active) * (1 - Math.pow(0.002, dt));
      u.hover += ((i === hovered ? 1 : 0) - u.hover) * 0.12;
      const s = 0.78 + u.active * 0.5 + u.hover * 0.06;
      u.model.scale.setScalar(s * (u.model.userData.baseScale ??= u.model.scale.x));
      p.position.y = 0.12 + u.active * 0.32 + Math.sin(t * 1.1 + i * 1.7) * 0.06;
      // face the camera-ish while the halo turns
      p.rotation.y = -halo.rotation.y + (reduced ? 0 : Math.sin(t * 0.5 + i) * 0.25) + u.active * Math.sin(t * 0.7) * 0.2;
      u.aura.material.opacity = u.active * 0.55;
      if (u.model.userData.spin) u.model.userData.spin.rotation.y = t * 0.6;
    });
    glowRing.material.opacity = 0.1 + Math.sin(t * 1.4) * 0.03;
    pMat.uniforms.uTime.value = t;
    renderer.render(scene, camera);
  }

  return {
    setActive,
    get active() {
      return active;
    },
    start() {
      if (running) return;
      running = true;
      clock.getDelta();
      frame();
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    dispose() {
      this.stop();
      ro.disconnect();
      renderer.dispose();
      pmrem.dispose();
    },
  };
}
