import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mulberry32, printedMaterial, type Printed } from "./print";
import {
  boxFaces, fluteTexture, tapePrint, airmailPrint, labelPrint, fragilePrint, stampTexture, giftPrint, bayPrint,
  laserTexture, marbleTexture, doorPrint, nameplatePrint, matPrint, mailerPrint, customsPrint, textSprite, heroLabel, type LabelSpec,
} from "./textures";
import { OUTLINE, LAKES, CITY, ROUTES, ROUTE, MID_LAT, halftone, type CityCode } from "@/lib/map";

/* ------------------------------------------------------------------
   Plain three.js builders shared by the story, the stills, the card
   turntable and the rate calculator.
   ------------------------------------------------------------------ */

const ss = THREE.MathUtils.smoothstep;
export const HERO_BOX = { W: 1.6, H: 1.1, D: 1.2 } as const;
const T = 0.028; // board thickness

/* =================================================================
   TAPE — a strip that runs up one side, across the seam, down the other
   ================================================================= */
export type TapeModel = { root: THREE.Group; set: (p: number) => void };
const PERIOD = 2.4; // scene units per repeat of the tape print

function tapeSegment(len: number, width: number, print: Printed) {
  const map = print.map.clone(), mask = print.mask?.clone() ?? null;
  map.needsUpdate = true; if (mask) mask.needsUpdate = true;
  const m = printedMaterial({ map, mask, bump: null, glow: null }, { side: THREE.DoubleSide });
  m.clearcoatRoughness = 0.04; m.polygonOffset = true; m.polygonOffsetFactor = -2;
  const g = new THREE.PlaneGeometry(len, width); g.translate(len / 2, 0, 0);
  const mesh = new THREE.Mesh(g, m);
  const obj = new THREE.Group(); obj.add(mesh);
  const set = (p: number) => {
    mesh.visible = p > 0.001;
    mesh.scale.x = Math.max(0.0001, p);
    map.repeat.set((len * p) / PERIOD, 1); if (mask) mask.repeat.set((len * p) / PERIOD, 1);
  };
  return { obj, set };
}
function place(o: THREE.Object3D, origin: THREE.Vector3, len: THREE.Vector3, normal: THREE.Vector3) {
  const y = new THREE.Vector3().crossVectors(normal, len);
  o.matrixAutoUpdate = false;
  o.matrix.makeBasis(len, y, normal).setPosition(origin);
}

export function createTape(W: number, H: number, D: number, { kind = "brand", width = 0.26, drop = 0.34, top }: { kind?: "brand" | "airmail"; width?: number; drop?: number; top: number }): TapeModel {
  const print = kind === "airmail" ? airmailPrint() : tapePrint();
  const root = new THREE.Group(); root.name = "tape";
  const e = 0.0025;
  const L = tapeSegment(drop, width, print), Tp = tapeSegment(W + 2 * e, width, print), R = tapeSegment(drop, width, print);
  place(L.obj, new THREE.Vector3(-W / 2 - e, top - drop, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-1, 0, 0));
  place(Tp.obj, new THREE.Vector3(-W / 2 - e, top + e, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0));
  place(R.obj, new THREE.Vector3(W / 2 + e, top, 0), new THREE.Vector3(0, -1, 0), new THREE.Vector3(1, 0, 0));
  root.add(L.obj, Tp.obj, R.obj);
  const total = 2 * drop + W;
  const set = (p: number) => {
    const d = p * total;
    L.set(THREE.MathUtils.clamp(d / drop, 0, 1));
    Tp.set(THREE.MathUtils.clamp((d - drop) / W, 0, 1));
    R.set(THREE.MathUtils.clamp((d - drop - W) / drop, 0, 1));
  };
  set(1);
  void H; void D;
  return { root, set };
}

/* =================================================================
   PARCEL — a regular slotted carton with four hinged flaps
   ================================================================= */
export type ParcelOpts = { W: number; H: number; D: number; plain?: boolean; seed?: number; label?: LabelSpec | null; tape?: "brand" | "airmail" | null; fragile?: boolean; flaps?: boolean; liteLabel?: boolean };
export type ParcelModel = {
  root: THREE.Group; W: number; H: number; D: number; top: number;
  setOpen: (o: number) => void; tape: TapeModel | null; setLabel: (l: number) => void; setStamp: (s: number) => void;
  label: THREE.Mesh | null; stamp: THREE.Mesh | null; inner: THREE.Group;
};

