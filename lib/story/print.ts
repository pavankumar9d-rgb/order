import * as THREE from "three";

export function mulberry32(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const FONT = {
  wide: (w: number | string, px: number, italic = false) =>
    `${italic ? "italic " : ""}${w} ${px}px "Archivo", "Helvetica Neue", Arial, sans-serif`,
  sans: (w: number | string, px: number) =>
    `${w} ${px}px "Inter Tight", "Helvetica Neue", Arial, sans-serif`,
  mono: (w: number | string, px: number) =>
    `${w} ${px}px "JetBrains Mono", Menlo, monospace`,
};

export function wide(
  ctx: CanvasRenderingContext2D,
  px: number,
  w: number | string = 800,
  italic = false,
  stretch = "expanded"
) {
  ctx.font = FONT.wide(w, px, italic);
  if ("fontStretch" in ctx) {
    (ctx as any).fontStretch = stretch;
  }
}

let _fontsReadyPromise: Promise<void> | null = null;
export function fontsReady(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (!_fontsReadyPromise) {
    _fontsReadyPromise = new Promise<void>((resolve) => {
      const timeout = new Promise<void>((res) => setTimeout(res, 2500));
      const fontsLoad =
        document.fonts && document.fonts.load
          ? Promise.all([
              document.fonts.load('800 64px "Archivo"'),
              document.fonts.load('italic 800 64px "Archivo"'),
              document.fonts.load('500 64px "Archivo"'),
              document.fonts.load('400 32px "Inter Tight"'),
              document.fonts.load('600 32px "Inter Tight"'),
              document.fonts.load('700 32px "Inter Tight"'),
              document.fonts.load('400 24px "JetBrains Mono"'),
              document.fonts.load('700 24px "JetBrains Mono"'),
            ])
          : Promise.resolve();

      Promise.race([fontsLoad, timeout])
        .then(() => resolve())
        .catch(() => resolve());
    });
  }
  return _fontsReadyPromise;
}

export const PAPER_ROUGH = 0.74;
export const FOIL_ROUGH = 0.3;

export type Printed = {
  map: THREE.CanvasTexture;
  mask?: THREE.CanvasTexture | null;
  bump?: THREE.CanvasTexture | null;
  glow?: THREE.CanvasTexture | null;
};

export class Sheet {
  W: number;
  H: number;
  mapCanvas: HTMLCanvasElement;
  mapCtx: CanvasRenderingContext2D;
  maskCanvas?: HTMLCanvasElement;
  maskCtx?: CanvasRenderingContext2D;
  bumpCanvas?: HTMLCanvasElement;
  bumpCtx?: CanvasRenderingContext2D;
  glowCanvas?: HTMLCanvasElement;
  glowCtx?: CanvasRenderingContext2D;
  foilGrad!: CanvasGradient;

  constructor(
    W: number,
    H: number,
    options: {
      mask?: boolean;
      bump?: boolean;
      foil?: string[];
    } = {}
  ) {
    const {
      mask = true,
      bump = true,
      foil = ["#ffd9c2", "#ff7a3d", "#ffb08a", "#e9531a"],
    } = options;

    this.W = Math.round(W);
    this.H = Math.round(H);

    this.mapCanvas = document.createElement("canvas");
    this.mapCanvas.width = this.W;
    this.mapCanvas.height = this.H;
    this.mapCtx = this.mapCanvas.getContext("2d", { willReadFrequently: true })!;

    if (mask) {
      this.maskCanvas = document.createElement("canvas");
      this.maskCanvas.width = this.W;
      this.maskCanvas.height = this.H;
      this.maskCtx = this.maskCanvas.getContext("2d", { willReadFrequently: true })!;
      this.maskCtx.fillStyle = `rgb(0, ${Math.round(PAPER_ROUGH * 255)}, 0)`;
      this.maskCtx.fillRect(0, 0, this.W, this.H);

      this.glowCanvas = document.createElement("canvas");
      this.glowCanvas.width = this.W;
      this.glowCanvas.height = this.H;
      this.glowCtx = this.glowCanvas.getContext("2d")!;
      this.glowCtx.fillStyle = "#000000";
      this.glowCtx.fillRect(0, 0, this.W, this.H);
    }

    if (bump) {
      this.bumpCanvas = document.createElement("canvas");
      this.bumpCanvas.width = this.W;
      this.bumpCanvas.height = this.H;
      this.bumpCtx = this.bumpCanvas.getContext("2d")!;
      this.bumpCtx.fillStyle = "#808080";
      this.bumpCtx.fillRect(0, 0, this.W, this.H);
    }

    this.createFoilGrad(foil);
  }

  private createFoilGrad(foil: string[]) {
    this.foilGrad = this.mapCtx.createLinearGradient(0, 0, this.W, this.H);
    const n = foil.length;
    foil.forEach((stop, i) => {
      this.foilGrad.addColorStop(i / (n - 1), stop);
    });
  }

  paper(color: string, rough = PAPER_ROUGH) {
    this.mapCtx.fillStyle = color;
    this.mapCtx.fillRect(0, 0, this.W, this.H);

    if (this.maskCtx) {
      this.maskCtx.fillStyle = `rgb(0, ${Math.round(rough * 255)}, 0)`;
      this.maskCtx.fillRect(0, 0, this.W, this.H);
    }
  }

  ink(color: string, draw: (c: CanvasRenderingContext2D) => void) {
    this.mapCtx.save();
    this.mapCtx.fillStyle = color;
    this.mapCtx.strokeStyle = color;
    draw(this.mapCtx);
    this.mapCtx.restore();
  }

  foil(
    draw: (c: CanvasRenderingContext2D) => void,
    { emboss = 0, color }: { emboss?: number; color?: string } = {}
  ) {
    const style = color || this.foilGrad;

    this.mapCtx.save();
    this.mapCtx.fillStyle = style;
    this.mapCtx.strokeStyle = style;
    draw(this.mapCtx);
    this.mapCtx.restore();

    if (this.maskCtx) {
      this.maskCtx.save();
      const maskColor = `rgb(0, ${Math.round(FOIL_ROUGH * 255)}, 255)`;
      this.maskCtx.fillStyle = maskColor;
      this.maskCtx.strokeStyle = maskColor;
      draw(this.maskCtx);
      this.maskCtx.restore();
    }

    if (this.bumpCtx && emboss !== 0) {
      this.bumpCtx.save();
      const val = Math.max(0, Math.min(255, Math.round(128 + emboss * 127)));
      const bumpColor = `rgb(${val}, ${val}, ${val})`;
      this.bumpCtx.fillStyle = bumpColor;
      this.bumpCtx.strokeStyle = bumpColor;
      draw(this.bumpCtx);
      this.bumpCtx.restore();
    }

    if (this.glowCtx) {
      this.glowCtx.save();
      this.glowCtx.fillStyle = "#c9a15a";
      this.glowCtx.strokeStyle = "#c9a15a";
      draw(this.glowCtx);
      this.glowCtx.restore();
    }
  }

  spot(draw: (c: CanvasRenderingContext2D) => void, rough: number) {
    if (!this.maskCtx) return;
    this.maskCtx.save();
    const maskColor = `rgb(255, ${Math.round(rough * 255)}, 0)`;
    this.maskCtx.fillStyle = maskColor;
    this.maskCtx.strokeStyle = maskColor;
    draw(this.maskCtx);
    this.maskCtx.restore();
  }

  emboss(draw: (c: CanvasRenderingContext2D) => void, depth = 1) {
    if (!this.bumpCtx) return;
    this.bumpCtx.save();
    const val = Math.max(0, Math.min(255, Math.round(128 + depth * 127)));
    const bumpColor = `rgb(${val}, ${val}, ${val})`;
    this.bumpCtx.fillStyle = bumpColor;
    this.bumpCtx.strokeStyle = bumpColor;
    draw(this.bumpCtx);
    this.bumpCtx.restore();
  }

  raw(draw: (c: CanvasRenderingContext2D) => void) {
    this.mapCtx.save();
    draw(this.mapCtx);
    this.mapCtx.restore();
  }

  textures(aniso = 8): Printed {
    const map = new THREE.CanvasTexture(this.mapCanvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = aniso;

    let mask: THREE.CanvasTexture | undefined;
    if (this.maskCanvas) {
      mask = new THREE.CanvasTexture(this.maskCanvas);
      mask.anisotropy = aniso;
    }

    let bump: THREE.CanvasTexture | undefined;
    if (this.bumpCanvas) {
      bump = new THREE.CanvasTexture(this.bumpCanvas);
      bump.anisotropy = aniso;
    }

    let glow: THREE.CanvasTexture | undefined;
    if (this.glowCanvas) {
      glow = new THREE.CanvasTexture(this.glowCanvas);
      glow.colorSpace = THREE.SRGBColorSpace;
      glow.anisotropy = aniso;
    }

    return { map, mask, bump, glow };
  }
}

export function printedMaterial(
  printed: Printed,
  {
    bumpScale = 1.4,
    side = THREE.FrontSide,
  }: { bumpScale?: number; side?: THREE.Side } = {}
): THREE.MeshPhysicalMaterial {
  const mat = new THREE.MeshPhysicalMaterial({
    map: printed.map,
    roughness: printed.mask ? 1 : PAPER_ROUGH,
    metalness: printed.mask ? 1 : 0,
    roughnessMap: printed.mask,
    metalnessMap: printed.mask,
    clearcoat: printed.mask ? 1 : 0,
    clearcoatMap: printed.mask,
    clearcoatRoughness: 0.06,
    bumpMap: printed.bump,
    bumpScale: bumpScale,
    emissive: printed.glow ? new THREE.Color("#ffffff") : new THREE.Color("#000000"),
    emissiveMap: printed.glow,
    emissiveIntensity: printed.glow ? 0.3 : 0,
    side: side,
  });

  return mat;
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | number[]
) {
  if (typeof (ctx as any).roundRect === "function") {
    (ctx as any).roundRect(x, y, w, h, r);
  } else {
    const radius = typeof r === "number" ? r : r[0] || 0;
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }
}

export function frame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  lw: number
) {
  ctx.fillRect(x, y, w, lw);
  ctx.fillRect(x, y + h - lw, w, lw);
  ctx.fillRect(x, y + lw, lw, h - 2 * lw);
  ctx.fillRect(x + w - lw, y + lw, lw, h - 2 * lw);
}

export function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFn: (px: number) => string,
  maxPx: number,
  maxWidth: number
): number {
  let px = maxPx;
  ctx.font = fontFn(px);
  while (px > 6 && ctx.measureText(text).width > maxWidth) {
    px -= 1;
    ctx.font = fontFn(px);
  }
  return px;
}

export function spaced(ctx: CanvasRenderingContext2D, px: number) {
  if ("letterSpacing" in ctx) {
    (ctx as any).letterSpacing = `${px}px`;
  }
}

export function barcode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number
) {
  const r = mulberry32(seed);
  let curX = x;
  while (curX < x + w - 4) {
    const barW = 2 + 2 * Math.floor(r() * 3);
    const gap = 2 + 2 * Math.floor(r() * 3);
    ctx.fillRect(curX, y, Math.min(barW, x + w - curX), h);
    curX += barW + gap;
  }
}

export function registration(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s = 12,
  lw = 2
) {
  ctx.save();
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(x, y, s / 2, 0, Math.PI * 2);
  ctx.moveTo(x - s, y);
  ctx.lineTo(x + s, y);
  ctx.moveTo(x, y - s);
  ctx.lineTo(x, y + s);
  ctx.stroke();
  ctx.restore();
}
