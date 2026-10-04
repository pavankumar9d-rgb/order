"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { boxFaces, tapePrint, labelPrint, heroLabel } from "@/lib/story/textures";
import { fontsReady, printedMaterial, FONT } from "@/lib/story/print";
import { studioEnvironment, studioLights } from "@/lib/story/studio";
import { useQualityTier } from "@/lib/hooks";

export type RatesState = { l: number; w: number; h: number; kg: number; byVolume: boolean };
const CM = 1 / 40; // scene units per centimetre

function scaleDisplay() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 160;
  const x = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  let last = "";
  const draw = (kg: number) => {
    const s = kg.toFixed(2);
    if (s === last) return; last = s;
    x.fillStyle = "#0d1a12"; x.fillRect(0, 0, 512, 160);
    x.fillStyle = "rgba(60,255,150,0.08)"; x.font = FONT.mono(700, 104); x.textAlign = "right"; x.textBaseline = "middle"; x.fillText("88.88", 400, 84);
    x.fillStyle = "#5dffa6"; x.shadowColor = "rgba(93,255,166,0.8)"; x.shadowBlur = 16; x.fillText(s, 400, 84); x.shadowBlur = 0;
    x.font = FONT.mono(700, 40); x.textAlign = "left"; x.fillText("KG", 416, 96);
    tex.needsUpdate = true;
  };
  draw(1);
  return { tex, draw };
}

function dimSprite() {
  const c = document.createElement("canvas"); c.width = 256; c.height = 96;
  const x = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  sp.scale.set(0.62, 0.232, 1); sp.renderOrder = 10;
  let last = "";
  const draw = (v: number) => {
    const s = `${Math.round(v)} cm`; if (s === last) return; last = s;
    x.clearRect(0, 0, 256, 96);
    x.fillStyle = "#101216"; x.beginPath(); x.roundRect(8, 12, 240, 72, 36); x.fill();
    x.fillStyle = "#f3f1ec"; x.font = FONT.mono(700, 40); x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(s, 128, 50);
    tex.needsUpdate = true;
  };
  return { sp, draw };
}