const edgeMats = new Map<string, THREE.MeshStandardMaterial>();
function edgeMat(rep: number) {
  const k = rep.toFixed(1);
  let m = edgeMats.get(k);
  if (!m) { const t = fluteTexture().clone(); t.needsUpdate = true; t.repeat.set(rep, 1); m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }); edgeMats.set(k, m); }
  return m;
}
const matCache = new Map<Printed, THREE.MeshPhysicalMaterial>();
function pm(p: Printed) { let m = matCache.get(p); if (!m) { m = printedMaterial(p, { bumpScale: 0.6 }); m.clearcoat = 0; m.roughness = 0.86; m.metalness = 0; m.metalnessMap = null; m.roughnessMap = null; m.clearcoatMap = null; matCache.set(p, m); } return m; }

export function createParcel(o: ParcelOpts): ParcelModel {
  const { W, H, D } = o;
  const f = boxFaces(W, H, D, { plain: o.plain, seed: o.seed ?? 1 });
  const inner = pm(f.inside), eW = edgeMat(W * 6), eD = edgeMat(D * 6), eH = edgeMat(H * 6);
  const root = new THREE.Group(); root.name = "parcel";
  const body = new THREE.Group(); root.add(body);
  const wall = (w: number, h: number, d: number, mats: THREE.Material[]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats); m.castShadow = true; m.receiveShadow = true; return m; };
  // [px, nx, py, ny, pz, nz]
  const front = wall(W, H, T, [eH, eH, eW, eW, pm(f.front), inner]); front.position.set(0, 0, D / 2 - T / 2);
  const back = wall(W, H, T, [eH, eH, eW, eW, inner, pm(f.back)]); back.position.set(0, 0, -D / 2 + T / 2);
  const left = wall(T, H, D - 2 * T, [inner, pm(f.side), eD, eD, eH, eH]); left.position.set(-W / 2 + T / 2, 0, 0);
  const right = wall(T, H, D - 2 * T, [pm(f.side), inner, eD, eD, eH, eH]); right.position.set(W / 2 - T / 2, 0, 0);
  const bottom = wall(W - 2 * T, T, D - 2 * T, [eD, eD, inner, pm(f.bottom), eW, eW]); bottom.position.set(0, -H / 2 + T / 2, 0);
  body.add(front, back, left, right, bottom);

  // flaps (minor under major)
  const hinges: { g: THREE.Group; axis: "x" | "z"; sign: number; minor: boolean }[] = [];
  const flapsOn = o.flaps !== false;
  if (flapsOn) {
    const major = (sign: 1 | -1) => {
      const g = new THREE.Group(); g.position.set(0, H / 2, sign * (D / 2 - T / 2));
      const m = wall(W, T, D / 2, [eD, eD, pm(f.flapMajor), inner, eW, eW]); m.position.set(0, T * 1.5, -sign * (D / 4 - T / 2));
      if (sign < 0) m.rotation.y = Math.PI;
      g.add(m); root.add(g); hinges.push({ g, axis: "x", sign, minor: false });
    };
    const minor = (sign: 1 | -1) => {
      const g = new THREE.Group(); g.position.set(sign * (W / 2 - T / 2), H / 2, 0);
      const m = wall(D / 2, T, D - 2 * T - 0.004, [eD, eD, pm(f.flapMinor), inner, eD, eD]); m.position.set(-sign * (D / 4 - T / 2), T / 2, 0);
      g.add(m); root.add(g); hinges.push({ g, axis: "z", sign, minor: true });
    };
    minor(-1); minor(1); major(1); major(-1);
  }
  const OPEN = 2.05;
  const setOpen = (op: number) => {
    const c = 1 - op;
    for (const h of hinges) {
      const k = h.minor ? 1 - ss(c, 0, 0.55) : 1 - ss(c, 0.42, 1);
      const a = OPEN * k * (h.minor ? 0.96 : 1);
      if (h.axis === "x") h.g.rotation.x = h.sign * a; else h.g.rotation.z = -h.sign * a;
    }
  };
  setOpen(0);
  const top = H / 2 + (flapsOn ? T * 2 : 0);

  const tape = o.tape ? createTape(W, H, D, { kind: o.tape, top, width: Math.min(0.26, D * 0.24), drop: Math.min(0.34, H * 0.36) }) : null;
  if (tape) root.add(tape.root);

  // label on top, reading from the front
  let label: THREE.Mesh | null = null, stamp: THREE.Mesh | null = null;
  let labelBase: Float32Array | null = null;
  if (o.label !== null) {
    const lw = Math.min(1.0, W * 0.66), lh = lw / 1.5;
    const g = new THREE.PlaneGeometry(lw, lh, 24, 2);
    const lm = printedMaterial(labelPrint(o.label ?? heroLabel, { lite: o.liteLabel }), { bumpScale: 0 });
    lm.clearcoat = 0.35; lm.polygonOffset = true; lm.polygonOffsetFactor = -4;
    label = new THREE.Mesh(g, lm); label.rotation.x = -Math.PI / 2; label.position.set(0, top + 0.004, 0);
    label.castShadow = true;
    root.add(label);
    labelBase = (g.getAttribute("position") as THREE.BufferAttribute).array.slice() as Float32Array;
    const sm = new THREE.MeshStandardMaterial({ map: stampTexture(), transparent: true, roughness: 0.55, opacity: 0, polygonOffset: true, polygonOffsetFactor: -6, depthWrite: false });
    stamp = new THREE.Mesh(new THREE.PlaneGeometry(lw * 0.82, lw * 0.82 * (520 / 1024)), sm);
    stamp.rotation.set(-Math.PI / 2, 0, 0.16); stamp.position.set(lw * 0.06, top + 0.008, 0.02); stamp.visible = false;
    root.add(stamp);
  }
  const setLabel = (l: number) => {
    if (!label || !labelBase) return;
    const e = ss(l, 0, 1);
    label.visible = l > 0.001;
    label.position.y = top + 0.004 + (1 - e) * 0.9;
    label.rotation.z = (1 - e) * 0.35;
    label.rotation.x = -Math.PI / 2 + (1 - e) * 0.25;
    const pos = label.geometry.getAttribute("position") as THREE.BufferAttribute;
    const curl = (1 - e) * 0.22, lw = (label.geometry as THREE.PlaneGeometry).parameters.width;
    for (let i = 0; i < pos.count; i++) { const x = labelBase[i * 3]; const k = Math.abs(x) / (lw / 2); pos.setZ(i, curl * k * k); }
    pos.needsUpdate = true;
  };
  const setStamp = (s: number) => {
    if (!stamp) return;
    stamp.visible = s > 0.001;
    const m = stamp.material as THREE.MeshStandardMaterial;
    m.opacity = Math.min(1, s * 1.6);
    stamp.scale.setScalar(1 + (1 - ss(s, 0, 0.6)) * 0.22);
  };
  if (label) setLabel(1);

  if (o.fragile) {
    const fm = printedMaterial(fragilePrint(), { bumpScale: 0 }); fm.polygonOffset = true; fm.polygonOffsetFactor = -3;
    const fw = Math.min(0.42, W * 0.3);
    const fr = new THREE.Mesh(new THREE.PlaneGeometry(fw, fw * (360 / 520)), fm);
    fr.position.set(W / 2 - fw / 2 - 0.1, -H / 2 + fw * 0.5, D / 2 + 0.0015);
    root.add(fr);
  }
  const innerG = new THREE.Group(); root.add(innerG);
  return { root, W, H, D, top, setOpen, tape, setLabel, setStamp, label, stamp, inner: innerG };
}

