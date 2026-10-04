/** Still keys shared by the DOM and the stills renderer — no three.js import here. */
export type StillKey = `svc:${string}` | "parcel" | "open" | "door" | "stamped";
/** Three-quarter pose of a parcel in its card. */
export const PARCEL_POSE = { x: 0.42, y: -0.62, z: 0 } as const;
