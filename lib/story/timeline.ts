/**
 * One scroll progress value (0 → 1 across the pinned story) drives both the WebGL rig and the
 * HTML overlay timeline. Every beat is a [start, end] window in that progress space.
 */
export const COVER_START = 0.93;

export const BEAT = {
  heroOut: [0.02, 0.09],
  statsIn: [0.06, 0.12],
  statsOut: [0.165, 0.2],
  drop: [0.06, 0.14],
  shreds: [0.1, 0.19],
  close: [0.165, 0.245],
  packCopyIn: [0.2, 0.235],
  tape: [0.235, 0.3],
  packCopyOut: [0.3, 0.315],
  label: [0.305, 0.35],
  labelCopyIn: [0.325, 0.355],
  labelCopyOut: [0.395, 0.41],
  belt: [0.36, 0.41],
  ride: [0.41, 0.56],
  scan: [0.455, 0.5],
  sortCopyIn: [0.45, 0.48],
  sortCopyOut: [0.545, 0.56],
  zoomOut: [0.56, 0.64],
  fly: [0.625, 0.735],
  flyCopyIn: [0.64, 0.67],
  flyCopyOut: [0.73, 0.745],
  zoomIn: [0.735, 0.81],
  pop: [0.755, 0.805],
  land: [0.8, 0.845],
  stamp: [0.845, 0.885],
  doneCopyIn: [0.86, 0.9],
  toast: [0.878, 0.9],
  cover: [COVER_START, 1],
} as const satisfies Record<string, readonly [number, number]>;

export const STAGE_AT = [0.2, 0.31, 0.44, 0.63, 0.84] as const;