/* =================================================================
   MAILER — the Same Day document pouch
   ================================================================= */
export function createMailer() {
  const root = new THREE.Group(); root.name = "mailer";
  const W = 1.5, D = 1.05;
  const g = new RoundedBoxGeometry(W, 0.06, D, 4, 0.03);
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = p.getY(i); const puff = (1 - Math.pow((2 * x) / W, 4)) * (1 - Math.pow((2 * z) / D, 4)); p.setY(i, y * (1 + puff * 1.6)); }
  g.computeVertexNormals();
  const top = printedMaterial(mailerPrint(), { bumpScale: 0 }); top.clearcoat = 0.6; top.clearcoatRoughness = 0.25; top.roughness = 0.5;
  // map the top print by projecting xz → uv
  const uv = g.getAttribute("uv") as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / W + 0.5, -p.getZ(i) / D + 0.5);
  const m = new THREE.Mesh(g, top); m.castShadow = true;
  root.add(m);
  const lw = 0.62, lm = printedMaterial(labelPrint({ ...heroLabel, awb: "PE 6120 0831 7718", to: { name: "Legal desk", line: "Road No. 1, Banjara Hills", city: "Hyderabad, Telangana", pin: "500034", code: "HYD" }, from: { name: "Rao & Associates", city: "Hyderabad, Telangana", pin: "500082", code: "HYD" }, service: "SAME DAY", seed: 61 }, { lite: true }), { bumpScale: 0 });
  lm.polygonOffset = true; lm.polygonOffsetFactor = -4;
  const label = new THREE.Mesh(new THREE.PlaneGeometry(lw, lw / 1.5), lm); label.rotation.x = -Math.PI / 2; label.position.set(0.28, 0.082, 0.12);
  root.add(label);
  return { root, W, H: 0.12, D };
}

