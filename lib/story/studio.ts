import * as THREE from "three";

/* ------------------------------------------------------------------
   One studio for everything: the live story, the offscreen stills and the
   card turntable all light the product with the same softbox environment
   and the same three lamps, so a still and a live frame are pixel-matched.
   ------------------------------------------------------------------ */

function softbox(w: number, h: number, color: string, intensity: number, pos: [number, number, number], rot: [number, number, number]) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide, toneMapped: false })
  );
  m.position.set(...pos);
  m.rotation.set(...rot);
  return m;
}

export function studioEnvScene() {
  const s = new THREE.Scene();
  s.background = new THREE.Color("#6c6d70");
  s.add(
    softbox(9, 6, "#fbfaf7", 2.6, [0, 5.5, 1], [Math.PI / 2, 0, 0]),         // overhead
    softbox(2.2, 7, "#fff6ec", 4.2, [-4.2, 1.8, 3], [0, Math.PI / 3, 0]),     // key strip, left
    softbox(1.3, 7, "#f4f6ff", 3.2, [4.6, 1.4, 1.2], [0, -Math.PI / 2.4, 0]), // rim strip, right
    softbox(3.5, 2.4, "#fbfaf6", 1.6, [1.5, 0.6, 6], [0, Math.PI, 0]),          // front fill card
    softbox(7, 1.1, "#ffffff", 1.8, [0, 2.4, -5.5], [0, 0, 0]),               // back bar — the glass edge line
    softbox(8, 4, "#e2ddd3", 0.9, [0, -3.2, 2], [-Math.PI / 2, 0, 0]),         // warm floor bounce
  );
  return s;
}

const envCache = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();
export function studioEnvironment(renderer: THREE.WebGLRenderer) {
  let t = envCache.get(renderer);
  if (!t) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    t = pmrem.fromScene(studioEnvScene(), 0.02).texture;
    pmrem.dispose();
    envCache.set(renderer, t);
  }
  return t;
}

export function studioLights() {
  const g = new THREE.Group();
  g.add(new THREE.AmbientLight("#f7f5f0", 0.8));
  const key = new THREE.DirectionalLight("#fff5e8", 2.3); key.position.set(-3.5, 5, 4.5);
  const rim = new THREE.DirectionalLight("#eef2ff", 1.3); rim.position.set(4.5, 2.2, -3.5);
  const fill = new THREE.DirectionalLight("#efe9df", 0.35); fill.position.set(0.5, -2.5, 3);
  g.add(key, rim, fill);
  return g;
}

export function configureRenderer(r: THREE.WebGLRenderer) {
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.NeutralToneMapping;
  r.toneMappingExposure = 1;
  r.setClearColor(0x000000, 0);
}
