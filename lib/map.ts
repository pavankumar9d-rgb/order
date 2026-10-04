/**
 * A simplified outline of India (lon, lat) plus the hubs we fly between.
 * The outline follows the boundary as depicted by the Survey of India, including Jammu & Kashmir and Ladakh.
 * Shared by the 3D map in the story and the SVG maps in the page — no three.js here.
 */
export const INDIA: readonly [number, number][] = [
  // western border: Kutch → Rajasthan → Punjab, then Jammu & Kashmir and Ladakh, then Himachal, Uttarakhand and the Nepal border,
  // then Sikkim, Bhutan, Arunachal and the north-east, the Bangladesh border, the east coast, the tip, and the west coast back to Kutch
  [68.2, 23.7], [69.4, 24.3], [70.1, 24.5], [70.1, 25.3], [69.6, 26.0], [70.0, 27.0], [70.5, 27.8], [71.7, 27.9],
  [72.9, 28.9], [73.9, 29.9], [74.6, 31.0], [74.6, 31.8], [75.3, 32.4], [74.0, 33.9], [73.5, 34.6], [74.0, 35.4],
  [74.5, 36.4], [74.7, 37.05], [75.9, 36.9], [77.2, 35.6], [78.3, 35.5], [80.3, 35.3], [79.9, 34.0], [79.2, 32.7],
  [78.7, 31.8], [79.0, 31.0], [80.2, 30.5], [80.6, 29.6], [81.2, 28.8], [82.0, 28.0], [83.0, 27.5], [84.0, 27.4],
  [84.8, 27.0], [85.8, 26.6], [87.0, 26.4], [88.1, 26.4], [88.1, 27.4], [88.4, 28.0], [88.9, 27.9], [88.9, 27.3],
  [89.1, 26.9], [90.0, 26.8], [91.6, 26.8], [92.1, 27.0], [92.7, 27.9], [93.9, 28.6], [95.1, 29.2], [96.2, 29.4],
  [97.3, 28.2], [96.9, 27.4], [96.0, 27.3], [95.3, 26.6], [94.7, 25.4], [94.2, 24.2], [93.4, 23.1], [93.1, 22.0],
  [92.5, 22.6], [92.3, 23.2], [91.6, 22.95], [91.2, 23.4], [91.3, 24.0], [91.8, 24.2], [92.2, 24.5], [92.0, 24.9],
  [91.0, 25.2], [90.0, 25.2], [89.8, 26.0], [89.0, 26.3], [88.4, 26.3], [88.5, 25.8], [88.2, 25.2], [88.1, 24.6],
  [88.5, 24.2], [88.6, 23.5], [88.9, 23.0], [89.0, 22.2], [88.6, 21.7], [87.5, 21.6], [86.9, 21.2], [86.7, 20.3],
  [85.9, 19.8], [85.0, 19.3], [84.1, 18.4], [83.3, 17.7], [82.3, 16.9], [81.3, 16.3], [80.9, 15.8], [80.2, 15.3],
  [80.2, 14.0], [80.35, 13.1], [79.9, 12.0], [79.85, 10.9], [79.4, 10.3], [79.3, 9.3], [78.1, 8.9], [77.5, 8.1],
  [76.9, 8.4], [76.4, 9.5], [75.8, 11.0], [75.0, 12.5], [74.6, 13.7], [74.1, 14.8], [73.8, 15.5], [73.4, 16.6],
  [73.0, 17.8], [72.8, 19.0], [72.8, 20.0], [72.7, 21.1], [72.5, 22.2], [72.1, 21.6], [71.0, 20.7], [70.3, 21.0],
  [69.7, 21.6], [69.0, 22.3], [70.2, 22.9], [69.4, 22.85], [68.5, 23.2],
];
export const OUTLINE = INDIA;

/** India has no large inland water bodies worth cutting out at this scale. */
export const LAKES: readonly (readonly [number, number][])[] = [];