/* =================================================================
   GIFT + SHREDS — what goes in the box
   ================================================================= */
export function createGift() {
  const root = new THREE.Group(); root.name = "gift";
  const W = 0.72, H = 0.34, D = 0.54;
  const pr = printedMaterial(giftPrint(), { bumpScale: 0.8 });
  const side = new THREE.MeshPhysicalMaterial({ color: "#2743ff", roughness: 0.4, clearcoat: 0.4 });
  const box = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 3, 0.02), [side, side, pr, side, side, side]); box.castShadow = true;
  root.add(box);
  const rib = new THREE.MeshPhysicalMaterial({ color: "#ff5a1f", roughness: 0.35, sheen: 1, sheenColor: new THREE.Color("#ffd0b8"), sheenRoughness: 0.4 });
  const r1 = new THREE.Mesh(new THREE.BoxGeometry(W + 0.012, H + 0.012, 0.07), rib); const r2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, H + 0.012, D + 0.012), rib);
  root.add(r1, r2);
  const loop = new THREE.TorusGeometry(0.08, 0.022, 10, 28);
  for (const s of [-1, 1]) { const l = new THREE.Mesh(loop, rib); l.position.set(s * 0.075, H / 2 + 0.05, 0); l.rotation.set(0, s * 0.35, s * 0.9); l.scale.set(1, 0.7, 1); root.add(l); }
  return { root, W, H, D };
}

