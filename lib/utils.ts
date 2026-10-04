export function clamp(v: number, a = 0, b = 1): number {
  return Math.max(a, Math.min(b, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function seg(p: number, a: number, b: number): number {
  return clamp((p - a) / (b - a), 0, 1);
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutQuint(t: number): number {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

export function cn(...classes: (string | boolean | undefined | null | { [key: string]: any })[]): string {
  const result: string[] = [];
  for (const c of classes) {
    if (!c) continue;
    if (typeof c === "string") {
      result.push(c);
    } else if (typeof c === "object") {
      for (const key of Object.keys(c)) {
        if (c[key]) result.push(key);
      }
    }
  }
  return result.join(" ");
}

export function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}
