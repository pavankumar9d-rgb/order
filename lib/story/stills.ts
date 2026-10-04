"use client";
import * as THREE from "three";
import { createParcel, createMailer, createGift, createShreds, createDoorstep, addCustoms, HERO_BOX } from "./models";
import { heroLabel } from "./textures";
import { fontsReady } from "./print";
import { configureRenderer, studioEnvironment, studioLights } from "./studio";
import { PARCEL_POSE, type StillKey } from "./pose";
import { services } from "@/data/site";

/** Studio stills rendered in the browser from the story's own models. One renderer, serial queue, cached URLs. */
export type { StillKey };
export const STUDIO = { W: 600, H: 800, fov: 24 } as const;

export function createStudioScene(renderer: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  scene.environment = studioEnvironment(renderer);
  scene.environmentIntensity = 0.9;
  scene.add(studioLights());
  return scene;
}

/** A service's parcel in its card pose — shared with the card turntable. */
export function buildService(id: string) {
  const svc = services.find((s) => s.id === id) ?? services[1];
  const g = new THREE.Group();
  const inner = new THREE.Group(); g.add(inner);
  if (svc.id === "document") {
    const m = createMailer(); inner.add(m.root);
    g.rotation.set(0.95, -0.5, 0.08);
    return { root: g, inner, cam: new THREE.Vector3(0, 0.1, 6.2), look: new THREE.Vector3(0, 0, 0), h: m.H };
  }
  const [W, H, D] = svc.size;
  const label = svc.id === "intl"
    ? { ...heroLabel, awb: "PE 7710 2284 0519", to: { name: "Daniel Tan", line: "22 Orchard Road", city: "Singapore", pin: "238841", code: "SIN" }, service: "INTL", seed: 771 }
    : svc.id === "medium" ? { ...heroLabel, awb: "PE 3391 5082 4410", to: { name: "Rohit Verma", line: "12, 4th Cross, Indiranagar", city: "Bengaluru, Karnataka", pin: "560038", code: "BLR" }, service: "SURFACE", seed: 339 } : heroLabel;
  const p = createParcel({ W, H, D, tape: svc.id === "intl" ? "airmail" : "brand", fragile: svc.id === "small", seed: 11 + W * 10, label, liteLabel: true });
  if (svc.id === "intl") addCustoms(p);
  inner.add(p.root);
  g.rotation.set(PARCEL_POSE.x, PARCEL_POSE.y, PARCEL_POSE.z);
  return { root: g, inner, cam: new THREE.Vector3(0, 0.15, 6.9), look: new THREE.Vector3(0, 0, 0), h: H };
}

type Job = { key: StillKey; resolve: (url: string) => void; reject: (e: unknown) => void };
const cache = new Map<StillKey, Promise<string>>();
const queue: Job[] = [];
let running = false;
let ctx: { renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera } | null = null;
let idleTimer = 0;

function setup() {
  if (ctx) return ctx;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "low-power" });
  renderer.setPixelRatio(1.5); renderer.setSize(STUDIO.W, STUDIO.H, false);
  configureRenderer(renderer);
  ctx = { renderer, scene: createStudioScene(renderer), camera: new THREE.PerspectiveCamera(STUDIO.fov, STUDIO.W / STUDIO.H, 0.1, 60) };
  return ctx;
}
function teardown() { if (!ctx) return; ctx.renderer.dispose(); ctx.renderer.forceContextLoss(); ctx = null; }

function stage(key: StillKey): { obj: THREE.Object3D; cam: THREE.Vector3; look: THREE.Vector3 } {
  const [kind, arg] = key.split(":");
  if (kind === "svc") { const s = buildService(arg); return { obj: s.root, cam: s.cam, look: s.look }; }
  if (kind === "open") {
    const p = createParcel({ ...HERO_BOX, tape: null, fragile: true, seed: 1, label: null }); p.setOpen(1);
    const gift = createGift(); gift.root.position.set(0, -HERO_BOX.H / 2 + 0.028 + gift.H / 2 + 0.25, 0.02); gift.root.rotation.set(0.12, 0.4, -0.08);
    const sh = createShreds(); sh.set(1); p.inner.add(gift.root, sh.mesh);
    p.root.rotation.set(0.5, -0.55, 0);
    return { obj: p.root, cam: new THREE.Vector3(0, 0.2, 11), look: new THREE.Vector3(0, 0.3, 0) };
  }
  if (kind === "door") {
    const g = new THREE.Group();
    const d = createDoorstep(); g.add(d.root);
    const p = createParcel({ ...HERO_BOX, tape: "brand", fragile: true, seed: 1 }); p.setStamp(1);
    p.root.position.copy(d.spot); p.root.position.y += HERO_BOX.H / 2; p.root.rotation.y = -0.16; g.add(p.root);
    return { obj: g, cam: new THREE.Vector3(2.2, 3.4, 9.6), look: new THREE.Vector3(-0.3, 1.5, -1.6) };
  }
  const p = createParcel({ ...HERO_BOX, tape: "brand", fragile: true, seed: 1 });
  if (kind === "stamped") p.setStamp(1);
  p.root.rotation.set(PARCEL_POSE.x, PARCEL_POSE.y, PARCEL_POSE.z);
  return { obj: p.root, cam: new THREE.Vector3(0, 0.15, 9.4), look: new THREE.Vector3(0, 0, 0) };
}

async function run() {
  if (running) return;
  running = true; clearTimeout(idleTimer);
  await fontsReady();
  while (queue.length) {
    const job = queue.shift()!;
    try {
      const { renderer, scene, camera } = setup();
      const { obj, cam, look } = stage(job.key);
      const wide = job.key === "door";
      camera.aspect = wide ? 4 / 3 : STUDIO.W / STUDIO.H; camera.fov = wide ? 38 : STUDIO.fov; camera.updateProjectionMatrix();
      renderer.setSize(wide ? 800 : STUDIO.W, wide ? 600 : STUDIO.H, false);
      scene.add(obj); camera.position.copy(cam); camera.lookAt(look);
      renderer.render(scene, camera);
      const blob = await new Promise<Blob | null>((r) => renderer.domElement.toBlob(r, "image/webp", 0.93));
      scene.remove(obj);
      if (!blob) throw new Error("toBlob failed");
      job.resolve(URL.createObjectURL(blob));
    } catch (e) { job.reject(e); }
    await new Promise((r) => setTimeout(r, 0));
  }
  running = false;
  idleTimer = window.setTimeout(teardown, 1500);
}

export function getStill(key: StillKey): Promise<string> {
  let p = cache.get(key);
  if (!p) {
    p = new Promise<string>((resolve, reject) => { queue.push({ key, resolve, reject }); });
    cache.set(key, p);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => run(), { timeout: 600 }); else setTimeout(() => run(), 50);
  }
  return p;
}