export function createShreds(n = 110) {
  const g = new THREE.BoxGeometry(0.16, 0.006, 0.026);
  const m = new THREE.MeshStandardMaterial({ roughness: 0.85 });
  const mesh = new THREE.InstancedMesh(g, m, n);
  const r = mulberry32(21);
  const cols = ["#c49a64", "#d8b481", "#ff5a1f", "#f3f1ec", "#b8864f"].map((c) => new THREE.Color(c));
  const data = Array.from({ length: n }, (_, i) => {
    mesh.setColorAt(i, cols[Math.floor(r() * cols.length)]);
    return { x: (r() - 0.5) * 1.3, z: (r() - 0.5) * 0.95, y0: 1.4 + r() * 1.8, yEnd: -0.28 + r() * 0.36, delay: r() * 0.45, rx: r() * 6, ry: r() * 6, rz: r() * 6, spin: 2 + r() * 6 };
  });
  mesh.instanceColor!.needsUpdate = true;
  mesh.castShadow = true;
  const q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1), M = new THREE.Matrix4();
  const set = (t: number) => {
    data.forEach((d, i) => {
      const k = THREE.MathUtils.clamp((t - d.delay) / 0.55, 0, 1);
      const fall = k * k;
      p.set(d.x, THREE.MathUtils.lerp(d.y0, d.yEnd, fall), d.z);
      const settle = 1 - fall;
      q.setFromEuler(e.set(d.rx + settle * d.spin, d.ry + settle * d.spin * 0.6, d.rz * (0.3 + settle)));
      s.setScalar(k > 0 ? 1 : 0.0001);
      M.compose(p, q, s); mesh.setMatrixAt(i, M);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  set(0);
  return { mesh, set };
}

/* =================================================================
   CONVEYOR + SCAN ARCH
   ================================================================= */
export const BELT = { L: 18, W: 2.1, Y: -0.62 } as const; // belt surface height (parcel bottom sits here)

function beltTexture() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 256;
  const x = c.getContext("2d")!;
  x.fillStyle = "#1d2025"; x.fillRect(0, 0, 512, 256);
  x.strokeStyle = "#2c3038"; x.lineWidth = 18; x.lineCap = "round";
  for (let i = 0; i < 4; i++) { const ox = i * 128 + 20; x.beginPath(); x.moveTo(ox, 30); x.lineTo(ox + 60, 128); x.lineTo(ox, 226); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}

export function createConveyor() {
  const root = new THREE.Group(); root.name = "conveyor";
  const { L, W, Y } = BELT;
  const bt = beltTexture(); bt.repeat.set(L / 1.2, 1);
  const belt = new THREE.Mesh(new THREE.BoxGeometry(L, 0.08, W), [
    new THREE.MeshStandardMaterial({ color: "#1d2025", roughness: 0.8 }), new THREE.MeshStandardMaterial({ color: "#1d2025", roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ map: bt, roughness: 0.7 }), new THREE.MeshStandardMaterial({ color: "#16181c" }),
    new THREE.MeshStandardMaterial({ color: "#1d2025", roughness: 0.8 }), new THREE.MeshStandardMaterial({ color: "#1d2025", roughness: 0.8 }),
  ]);
  belt.position.y = Y - 0.04; belt.receiveShadow = true; root.add(belt);
  const steel = new THREE.MeshPhysicalMaterial({ color: "#c8ccd2", metalness: 1, roughness: 0.32 });
  const paint = new THREE.MeshPhysicalMaterial({ color: "#ff5a1f", roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const ink = new THREE.MeshPhysicalMaterial({ color: "#15171b", roughness: 0.5, clearcoat: 0.3 });
  for (const s of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(L, 0.2, 0.08), paint); rail.position.set(0, Y + 0.02, s * (W / 2 + 0.05)); rail.castShadow = true; root.add(rail);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(L, 0.03, 0.14), steel); lip.position.set(0, Y + 0.135, s * (W / 2 + 0.05)); root.add(lip);
    for (let x = -L / 2 + 1; x < L / 2; x += 2.6) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.1), ink); leg.position.set(x, Y - 0.78, s * (W / 2 - 0.1)); root.add(leg); }
  }
  // scan arch at x = 0
  const arch = new THREE.Group(); arch.name = "arch"; root.add(arch);
  for (const s of [-1, 1]) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.6, 0.16), ink); post.position.set(0, Y + 1.1, s * (W / 2 + 0.28)); post.castShadow = true; arch.add(post); }
  const bay = printedMaterial(bayPrint(), { bumpScale: 0 });
  // the bay sign is printed on the beam's +x face — the side the parcels come out of
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.46, W + 0.8), [bay, ink, ink, ink, ink, ink]);
  beam.position.set(0, Y + 2.5, 0); arch.add(beam);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 1.2), steel); head.position.set(0, Y + 2.22, 0); arch.add(head);
  const fanMat = new THREE.MeshBasicMaterial({ map: laserTexture(), transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const fan = new THREE.Mesh(new THREE.PlaneGeometry(W, 2.2), fanMat); fan.rotation.y = Math.PI / 2; fan.position.set(0, Y + 1.1, 0); arch.add(fan);
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 1.1), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff3b1f").multiplyScalar(3), toneMapped: false }));
  led.position.set(0, Y + 2.155, 0); arch.add(led);

  // traffic on the belt: plain cartons flowing through
  const r = mulberry32(3);
  const traffic: { p: ParcelModel; x0: number }[] = [];
  const sizes: [number, number, number][] = [[0.9, 0.6, 0.7], [1.2, 0.8, 0.9], [0.7, 0.5, 0.6], [1.3, 0.7, 1.0], [0.8, 0.9, 0.8], [1.0, 0.55, 0.75]];
  sizes.forEach(([w, h, d], i) => {
    const p = createParcel({ W: w, H: h, D: d, plain: true, seed: 40 + i, tape: "brand", liteLabel: true, label: { ...heroLabel, awb: `PE ${4000 + i * 713} ${1000 + i * 37} ${2000 + i * 91}`, seed: 300 + i * 17 } });
    p.root.rotation.y = (r() - 0.5) * 0.25;
    p.root.position.set(0, Y + h / 2, (r() - 0.5) * 0.5);
    root.add(p.root);
    traffic.push({ p, x0: i * 3.0 });
  });
  return { root, belt, bt, arch, fan, led, traffic, head };
}