function Rig({ state, drag }: { state: { current: RatesState }; drag: { current: { dx: number; vel: number; down: boolean } } }) {
  const { gl, scene, camera, size } = useThree();
  useEffect(() => { scene.environment = studioEnvironment(gl); scene.environmentIntensity = 0.9; const l = studioLights(); scene.add(l); return () => { scene.remove(l); }; }, [gl, scene]);

  const kit = useMemo(() => {
    const root = new THREE.Group();
    // weighing scale
    const steel = new THREE.MeshPhysicalMaterial({ color: "#d4d7dc", metalness: 1, roughness: 0.28 });
    const body = new THREE.MeshPhysicalMaterial({ color: "#15171b", roughness: 0.45, clearcoat: 0.6 });
    const base = new THREE.Mesh(new RoundedBoxGeometry(2.9, 0.16, 2.3, 3, 0.05), body); base.position.y = -0.14; root.add(base);
    const plate = new THREE.Mesh(new RoundedBoxGeometry(2.7, 0.05, 2.1, 3, 0.02), steel); plate.position.y = -0.03; root.add(plate);
    const disp = scaleDisplay();
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.28), new THREE.MeshBasicMaterial({ map: disp.tex, toneMapped: false }));
    const pod = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.4, 0.14, 3, 0.03), body); pod.position.set(0, -0.14, 1.26); pod.rotation.x = -0.5; root.add(pod);
    screen.position.set(0, -0.12, 1.335); screen.rotation.x = -0.5; root.add(screen);
    // the carton (unit box, scaled)
    const f = boxFaces(1, 1, 1, { plain: true, seed: 12 });
    const kraft = printedMaterial(f.front, { bumpScale: 0.6 }); kraft.clearcoat = 0; kraft.roughness = 0.85; kraft.metalness = 0; kraft.metalnessMap = null; kraft.roughnessMap = null; kraft.clearcoatMap = null;
    const box = new THREE.Mesh(new RoundedBoxGeometry(1, 1, 1, 2, 0.015), kraft); box.castShadow = true; root.add(box);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), new THREE.LineBasicMaterial({ color: "#ff5a1f", transparent: true, opacity: 0 }));
    root.add(edges);
    // tape along the top, down both ends
    const tp = tapePrint();
    const tmap = tp.map.clone(); tmap.needsUpdate = true;
    const tapeMat = new THREE.MeshPhysicalMaterial({ map: tmap, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05, polygonOffset: true, polygonOffsetFactor: -2 });
    const tapeTop = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), tapeMat); tapeTop.rotation.x = -Math.PI / 2; root.add(tapeTop);
    const tapeL = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), tapeMat); tapeL.rotation.set(0, -Math.PI / 2, Math.PI / 2); root.add(tapeL);
    const tapeR = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), tapeMat); tapeR.rotation.set(0, Math.PI / 2, -Math.PI / 2); root.add(tapeR);
    // label
    const lm = printedMaterial(labelPrint(heroLabel, { lite: true }), { bumpScale: 0 }); lm.polygonOffset = true; lm.polygonOffsetFactor = -4;
    const label = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.6), lm); label.rotation.x = -Math.PI / 2; root.add(label);
    // dimension callouts
    const lineMat = new THREE.LineBasicMaterial({ color: "#101216", transparent: true, opacity: 0.7 });
    const mkLine = () => { const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(1, 0, 0)]); const l = new THREE.Line(g, lineMat); root.add(l); return l; };
    const dims = { l: dimSprite(), w: dimSprite(), h: dimSprite() };
    Object.values(dims).forEach((d) => root.add(d.sp));
    const lines = { l: mkLine(), w: mkLine(), h: mkLine() };
    return { root, box, edges, tapeTop, tapeL, tapeR, tmap, label, disp, dims, lines };
  }, []);

  const cur = useRef({ l: 40, w: 30, h: 20, kg: 2 });
  const rot = useRef(-0.6);
  const frames = useRef(0);
  const setLine = (l: THREE.Line, a: THREE.Vector3, b: THREE.Vector3) => { const p = l.geometry.getAttribute("position") as THREE.BufferAttribute; p.setXYZ(0, a.x, a.y, a.z); p.setXYZ(1, b.x, b.y, b.z); p.needsUpdate = true; l.geometry.computeBoundingSphere(); };
  const A = useMemo(() => new THREE.Vector3(), []), B = useMemo(() => new THREE.Vector3(), []);

  useFrame((st, dt) => {
    if (++frames.current === 3) window.dispatchEvent(new Event("dak:rates-ready"));
    const d = Math.min(dt, 0.05), k = 1 - Math.pow(0.004, d);
    const s = state.current, c = cur.current;
    c.l += (s.l - c.l) * k; c.w += (s.w - c.w) * k; c.h += (s.h - c.h) * k; c.kg += (s.kg - c.kg) * k * 0.8;
    const L = c.l * CM, Hh = c.h * CM, Wd = c.w * CM;
    const { box, edges, tapeTop, tapeL, tapeR, tmap, label, disp, dims, lines } = kit;
    box.scale.set(L, Hh, Wd); box.position.set(0, Hh / 2, 0);
    edges.scale.set(L * 1.004, Hh * 1.004, Wd * 1.004); edges.position.copy(box.position);
    const em = edges.material as THREE.LineBasicMaterial; em.opacity += ((s.byVolume ? 0.9 : 0) - em.opacity) * k;
    const tw = Math.min(0.24, Wd * 0.3), drop = Math.min(0.3, Hh * 0.4);
    tapeTop.scale.set(L + 0.004, tw, 1); tapeTop.position.set(0, Hh + 0.002, 0);
    tapeL.scale.set(drop, tw, 1); tapeL.position.set(-L / 2 - 0.002, Hh - drop / 2, 0);
    tapeR.scale.set(drop, tw, 1); tapeR.position.set(L / 2 + 0.002, Hh - drop / 2, 0);
    tmap.repeat.set(L / 2.4, 1);
    const ls = Math.min(1, (L * 0.8) / 0.9, (Wd * 0.8) / 0.6);
    label.scale.setScalar(ls); label.position.set(0, Hh + 0.004, 0);
    disp.draw(c.kg);
    // callouts: length along the front-bottom edge, width along the right-bottom edge, height up the front-right edge
    const o = 0.18;
    setLine(lines.l, A.set(-L / 2, 0.001, Wd / 2 + o), B.set(L / 2, 0.001, Wd / 2 + o));
    dims.l.sp.position.set(0, 0.02, Wd / 2 + o + 0.2); dims.l.draw(c.l);
    setLine(lines.w, A.set(L / 2 + o, 0.001, -Wd / 2), B.set(L / 2 + o, 0.001, Wd / 2));
    dims.w.sp.position.set(L / 2 + o + 0.36, 0.02, 0); dims.w.draw(c.w);
    setLine(lines.h, A.set(-L / 2 - o, 0, Wd / 2), B.set(-L / 2 - o, Hh, Wd / 2));
    dims.h.sp.position.set(-L / 2 - o - 0.36, Hh / 2, Wd / 2); dims.h.draw(c.h);

    const dr = drag.current;
    if (!dr.down) { dr.vel *= Math.pow(0.04, d); rot.current += d * 0.12 + dr.vel * d; } else { rot.current += dr.dx * 0.01; dr.vel = (dr.dx * 0.01) / Math.max(d, 1 / 120); dr.dx = 0; }
    kit.root.rotation.y = Math.sin(rot.current) * 0.55 - 0.35;
    kit.root.position.y = -0.55 + Math.sin(st.clock.elapsedTime * 0.8) * 0.01;
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const tanH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const span = Math.max(3.4, L + 1.6, Wd + 1.8), tall = Math.max(2.4, Hh + 1.2);
    const dist = Math.max(tall / (2 * tanH), span / (2 * tanH * aspect)) * 1.12;
    cam.position.lerp(A.set(0, dist * 0.55, dist), k); cam.lookAt(0, Hh * 0.35 - 0.2, 0);
  });

  return <primitive object={kit.root} />;
}

/** Live carton on a weighing scale for the rate calculator. Props feed a ref — the canvas never re-renders. */
export default function RatesScene({ config }: { config: RatesState }) {
  const tier = useQualityTier();
  const state = useRef(config);
  state.current = config;
  const drag = useRef({ dx: 0, vel: 0, down: false });
  const last = useRef(0);
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [fonts, setFonts] = useState(false);
  useEffect(() => { fontsReady().then(() => setFonts(true)); }, []);
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const io = new IntersectionObserver(([en]) => setVisible(en.isIntersecting), { threshold: 0 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <div ref={wrap} className="absolute inset-0 touch-pan-y" data-cursor="drag"
      onPointerDown={(e) => { drag.current.down = true; last.current = e.clientX; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); }}
      onPointerMove={(e) => { if (!drag.current.down) return; drag.current.dx += e.clientX - last.current; last.current = e.clientX; }}
      onPointerUp={() => { drag.current.down = false; }} onPointerCancel={() => { drag.current.down = false; }}>
      {fonts && (
        <Canvas dpr={[1, 1.35]} camera={{ fov: 26, position: [0, 3, 8], near: 0.1, far: 60 }}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping }} className="!absolute inset-0" frameloop={visible ? "always" : "never"} aria-hidden>
          <Rig state={state} drag={drag} />
        </Canvas>
      )}
    </div>
  );
}