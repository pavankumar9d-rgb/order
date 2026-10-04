import * as THREE from "three";
import { Sheet, FONT, wide, mulberry32, roundRect, frame, barcode, spaced, type Printed } from "./print";
import { brand, hero } from "@/data/site";

/* ------------------------------------------------------------------
   Everything printed in the story: kraft carton art, branded tape, the
   thermal shipping label, stickers, the rubber stamp and the doorstep.
   ------------------------------------------------------------------ */

const INK = "#15171b";
const ORANGE = "#ff5a1f";
const PX = 420; // canvas px per scene unit on carton faces

/* ---------------- the mark: a parcel seen at three-quarter ---------------- */
export function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, fill: string, cut: string) {
  // viewBox 0..32 — same geometry as the favicon / Logo
  const P = (px: number, py: number): [number, number] => [x + (px / 32) * s, y + (py / 32) * s];
  ctx.save();
  ctx.fillStyle = fill;
  ctx.beginPath();
  [[7, 11.5], [16, 7], [25, 11.5], [25, 20.5], [16, 25], [7, 20.5]].forEach(([a, b], i) => { const [px, py] = P(a, b); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = cut; ctx.lineWidth = (1.6 / 32) * s; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(...P(7, 11.5)); ctx.lineTo(...P(16, 16)); ctx.lineTo(...P(25, 11.5)); ctx.moveTo(...P(16, 16)); ctx.lineTo(...P(16, 25)); ctx.moveTo(...P(11.5, 9.25)); ctx.lineTo(...P(20.5, 13.75)); ctx.stroke();
  ctx.restore();
}

/* ---------------- kraft ---------------- */
function kraftFibres(s: Sheet, seed: number, base = "#c49a64") {
  const r = mulberry32(seed);
  s.raw((c) => {
    c.fillStyle = base; c.fillRect(0, 0, s.W, s.H);
    // soft blotches
    for (let i = 0; i < 26; i++) {
      const x = r() * s.W, y = r() * s.H, rad = 40 + r() * 160;
      const g = c.createRadialGradient(x, y, 0, x, y, rad);
      const dark = r() > 0.5;
      g.addColorStop(0, dark ? "rgba(120,80,40,0.035)" : "rgba(255,235,200,0.04)"); g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // fibres
    const n = Math.round((s.W * s.H) / 260);
    for (let i = 0; i < n; i++) {
      const x = r() * s.W, y = r() * s.H, a = r() * Math.PI, l = 3 + r() * 11;
      c.strokeStyle = r() > 0.55 ? `rgba(90,58,28,${0.05 + r() * 0.09})` : `rgba(255,240,215,${0.05 + r() * 0.08})`;
      c.lineWidth = 0.6 + r() * 0.8;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
    }
  });
  return s;
}

/** Flexo print looks slightly rough: ink with a faint speckle knocked out. */
function speckle(s: Sheet, seed: number, color: string, alpha = 0.18) {
  const r = mulberry32(seed);
  s.raw((c) => {
    c.globalCompositeOperation = "source-atop";
    c.fillStyle = color; c.globalAlpha = alpha;
    for (let i = 0; i < (s.W * s.H) / 900; i++) c.fillRect(r() * s.W, r() * s.H, 1 + r() * 2, 1 + r() * 2);
  });
}

function upArrows(c: CanvasRenderingContext2D, x: number, y: number, s: number) {
  for (const dx of [0, s * 0.62]) {
    c.beginPath();
    c.moveTo(x + dx + s * 0.25, y); c.lineTo(x + dx + s * 0.5, y + s * 0.34); c.lineTo(x + dx + s * 0.34, y + s * 0.34); c.lineTo(x + dx + s * 0.34, y + s); c.lineTo(x + dx + s * 0.16, y + s); c.lineTo(x + dx + s * 0.16, y + s * 0.34); c.lineTo(x + dx, y + s * 0.34); c.closePath(); c.fill();
  }
  c.fillRect(x - s * 0.04, y + s * 1.08, s * 1.2, s * 0.08);
}
function glassIcon(c: CanvasRenderingContext2D, x: number, y: number, s: number) {
  c.beginPath(); c.moveTo(x, y); c.lineTo(x + s * 0.6, y); c.quadraticCurveTo(x + s * 0.62, y + s * 0.5, x + s * 0.3, y + s * 0.56); c.quadraticCurveTo(x - s * 0.02, y + s * 0.5, x, y); c.fill();
  c.fillRect(x + s * 0.27, y + s * 0.54, s * 0.06, s * 0.34); c.fillRect(x + s * 0.1, y + s * 0.86, s * 0.4, s * 0.06);
}
function umbrellaIcon(c: CanvasRenderingContext2D, x: number, y: number, s: number) {
  c.beginPath(); c.arc(x + s * 0.5, y + s * 0.45, s * 0.46, Math.PI, 0); c.closePath(); c.fill();
  c.fillRect(x + s * 0.47, y + s * 0.45, s * 0.06, s * 0.42);
  c.beginPath(); c.arc(x + s * 0.38, y + s * 0.87, s * 0.12, 0, Math.PI); c.lineWidth = s * 0.06; c.stroke();
  for (let i = 0; i < 3; i++) c.fillRect(x + s * (0.2 + i * 0.3), y - s * 0.28 + (i % 2) * s * 0.06, s * 0.05, s * 0.16);
}

export type BoxFaces = { front: Printed; back: Printed; side: Printed; flapMajor: Printed; flapMinor: Printed; inside: Printed; bottom: Printed };
const boxCache = new Map<string, BoxFaces>();

/** Printed kraft faces for a W × H × D carton (scene units). `plain` = unbranded kraft for the sorting line. */
export function boxFaces(W: number, H: number, D: number, { plain = false, seed = 1 }: { plain?: boolean; seed?: number } = {}): BoxFaces {
  const key = `${W}|${H}|${D}|${plain}|${seed}`;
  const hit = boxCache.get(key); if (hit) return hit;
  const px = plain ? PX * 0.55 : PX;

  const front = kraftFibres(new Sheet(W * px, H * px, { mask: false }), seed);
  if (!plain) {
    const s = front, u = s.H / 100;
    s.ink(INK, (c) => {
      drawMark(c, s.W * 0.06, u * 9, u * 26, INK, "#c49a64");
      wide(c, u * 12, 800); c.textBaseline = "alphabetic"; c.fillText(brand.wordmark, s.W * 0.06 + u * 30, u * 28.5);
      c.font = FONT.mono(700, u * 4.6); spaced(c, u * 0.9); c.fillText("EXPRESS COURIER · SINCE 2009", s.W * 0.06 + u * 31, u * 36.5);
      upArrows(c, s.W * 0.86, u * 10, u * 13);
      c.font = FONT.mono(700, u * 3.6); c.textAlign = "center"; c.fillText("THIS WAY UP", s.W * 0.86 + u * 7, u * 31);
    });
    s.ink(ORANGE, (c) => { c.fillRect(s.W * 0.06, u * 76, s.W * 0.88, u * 11); });
    s.ink("#c49a64", (c) => { wide(c, u * 6.4, 800, true); c.textBaseline = "middle"; c.fillText("ACROSS INDIA, BY TOMORROW.", s.W * 0.08, u * 81.8); });
    s.ink(INK, (c) => { c.font = FONT.mono(500, u * 3.2); spaced(c, u * 0.6); c.fillText("DOUBLE-WALL · 44 ECT · RECYCLABLE ♻", s.W * 0.06, u * 94); });
    speckle(s, seed + 3, "#c49a64", 0.35);
  }
  const back = kraftFibres(new Sheet(W * px, H * px, { mask: false }), seed + 1);
  if (!plain) {
    const s = back, u = s.H / 100;
    s.ink(INK, (c) => {
      const y = u * 14, sz = u * 22, gap = s.W * 0.2;
      frame(c, s.W * 0.1 - u * 3, y - u * 6, gap * 3 + u * 6, sz + u * 12, u * 1.2);
      glassIcon(c, s.W * 0.1 + gap * 0.18, y, sz); umbrellaIcon(c, s.W * 0.1 + gap * 1.2, y + u * 3, sz * 0.8); upArrows(c, s.W * 0.1 + gap * 2.2, y + u * 1, sz * 0.72);
      wide(c, u * 9, 800); c.textAlign = "left"; c.fillText("HANDLE WITH CARE", s.W * 0.1 - u * 3, u * 60);
      c.font = FONT.mono(500, u * 3.6); spaced(c, u * 0.7); c.fillText(`${brand.wordmark} · CALL ${brand.phone} · 24 × 7`, s.W * 0.1 - u * 3, u * 70);
    });
    s.ink(ORANGE, (c) => { c.fillRect(s.W * 0.1 - u * 3, u * 80, u * 26, u * 3); });
    speckle(s, seed + 5, "#c49a64", 0.35);
  }
  const side = kraftFibres(new Sheet(D * px, H * px, { mask: false }), seed + 2);
  if (!plain) {
    const s = side, u = s.H / 100;
    s.ink(ORANGE, (c) => { c.beginPath(); c.arc(s.W / 2, u * 40, u * 24, 0, Math.PI * 2); c.fill(); });
    s.ink(INK, (c) => {
      drawMark(c, s.W / 2 - u * 16, u * 24, u * 32, INK, ORANGE);
      wide(c, u * 8, 800); c.textAlign = "center"; c.fillText(brand.wordmark, s.W / 2, u * 80);
      c.font = FONT.mono(500, u * 3.4); spaced(c, u * 0.7); c.fillText("EXPRESS · SURFACE · INTERNATIONAL", s.W / 2, u * 89);
    });
    speckle(s, seed + 7, "#c49a64", 0.3);
  }
  const flapMajor = kraftFibres(new Sheet(W * px * 0.8, (D / 2) * px * 0.8, { mask: false }), seed + 4);
  if (!plain) {
    const s = flapMajor, u = s.H / 100;
    s.ink(INK, (c) => { c.font = FONT.mono(700, u * 6.5); spaced(c, u * 1.2); c.textAlign = "right"; c.fillText("OPEN WITH CARE  ✂ - - - -", s.W * 0.94, u * 88); });
  }
  const flapMinor = kraftFibres(new Sheet(D * px * 0.6, (D / 2) * px * 0.6, { mask: false }), seed + 6);
  const inside = kraftFibres(new Sheet(512, 512, { mask: false }), seed + 8, "#d9bd92");
  const bottom = kraftFibres(new Sheet(W * px * 0.5, D * px * 0.5, { mask: false }), seed + 9);
  const out: BoxFaces = {
    front: front.textures(), back: back.textures(), side: side.textures(), flapMajor: flapMajor.textures(),
    flapMinor: flapMinor.textures(), inside: inside.textures(), bottom: bottom.textures(),
  };
  boxCache.set(key, out);
  return out;
}

/** The corrugated edge: fluting between two liners. */
let fluteTex: THREE.Texture | null = null;
export function fluteTexture() {
  if (fluteTex) return fluteTex;
  const c = document.createElement("canvas"); c.width = 256; c.height = 32;
  const x = c.getContext("2d")!;
  x.fillStyle = "#b88a55"; x.fillRect(0, 0, 256, 32);
  x.fillStyle = "#d6b484"; x.fillRect(0, 0, 256, 5); x.fillRect(0, 27, 256, 5);
  x.strokeStyle = "#8a6034"; x.lineWidth = 2.2; x.beginPath();
  for (let i = 0; i <= 256; i++) { const y = 16 + Math.sin((i / 256) * Math.PI * 2 * 12) * 9.5; if (i) x.lineTo(i, y); else x.moveTo(i, y); }
  x.stroke();
  fluteTex = new THREE.CanvasTexture(c); fluteTex.colorSpace = THREE.SRGBColorSpace; fluteTex.wrapS = fluteTex.wrapT = THREE.RepeatWrapping;
  return fluteTex;
}

/* ---------------- branded tape ---------------- */
let tapeTex: Printed | null = null;
export function tapePrint() {
  if (tapeTex) return tapeTex;
  const s = new Sheet(2048, 160, { bump: false });
  s.paper(ORANGE, 0.28);
  s.ink(INK, (c) => {
    c.textBaseline = "middle";
    let x = 20;
    const items = [brand.wordmark, "●", "EXPRESS", "●", "SEALED FOR YOU", "●"];
    for (let k = 0; k < 4; k++) for (const t of items) {
      if (t === "●") { c.beginPath(); c.arc(x + 12, 80, 9, 0, Math.PI * 2); c.fill(); x += 50; continue; }
      wide(c, 64, 800, t !== brand.wordmark); c.fillText(t, x, 84); x += c.measureText(t).width + 38;
    }
  });
  s.ink("rgba(255,255,255,0.85)", (c) => { c.fillRect(0, 10, s.W, 5); c.fillRect(0, s.H - 15, s.W, 5); });
  tapeTex = s.textures();
  for (const t of [tapeTex.map, tapeTex.mask]) if (t) { t.wrapS = THREE.RepeatWrapping; }
  return tapeTex;
}

/* ---------------- the thermal label (landscape, reads from the front) ---------------- */
function qr(c: CanvasRenderingContext2D, x: number, y: number, size: number, seed: number) {
  const n = 25, m = size / n, r = mulberry32(seed);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (r() > 0.52) c.fillRect(x + i * m, y + j * m, m + 0.3, m + 0.3);
  const finder = (fx: number, fy: number) => {
    c.save(); c.fillStyle = "#fbfbf7"; c.fillRect(x + fx * m - m, y + fy * m - m, m * 9, m * 9); c.restore();
    c.fillRect(x + fx * m, y + fy * m, m * 7, m * 7);
    c.save(); c.fillStyle = "#fbfbf7"; c.fillRect(x + (fx + 1) * m, y + (fy + 1) * m, m * 5, m * 5); c.restore();
    c.fillRect(x + (fx + 2) * m, y + (fy + 2) * m, m * 3, m * 3);
  };
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
}

export type LabelSpec = { awb: string; to: { name: string; line: string; city: string; pin: string; code: string }; from: { name: string; city: string; pin: string; code: string }; weight: string; service: string; seed: number };
export const heroLabel: LabelSpec = { awb: hero.awb, to: hero.to, from: hero.from, weight: hero.weight, service: "EXPRESS", seed: 5829 };

const labelCache = new Map<string, Printed>();
/** 1500 × 1000 px thermal label. */
export function labelPrint(spec: LabelSpec = heroLabel, { lite = false }: { lite?: boolean } = {}) {
  const key = spec.awb + (lite ? "l" : "");
  const hit = labelCache.get(key); if (hit) return hit;
  const k = lite ? 0.5 : 1;
  const s = new Sheet(1500 * k, 1000 * k, { bump: false });
  const u = s.W / 150; // 1u = 10px at full size
  s.paper("#fbfbf7", 0.55);
  s.ink(INK, (c) => {
    c.textBaseline = "alphabetic";
    // header band
    c.fillRect(0, 0, s.W, u * 17);
    c.save(); c.fillStyle = "#fbfbf7";
    drawMark(c, u * 4, u * 2.5, u * 12, "#fbfbf7", INK);
    wide(c, u * 8.4, 800); c.fillText(brand.wordmark, u * 17.5, u * 11.6);
    c.textAlign = "right"; c.font = FONT.mono(700, u * 3.6); spaced(c, u * 0.7); c.fillText("PRIORITY · 24H · PREPAID", s.W - u * 38, u * 10.6);
    c.restore();
    // service block
    c.save(); c.fillStyle = ORANGE; c.fillRect(s.W - u * 34, 0, u * 34, u * 17); c.fillStyle = INK; wide(c, u * 5.6, 800, true); c.textAlign = "center"; c.fillText(spec.service, s.W - u * 17, u * 11); c.restore();

    // TO
    c.font = FONT.mono(700, u * 3); spaced(c, u * 0.5); c.fillText("SHIP TO", u * 5, u * 26);
    spaced(c, 0);
    c.font = FONT.sans(700, u * 6.4); c.fillText(spec.to.name, u * 5, u * 34.5);
    c.font = FONT.sans(500, u * 4.4); c.fillText(spec.to.line, u * 5, u * 41); c.fillText(`${spec.to.city}`, u * 5, u * 46.5);
    wide(c, u * 12, 800); c.fillText(spec.to.pin, u * 5, u * 60);
    // route code block
    frame(c, u * 92, u * 21, u * 53, u * 41, u * 0.9);
    c.textAlign = "center";
    c.font = FONT.mono(700, u * 3); spaced(c, u * 0.5); c.fillText("ROUTE", u * 118.5, u * 27.5); spaced(c, 0);
    wide(c, u * 10, 800); c.fillText(`${spec.from.code} › ${spec.to.code}`, u * 118.5, u * 41);
    c.fillRect(u * 92, u * 46, u * 53, u * 16);
    c.save(); c.fillStyle = "#fbfbf7"; wide(c, u * 7.4, 800, true); c.fillText(`${spec.to.code}-07`, u * 118.5, u * 57); c.restore();
    c.textAlign = "left";
    // FROM
    c.fillRect(u * 5, u * 65, s.W - u * 10, u * 0.6);
    c.font = FONT.mono(700, u * 2.6); spaced(c, u * 0.5); c.fillText("FROM", u * 5, u * 70.5); spaced(c, 0);
    c.font = FONT.sans(500, u * 3.4); c.fillText(`${spec.from.name} · ${spec.from.city} ${spec.from.pin}`, u * 17, u * 70.8);
    // barcode + AWB
    barcode(c, u * 5, u * 74, u * 104, u * 17, spec.seed);
    c.font = FONT.mono(700, u * 3.6); spaced(c, u * 1.1); c.fillText(`TRACKING ${spec.awb}`, u * 5, u * 96.5); spaced(c, 0);
    qr(c, u * 117, u * 70, u * 28, spec.seed + 1);
    c.font = FONT.mono(500, u * 2.4); c.textAlign = "right"; spaced(c, u * 0.4); c.fillText(`${spec.weight.toUpperCase()} · 1/1`, s.W - u * 5, u * 98.6);
  });
  const t = s.textures(lite ? 4 : 8);
  labelCache.set(key, t);
  return t;
}

/* ---------------- stickers ---------------- */
let fragile: Printed | null = null;
export function fragilePrint() {
  if (fragile) return fragile;
  const s = new Sheet(520, 360, { bump: false });
  s.paper("#e2231a", 0.4);
  s.ink("#ffffff", (c) => {
    frame(c, 14, 14, s.W - 28, s.H - 28, 6);
    glassIcon(c, 40, 60, 170);
    const x = 216; wide(c, 74, 800); c.fillText("FRAGILE", x - 4, 150);
    c.font = FONT.mono(700, 24); spaced(c, 4); c.fillText("HANDLE WITH CARE", x, 204); c.fillText("DO NOT DROP", x, 244);
    c.fillRect(x, 272, 250, 5);
  });
  fragile = s.textures(4);
  return fragile;
}

/* ---------------- the rubber stamp impression (alpha) ---------------- */
let stampTex: THREE.Texture | null = null;
export function stampTexture() {
  if (stampTex) return stampTex;
  const c = document.createElement("canvas"); c.width = 1024; c.height = 520;
  const x = c.getContext("2d")!;
  x.translate(512, 260);
  x.strokeStyle = x.fillStyle = "#d8231b";
  x.lineWidth = 16; roundRect(x, -480, -220, 960, 440, 60); x.stroke();
  x.lineWidth = 6; roundRect(x, -446, -186, 892, 372, 36); x.stroke();
  wide(x, 150, 800); x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("DELIVERED", 0, -28);
  x.font = FONT.mono(700, 44); spaced(x, 10); x.fillText(`${brand.wordmark} · ${hero.to.code} · 10:14`, 0, 110);
  // tick
  x.lineWidth = 22; x.lineCap = "round"; x.lineJoin = "round"; x.beginPath(); x.moveTo(-400, -150); x.lineTo(-372, -122); x.lineTo(-318, -186); x.stroke();
  // ink wear
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalCompositeOperation = "destination-out";
  const r = mulberry32(77);
  for (let i = 0; i < 5200; i++) { x.globalAlpha = 0.25 + r() * 0.75; const s = 1 + r() * 4.5; x.fillRect(r() * 1024, r() * 520, s, s); }
  for (let i = 0; i < 26; i++) { x.globalAlpha = 0.2 + r() * 0.3; x.beginPath(); x.ellipse(r() * 1024, r() * 520, 20 + r() * 80, 6 + r() * 20, r() * 3, 0, Math.PI * 2); x.fill(); }
  stampTex = new THREE.CanvasTexture(c); stampTex.colorSpace = THREE.SRGBColorSpace; stampTex.anisotropy = 8;
  return stampTex;
}

/* ---------------- map + labels ---------------- */
export function textSprite(text: string, { color = INK, bg = "rgba(243,241,236,0.92)", size = 44, dot = ORANGE }: { color?: string; bg?: string | null; size?: number; dot?: string | null } = {}) {
  const c = document.createElement("canvas");
  const x = c.getContext("2d")!;
  x.font = FONT.mono(700, size); spaced(x, size * 0.18);
  const w = Math.ceil(x.measureText(text).width + size * (dot ? 2.4 : 1.4)), h = Math.ceil(size * 1.9);
  c.width = w; c.height = h;
  if (bg) { x.fillStyle = bg; roundRect(x, 0, 0, w, h, h / 2); x.fill(); }
  if (dot) { x.fillStyle = dot; x.beginPath(); x.arc(size * 0.95, h / 2, size * 0.3, 0, Math.PI * 2); x.fill(); }
  x.font = FONT.mono(700, size); spaced(x, size * 0.18); x.fillStyle = color; x.textBaseline = "middle";
  x.fillText(text, dot ? size * 1.6 : size * 0.7, h / 2 + size * 0.04);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return { tex: t, aspect: w / h };
}

export function dotTexture(color = "255,255,255") {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, `rgba(${color},1)`); g.addColorStop(0.45, `rgba(${color},0.7)`); g.addColorStop(1, `rgba(${color},0)`);
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/** Soft red laser fan for the scan arch (additive). */
export function laserTexture() {
  const c = document.createElement("canvas"); c.width = 64; c.height = 256;
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "rgba(255,60,30,0.9)"); g.addColorStop(1, "rgba(255,60,30,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 256);
  const h = x.createLinearGradient(0, 0, 64, 0);
  h.addColorStop(0, "rgba(0,0,0,1)"); h.addColorStop(0.5, "rgba(0,0,0,0)"); h.addColorStop(1, "rgba(0,0,0,1)");
  x.globalCompositeOperation = "destination-out"; x.fillStyle = h; x.fillRect(0, 0, 64, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/** Bay sign on top of the scan arch. */
export function bayPrint() {
  const s = new Sheet(1024, 180, { bump: false });
  s.paper(INK, 0.4);
  s.ink("#ffffff", (c) => { wide(c, 84, 800); c.textBaseline = "middle"; c.fillText("SCAN", 40, 96); });
  s.ink(ORANGE, (c) => { c.fillRect(400, 36, 300, 108); });
  s.ink(INK, (c) => { wide(c, 72, 800, true); c.textBaseline = "middle"; c.textAlign = "center"; c.fillText("BAY 14", 550, 94); });
  s.ink("rgba(255,255,255,0.6)", (c) => { c.font = FONT.mono(700, 30); spaced(c, 5); c.textBaseline = "middle"; c.fillText("HYD HUB", 740, 96); });
  return s.textures(4);
}

/* ---------------- doorstep ---------------- */
export function marbleTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 1024;
  const x = c.getContext("2d")!;
  const r = mulberry32(31);
  const tile = 512;
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const ox = i * tile, oy = j * tile;
    const g = x.createLinearGradient(ox, oy, ox + tile, oy + tile);
    g.addColorStop(0, (i + j) % 2 ? "#ece8e1" : "#f3f0ea"); g.addColorStop(1, (i + j) % 2 ? "#e3ded5" : "#ebe7df");
    x.fillStyle = g; x.fillRect(ox, oy, tile, tile);
    for (let v = 0; v < 7; v++) {
      x.strokeStyle = `rgba(120,112,100,${0.06 + r() * 0.12})`; x.lineWidth = 0.8 + r() * 2.2;
      x.beginPath(); let px = ox + r() * tile, py = oy; x.moveTo(px, py);
      while (py < oy + tile) { px += (r() - 0.5) * 40; py += 10 + r() * 26; x.lineTo(px, py); }
      x.stroke();
    }
  }
  x.fillStyle = "#cfc9be"; x.fillRect(tile - 3, 0, 6, 1024); x.fillRect(0, tile - 3, 1024, 6); x.fillRect(0, 0, 1024, 3); x.fillRect(0, 0, 3, 1024);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}

export function doorPrint() {
  const s = new Sheet(560, 1120, { bump: true });
  const r = mulberry32(9);
  s.raw((c) => {
    c.fillStyle = "#20352c"; c.fillRect(0, 0, s.W, s.H);
    for (let i = 0; i < 380; i++) { c.strokeStyle = `rgba(${r() > 0.5 ? "10,20,15" : "70,95,80"},${0.03 + r() * 0.06})`; c.lineWidth = 1 + r() * 3; const xx = r() * s.W; c.beginPath(); c.moveTo(xx, 0); c.bezierCurveTo(xx + (r() - 0.5) * 30, s.H * 0.3, xx + (r() - 0.5) * 30, s.H * 0.7, xx + (r() - 0.5) * 20, s.H); c.stroke(); }
  });
  const panel = (x: number, y: number, w: number, h: number) => {
    s.emboss((c) => { frame(c, x, y, w, h, 18); }, -0.8);
    s.ink("rgba(5,10,8,0.45)", (c) => { frame(c, x, y, w, h, 6); });
    s.ink("rgba(200,230,210,0.14)", (c) => { c.fillRect(x + 18, y + 18, w - 36, 5); });
  };
  panel(70, 90, 420, 400); panel(70, 580, 420, 450);
  return s.textures(8);
}

export function nameplatePrint() {
  const s = new Sheet(520, 180, { bump: false });
  s.paper("#c9a25a", 0.3);
  s.foil((c) => { c.fillRect(0, 0, s.W, s.H); }, { color: "#d4ae68" });
  s.ink("#2b1d0e", (c) => { c.font = FONT.sans(700, 56); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("4B · SHARMA", s.W / 2, s.H / 2 + 4); frame(c, 12, 12, s.W - 24, s.H - 24, 4); });
  return s.textures(4);
}

export function matPrint() {
  const s = new Sheet(1024, 640, { bump: true });
  const r = mulberry32(12);
  s.raw((c) => {
    c.fillStyle = "#9b6a3a"; c.fillRect(0, 0, s.W, s.H);
    for (let i = 0; i < 16000; i++) { c.fillStyle = `rgba(${r() > 0.5 ? "60,36,14" : "200,150,90"},${0.2 + r() * 0.35})`; c.fillRect(r() * s.W, r() * s.H, 2 + r() * 3, 1 + r() * 2); }
  });
  s.ink("#3a2210", (c) => { frame(c, 40, 40, s.W - 80, s.H - 80, 22); wide(c, 112, 800); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("SWAGAT", s.W / 2, s.H / 2 + 6); });
  // a rangoli-style chain of diamonds and dots above and below the greeting, drawn on the canvas
  s.ink("#e8b04a", (c) => {
    for (const y of [112, s.H - 112]) for (let x = 130; x < s.W - 100; x += 58) {
      c.beginPath(); c.moveTo(x, y - 18); c.lineTo(x + 18, y); c.lineTo(x, y + 18); c.lineTo(x - 18, y); c.closePath(); c.fill();
      c.beginPath(); c.arc(x + 29, y, 5, 0, Math.PI * 2); c.fill();
    }
  });
  s.emboss((c) => { for (let y = 0; y < s.H; y += 8) c.fillRect(0, y, s.W, 3); }, 0.5);
  return s.textures(8);
}

/* ---------------- the mailer pouch & international extras ---------------- */
export function mailerPrint() {
  const s = new Sheet(1500, 1050, { bump: false });
  s.paper("#f6f4ef", 0.5);
  s.ink(ORANGE, (c) => { c.fillRect(0, 0, s.W, 150); });
  s.ink(INK, (c) => {
    drawMark(c, 60, 30, 90, INK, ORANGE);
    wide(c, 76, 800); c.textBaseline = "middle"; c.fillText(brand.wordmark, 170, 78);
    c.font = FONT.mono(700, 30); spaced(c, 6); c.textAlign = "right"; c.fillText("SAME DAY · DOCUMENTS", s.W - 60, 80);
    c.textAlign = "left"; spaced(c, 4); c.font = FONT.mono(500, 26);
    c.fillText("TAMPER-EVIDENT · WATERPROOF · 100% RECYCLED PE", 60, s.H - 50);
  });
  s.ink("rgba(21,23,27,0.1)", (c) => { for (let i = 0; i < 16; i++) c.fillRect(0, 190 + i * 52, s.W, 2); });
  return s.textures(6);
}

let airmail: Printed | null = null;
export function airmailPrint() {
  if (airmail) return airmail;
  const s = new Sheet(2048, 160, { bump: false });
  s.paper("#f7f5ef", 0.3);
  s.ink("#d8231b", (c) => { for (let x = -80; x < s.W + 80; x += 160) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 60, 0); c.lineTo(x + 20, s.H); c.lineTo(x - 40, s.H); c.closePath(); c.fill(); } });
  s.ink("#2743ff", (c) => { for (let x = 0; x < s.W + 80; x += 160) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 60, 0); c.lineTo(x + 20, s.H); c.lineTo(x - 40, s.H); c.closePath(); c.fill(); } });
  s.ink(INK, (c) => { c.fillStyle = "#f7f5ef"; c.fillRect(0, 44, s.W, 72); c.fillStyle = INK; wide(c, 50, 800, true); c.textBaseline = "middle"; for (let x = 30; x < s.W; x += 700) c.fillText("PAR AVION · BY AIR", x, 82); });
  airmail = s.textures(4);
  for (const t of [airmail.map, airmail.mask]) if (t) t.wrapS = THREE.RepeatWrapping;
  return airmail;
}

