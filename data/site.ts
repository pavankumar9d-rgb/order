/**
 * PAVAN EXPRESS — express courier, door to door across India.
 * Pavan Express and all copy, numbers, prices and reviews are placeholder showcase content.
 */
export const brand = {
  name: "Pavan Express",
  wordmark: "PAVAN EXPRESS",
  short: "PAVAN",
  product: "Express courier",
  tagline: "Across India, by tomorrow.",
  hq: "Hyderabad",
  phone: "1800 000 0199",
} as const;

export const nav = [
  { label: "The journey", href: "#story" },
  { label: "Track", href: "#track" },
  { label: "Services", href: "#services" },
  { label: "Rates", href: "#rates" },
  { label: "Network", href: "#network" },
  { label: "Reviews", href: "#reviews" },
] as const;

/** Stickers in the story. */
export const stickers = [
  { value: "19K", unit: "+", label: "PIN codes", shape: "burst" },
  { value: "24", unit: "h", label: "Pan-India", shape: "circle" },
  { value: "98.6", unit: "%", label: "On time", shape: "pill" },
  { value: "6", unit: "pm", label: "Last pickup", shape: "square" },
] as const;

/** Readout checkpoints under the story. */
export const stages = ["Packed", "Labelled", "Sorted", "Flown", "Delivered"] as const;

/** The parcel we follow through the story: Hyderabad → New Delhi. */
export const hero = {
  awb: "PE 5829 1047 3361",
  awbShort: "5829 1047 3361",
  from: { name: "Pavan Kumar", line: "Flat 302, Mallapur Main Road", city: "Hyderabad, Telangana", town: "Hyderabad", pin: "500076", code: "HYD" },
  to: { name: "Arjun Sharma", line: "Flat 4B, B-14, Hauz Khas Enclave", city: "New Delhi, Delhi", town: "Delhi", pin: "110016", code: "DEL" },
  weight: "1.2 kg",
  km: 1254,
} as const;

export type TrackEvent = { status: string; time: string; place: string; note: string };
export const heroEvents: TrackEvent[] = [
  { status: "Booked", time: "Mon · 5:02 pm", place: "Mallapur, Hyderabad", note: "Pickup booked on WhatsApp" },
  { status: "Picked up", time: "Mon · 6:42 pm", place: "Mallapur, Hyderabad", note: "Collected by Ravi · OTP verified" },
  { status: "At hub", time: "Mon · 8:15 pm", place: "Hyderabad hub · Shamshabad · Bay 14", note: "Scanned, weighed and sorted" },
  { status: "In the air", time: "Mon · 10:40 pm", place: "HYD → DEL", note: "Overnight freighter, 1,254 km" },
  { status: "Delhi hub", time: "Tue · 7:30 am", place: "Delhi hub · Mahipalpur", note: "Sorted to the Hauz Khas route" },
  { status: "Out for delivery", time: "Tue · 8:30 am", place: "Hauz Khas, New Delhi", note: "With Imran · 6 stops away" },
  { status: "Delivered", time: "Tue · 10:14 am", place: "Flat 4B, B-14, Hauz Khas Enclave", note: "Handed to Arjun · OTP + photo proof" },
];

export type Service = {
  id: "document" | "small" | "medium" | "intl";
  name: string;
  sub: string;
  eta: string;
  from: number;
  blurb: string;
  perks: string[];
  tint: string;
  /** parcel size in scene units (w, h, d) */
  size: [number, number, number];
};

export const services: Service[] = [
  { id: "document", name: "Same Day", sub: "Within your city", eta: "By 9 pm", from: 149, blurb: "Book by noon, delivered the same evening. Contracts, keys, cakes, the tiffin someone forgot.", perks: ["Pickup in 60 min", "Live courier map", "Up to 5 kg"], tint: "#f6dccf", size: [1.5, 0.08, 1.05] },
  { id: "small", name: "Express", sub: "Overnight, metro to metro", eta: "Next morning", from: 119, blurb: "Picked up by 6 pm, flown overnight, at the door before lunch — between every major metro in the country.", perks: ["Flown overnight", "OTP-secured delivery", "Up to 30 kg"], tint: "#e4e2dc", size: [1.0, 0.72, 0.8] },
  { id: "medium", name: "Surface", sub: "Every PIN code", eta: "1–7 days", from: 55, blurb: "Our road and rail network reaches all 19,000+ PIN codes across India — the budget way to send what isn't urgent.", perks: ["19,000+ PIN codes", "Free reverse pickup", "Up to 70 kg"], tint: "#efe3cf", size: [1.45, 1.0, 1.1] },
  { id: "intl", name: "International", sub: "220 countries", eta: "3–6 days", from: 1499, blurb: "Customs paperwork done for you, duties shown upfront, tracked door to door abroad.", perks: ["Customs handled", "Duties upfront", "Door to door"], tint: "#dfe3f3", size: [1.35, 1.2, 1.2] },
];