/* =================================================================
   MAP — halftone India, city pins, trunk routes, the flight
   ================================================================= */
export const MAP = { S: 1.2, Y: -1.32, K: Math.cos((MID_LAT * Math.PI) / 180) } as const;
export function proj(lon: number, lat: number, out = new THREE.Vector3()) {
  const o = CITY[ROUTE.from];
  return out.set((lon - o.lon) * MAP.S * MAP.K, MAP.Y, -(lat - o.lat) * MAP.S);
}
export const cityPos = (c: CityCode, out = new THREE.Vector3()) => proj(CITY[c].lon, CITY[c].lat, out);

export function arcCurve(a: THREE.Vector3, b: THREE.Vector3, lift = 0.2) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.y += a.distanceTo(b) * lift;
  return new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone());
}

function shadowTex() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(16,18,22,0.55)"); g.addColorStop(1, "rgba(16,18,22,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function createMap() {
  const root = new THREE.Group(); root.name = "map";
  const pts = halftone(0.6);
  const dotMat = new THREE.MeshBasicMaterial({ color: "#a29e94", transparent: true, opacity: 0, depthWrite: false });
  const dots = new THREE.InstancedMesh(new THREE.CircleGeometry(0.21, 12), dotMat, pts.length);
  const M = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  pts.forEach(([lo, la], i) => { proj(lo, la, v); M.compose(v, q, one); dots.setMatrixAt(i, M); });
  dots.frustumCulled = false; dots.renderOrder = -2;
  root.add(dots);
  // coastline
  const lineMat = new THREE.LineBasicMaterial({ color: "#5d5a54", transparent: true, opacity: 0 });
  const line = new THREE.Group();
  for (const ring of [OUTLINE, ...LAKES]) line.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ring.map(([lo, la]) => proj(lo, la).setY(MAP.Y + 0.01))), lineMat));
  root.add(line);

  // trunk routes — thin cobalt arcs that draw in
  const routeMat = new THREE.MeshBasicMaterial({ color: "#2743ff", transparent: true, opacity: 0.0, depthWrite: false });
  const routes = ROUTES.filter(([a, b]) => !(a === ROUTE.from && b === ROUTE.to)).map(([a, b]) => {
    const c = arcCurve(cityPos(a), cityPos(b), 0.12);
    const g = new THREE.TubeGeometry(c, 48, 0.06, 6, false);
    const m = new THREE.Mesh(g, routeMat); m.frustumCulled = false; root.add(m);
    return { m, count: g.index!.count };
  });
  // the hero route, Hyderabad to Delhi
  const heroCurve = arcCurve(cityPos(ROUTE.from), cityPos(ROUTE.to), 0.18);
  const trailG = new THREE.TubeGeometry(heroCurve, 160, 0.16, 8, false);
  const trail = new THREE.Mesh(trailG, new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff5a1f"), toneMapped: false, transparent: true, opacity: 1 }));
  trail.frustumCulled = false; root.add(trail);
  const ghost = new THREE.Line(new THREE.BufferGeometry().setFromPoints(heroCurve.getPoints(120)), new THREE.LineDashedMaterial({ color: "#ff5a1f", dashSize: 0.6, gapSize: 0.45, transparent: true, opacity: 0 }));
  ghost.computeLineDistances(); root.add(ghost);

  // city pins
  const pinMat = new THREE.MeshBasicMaterial({ color: "#ff5a1f" });
  const ringMat = new THREE.MeshBasicMaterial({ color: "#ff5a1f", transparent: true, opacity: 0.5, depthWrite: false });
  const labels: THREE.Sprite[] = [];
  const pins = (Object.keys(CITY) as CityCode[]).map((c) => {
    const g = new THREE.Group(); cityPos(c, g.position); g.position.y += 0.02;
    const big = c === ROUTE.from || c === ROUTE.to;
    const dot = new THREE.Mesh(new THREE.CircleGeometry(big ? 0.62 : 0.4, 24), pinMat); dot.rotation.x = -Math.PI / 2;
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.86, 36), ringMat); ring.rotation.x = -Math.PI / 2;
    g.add(dot, ring);
    const { tex, aspect } = textSprite(CITY[c].name.toUpperCase(), { size: big ? 46 : 38, dot: null, bg: big ? "rgba(16,18,22,0.92)" : "rgba(243,241,236,0.9)", color: big ? "#f3f1ec" : "#15171b" });
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, opacity: 0 }));
    const h = big ? 1.25 : 0.9; sp.scale.set(h * aspect, h, 1); sp.center.set(0, -0.35); sp.position.set(0.7, 0.2, 0); sp.renderOrder = 10;
    g.add(sp); labels.push(sp);
    root.add(g);
    return { c, g, ring, big };
  });

  // the jet
  const jet = new THREE.Group(); jet.name = "jet";
  const white = new THREE.MeshPhysicalMaterial({ color: "#1c1f25", roughness: 0.35, clearcoat: 0.8 });
  const orange = new THREE.MeshPhysicalMaterial({ color: "#ff5a1f", roughness: 0.4, clearcoat: 0.6 });
  const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.5, 6, 16), white); fus.rotation.z = Math.PI / 2; jet.add(fus);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 2.2), white); wing.position.set(0.05, -0.04, 0); jet.add(wing);
  const tailW = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 0.8), white); tailW.position.set(-0.8, 0.02, 0); jet.add(tailW);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.45, 0.04), orange); fin.position.set(-0.82, 0.24, 0); jet.add(fin);
  for (const s of [-1, 1]) { const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 12), orange); eng.rotation.z = Math.PI / 2; eng.position.set(0.18, -0.13, s * 0.5); jet.add(eng); }
  jet.scale.setScalar(1.3);
  root.add(jet);
  const jetShadow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, opacity: 0.5 }));
  jetShadow.rotation.x = -Math.PI / 2; root.add(jetShadow);

  return { root, dots, dotMat, line, lineMat, routes, routeMat, heroCurve, trail, trailCount: trailG.index!.count, ghost, pins, labels, jet, jetShadow };
}

