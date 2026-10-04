"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { createParcel, createGift, createShreds, createConveyor, createMap, createDoorstep, createStamper, cityPos, HERO_BOX, BELT, MAP } from "@/lib/story/models";
import { ROUTE } from "@/lib/map";
import { fontsReady } from "@/lib/story/print";
import { studioEnvironment, studioLights } from "@/lib/story/studio";
import { BEAT } from "@/lib/story/timeline";
import { usePointer, useQualityTier, useIsMobile } from "@/lib/hooks";
import { seg, easeInOut, easeOut, lerp, clamp } from "@/lib/utils";

export type StoryRefs = { progress: { current: number }; entrance: { current: number } };

const b = (p: number, k: keyof typeof BEAT) => seg(p, BEAT[k][0], BEAT[k][1]);
const easeIn = (t: number) => t * t * t;
const bounce = (t: number) => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375; return n * (t -= 2.625 / d) * t + 0.984375; };
const { W, H, D } = HERO_BOX;
const RIDE_FROM = -4.2, RIDE_TO = 4.2;

function blobTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(16,18,22,0.55)"); g.addColorStop(0.5, "rgba(16,18,22,0.2)"); g.addColorStop(1, "rgba(16,18,22,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

type Shot = { t: THREE.Vector3; d: THREE.Vector3; w: number; h: number };
const shot = (t: [number, number, number], d: [number, number, number], w: number, h: number): Shot => ({ t: new THREE.Vector3(...t), d: new THREE.Vector3(...d).normalize(), w, h });

function Rig({ progress, entrance, mobile, reduced }: StoryRefs & { mobile: boolean; reduced: boolean }) {
  const { camera, size, gl, scene } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  useEffect(() => {
    scene.environment = studioEnvironment(gl);
    scene.environmentIntensity = 0.9;
    const l = studioLights(); scene.add(l);
    return () => { scene.remove(l); };
  }, [gl, scene]);

  const parcel = useMemo(() => createParcel({ ...HERO_BOX, tape: "brand", fragile: true, seed: 1 }), []);
  const gift = useMemo(() => createGift(), []);
  const shreds = useMemo(() => createShreds(), []);
  useMemo(() => { parcel.inner.add(gift.root, shreds.mesh); }, [parcel, gift, shreds]);
  const conv = useMemo(() => createConveyor(), []);
  const map = useMemo(() => createMap(), []);
  const door = useMemo(() => { const d = createDoorstep(); cityPos(ROUTE.to, d.root.position); return d; }, []);
  const stamper = useMemo(() => createStamper(), []);
  const blob = useMemo(() => blobTexture(), []);
  const scanLine = useMemo(() => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.035, D * 0.98), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff2a12").multiplyScalar(2.2), toneMapped: false, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.visible = false; parcel.root.add(m); return m;
  }, [parcel]);
  const DEST = useMemo(() => cityPos(ROUTE.to), []);
  const shots = useMemo(() => ({
    hero: shot([0, 0.62, 0], [0, 0.4, 1], 4.4, 4.9),
    pack: shot([0, 0.1, 0], [0.5, 0.78, 1], 4.3, 3.8),
    label: shot([0, 0.42, 0], [0.12, 1.55, 1], 3.6, 3.2),
    belt: shot([0, -0.1, 0], [0.78, 0.55, 1], 8.4, 5.2),
    out: shot([4.7, MAP.Y, -6.2], [0, 2.1, 1], 46, 42),
    fly: shot([1.5, MAP.Y, -7.5], [0, 1.55, 1], 34, 30),
    door: shot([0, 0, 0], [0.3, 0.36, 1], 8.6, 6.6),
    stamp: shot([0, 0, 0], [0.12, 0.95, 1], 3.6, 3.1),
  }), []);

  const shadow = useRef<THREE.Mesh>(null);
  const pointer = usePointer();
  const ptr = useRef({ x: 0, y: 0 });
  const spin = useRef(0);
  const camPos = useRef(new THREE.Vector3(0, 1.5, 9));
  const lookCur = useRef(new THREE.Vector3());
  const V = useMemo(() => ({ bp: new THREE.Vector3(), jy: new THREE.Vector3(), bt: new THREE.Vector3(), ft: new THREE.Vector3(), dt: new THREE.Vector3(), st: new THREE.Vector3(), off: new THREE.Vector3(), t: new THREE.Vector3(), d: new THREE.Vector3(), a: new THREE.Vector3(), q: new THREE.Quaternion(), m: new THREE.Matrix4(), up: new THREE.Vector3(0, 1, 0), x: new THREE.Vector3(), z: new THREE.Vector3(), pivot: new THREE.Vector3(0, MAP.Y, 0), top: new THREE.Vector3() }), []);
  const frames = useRef(0);

  useFrame((st, dt) => {
    if (++frames.current === 3) window.dispatchEvent(new Event("dak:scene-ready"));
    const p = progress.current;
    const e = reduced ? 1 : easeOut(clamp(entrance.current));
    const t = st.clock.elapsedTime;
    const d = Math.min(dt, 0.05);
    const k = 1 - Math.pow(0.0016, d);
    ptr.current.x = lerp(ptr.current.x, reduced ? 0 : pointer.current.x, k * 0.5);
    ptr.current.y = lerp(ptr.current.y, reduced ? 0 : pointer.current.y, k * 0.5);
    const px = ptr.current.x, py = ptr.current.y;
    const sway = reduced ? 0 : 1;

    const drop = b(p, "drop"), shr = b(p, "shreds"), close = easeInOut(b(p, "close")), tape = b(p, "tape"), lab = b(p, "label");
    const toBelt = easeInOut(b(p, "belt")), ride = b(p, "ride"), scan = b(p, "scan");
    const zo = b(p, "zoomOut"), fly = b(p, "fly"), zi = b(p, "zoomIn"), pop = b(p, "pop"), land = b(p, "land"), stampT = b(p, "stamp");
    const cover = easeInOut(b(p, "cover"));
    const statsHold = easeInOut(b(p, "statsIn")) * (1 - easeInOut(b(p, "statsOut")));

    // ---------------- the parcel: pack → tape → label
    parcel.setOpen(1 - close);
    const g0 = easeInOut(drop);
    gift.root.position.set(0, lerp(1.15, -H / 2 + 0.028 + gift.H / 2 + 0.004, easeIn(clamp(drop * 1.05))), 0);
    gift.root.rotation.set(Math.sin(t * 0.9) * 0.12 * (1 - g0) * sway, (1 - g0) * (t * 0.5 * sway + 0.6), Math.sin(t * 0.7) * 0.1 * (1 - g0) * sway);
    gift.root.visible = close < 0.98;
    shreds.set(shr); shreds.mesh.visible = shr > 0 && close < 0.98;
    parcel.tape!.set(easeInOut(tape));
    parcel.setLabel(lab);

    // pose before the belt
    spin.current += reduced ? 0 : d * 0.25 * (1 - g0);
    let ry = lerp(spin.current - 0.5 + (1 - e) * -1.5, -0.52, easeInOut(clamp(drop * 1.2)));
    ry = lerp(ry, -0.28, easeInOut(seg(p, BEAT.tape[1], BEAT.label[1])));
    let rx = lerp(0.1, 0.0, g0);
    const bob = Math.sin(t * 0.8) * 0.04 * sway * (1 - toBelt);
    const A = V.a.set(0, lerp(-0.2 - (1 - e) * 0.6, 0, close) + bob, 0);
    // onto the belt, then the ride
    const beltPos = V.bp.set(lerp(RIDE_FROM, RIDE_TO, ride), BELT.Y + H / 2, 0);
    const pos = A.lerp(beltPos, toBelt); pos.y += Math.sin(Math.PI * toBelt) * 0.7;
    ry = lerp(ry, 0, toBelt); rx = lerp(rx, 0, toBelt);
    // zoom out: everything at the hub shrinks into the origin city's pin
    const hubS = Math.max(0.0001, 1 - easeIn(clamp(zo * 1.15)));
    const hubOn = zo < 0.999;
    // landing at the door in Hauz Khas
    const atDoor = p >= BEAT.land[0] - 0.02;
    if (atDoor) {
      const le = clamp(land);
      const fall = 1 - bounce(le);
      pos.copy(DEST).add(door.spot); pos.y += H / 2 + fall * 2.6 * Math.min(1, le * 8 + 0.2);
      ry = lerp(0.9, -0.16, easeOut(le)); rx = lerp(0.3, 0, easeOut(le));
      parcel.root.visible = land > 0;
      parcel.root.scale.set(1, 1 - Math.sin(Math.PI * clamp((stampT - 0.4) / 0.2)) * 0.035, 1);
    } else {
      pos.sub(V.pivot).multiplyScalar(hubS).add(V.pivot);
      parcel.root.visible = hubOn;
      parcel.root.scale.setScalar(hubS);
    }
    pos.y -= cover * 0.9;
    parcel.root.position.copy(pos);
    parcel.root.rotation.set(rx - py * 0.05 * (1 - toBelt), ry + px * 0.14 * (1 - toBelt), 0);
    parcel.setStamp(clamp((stampT - 0.42) / 0.12));

    // scan line across the parcel top as it passes under the arch (x = 0)
    const lx = -pos.x;
    scanLine.visible = toBelt > 0.99 && Math.abs(lx) < W / 2 - 0.02 && scan > 0 && scan < 1 && hubOn;
    scanLine.position.set(lx, parcel.top + 0.012, 0);

    // ---------------- conveyor
    conv.root.visible = p > BEAT.belt[0] - 0.01 && hubOn;
    const rise = easeOut(clamp(toBelt * 1.6));
    conv.root.scale.setScalar(hubS);
    conv.root.position.set(0, (-3.2 * (1 - rise)) * hubS + V.pivot.y * (1 - hubS), 0);
    conv.bt.offset.x = -((ride * (RIDE_TO - RIDE_FROM)) / 1.2);
    conv.traffic.forEach((tr, i) => {
      const slot = i < 3 ? i + 1 : -(i - 2);
      let x = beltPos.x + slot * 2.7;
      const half = BELT.L / 2 - 0.6;
      tr.p.root.visible = Math.abs(x) < half;
      x = THREE.MathUtils.clamp(x, -half, half);
      tr.p.root.position.x = x;
    });
    const scanOn = Math.sin(Math.PI * clamp(scan));
    (conv.fan.material as THREE.MeshBasicMaterial).opacity = (0.16 + scanOn * 0.5) * rise;
    (conv.led.material as THREE.MeshBasicMaterial).color.set(scan > 0.62 ? "#1fe07a" : "#ff3b1f").multiplyScalar(3);

    // ---------------- the map
    const mapVis = easeInOut(seg(p, BEAT.zoomOut[0] + 0.01, BEAT.zoomOut[0] + 0.06)) * (1 - easeInOut(seg(p, BEAT.zoomIn[0] + 0.012, BEAT.zoomIn[0] + 0.05)));
    map.root.visible = mapVis > 0.001;
    map.dotMat.opacity = mapVis * 0.6;
    map.lineMat.opacity = mapVis * 0.45;
    const drawIn = easeInOut(seg(p, BEAT.zoomOut[0] + 0.03, BEAT.fly[0] + 0.03));
    map.routeMat.opacity = 0.55 * mapVis;
    map.routes.forEach((r, i) => { const kk = clamp(drawIn * 1.6 - i * 0.035); r.m.geometry.setDrawRange(0, Math.floor((kk * r.count) / 3) * 3); r.m.visible = kk > 0; });
    const fe = easeInOut(fly);
    map.trail.geometry.setDrawRange(0, Math.floor(fe * 160) * 48);
    map.trail.visible = fly > 0 && mapVis > 0.01;
    (map.trail.material as THREE.MeshBasicMaterial).opacity = mapVis;
    (map.ghost.material as THREE.LineDashedMaterial).opacity = mapVis * 0.8 * (1 - fe);
    const labA = easeInOut(seg(p, BEAT.zoomOut[0] + 0.04, BEAT.zoomOut[1])) * (1 - easeInOut(seg(p, BEAT.zoomIn[0], BEAT.zoomIn[0] + 0.025)));
    map.labels.forEach((s) => ((s.material as THREE.SpriteMaterial).opacity = mapVis * labA));
    map.pins.forEach((pin, i) => {
      const ph = (t * 0.6 + i * 0.37) % 1;
      pin.ring.scale.setScalar(1 + ph * (pin.big ? 1.6 : 1.1));
      (pin.ring.material as THREE.MeshBasicMaterial).opacity = (1 - ph) * 0.5 * mapVis;
      pin.g.visible = mapVis > 0.01 && !(pin.c === ROUTE.to && pop > 0.2);
    });
    // the jet
    const jOn = fly > 0 && fly < 1;
    map.jet.visible = jOn; map.jetShadow.visible = jOn;
    if (jOn) {
      map.heroCurve.getPointAt(fe, map.jet.position); map.jet.position.y += 0.3;
      map.heroCurve.getTangentAt(Math.min(0.999, fe), V.x).normalize();
      V.z.crossVectors(V.x, V.up).normalize(); const yy = V.jy.crossVectors(V.z, V.x).normalize();
      V.m.makeBasis(V.x, yy, V.z); map.jet.quaternion.setFromRotationMatrix(V.m);
      map.jet.rotateX(Math.sin(fe * Math.PI * 2) * 0.25);
      const js = Math.min(1, Math.sin(Math.PI * fly) * 5);
      map.jet.scale.setScalar(1.3 * js);
      map.jetShadow.position.set(map.jet.position.x + 0.8, MAP.Y + 0.03, map.jet.position.z + 0.6);
      map.jetShadow.scale.setScalar(js * (1.4 - (map.jet.position.y - MAP.Y) * 0.05));
    }

    // ---------------- doorstep
    const popE = easeOut(clamp(pop));
    door.root.visible = pop > 0;
    door.floor.scale.setScalar(Math.max(0.0001, popE));
    door.pop.rotation.x = -Math.PI / 2 * (1 - easeInOut(clamp((pop - 0.25) / 0.75)));
    door.pop.scale.setScalar(Math.max(0.0001, popE));
    door.mat.scale.setScalar(Math.max(0.0001, easeOut(clamp((pop - 0.35) / 0.65))));
    door.root.position.y = DEST.y - cover * 0.9;

    // ---------------- the stamp
    const sOn = stampT > 0 && stampT < 1;
    stamper.visible = sOn;
    if (sOn) {
      const down = easeIn(clamp(stampT / 0.42)), up = easeInOut(clamp((stampT - 0.55) / 0.45));
      const lift = (1 - down) * 1.7 + up * 2.4;
      parcel.root.updateMatrixWorld();
      V.top.set(0.06, parcel.top + lift, 0.02); parcel.root.localToWorld(V.top);
      stamper.position.copy(V.top);
      stamper.rotation.set(0, parcel.root.rotation.y + 0.16, (1 - down) * 0.2 - up * 0.3);
      stamper.scale.setScalar(1 - up * 0.4);
    }

    // ---------------- floor shadow
    if (shadow.current) {
      const m = shadow.current.material as THREE.MeshBasicMaterial;
      let op = 0, sy = pos.y - H / 2 - 0.5, sx = pos.x, sc = 1;
      if (!atDoor && hubOn) {
        op = lerp(0.42, 0.7, toBelt) * e * hubS;
        sy = lerp(pos.y - H / 2 - 0.55, BELT.Y + 0.006, toBelt);
        sc = lerp(1.25, 0.95, toBelt) * hubS;
      } else if (atDoor && land > 0) {
        op = 0.65 * clamp(land * 3);
        sy = DEST.y + 0.04 - cover * 0.9; sc = 0.9 + (1 - bounce(clamp(land))) * 0.4;
      }
      m.opacity = op * (1 - cover);
      shadow.current.visible = m.opacity > 0.01;
      shadow.current.position.set(sx, sy, pos.z);
      shadow.current.scale.setScalar(sc);
      shadow.current.rotation.z = -parcel.root.rotation.y;
    }

    // ---------------- camera
    const aspect = size.width / Math.max(1, size.height);
    const tanH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const fit = (s: Shot) => Math.max(s.h / (2 * tanH), s.w / (2 * tanH * aspect)) * (mobile ? 1.05 : 1);
    const T = V.t.copy(shots.hero.t), Dd = V.d.copy(shots.hero.d);
    let dist = fit(shots.hero);
    const blend = (s: Shot, kk: number, log = false, tgt?: THREE.Vector3, kt = kk) => {
      if (kk <= 0 && kt <= 0) return;
      T.lerp(tgt ?? s.t, kt); Dd.lerp(s.d, kk).normalize();
      const fd = fit(s);
      dist = log ? Math.exp(lerp(Math.log(dist), Math.log(fd), kk)) : lerp(dist, fd, kk);
    };
    const side = mobile ? 0 : 1;
    blend(shots.pack, easeInOut(seg(p, BEAT.drop[0] + 0.02, BEAT.close[1])), false, V.off.copy(shots.pack.t).setX(-0.75 * side));
    blend(shots.label, easeInOut(seg(p, BEAT.tape[1] - 0.01, BEAT.label[1])), false, V.off.copy(shots.label.t).setX(-1.05 * side));
    const beltT = V.bt.set(pos.x * 0.55 - 1.7 * (mobile ? 0 : 1), -0.1, 0);
    blend(shots.belt, easeInOut(seg(p, BEAT.belt[0], BEAT.belt[1] + 0.02)), false, beltT);
    blend(shots.out, easeInOut(zo), true);
    const flyT = V.ft.lerpVectors(shots.fly.t, DEST, Math.pow(easeInOut(fly), 2.2) * 0.8);
    blend(shots.fly, easeInOut(seg(p, BEAT.fly[0], BEAT.fly[0] + 0.05)), false, flyT);
    if (fly > 0) T.lerp(flyT, easeInOut(fly));
    const doorT = V.dt.copy(DEST).add(V.off.set(-0.2, 1.75, -1.5));
    blend(shots.door, easeInOut(zi), true, doorT, easeOut(clamp(zi * 1.8)));
    const stampTgt = V.st.copy(DEST).add(door.spot).add(V.off.set(0, H + 0.05, 0));
    blend(shots.stamp, easeInOut(seg(p, BEAT.land[1] - 0.01, BEAT.stamp[0] + 0.02)) * (1 - easeInOut(seg(p, BEAT.stamp[1], BEAT.doneCopyIn[1]))), false, stampTgt);
    dist *= 1 - statsHold * 0.05;
    T.y -= cover * 0.4;
    const par = Math.max(1, dist * 0.06);
    camPos.current.copy(T).addScaledVector(Dd, dist);
    camPos.current.x += px * 0.3 * par; camPos.current.y += py * 0.18 * par;
    cam.position.lerp(camPos.current, k);
    lookCur.current.lerp(T, k);
    cam.lookAt(lookCur.current);
  });

  return (
    <>
      <primitive object={parcel.root} />
      <primitive object={conv.root} />
      <primitive object={map.root} />
      <primitive object={door.root} />
      <primitive object={stamper} />
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} visible={false} renderOrder={-1}>
        <planeGeometry args={[2.6, 2.1]} />
        <meshBasicMaterial map={blob} transparent depthWrite={false} opacity={0} />
      </mesh>
    </>
  );
}

export default function StoryScene({ progress, entrance, reduced = false }: StoryRefs & { reduced?: boolean }) {
  const tier = useQualityTier();
  const mobile = useIsMobile();
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
    <div ref={wrap} className="absolute inset-0">
      {fonts && (
        <Canvas
          dpr={[1, 1.35]}
          camera={{ fov: mobile ? 32 : 28, position: [0, 1.5, 9], near: 0.1, far: 500 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1.0 }}
          className="!absolute inset-0"
          aria-hidden
          frameloop={visible ? "always" : "never"}
        >
          <Suspense fallback={null}>
            <Rig progress={progress} entrance={entrance} mobile={mobile} reduced={reduced} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}