export const CITY = {
  HYD: { name: "Hyderabad", lon: 78.49, lat: 17.39 },
  DEL: { name: "Delhi", lon: 77.21, lat: 28.61 },
  BOM: { name: "Mumbai", lon: 72.88, lat: 19.08 },
  BLR: { name: "Bengaluru", lon: 77.59, lat: 12.97 },
  MAA: { name: "Chennai", lon: 80.27, lat: 13.08 },
  CCU: { name: "Kolkata", lon: 88.36, lat: 22.57 },
  NAG: { name: "Nagpur", lon: 79.09, lat: 21.15 },
  AMD: { name: "Ahmedabad", lon: 72.57, lat: 23.02 },
  JAI: { name: "Jaipur", lon: 75.79, lat: 26.91 },
  LKO: { name: "Lucknow", lon: 80.95, lat: 26.85 },
  IXC: { name: "Chandigarh", lon: 76.78, lat: 30.73 },
  COK: { name: "Kochi", lon: 76.27, lat: 9.93 },
  GAU: { name: "Guwahati", lon: 91.74, lat: 26.14 },
  BBI: { name: "Bhubaneswar", lon: 85.82, lat: 20.3 },
} as const;
export type CityCode = keyof typeof CITY;

/** The story's flight. Nagpur, at the geographic centre of India, is the central hub. */
export const ROUTE = { from: "HYD", to: "DEL", hub: "NAG" } as const satisfies Record<string, CityCode>;

/** Trunk routes drawn on the maps (hub-and-spoke through Nagpur plus the big metro pairs). */
export const ROUTES: [CityCode, CityCode][] = [
  ["HYD", "DEL"], ["HYD", "NAG"], ["NAG", "DEL"], ["NAG", "BOM"], ["NAG", "CCU"], ["NAG", "BLR"], ["NAG", "MAA"],
  ["BOM", "DEL"], ["BOM", "BLR"], ["DEL", "CCU"], ["DEL", "JAI"], ["DEL", "LKO"], ["DEL", "IXC"], ["BOM", "AMD"], ["AMD", "JAI"],
  ["MAA", "BLR"], ["MAA", "COK"], ["BLR", "COK"], ["CCU", "GAU"], ["CCU", "BBI"], ["BBI", "HYD"],
];

function inPoly(lon: number, lat: number, poly: readonly (readonly [number, number])[]) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
export function inside(lon: number, lat: number) {
  return inPoly(lon, lat, OUTLINE) && !LAKES.some((l) => inPoly(lon, lat, l));
}

const BOUNDS = (() => {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of OUTLINE) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return { x0, x1, y0, y1 };
})();

/** Halftone grid of points inside the outline. */
export function halftone(step = 0.6) {
  const pts: [number, number][] = [];
  for (let lat = BOUNDS.y0; lat <= BOUNDS.y1; lat += step) {
    const row = Math.round((lat - BOUNDS.y0) / step);
    for (let lon = BOUNDS.x0; lon <= BOUNDS.x1; lon += step) {
      const x = lon + (row % 2 ? step / 2 : 0);
      if (inside(x, lat)) pts.push([x, lat]);
    }
  }
  return pts;
}

/** Latitude used for the cos(lat) squeeze in both the SVG and the 3D maps. */
export const MID_LAT = 22;

/** SVG projection: equirectangular with a cos(lat) squeeze, into a viewBox of width W. */
export function svgProjector(W = 600) {
  const lon0 = BOUNDS.x0 - 0.8, lon1 = BOUNDS.x1 + 0.8, lat0 = BOUNDS.y0 - 0.8, lat1 = BOUNDS.y1 + 0.8, k = Math.cos((MID_LAT * Math.PI) / 180);
  const sx = W / ((lon1 - lon0) * k);
  const H = (lat1 - lat0) * sx;
  return { W, H, x: (lon: number) => (lon - lon0) * k * sx, y: (lat: number) => (lat1 - lat) * sx };
}

/** Land with the lakes as holes — use with fill-rule / clip-rule "evenodd". */
export function outlinePath(p = svgProjector()) {
  const ring = (r: readonly (readonly [number, number])[]) => "M" + r.map(([lo, la]) => `${p.x(lo).toFixed(1)} ${p.y(la).toFixed(1)}`).join(" L") + " Z";
  return [ring(OUTLINE), ...LAKES.map(ring)].join(" ");
}

/** Quadratic arc between two cities for SVG, bulging to the left of travel. */
export function arcPath(a: CityCode, b: CityCode, p = svgProjector(), bend = 0.2) {
  const A = CITY[a], B = CITY[b];
  const x1 = p.x(A.lon), y1 = p.y(A.lat), x2 = p.x(B.lon), y2 = p.y(B.lat);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${(mx + dy * bend).toFixed(1)} ${(my - dx * bend).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}