/* =================================================================
   DOORSTEP — a pop-up doorstep in Hauz Khas, New Delhi
   ================================================================= */
function softDisc() {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(128, 128, 60, 128, 128, 128);
  g.addColorStop(0, "#fff"); g.addColorStop(1, "#000");
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export function createDoorstep() {
  const root = new THREE.Group(); root.name = "doorstep";
  const S = 1.8; root.scale.setScalar(S); // a real door next to a real parcel
  const mt = marbleTexture(); mt.repeat.set(3, 3);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(4.6, 72), new THREE.MeshStandardMaterial({ map: mt, roughness: 0.28, alphaMap: softDisc(), transparent: true }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; root.add(floor);

  const pop = new THREE.Group(); pop.position.z = -1.7; root.add(pop); // hinged at the floor line
  const plaster = new THREE.MeshStandardMaterial({ color: "#e6dccb", roughness: 0.9 });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(7.2, 4.4, 0.24), plaster); wall.position.set(0, 2.2, -0.12); wall.receiveShadow = true; pop.add(wall);
  const skirting = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.14, 0.04), new THREE.MeshStandardMaterial({ color: "#d8cfc1", roughness: 0.6 })); skirting.position.set(0, 0.07, 0.02); pop.add(skirting);
  const teak = new THREE.MeshPhysicalMaterial({ color: "#1d3128", roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2 });
  const dW = 1.45, dH = 2.7;
  const door = new THREE.Mesh(new THREE.BoxGeometry(dW, dH, 0.08), [teak, teak, teak, teak, printedMaterial(doorPrint(), { bumpScale: 2 }), teak]);
  door.position.set(-0.2, dH / 2, 0.04); door.castShadow = true; pop.add(door);
  const jamb = (w: number, h: number, x: number, y: number) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.16), teak); m.position.set(x, y, 0.06); pop.add(m); };
  jamb(0.14, dH + 0.14, -0.2 - dW / 2 - 0.07, (dH + 0.14) / 2); jamb(0.14, dH + 0.14, -0.2 + dW / 2 + 0.07, (dH + 0.14) / 2); jamb(dW + 0.42, 0.14, -0.2, dH + 0.07);
  const brass = new THREE.MeshPhysicalMaterial({ color: "#d9b36a", metalness: 1, roughness: 0.25 });
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 14), brass); knob.position.set(-0.2 + dW / 2 - 0.16, 1.2, 0.13); pop.add(knob);
  const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 16), brass); rose.rotation.x = Math.PI / 2; rose.position.set(-0.2 + dW / 2 - 0.16, 1.2, 0.1); pop.add(rose);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.215), printedMaterial(nameplatePrint(), { bumpScale: 0 })); plate.position.set(1.15, 1.72, 0.005); pop.add(plate);
  const bell = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.03), new THREE.MeshStandardMaterial({ color: "#f7f5f0", roughness: 0.4 })); bell.position.set(1.15, 1.32, 0.015); pop.add(bell);
  const bellBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16), brass); bellBtn.rotation.x = Math.PI / 2; bellBtn.position.set(1.15, 1.34, 0.035); pop.add(bellBtn);
  // a potted plant by the door
  const plant = new THREE.Group(); plant.position.set(-1.85, 0, 0.55); pop.add(plant);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.23, 0.55, 28), new THREE.MeshStandardMaterial({ color: "#b8603a", roughness: 0.8 })); pot.position.y = 0.275; pot.castShadow = true; plant.add(pot);
  const leafMat = new THREE.MeshStandardMaterial({ color: "#2f6b3a", roughness: 0.55, side: THREE.DoubleSide });
  const r = mulberry32(8);
  for (let i = 0; i < 9; i++) {
    const h = 0.7 + r() * 0.7, leaf = new THREE.Mesh(new THREE.ConeGeometry(0.07, h, 4, 1), leafMat);
    leaf.scale.set(1, 1, 0.25); leaf.position.set((r() - 0.5) * 0.3, 0.55 + h / 2, (r() - 0.5) * 0.3); leaf.rotation.set((r() - 0.5) * 0.3, r() * 3, (r() - 0.5) * 0.35); plant.add(leaf);
  }
  const coir = new THREE.MeshStandardMaterial({ color: "#7d5430", roughness: 1 });
  const mat = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.035, 1.06), [coir, coir, printedMaterial(matPrint(), { bumpScale: 2.5 }), coir, coir, coir]);
  mat.position.set(-0.2, 0.0175, -0.95); mat.receiveShadow = true; root.add(mat);
  return { root, floor, pop, mat, matTop: 0.035 * S, spot: new THREE.Vector3(-0.2, 0.035, -0.95).multiplyScalar(S) };
}