export function customsPrint() {
  const s = new Sheet(800, 560, { bump: false });
  s.paper("#d9f0dc", 0.5);
  s.ink("#0e3b1f", (c) => {
    frame(c, 16, 16, s.W - 32, s.H - 32, 5);
    wide(c, 50, 800); c.fillText("CUSTOMS", 44, 96); c.font = FONT.mono(700, 30); spaced(c, 4); c.fillText("DECLARATION · CN22", 44, 140);
    c.fillRect(44, 170, s.W - 88, 3);
    c.font = FONT.sans(500, 28); spaced(c, 0);
    ["Gift  ☐   Documents  ☐   Sale of goods  ☒", "Handmade blue pottery, 2 pcs · 1.8 kg", "Value  INR 8,500  ·  HS 6912.00", "Duties paid by sender (DDP)"].forEach((t, i) => c.fillText(t, 44, 226 + i * 64));
    barcode(c, 44, 470, 460, 50, 911);
  });
  return s.textures(4);
}

/* ---------------- a gift inside ---------------- */
export function giftPrint() {
  const s = new Sheet(640, 640, { bump: true });
  s.paper("#2743ff", 0.35);
  s.ink("rgba(255,255,255,0.13)", (c) => { for (let i = -640; i < 640; i += 48) { c.save(); c.translate(i, 0); c.rotate(0.6); c.fillRect(0, -200, 16, 1400); c.restore(); } });
  s.foil((c) => { c.textAlign = "center"; c.textBaseline = "middle"; wide(c, 50, 800, true); c.fillText("for you", 320, 320); }, { emboss: 0.8, color: "#ffd2b8" });
  return s.textures(6);
}