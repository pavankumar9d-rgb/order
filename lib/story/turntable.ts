"use client";
import * as THREE from "three";
import { fontsReady } from "./print";
import { configureRenderer } from "./studio";
import { buildService, createStudioScene, STUDIO } from "./stills";

/**
 * Live "flip" for the service cards: the same studio, builder and camera as the stills, so a card
 * swaps still → live canvas → still without a jump. One renderer, moved into whichever card plays.
 */
export type FlipState = { hop: number; spin: number; tilt: number; squash: number; sweep: number };

type Entry = ReturnType<typeof buildService> & { rx: number; ry: number };

class Turntable {
  readonly renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private sweep: THREE.DirectionalLight;
  private items = new Map<string, Entry>();
  private cur: Entry | null = null;
  busy = false;
  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    configureRenderer(this.renderer);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.scene = createStudioScene(this.renderer);
    this.camera = new THREE.PerspectiveCamera(STUDIO.fov, STUDIO.W / STUDIO.H, 0.1, 60);
    this.sweep = new THREE.DirectionalLight("#fff4e6", 0); this.scene.add(this.sweep);
    const el = this.renderer.domElement;
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:block";
  }
  use(id: string) {
    let e = this.items.get(id);
    if (!e) { const b = buildService(id); e = { ...b, rx: b.root.rotation.x, ry: b.root.rotation.y }; this.items.set(id, e); }
    if (this.cur !== e) { if (this.cur) this.scene.remove(this.cur.root); this.scene.add(e.root); this.cur = e; }
    this.camera.position.copy(e.cam); this.camera.lookAt(e.look);
  }
  mount(host: HTMLElement, overscan = 1) {
    host.appendChild(this.renderer.domElement);
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.zoom = 1 / overscan; this.camera.updateProjectionMatrix();
  }
  unmount() { this.renderer.domElement.remove(); }
  apply(s: FlipState) {
    const e = this.cur; if (!e) return;
    e.root.position.y = s.hop * 0.9;
    e.root.rotation.set(e.rx + s.tilt, e.ry + s.spin * Math.PI * 2, 0);
    e.inner.scale.set(1 + s.squash * 0.08, 1 - s.squash * 0.14, 1 + s.squash * 0.08);
    this.sweep.intensity = Math.sin(Math.PI * s.sweep) * 2.4;
    this.sweep.position.set(-5 + 10 * s.sweep, 1.5, 4);
  }
  render() { this.renderer.render(this.scene, this.camera); }
  warm(id: string) { this.use(id); this.renderer.compile(this.scene, this.camera); }
}

let instance: Promise<Turntable> | null = null;
export function getTurntable() { instance ??= fontsReady().then(() => new Turntable()); return instance; }