/* =================================================================
   RUBBER STAMP
   ================================================================= */
export function createStamper() {
  const root = new THREE.Group(); root.name = "stamper";
  const wood = new THREE.MeshPhysicalMaterial({ color: "#8a5a32", roughness: 0.45, clearcoat: 0.6 });
  const block = new THREE.Mesh(new RoundedBoxGeometry(0.86, 0.16, 0.5, 3, 0.03), wood); block.position.y = 0.12; root.add(block);
  const rubber = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.04, 0.44), new THREE.MeshStandardMaterial({ color: "#b3201a", roughness: 0.7 })); rubber.position.y = 0.02; root.add(rubber);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.34, 20), wood); neck.position.y = 0.37; root.add(neck);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 18), new THREE.MeshPhysicalMaterial({ color: "#15171b", roughness: 0.3, clearcoat: 1 })); knob.position.y = 0.6; knob.scale.set(1, 0.8, 1); root.add(knob);
  root.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true; });
  return root;
}

/* =================================================================
   CUSTOMS STICKER (international card)
   ================================================================= */
export function addCustoms(p: ParcelModel) {
  const m = printedMaterial(customsPrint(), { bumpScale: 0 }); m.polygonOffset = true; m.polygonOffsetFactor = -3;
  const w = 0.5, s = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.7), m);
  s.position.set(-p.W / 2 + w / 2 + 0.12, 0.05, p.D / 2 + 0.0015); s.rotation.z = 0.04;
  p.root.add(s);
}