/* ---------------- rates (metric: centimetres and kilograms, INR incl. GST) ---------------- */
export const cities = [
  { id: "HYD", name: "Hyderabad", state: "Telangana", lon: 78.49, lat: 17.39 },
  { id: "DEL", name: "Delhi", state: "Delhi", lon: 77.21, lat: 28.61 },
  { id: "BOM", name: "Mumbai", state: "Maharashtra", lon: 72.88, lat: 19.08 },
  { id: "BLR", name: "Bengaluru", state: "Karnataka", lon: 77.59, lat: 12.97 },
  { id: "MAA", name: "Chennai", state: "Tamil Nadu", lon: 80.27, lat: 13.08 },
  { id: "CCU", name: "Kolkata", state: "West Bengal", lon: 88.36, lat: 22.57 },
  { id: "PNQ", name: "Pune", state: "Maharashtra", lon: 73.86, lat: 18.52 },
  { id: "AMD", name: "Ahmedabad", state: "Gujarat", lon: 72.57, lat: 23.02 },
  { id: "JAI", name: "Jaipur", state: "Rajasthan", lon: 75.79, lat: 26.91 },
  { id: "LKO", name: "Lucknow", state: "Uttar Pradesh", lon: 80.95, lat: 26.85 },
  { id: "IXC", name: "Chandigarh", state: "Chandigarh", lon: 76.78, lat: 30.73 },
  { id: "COK", name: "Kochi", state: "Kerala", lon: 76.27, lat: 9.93 },
  { id: "GAU", name: "Guwahati", state: "Assam", lon: 91.74, lat: 26.14 },
  { id: "BBI", name: "Bhubaneswar", state: "Odisha", lon: 85.82, lat: 20.3 },
] as const;
export type CityId = (typeof cities)[number]["id"];
export type Mode = "express" | "surface";
export type Zone = "city" | "regional" | "national" | "far";

export const zoneName: Record<Zone, string> = { city: "Same city", regional: "Regional · under 600 km", national: "National · under 1,200 km", far: "Pan-India · 1,200 km and above" };

/** Great-circle kilometres between two cities. */
export function kmBetween(a: CityId, b: CityId) {
  const A = cities.find((c) => c.id === a)!, B = cities.find((c) => c.id === b)!;
  const r = Math.PI / 180, dLat = (B.lat - A.lat) * r, dLon = (B.lon - A.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(A.lat * r) * Math.cos(B.lat * r) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
export function zoneFor(a: CityId, b: CityId): Zone {
  if (a === b) return "city";
  const km = kmBetween(a, b);
  return km < 600 ? "regional" : km < 1200 ? "national" : "far";
}

const RATE: Record<Mode, Record<Zone, [number, number]>> = {
  // [first 500 g, each extra 500 g] in INR, GST included
  express: { city: [89, 30], regional: [119, 45], national: [159, 70], far: [199, 90] },
  surface: { city: [45, 12], regional: [55, 18], national: [69, 28], far: [89, 38] },
};
const ETA: Record<Mode, Record<Zone, string>> = {
  express: { city: "Today, by 9 pm", regional: "Tomorrow, 10:30 am", national: "Tomorrow, by noon", far: "Tomorrow, by noon" },
  surface: { city: "Tomorrow", regional: "1–2 days", national: "3–4 days", far: "5–7 days" },
};

/** Volumetric weight (kg) from centimetres, the Indian-courier standard divisor of 5000. */
export const dimWeight = (l: number, w: number, h: number) => (l * w * h) / 5000;
export function quote({ l, w, h, kg, from, to, mode }: { l: number; w: number; h: number; kg: number; from: CityId; to: CityId; mode: Mode }) {
  const dim = dimWeight(l, w, h);
  // Indian couriers bill in 500 g slabs: first 500 g, then each extra 500 g.
  const slabs = Math.max(1, Math.ceil(Math.max(kg, dim) * 2 - 1e-9));
  const charge = slabs / 2; // billable kg
  const zone = zoneFor(from, to);
  const [first, extra] = RATE[mode][zone];
  const price = first + (slabs - 1) * extra;
  return { dim, charge, zone, price, eta: ETA[mode][zone], byVolume: dim > kg, km: Math.round(kmBetween(from, to)) };
}

/* ---------------- network ---------------- */
export const network = [
  { v: 19000, s: "+", l: "PIN codes reached" },
  { v: 38, s: "", l: "Sorting hubs" },
  { v: 9400, s: "", l: "Vans & bikes" },
  { v: 24, s: " lakh", l: "Parcels a day" },
] as const;

export const reviews = [
  { quote: "We ship 600 orders a day from Hyderabad. Next-day to every major metro, and our RTO dropped by half after we switched.", name: "Sneha R.", place: "Founder, a Pochampally ikat label · Hyderabad" },
  { quote: "Sent my amma's birthday cake across Chennai at 3 pm. It arrived at 6:40 with the candles intact.", name: "Karthik N.", place: "Chennai" },
  { quote: "The tracking is actually live. I watched the rider turn onto my street and walked down to meet him.", name: "Farah K.", place: "Bengaluru" },
  { quote: "Customs for our first order to Singapore was one form, done on the app. Duties were shown before we paid.", name: "Aman S.", place: "Blue pottery studio · Jaipur" },
  { quote: "Their pickup guy shows up at 5:55 every single day. You could set a clock by him.", name: "Suresh P.", place: "Pune" },
] as const;

export const inr = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
