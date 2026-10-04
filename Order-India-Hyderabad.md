You are a senior creative technologist: a Three.js / React Three Fiber engineer, a GSAP motion designer and an editorial art director in one. Build the site below exactly as specified — every number, colour, word and timing here is the real one. Where a file is given in full, write it exactly as given. Do not improvise substitutes, do not simplify the 3D into images, and do not add sections that are not listed.

BR-DAK — ONE PARCEL, HYDERABAD TO NEW DELHI
A scroll-driven story for an express courier, rendered live in WebGL. Between "Across India," and "by tomorrow." a gift box drops into an open corrugated carton, crinkle-paper shreds pile in around it, the flaps fold shut and branded tape runs across the top; a shipping label slaps on while the tracking number decodes letter by letter; the parcel hops onto a conveyor in a sorting hub and rides under a scanner arch whose laser fan sweeps it red → green; the whole hub shrinks into a pin on a halftone map of India, route arcs draw themselves between 14 hubs, and a cargo jet flies the hero route HYD → DEL while a distance counter runs to 1,254 km; the camera dives into Hauz Khas, New Delhi, a pop-up doorstep folds up out of the map, the parcel drops onto the doormat with a bounce and a rubber stamper slams DELIVERED on the lid while a phone notification slides in. Then the page: a manifesto with self-drawing diagrams, a working tracker (route map + journey timeline), four services as flip-able parcels, a live rate calculator with a parcel that resizes and a scale that weighs it, a network map with moving freight dots, and reviews.

The whole site ships ZERO image, video or model downloads. Every carton, label, tape print, the conveyor, the map, the jet, the doorstep and every product "photo" on the page are generated in the browser from code.

================================================================================
1. STACK — use exactly these
================================================================================

- Next.js 16 (App Router, Turbopack), React 19.2, TypeScript 5.9 (strict)
- Tailwind CSS v4 via @tailwindcss/postcss (tokens in @theme in app/globals.css)
- three 0.186, @react-three/fiber 9, @react-three/drei 10
- gsap 3.12.5+ with ScrollTrigger, lenis 1.1.18+
- Fonts through next/font/google: Archivo (display; variable with the wdth axis; normal + italic; --font-display), Inter_Tight (body; 400/500/600/700; --font-body), JetBrains_Mono (mono; 400/500/700; --font-mono), all display "swap". The .wide / .wide-i / .semi utilities in globals.css stretch Archivo wide.

package.json name "br-dak-courier"; scripts: dev, build, start, lint (next lint), typecheck (tsc --noEmit).
next.config.ts: reactStrictMode true; images.formats ["image/avif","image/webp"]; transpilePackages ["three"]; experimental.optimizePackageImports ["@react-three/drei","three"]; headers(): /assets/:path* → Cache-Control "public, max-age=31536000, immutable".

File structure:
app/layout.tsx · app/page.tsx (renders <SitePage />) · app/globals.css
components/site/ SitePage · Intro · Nav · OfferBar · Footer · Logo · Still · site.css
components/story/ StorySection (sticky stage + HTML overlay) · StoryScene (R3F rig) · RatesScene (the rate calculator's live parcel)
components/sections/ ManifestoSection · TrackSection · ServicesSection · RatesSection · NetworkSection · ReviewsSection
components/motion/ SmoothScroll · Reveal · Counter
components/ui/ Button · Magnetic · Cursor
lib/map.ts — the US outline, cities and routes, shared by the 3D map and the SVG maps (no three.js)
lib/story/ models · textures · print · studio · stills · turntable · engine · pose · timeline
lib/ gsap · hooks · utils
data/site.ts — every brand name, line of copy, sticker, tracking event, service, city, rate and review
public/assets/brand/favicon.svg

public/assets/brand/favicon.svg (exactly):
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#101216"/><path d="M7 11.5 16 7l9 4.5v9L16 25l-9-4.5z" fill="#ff5a1f"/><path d="M7 11.5 16 16l9-4.5M16 16v9" fill="none" stroke="#101216" stroke-width="1.6" stroke-linejoin="round"/><path d="M11.5 9.25 20.5 13.75" stroke="#101216" stroke-width="1.6"/></svg>

================================================================================
2. BRAND AND CONTENT — data/site.ts (write exactly this)
================================================================================

The brand is a placeholder that lives in ONE place. Every print on the carton and label, nav, footer, copy line and metadata string reads from here. All units are metric and prices are in INR (₹), GST included. Spelling is Indian English (labelled, colour, centre).

/**
 * BR-DAK — express courier, door to door across India.
 * BR-Dak and all copy, numbers, prices and reviews are placeholder showcase content.
 */
export const brand = {
  name: "BR-Dak",
  wordmark: "BR-DAK",
  short: "DAK",
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
  awb: "BRD 5829 1047 3361",
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

app/layout.tsx (exactly):
import type { Metadata, Viewport } from "next";
import { Archivo, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Cursor from "@/components/ui/Cursor";

const display = Archivo({ subsets: ["latin", "latin-ext"], variable: "--font-display", axes: ["wdth"], style: ["normal", "italic"], display: "swap" });
const body = Inter_Tight({ subsets: ["latin", "latin-ext"], variable: "--font-body", weight: ["400", "500", "600", "700"], display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-mono", weight: ["400", "500", "700"], display: "swap" });

const TITLE = "BR-Dak — Across India, by tomorrow";
const DESC = "Express courier reaching 19,000+ PIN codes across India: picked up by 6 pm, flown overnight and delivered before lunch — tracked live all the way.";

export const metadata: Metadata = {
  title: { default: TITLE, template: "%s — BR-Dak" },
  description: DESC,
  openGraph: { type: "website", title: TITLE, description: DESC, locale: "en_IN" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
  icons: { icon: [{ url: "/assets/brand/favicon.svg", type: "image/svg+xml" }] },
};

export const viewport: Viewport = { themeColor: "#F3F1EC", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="cursor-none-desktop">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory">Skip to content</a>
        <SmoothScroll>{children}</SmoothScroll>
        <Cursor />
      </body>
    </html>
  );
}

components/site/Logo.tsx (exactly — the parcel mark has the same geometry as the carton print):
import { cn } from "@/lib/utils";
import { brand } from "@/data/site";

/** The mark: a parcel at three-quarter, taped across (viewBox 0 0 32 32). Same geometry as the carton print. */
export function Mark({ className, cut = "var(--color-ivory)", title }: { className?: string; cut?: string; title?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-auto", className)} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path d="M7 11.5 16 7l9 4.5v9L16 25l-9-4.5z" fill="currentColor" />
      <path d="M7 11.5 16 16l9-4.5M16 16v9M11.5 9.25 20.5 13.75" fill="none" stroke={cut} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ className, compact = false, cut }: { className?: string; compact?: boolean; cut?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-current", className)}>
      <Mark className={cn(compact ? "h-7" : "h-8", "text-accent")} cut={cut} />
      <span className="flex flex-col leading-none">
        <span className="wide text-[1.2rem]">{brand.wordmark}</span>
        {!compact && <span className="mt-1 font-mono text-[0.5rem] uppercase tracking-[0.22em] opacity-60">{brand.product}</span>}
      </span>
    </span>
  );
}

app/page.tsx renders <SitePage />. components/site/SitePage.tsx imports ./site.css and renders, in order: <Intro /> <Nav /> <main id="main"> StorySection · ManifestoSection · TrackSection · ServicesSection · RatesSection · NetworkSection · ReviewsSection </main> <Footer /> <OfferBar />.

================================================================================
3. DESIGN SYSTEM — app/globals.css and components/site/site.css (write exactly these)
================================================================================

app/globals.css:
@import "tailwindcss";

/* ------------------------------------------------------------------
   BR-DAK — design tokens
   Sorting-floor paper, ink, signal orange, route cobalt, kraft.
   ------------------------------------------------------------------ */
@theme {
  --color-ivory: #f3f1ec;
  --color-paper: #e7e4dc;
  --color-fog: #dcd9d0;
  --color-accent: #ff5a1f;
  --color-accent-deep: #de4209;
  --color-cobalt: #2743ff;
  --color-cobalt-soft: #dfe3fb;
  --color-kraft: #c49a64;
  --color-kraft-light: #e3cba6;
  --color-ok: #16b364;
  --color-ink: #101216;
  --color-ink-soft: #1c1f25;
  --color-deep: #0b0d10;
  --color-grey: #7b7d82;
  --color-grey-light: #c7c5be;
  --color-white: #ffffff;

  --font-display: var(--font-display), "Archivo", "Helvetica Neue", Arial, sans-serif;
  --font-body: var(--font-body), "Inter Tight", system-ui, sans-serif;
  --font-mono: var(--font-mono), "JetBrains Mono", ui-monospace, monospace;

  --ease-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-soft: cubic-bezier(0.25, 0.1, 0.25, 1);
}

:root {
  --nav-h: 88px;
  --gutter: clamp(1.25rem, 4vw, 4rem);
  color-scheme: light;
}

html { scroll-behavior: auto; -webkit-text-size-adjust: 100%; }
html { overflow-x: clip; }
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
.lenis.lenis-stopped { overflow: hidden; }

body {
  background: var(--color-ivory);
  color: var(--color-ink);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: clip;
}

::selection { background: var(--color-accent); color: var(--color-ivory); }

/* Typography ------------------------------------------------------- */
.font-display { font-family: var(--font-display); }
.font-body { font-family: var(--font-body); }
.font-mono { font-family: var(--font-mono); }

/* Archivo, stretched wide: freight-stencil energy. Italic = speed. */
.wide { font-family: var(--font-display); font-weight: 800; font-stretch: 125%; letter-spacing: -0.035em; }
.wide-i { font-style: italic; }
.semi { font-family: var(--font-display); font-weight: 700; font-stretch: 108%; letter-spacing: -0.03em; }
.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-grey);
}
.lede { font-size: clamp(1.05rem, 1.35vw, 1.3rem); line-height: 1.5; letter-spacing: -0.01em; }
.body-sm { font-size: 0.92rem; line-height: 1.6; }

.container-x { padding-left: var(--gutter); padding-right: var(--gutter); }

/* Dotted sorting-floor grid ---------------------------------------- */
.dot-grid { background-image: radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--color-ink) 16%, transparent) 1px, transparent 1.4px); background-size: 28px 28px; }
.dot-grid-light { background-image: radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--color-ivory) 14%, transparent) 1px, transparent 1.4px); background-size: 28px 28px; }

.grain::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.05;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}

/* Reveal helpers --------------------------------------------------- */
[data-reveal] { opacity: 0; transform: translateY(24px); transition: opacity 1.1s var(--ease-expo), transform 1.1s var(--ease-expo); }
[data-reveal].is-in { opacity: 1; transform: none; }
.line-mask { overflow: hidden; display: block; }
.line-mask > span { display: block; transform: translateY(110%); transition: transform 1.1s var(--ease-expo); }
.is-in .line-mask > span { transform: none; }

@media (hover: hover) and (pointer: fine) { .cursor-none-desktop { cursor: none; } }

:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }
  [data-reveal], .line-mask > span { opacity: 1; transform: none; }
}

@keyframes marquee { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(-50%, 0, 0); } }
.marquee-track { animation: marquee 38s linear infinite; }

components/site/site.css:
/* ------------------------------------------------------------------
   BR-DAK — page-scoped styles (tokens in app/globals.css)
   ------------------------------------------------------------------ */
@keyframes dak-hint { 0% { transform: translateY(-100%); } 100% { transform: translateY(250%); } }
@keyframes dak-still-in { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: none; } }
.dak-still-in { animation: dak-still-in 0.9s var(--ease-expo) both; }

/* die-cut stickers in the story */
.dak-sticker { width: clamp(118px, 12vw, 176px); aspect-ratio: 1; will-change: transform, opacity; filter: drop-shadow(0 14px 18px rgba(16, 18, 22, 0.22)); }
.dak-sticker > .face { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; overflow: hidden; }
.dak-sticker > .face::after { content: ""; position: absolute; inset: -40%; background: linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.55) 50%, transparent 60%); transform: translateX(var(--sheen, -120%)); pointer-events: none; }
.dak-sticker[data-shape="burst"] > .face { clip-path: polygon(50% 0%, 61% 12%, 77% 6%, 80% 22%, 96% 26%, 89% 41%, 100% 54%, 86% 63%, 90% 79%, 74% 80%, 68% 96%, 54% 88%, 40% 99%, 32% 84%, 16% 88%, 16% 71%, 1% 64%, 11% 50%, 2% 36%, 18% 30%, 18% 13%, 34% 16%); }
.dak-sticker[data-shape="circle"] > .face { border-radius: 50%; }
.dak-sticker[data-shape="pill"] { aspect-ratio: 1.7; width: clamp(150px, 15vw, 220px); }
.dak-sticker[data-shape="pill"] > .face { border-radius: 999px; }
.dak-sticker[data-shape="square"] > .face { border-radius: 22%; }
.dak-sticker .edge { position: absolute; inset: 5px; border: 2px dashed currentColor; opacity: 0.35; border-radius: inherit; }

.dak-no-scrollbar { scrollbar-width: none; }
.dak-no-scrollbar::-webkit-scrollbar { display: none; }

/* perforated tear-off edge between sections */
.dak-perf { background-image: radial-gradient(circle at 10px 0, transparent 7px, currentColor 7.5px); background-size: 20px 12px; background-repeat: repeat-x; height: 12px; }

/* range inputs */
.dak-range { -webkit-appearance: none; appearance: none; width: 100%; height: 28px; background: transparent; cursor: pointer; }
.dak-range::-webkit-slider-runnable-track { height: 2px; background: linear-gradient(to right, var(--color-accent) var(--fill, 50%), color-mix(in srgb, currentColor 22%, transparent) var(--fill, 50%)); border-radius: 2px; }
.dak-range::-moz-range-track { height: 2px; background: color-mix(in srgb, currentColor 22%, transparent); }
.dak-range::-moz-range-progress { height: 2px; background: var(--color-accent); }
.dak-range::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; margin-top: -10px; border-radius: 6px; background: var(--color-accent); border: 3px solid var(--color-ink); box-shadow: 0 0 0 1px var(--color-accent); transition: transform .3s var(--ease-expo); }
.dak-range::-moz-range-thumb { width: 18px; height: 18px; border-radius: 6px; background: var(--color-accent); border: 3px solid var(--color-ink); }
.dak-range:active::-webkit-slider-thumb { transform: scale(1.18) rotate(45deg); }

@media (prefers-reduced-motion: reduce) { .dak-still-in { animation: none; } }

================================================================================
4. FOUNDATIONS — lib/utils, lib/hooks, lib/gsap, motion, ui
================================================================================

lib/utils: clamp(v,a=0,b=1) · lerp · seg(p,a,b) = clamp((p-a)/(b-a)) · easeInOut (quadratic in-out: t<.5 ? 2t² : 1-(-2t+2)²/2) · easeOut = 1-(1-t)³ · easeInOutQuint · cn(...classes) · pad(n) = two-digit string.

lib/hooks ("use client"): useMediaQuery(query, initial=false); useReducedMotion; useIsMobile (max-width:767px); useIsTouch ((hover:none), (pointer:coarse)); useQualityTier → 0/1/2: tier 0 if mobile or ≤4 cores or ≤4 GB deviceMemory; tier 2 if ≥8 cores, ≥8 GB and DPR ≤ 2; else 1 (default state 1). useInView (IntersectionObserver, rootMargin 0 0 -10% 0, threshold .1, once). usePointer: a ref of the pointer normalised to -1..1 (y up), from a passive pointermove listener. useLatest; useEvent.

lib/gsap ("use client"): register ScrollTrigger; ScrollTrigger.config({ ignoreMobileResize: true, autoRefreshEvents: "visibilitychange,DOMContentLoaded,load" }); gsap.defaults({ ease: "power3.out", duration: 1 }). Export gsap and ScrollTrigger.

SmoothScroll ("use client"): declare window.__lenis. Under reduced motion, only ScrollTrigger.refresh(). Otherwise new Lenis({ duration 1.15, easing t ⇒ min(1, 1.001 − 2^(−10t)), smoothWheel true, syncTouch false, touchMultiplier 1.4, wheelMultiplier .95 }); window.__lenis = lenis; lenis.on("scroll", ScrollTrigger.update); drive it from gsap.ticker (t ⇒ lenis.raf(t*1000)), gsap.ticker.lagSmoothing(0); add class "lenis" to <html>. Intercept clicks on a[href^="#"] (skip "#", guard querySelector with try/catch) and lenis.scrollTo(target, { offset 0, duration 1.6 }). ScrollTrigger.refresh after 300 ms, on document.fonts.ready, and on width-only resizes (ignore changes < 2px — mobile URL bar — debounce 250 ms). Clean everything up on unmount and clear window.__lenis.

Cursor ("use client"; fine pointer only, not under reduced motion): a 6px dot (#F5F3EE, mix-blend difference) that follows the pointer exactly, and a ring (32px, 1px ivory border, mix-blend difference, rounded-full, z-100) that eases toward it at .18 per frame; both translate(-50%,-50%). The ring's data-mode comes from the nearest [data-cursor]: link → 48px; cta → 64px with ivory/20 fill; view / drag / 3d → 80px solid ivory with a mono .6rem uppercase label (tracking .15em, ink) "View" / "Drag" / "Rotate". Width/height/colour transition 500 ms expo. Hide both on document mouseleave, show on mouseenter.

Magnetic: wraps a CTA; mouse pointers only; target = offset from centre × 0.22 (strength prop); eased at .16 per rAF until settled; back to 0 on leave; will-change transform.

Button (next/link, or <a> for http/mailto/tel): props href, variant "ink"|"ivory"|"ghost"|"ghost-light", size "md"|"lg". Base: group inline-flex items-center gap-3, body font medium, tracking .02em, rounded-full, transition-all 500 ms expo. md px-6 py-3 .85rem · lg px-8 py-4 .95rem. Variants: ink = ink bg, ivory text, accent on hover · ivory = ivory bg, ink text, white on hover with a soft shadow and -1px lift · ghost = 1px ink/20 border, ink text, ink border on hover · ghost-light = ivory/30 border, ivory text. Trailing 14px arrow (path "M1 7h11M7 1l6 6-6 6", stroke 1.4, round caps) that moves 4px right on group hover. data-cursor "cta".

Reveal: IntersectionObserver (rootMargin 0 0 -12% 0, threshold .05) that adds .is-in; optional delay; optional `lines` that splits a string on \n into .line-mask spans with an 80 ms stagger.

Counter: a span; GSAP tween of { v } to value over 1.8 s power3.out with scrollTrigger { start "top 85%", once }; text = v.toLocaleString("en-IN", fixed decimals) + suffix; starts at 0; instant under reduced motion.

Counter formats with locale "en-IN" by default (a `locale` prop, default "en-IN"), so large numbers group the Indian way (1,00,000). The latin-ext font subset is loaded alongside latin so the ₹ glyph renders in Archivo, Inter Tight and JetBrains Mono.

================================================================================
5. THE TIMELINE — lib/story/timeline.ts, pose.ts, engine.ts (write exactly these)
================================================================================

One scroll progress value p (0 → 1 across the pinned story) drives both the WebGL rig and the HTML overlay timeline; every beat is a [start, end] window in that space.

lib/story/timeline.ts:
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

lib/story/pose.ts:
/** Still keys shared by the DOM and the stills renderer — no three.js import here. */
export type StillKey = `svc:${string}` | "parcel" | "open" | "door" | "stamped";
/** Three-quarter pose of a parcel in its card. */
export const PARCEL_POSE = { x: 0.42, y: -0.62, z: 0 } as const;

lib/story/engine.ts:
"use client";
/** The one async entry for everything WebGL, so three.js is fetched once and only when needed. */
export { default as StoryScene } from "@/components/story/StoryScene";
export { default as RatesScene } from "@/components/story/RatesScene";
export { getStill } from "./stills";
export { getTurntable } from "./turntable";

================================================================================
6. THE MAP DATA — lib/map.ts (write exactly this)
================================================================================

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

================================================================================
7. PRINTING — lib/story/print.ts
================================================================================

Every printed surface — carton faces, tape, label, stamp, doormat — is "printed" on up to four same-size canvases: map (inks + foil colour), mask (R = spot-UV gloss, G = roughness, B = metal for foil), bump (emboss/deboss, 128 grey = flat) and glow (foil only).

mulberry32(seed): the standard 32-bit PRNG. Every "random" thing in the site is seeded.
FONT: wide(w, px, italic=false) → `${italic?"italic ":""}${w} ${px}px "Archivo", "Helvetica Neue", Arial, sans-serif` · sans(w, px) → `${w} ${px}px "Inter Tight", "Helvetica Neue", Arial, sans-serif` · mono(w, px) → `${w} ${px}px "JetBrains Mono", Menlo, monospace`. Plus a helper wide(ctx, px, w = 800, italic = false, stretch = "expanded") that sets ctx.font = FONT.wide(...) and ctx.fontStretch = stretch (Archivo stretched wide where canvas supports it).
fontsReady(): memoised; races Promise.all of document.fonts.load for wide 800 64, wide 800 64 italic, wide 500 64, the sans and mono weights used, including mono 700 24, against a 2.5 s timeout; errors swallowed. Nothing is printed before it resolves.

PAPER_ROUGH .74, FOIL_ROUGH .3.
class Sheet(W, H, { mask = true, bump = true, foil = ["#f1d9a0","#c79a4c","#e8cb8a","#b8873d"] }):
  rounds W/H; creates the map canvas, mask and glow canvases if mask, bump if bump. glow starts black; mask starts rgb(0, PAPER_ROUGH·255, 0); bump starts #808080. The foil gradient is a linear gradient corner to corner over the foil stops.
  paper(color, rough=PAPER_ROUGH): flood map with the colour and mask with rgb(0, rough·255, 0).
  ink(color, draw): colour layer only.
  foil(draw, { emboss=0, color? }): map in the foil gradient (or colour); mask rgb(0, FOIL_ROUGH·255, 255); bump rgb(128+emboss·127) if emboss; and the same shape in #c9a15a on glow.
  spot(draw, rough): mask rgb(255, rough·255, 0) only — gloss without colour.
  emboss(draw, depth=1): bump only, rgb(128+depth·127).
  raw(draw): direct colour-layer access.
  Each draw runs inside save/restore with fillStyle and strokeStyle set to the layer's style.
  textures(aniso=8) → { map (sRGB), mask, bump, glow (sRGB) } as CanvasTextures with that anisotropy.
printedMaterial(printed, { bumpScale 1.4, side FrontSide }): MeshPhysicalMaterial with map; roughness 1 / metalness 1 driven by roughnessMap + metalnessMap = mask (or roughness PAPER_ROUGH, metalness 0 without a mask); clearcoat 1 with clearcoatMap = mask, clearcoatRoughness .06; bumpMap; emissive white with emissiveMap = glow at intensity .3 (black / 0 without glow).
Helpers: roundRect; frame(ctx,x,y,w,h,lw) (a rectangle ring drawn with four fillRects so it works on every layer); fitText(ctx, text, font(px), max, width) — largest size ≤ max that fits, sets ctx.font and returns px; spaced(ctx, px) sets ctx.letterSpacing; barcode(ctx,x,y,w,h,seed) — bars of width 2 + 2·floor(r·3) with gaps 2 + 2·floor(r·3); registration(ctx,x,y,s=12,lw=2) — a crosshair.

In this build the Sheet's default foil stops are the brand orange: ["#ffd9c2", "#ff7a3d", "#ffb08a", "#e9531a"].

================================================================================
8. THE STUDIO — lib/story/studio.ts (write exactly this)
================================================================================

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

================================================================================
9. SURFACES — lib/story/textures.ts (write exactly this)
================================================================================

Carton faces with flute texture, the branded and airmail tape, the shipping label (with a barcode, QR and the decoded tracking number), FRAGILE print, the DELIVERED stamp, text sprites for the map, a laser fan, the bay sign, marble, the door, nameplate and doormat, the mailer, customs form and gift wrap.

import * as THREE from "three";
import { Sheet, FONT, wide, mulberry32, roundRect, frame, barcode, spaced, type Printed } from "./print";
import { brand, hero } from "@/data/site";

/* ------------------------------------------------------------------
   Everything printed in the story: kraft carton art, branded tape, the
   thermal shipping label, stickers, the rubber stamp and the doorstep.
   ------------------------------------------------------------------ */

const INK = "#15171b";
const ORANGE = "#ff5a1f";
const PX = 420; // canvas px per scene unit on carton faces

/* ---------------- the mark: a parcel seen at three-quarter ---------------- */
export function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, fill: string, cut: string) {
  // viewBox 0..32 — same geometry as the favicon / Logo
  const P = (px: number, py: number): [number, number] => [x + (px / 32) * s, y + (py / 32) * s];
  ctx.save();
  ctx.fillStyle = fill;
  ctx.beginPath();
  [[7, 11.5], [16, 7], [25, 11.5], [25, 20.5], [16, 25], [7, 20.5]].forEach(([a, b], i) => { const [px, py] = P(a, b); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = cut; ctx.lineWidth = (1.6 / 32) * s; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(...P(7, 11.5)); ctx.lineTo(...P(16, 16)); ctx.lineTo(...P(25, 11.5)); ctx.moveTo(...P(16, 16)); ctx.lineTo(...P(16, 25)); ctx.moveTo(...P(11.5, 9.25)); ctx.lineTo(...P(20.5, 13.75)); ctx.stroke();
  ctx.restore();
}

/* ---------------- kraft ---------------- */
function kraftFibres(s: Sheet, seed: number, base = "#c49a64") {
  const r = mulberry32(seed);
  s.raw((c) => {
    c.fillStyle = base; c.fillRect(0, 0, s.W, s.H);
    // soft blotches
    for (let i = 0; i < 26; i++) {
      const x = r() * s.W, y = r() * s.H, rad = 40 + r() * 160;
      const g = c.createRadialGradient(x, y, 0, x, y, rad);
      const dark = r() > 0.5;
      g.addColorStop(0, dark ? "rgba(120,80,40,0.035)" : "rgba(255,235,200,0.04)"); g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // fibres
    const n = Math.round((s.W * s.H) / 260);
    for (let i = 0; i < n; i++) {
      const x = r() * s.W, y = r() * s.H, a = r() * Math.PI, l = 3 + r() * 11;
      c.strokeStyle = r() > 0.55 ? `rgba(90,58,28,${0.05 + r() * 0.09})` : `rgba(255,240,215,${0.05 + r() * 0.08})`;
      c.lineWidth = 0.6 + r() * 0.8;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
    }
  });
  return s;
}

/** Flexo print looks slightly rough: ink with a faint speckle knocked out. */
function speckle(s: Sheet, seed: number, color: string, alpha = 0.18) {
  const r = mulberry32(seed);
  s.raw((c) => {
    c.globalCompositeOperation = "source-atop";
    c.fillStyle = color; c.globalAlpha = alpha;
    for (let i = 0; i < (s.W * s.H) / 900; i++) c.fillRect(r() * s.W, r() * s.H, 1 + r() * 2, 1 + r() * 2);
  });
}

function upArrows(c: CanvasRenderingContext2D, x: number, y: number, s: number) {
  for (const dx of [0, s * 0.62]) {
    c.beginPath();
    c.moveTo(x + dx + s * 0.25, y); c.lineTo(x + dx + s * 0.5, y + s * 0.34); c.lineTo(x + dx + s * 0.34, y + s * 0.34); c.lineTo(x + dx + s * 0.34, y + s); c.lineTo(x + dx + s * 0.16, y + s); c.lineTo(x + dx + s * 0.16, y + s * 0.34); c.lineTo(x + dx, y + s * 0.34); c.closePath(); c.fill();
  }
  c.fillRect(x - s * 0.04, y + s * 1.08, s * 1.2, s * 0.08);
}
function glassIcon(c: CanvasRenderingContext2D, x: number, y: number, s: number) {
  c.beginPath(); c.moveTo(x, y); c.lineTo(x + s * 0.6, y); c.quadraticCurveTo(x + s * 0.62, y + s * 0.5, x + s * 0.3, y + s * 0.56); c.quadraticCurveTo(x - s * 0.02, y + s * 0.5, x, y); c.fill();
  c.fillRect(x + s * 0.27, y + s * 0.54, s * 0.06, s * 0.34); c.fillRect(x + s * 0.1, y + s * 0.86, s * 0.4, s * 0.06);
}
function umbrellaIcon(c: CanvasRenderingContext2D, x: number, y: number, s: number) {
  c.beginPath(); c.arc(x + s * 0.5, y + s * 0.45, s * 0.46, Math.PI, 0); c.closePath(); c.fill();
  c.fillRect(x + s * 0.47, y + s * 0.45, s * 0.06, s * 0.42);
  c.beginPath(); c.arc(x + s * 0.38, y + s * 0.87, s * 0.12, 0, Math.PI); c.lineWidth = s * 0.06; c.stroke();
  for (let i = 0; i < 3; i++) c.fillRect(x + s * (0.2 + i * 0.3), y - s * 0.28 + (i % 2) * s * 0.06, s * 0.05, s * 0.16);
}

export type BoxFaces = { front: Printed; back: Printed; side: Printed; flapMajor: Printed; flapMinor: Printed; inside: Printed; bottom: Printed };
const boxCache = new Map<string, BoxFaces>();

/** Printed kraft faces for a W × H × D carton (scene units). `plain` = unbranded kraft for the sorting line. */
export function boxFaces(W: number, H: number, D: number, { plain = false, seed = 1 }: { plain?: boolean; seed?: number } = {}): BoxFaces {
  const key = `${W}|${H}|${D}|${plain}|${seed}`;
  const hit = boxCache.get(key); if (hit) return hit;
  const px = plain ? PX * 0.55 : PX;

  const front = kraftFibres(new Sheet(W * px, H * px, { mask: false }), seed);
  if (!plain) {
    const s = front, u = s.H / 100;
    s.ink(INK, (c) => {
      drawMark(c, s.W * 0.06, u * 9, u * 26, INK, "#c49a64");
      wide(c, u * 17, 800); c.textBaseline = "alphabetic"; c.fillText(brand.wordmark, s.W * 0.06 + u * 30, u * 29);
      c.font = FONT.mono(700, u * 4.6); spaced(c, u * 0.9); c.fillText("EXPRESS COURIER · SINCE 2009", s.W * 0.06 + u * 31, u * 36.5);
      upArrows(c, s.W * 0.86, u * 10, u * 13);
      c.font = FONT.mono(700, u * 3.6); c.textAlign = "center"; c.fillText("THIS WAY UP", s.W * 0.86 + u * 7, u * 31);
    });
    s.ink(ORANGE, (c) => { c.fillRect(s.W * 0.06, u * 76, s.W * 0.88, u * 11); });
    s.ink("#c49a64", (c) => { wide(c, u * 6.4, 800, true); c.textBaseline = "middle"; c.fillText("ACROSS INDIA, BY TOMORROW.", s.W * 0.08, u * 81.8); });
    s.ink(INK, (c) => { c.font = FONT.mono(500, u * 3.2); spaced(c, u * 0.6); c.fillText("DOUBLE-WALL · 44 ECT · RECYCLABLE ♻", s.W * 0.06, u * 94); });
    speckle(s, seed + 3, "#c49a64", 0.35);
  }
  const back = kraftFibres(new Sheet(W * px, H * px, { mask: false }), seed + 1);
  if (!plain) {
    const s = back, u = s.H / 100;
    s.ink(INK, (c) => {
      const y = u * 14, sz = u * 22, gap = s.W * 0.2;
      frame(c, s.W * 0.1 - u * 3, y - u * 6, gap * 3 + u * 6, sz + u * 12, u * 1.2);
      glassIcon(c, s.W * 0.1 + gap * 0.18, y, sz); umbrellaIcon(c, s.W * 0.1 + gap * 1.2, y + u * 3, sz * 0.8); upArrows(c, s.W * 0.1 + gap * 2.2, y + u * 1, sz * 0.72);
      wide(c, u * 9, 800); c.textAlign = "left"; c.fillText("HANDLE WITH CARE", s.W * 0.1 - u * 3, u * 60);
      c.font = FONT.mono(500, u * 3.6); spaced(c, u * 0.7); c.fillText(`${brand.wordmark} · CALL ${brand.phone} · 24 × 7`, s.W * 0.1 - u * 3, u * 70);
    });
    s.ink(ORANGE, (c) => { c.fillRect(s.W * 0.1 - u * 3, u * 80, u * 26, u * 3); });
    speckle(s, seed + 5, "#c49a64", 0.35);
  }
  const side = kraftFibres(new Sheet(D * px, H * px, { mask: false }), seed + 2);
  if (!plain) {
    const s = side, u = s.H / 100;
    s.ink(ORANGE, (c) => { c.beginPath(); c.arc(s.W / 2, u * 40, u * 24, 0, Math.PI * 2); c.fill(); });
    s.ink(INK, (c) => {
      drawMark(c, s.W / 2 - u * 16, u * 24, u * 32, INK, ORANGE);
      wide(c, u * 8, 800); c.textAlign = "center"; c.fillText(brand.wordmark, s.W / 2, u * 80);
      c.font = FONT.mono(500, u * 3.4); spaced(c, u * 0.7); c.fillText("EXPRESS · SURFACE · INTERNATIONAL", s.W / 2, u * 89);
    });
    speckle(s, seed + 7, "#c49a64", 0.3);
  }
  const flapMajor = kraftFibres(new Sheet(W * px * 0.8, (D / 2) * px * 0.8, { mask: false }), seed + 4);
  if (!plain) {
    const s = flapMajor, u = s.H / 100;
    s.ink(INK, (c) => { c.font = FONT.mono(700, u * 6.5); spaced(c, u * 1.2); c.textAlign = "right"; c.fillText("OPEN WITH CARE  ✂ - - - -", s.W * 0.94, u * 88); });
  }
  const flapMinor = kraftFibres(new Sheet(D * px * 0.6, (D / 2) * px * 0.6, { mask: false }), seed + 6);
  const inside = kraftFibres(new Sheet(512, 512, { mask: false }), seed + 8, "#d9bd92");
  const bottom = kraftFibres(new Sheet(W * px * 0.5, D * px * 0.5, { mask: false }), seed + 9);
  const out: BoxFaces = {
    front: front.textures(), back: back.textures(), side: side.textures(), flapMajor: flapMajor.textures(),
    flapMinor: flapMinor.textures(), inside: inside.textures(), bottom: bottom.textures(),
  };
  boxCache.set(key, out);
  return out;
}

/** The corrugated edge: fluting between two liners. */
let fluteTex: THREE.Texture | null = null;
export function fluteTexture() {
  if (fluteTex) return fluteTex;
  const c = document.createElement("canvas"); c.width = 256; c.height = 32;
  const x = c.getContext("2d")!;
  x.fillStyle = "#b88a55"; x.fillRect(0, 0, 256, 32);
  x.fillStyle = "#d6b484"; x.fillRect(0, 0, 256, 5); x.fillRect(0, 27, 256, 5);
  x.strokeStyle = "#8a6034"; x.lineWidth = 2.2; x.beginPath();
  for (let i = 0; i <= 256; i++) { const y = 16 + Math.sin((i / 256) * Math.PI * 2 * 12) * 9.5; if (i) x.lineTo(i, y); else x.moveTo(i, y); }
  x.stroke();
  fluteTex = new THREE.CanvasTexture(c); fluteTex.colorSpace = THREE.SRGBColorSpace; fluteTex.wrapS = fluteTex.wrapT = THREE.RepeatWrapping;
  return fluteTex;
}

/* ---------------- branded tape ---------------- */
let tapeTex: Printed | null = null;
export function tapePrint() {
  if (tapeTex) return tapeTex;
  const s = new Sheet(2048, 160, { bump: false });
  s.paper(ORANGE, 0.28);
  s.ink(INK, (c) => {
    c.textBaseline = "middle";
    let x = 20;
    const items = [brand.wordmark, "●", "EXPRESS", "●", "SEALED FOR YOU", "●"];
    for (let k = 0; k < 4; k++) for (const t of items) {
      if (t === "●") { c.beginPath(); c.arc(x + 12, 80, 9, 0, Math.PI * 2); c.fill(); x += 50; continue; }
      wide(c, 64, 800, t !== brand.wordmark); c.fillText(t, x, 84); x += c.measureText(t).width + 38;
    }
  });
  s.ink("rgba(255,255,255,0.85)", (c) => { c.fillRect(0, 10, s.W, 5); c.fillRect(0, s.H - 15, s.W, 5); });
  tapeTex = s.textures();
  for (const t of [tapeTex.map, tapeTex.mask]) if (t) { t.wrapS = THREE.RepeatWrapping; }
  return tapeTex;
}

/* ---------------- the thermal label (landscape, reads from the front) ---------------- */
function qr(c: CanvasRenderingContext2D, x: number, y: number, size: number, seed: number) {
  const n = 25, m = size / n, r = mulberry32(seed);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (r() > 0.52) c.fillRect(x + i * m, y + j * m, m + 0.3, m + 0.3);
  const finder = (fx: number, fy: number) => {
    c.save(); c.fillStyle = "#fbfbf7"; c.fillRect(x + fx * m - m, y + fy * m - m, m * 9, m * 9); c.restore();
    c.fillRect(x + fx * m, y + fy * m, m * 7, m * 7);
    c.save(); c.fillStyle = "#fbfbf7"; c.fillRect(x + (fx + 1) * m, y + (fy + 1) * m, m * 5, m * 5); c.restore();
    c.fillRect(x + (fx + 2) * m, y + (fy + 2) * m, m * 3, m * 3);
  };
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
}

export type LabelSpec = { awb: string; to: { name: string; line: string; city: string; pin: string; code: string }; from: { name: string; city: string; pin: string; code: string }; weight: string; service: string; seed: number };
export const heroLabel: LabelSpec = { awb: hero.awb, to: hero.to, from: hero.from, weight: hero.weight, service: "EXPRESS", seed: 5829 };

const labelCache = new Map<string, Printed>();
/** 1500 × 1000 px thermal label. */
export function labelPrint(spec: LabelSpec = heroLabel, { lite = false }: { lite?: boolean } = {}) {
  const key = spec.awb + (lite ? "l" : "");
  const hit = labelCache.get(key); if (hit) return hit;
  const k = lite ? 0.5 : 1;
  const s = new Sheet(1500 * k, 1000 * k, { bump: false });
  const u = s.W / 150; // 1u = 10px at full size
  s.paper("#fbfbf7", 0.55);
  s.ink(INK, (c) => {
    c.textBaseline = "alphabetic";
    // header band
    c.fillRect(0, 0, s.W, u * 17);
    c.save(); c.fillStyle = "#fbfbf7";
    drawMark(c, u * 4, u * 2.5, u * 12, "#fbfbf7", INK);
    wide(c, u * 8.4, 800); c.fillText(brand.wordmark, u * 17.5, u * 11.6);
    c.textAlign = "right"; c.font = FONT.mono(700, u * 3.6); spaced(c, u * 0.7); c.fillText("PRIORITY · 24H · PREPAID", s.W - u * 38, u * 10.6);
    c.restore();
    // service block
    c.save(); c.fillStyle = ORANGE; c.fillRect(s.W - u * 34, 0, u * 34, u * 17); c.fillStyle = INK; wide(c, u * 5.6, 800, true); c.textAlign = "center"; c.fillText(spec.service, s.W - u * 17, u * 11); c.restore();

    // TO
    c.font = FONT.mono(700, u * 3); spaced(c, u * 0.5); c.fillText("SHIP TO", u * 5, u * 26);
    spaced(c, 0);
    c.font = FONT.sans(700, u * 6.4); c.fillText(spec.to.name, u * 5, u * 34.5);
    c.font = FONT.sans(500, u * 4.4); c.fillText(spec.to.line, u * 5, u * 41); c.fillText(`${spec.to.city}`, u * 5, u * 46.5);
    wide(c, u * 12, 800); c.fillText(spec.to.pin, u * 5, u * 60);
    // route code block
    frame(c, u * 92, u * 21, u * 53, u * 41, u * 0.9);
    c.textAlign = "center";
    c.font = FONT.mono(700, u * 3); spaced(c, u * 0.5); c.fillText("ROUTE", u * 118.5, u * 27.5); spaced(c, 0);
    wide(c, u * 10, 800); c.fillText(`${spec.from.code} › ${spec.to.code}`, u * 118.5, u * 41);
    c.fillRect(u * 92, u * 46, u * 53, u * 16);
    c.save(); c.fillStyle = "#fbfbf7"; wide(c, u * 7.4, 800, true); c.fillText(`${spec.to.code}-07`, u * 118.5, u * 57); c.restore();
    c.textAlign = "left";
    // FROM
    c.fillRect(u * 5, u * 65, s.W - u * 10, u * 0.6);
    c.font = FONT.mono(700, u * 2.6); spaced(c, u * 0.5); c.fillText("FROM", u * 5, u * 70.5); spaced(c, 0);
    c.font = FONT.sans(500, u * 3.4); c.fillText(`${spec.from.name} · ${spec.from.city} ${spec.from.pin}`, u * 17, u * 70.8);
    // barcode + AWB
    barcode(c, u * 5, u * 74, u * 104, u * 17, spec.seed);
    c.font = FONT.mono(700, u * 3.6); spaced(c, u * 1.1); c.fillText(`TRACKING ${spec.awb}`, u * 5, u * 96.5); spaced(c, 0);
    qr(c, u * 117, u * 70, u * 28, spec.seed + 1);
    c.font = FONT.mono(500, u * 2.4); c.textAlign = "right"; spaced(c, u * 0.4); c.fillText(`${spec.weight.toUpperCase()} · 1/1`, s.W - u * 5, u * 98.6);
  });
  const t = s.textures(lite ? 4 : 8);
  labelCache.set(key, t);
  return t;
}

/* ---------------- stickers ---------------- */
let fragile: Printed | null = null;
export function fragilePrint() {
  if (fragile) return fragile;
  const s = new Sheet(520, 360, { bump: false });
  s.paper("#e2231a", 0.4);
  s.ink("#ffffff", (c) => {
    frame(c, 14, 14, s.W - 28, s.H - 28, 6);
    glassIcon(c, 40, 60, 170);
    const x = 216; wide(c, 74, 800); c.fillText("FRAGILE", x - 4, 150);
    c.font = FONT.mono(700, 24); spaced(c, 4); c.fillText("HANDLE WITH CARE", x, 204); c.fillText("DO NOT DROP", x, 244);
    c.fillRect(x, 272, 250, 5);
  });
  fragile = s.textures(4);
  return fragile;
}

/* ---------------- the rubber stamp impression (alpha) ---------------- */
let stampTex: THREE.Texture | null = null;
export function stampTexture() {
  if (stampTex) return stampTex;
  const c = document.createElement("canvas"); c.width = 1024; c.height = 520;
  const x = c.getContext("2d")!;
  x.translate(512, 260);
  x.strokeStyle = x.fillStyle = "#d8231b";
  x.lineWidth = 16; roundRect(x, -480, -220, 960, 440, 60); x.stroke();
  x.lineWidth = 6; roundRect(x, -446, -186, 892, 372, 36); x.stroke();
  wide(x, 150, 800); x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("DELIVERED", 0, -28);
  x.font = FONT.mono(700, 44); spaced(x, 10); x.fillText(`${brand.wordmark} · ${hero.to.code} · 10:14`, 0, 110);
  // tick
  x.lineWidth = 22; x.lineCap = "round"; x.lineJoin = "round"; x.beginPath(); x.moveTo(-400, -150); x.lineTo(-372, -122); x.lineTo(-318, -186); x.stroke();
  // ink wear
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalCompositeOperation = "destination-out";
  const r = mulberry32(77);
  for (let i = 0; i < 5200; i++) { x.globalAlpha = 0.25 + r() * 0.75; const s = 1 + r() * 4.5; x.fillRect(r() * 1024, r() * 520, s, s); }
  for (let i = 0; i < 26; i++) { x.globalAlpha = 0.2 + r() * 0.3; x.beginPath(); x.ellipse(r() * 1024, r() * 520, 20 + r() * 80, 6 + r() * 20, r() * 3, 0, Math.PI * 2); x.fill(); }
  stampTex = new THREE.CanvasTexture(c); stampTex.colorSpace = THREE.SRGBColorSpace; stampTex.anisotropy = 8;
  return stampTex;
}

/* ---------------- map + labels ---------------- */
export function textSprite(text: string, { color = INK, bg = "rgba(243,241,236,0.92)", size = 44, dot = ORANGE }: { color?: string; bg?: string | null; size?: number; dot?: string | null } = {}) {
  const c = document.createElement("canvas");
  const x = c.getContext("2d")!;
  x.font = FONT.mono(700, size); spaced(x, size * 0.18);
  const w = Math.ceil(x.measureText(text).width + size * (dot ? 2.4 : 1.4)), h = Math.ceil(size * 1.9);
  c.width = w; c.height = h;
  if (bg) { x.fillStyle = bg; roundRect(x, 0, 0, w, h, h / 2); x.fill(); }
  if (dot) { x.fillStyle = dot; x.beginPath(); x.arc(size * 0.95, h / 2, size * 0.3, 0, Math.PI * 2); x.fill(); }
  x.font = FONT.mono(700, size); spaced(x, size * 0.18); x.fillStyle = color; x.textBaseline = "middle";
  x.fillText(text, dot ? size * 1.6 : size * 0.7, h / 2 + size * 0.04);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return { tex: t, aspect: w / h };
}

export function dotTexture(color = "255,255,255") {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, `rgba(${color},1)`); g.addColorStop(0.45, `rgba(${color},0.7)`); g.addColorStop(1, `rgba(${color},0)`);
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/** Soft red laser fan for the scan arch (additive). */
export function laserTexture() {
  const c = document.createElement("canvas"); c.width = 64; c.height = 256;
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "rgba(255,60,30,0.9)"); g.addColorStop(1, "rgba(255,60,30,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 256);
  const h = x.createLinearGradient(0, 0, 64, 0);
  h.addColorStop(0, "rgba(0,0,0,1)"); h.addColorStop(0.5, "rgba(0,0,0,0)"); h.addColorStop(1, "rgba(0,0,0,1)");
  x.globalCompositeOperation = "destination-out"; x.fillStyle = h; x.fillRect(0, 0, 64, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/** Bay sign on top of the scan arch. */
export function bayPrint() {
  const s = new Sheet(1024, 180, { bump: false });
  s.paper(INK, 0.4);
  s.ink("#ffffff", (c) => { wide(c, 84, 800); c.textBaseline = "middle"; c.fillText("SCAN", 40, 96); });
  s.ink(ORANGE, (c) => { c.fillRect(400, 36, 300, 108); });
  s.ink(INK, (c) => { wide(c, 72, 800, true); c.textBaseline = "middle"; c.textAlign = "center"; c.fillText("BAY 14", 550, 94); });
  s.ink("rgba(255,255,255,0.6)", (c) => { c.font = FONT.mono(700, 30); spaced(c, 5); c.textBaseline = "middle"; c.fillText("HYD HUB", 740, 96); });
  return s.textures(4);
}

/* ---------------- doorstep ---------------- */
export function marbleTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 1024;
  const x = c.getContext("2d")!;
  const r = mulberry32(31);
  const tile = 512;
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const ox = i * tile, oy = j * tile;
    const g = x.createLinearGradient(ox, oy, ox + tile, oy + tile);
    g.addColorStop(0, (i + j) % 2 ? "#ece8e1" : "#f3f0ea"); g.addColorStop(1, (i + j) % 2 ? "#e3ded5" : "#ebe7df");
    x.fillStyle = g; x.fillRect(ox, oy, tile, tile);
    for (let v = 0; v < 7; v++) {
      x.strokeStyle = `rgba(120,112,100,${0.06 + r() * 0.12})`; x.lineWidth = 0.8 + r() * 2.2;
      x.beginPath(); let px = ox + r() * tile, py = oy; x.moveTo(px, py);
      while (py < oy + tile) { px += (r() - 0.5) * 40; py += 10 + r() * 26; x.lineTo(px, py); }
      x.stroke();
    }
  }
  x.fillStyle = "#cfc9be"; x.fillRect(tile - 3, 0, 6, 1024); x.fillRect(0, tile - 3, 1024, 6); x.fillRect(0, 0, 1024, 3); x.fillRect(0, 0, 3, 1024);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}

export function doorPrint() {
  const s = new Sheet(560, 1120, { bump: true });
  const r = mulberry32(9);
  s.raw((c) => {
    c.fillStyle = "#20352c"; c.fillRect(0, 0, s.W, s.H);
    for (let i = 0; i < 380; i++) { c.strokeStyle = `rgba(${r() > 0.5 ? "10,20,15" : "70,95,80"},${0.03 + r() * 0.06})`; c.lineWidth = 1 + r() * 3; const xx = r() * s.W; c.beginPath(); c.moveTo(xx, 0); c.bezierCurveTo(xx + (r() - 0.5) * 30, s.H * 0.3, xx + (r() - 0.5) * 30, s.H * 0.7, xx + (r() - 0.5) * 20, s.H); c.stroke(); }
  });
  const panel = (x: number, y: number, w: number, h: number) => {
    s.emboss((c) => { frame(c, x, y, w, h, 18); }, -0.8);
    s.ink("rgba(5,10,8,0.45)", (c) => { frame(c, x, y, w, h, 6); });
    s.ink("rgba(200,230,210,0.14)", (c) => { c.fillRect(x + 18, y + 18, w - 36, 5); });
  };
  panel(70, 90, 420, 400); panel(70, 580, 420, 450);
  return s.textures(8);
}

export function nameplatePrint() {
  const s = new Sheet(520, 180, { bump: false });
  s.paper("#c9a25a", 0.3);
  s.foil((c) => { c.fillRect(0, 0, s.W, s.H); }, { color: "#d4ae68" });
  s.ink("#2b1d0e", (c) => { c.font = FONT.sans(700, 56); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("4B · SHARMA", s.W / 2, s.H / 2 + 4); frame(c, 12, 12, s.W - 24, s.H - 24, 4); });
  return s.textures(4);
}

export function matPrint() {
  const s = new Sheet(1024, 640, { bump: true });
  const r = mulberry32(12);
  s.raw((c) => {
    c.fillStyle = "#9b6a3a"; c.fillRect(0, 0, s.W, s.H);
    for (let i = 0; i < 16000; i++) { c.fillStyle = `rgba(${r() > 0.5 ? "60,36,14" : "200,150,90"},${0.2 + r() * 0.35})`; c.fillRect(r() * s.W, r() * s.H, 2 + r() * 3, 1 + r() * 2); }
  });
  s.ink("#3a2210", (c) => { frame(c, 40, 40, s.W - 80, s.H - 80, 22); wide(c, 112, 800); c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("SWAGAT", s.W / 2, s.H / 2 + 6); });
  // a rangoli-style chain of diamonds and dots above and below the greeting, drawn on the canvas
  s.ink("#e8b04a", (c) => {
    for (const y of [112, s.H - 112]) for (let x = 130; x < s.W - 100; x += 58) {
      c.beginPath(); c.moveTo(x, y - 18); c.lineTo(x + 18, y); c.lineTo(x, y + 18); c.lineTo(x - 18, y); c.closePath(); c.fill();
      c.beginPath(); c.arc(x + 29, y, 5, 0, Math.PI * 2); c.fill();
    }
  });
  s.emboss((c) => { for (let y = 0; y < s.H; y += 8) c.fillRect(0, y, s.W, 3); }, 0.5);
  return s.textures(8);
}

/* ---------------- the mailer pouch & international extras ---------------- */
export function mailerPrint() {
  const s = new Sheet(1500, 1050, { bump: false });
  s.paper("#f6f4ef", 0.5);
  s.ink(ORANGE, (c) => { c.fillRect(0, 0, s.W, 150); });
  s.ink(INK, (c) => {
    drawMark(c, 60, 30, 90, INK, ORANGE);
    wide(c, 76, 800); c.textBaseline = "middle"; c.fillText(brand.wordmark, 170, 78);
    c.font = FONT.mono(700, 30); spaced(c, 6); c.textAlign = "right"; c.fillText("SAME DAY · DOCUMENTS", s.W - 60, 80);
    c.textAlign = "left"; spaced(c, 4); c.font = FONT.mono(500, 26);
    c.fillText("TAMPER-EVIDENT · WATERPROOF · 100% RECYCLED PE", 60, s.H - 50);
  });
  s.ink("rgba(21,23,27,0.1)", (c) => { for (let i = 0; i < 16; i++) c.fillRect(0, 190 + i * 52, s.W, 2); });
  return s.textures(6);
}

let airmail: Printed | null = null;
export function airmailPrint() {
  if (airmail) return airmail;
  const s = new Sheet(2048, 160, { bump: false });
  s.paper("#f7f5ef", 0.3);
  s.ink("#d8231b", (c) => { for (let x = -80; x < s.W + 80; x += 160) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 60, 0); c.lineTo(x + 20, s.H); c.lineTo(x - 40, s.H); c.closePath(); c.fill(); } });
  s.ink("#2743ff", (c) => { for (let x = 0; x < s.W + 80; x += 160) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 60, 0); c.lineTo(x + 20, s.H); c.lineTo(x - 40, s.H); c.closePath(); c.fill(); } });
  s.ink(INK, (c) => { c.fillStyle = "#f7f5ef"; c.fillRect(0, 44, s.W, 72); c.fillStyle = INK; wide(c, 50, 800, true); c.textBaseline = "middle"; for (let x = 30; x < s.W; x += 700) c.fillText("PAR AVION · BY AIR", x, 82); });
  airmail = s.textures(4);
  for (const t of [airmail.map, airmail.mask]) if (t) t.wrapS = THREE.RepeatWrapping;
  return airmail;
}

export function customsPrint() {
  const s = new Sheet(800, 560, { bump: false });
  s.paper("#d9f0dc", 0.5);
  s.ink("#0e3b1f", (c) => {
    frame(c, 16, 16, s.W - 32, s.H - 32, 5);
    wide(c, 50, 800); c.fillText("CUSTOMS", 44, 96); c.font = FONT.mono(700, 30); spaced(c, 4); c.fillText("DECLARATION · CN22", 44, 140);
    c.fillRect(44, 170, s.W - 88, 3);
    c.font = FONT.sans(500, 28); spaced(c, 0);
    ["Gift  ☐   Documents  ☐   Sale of goods  ☒", "Handmade blue pottery, 2 pcs · 1.8 kg", "Value  INR 8,500  ·  HS 6912.00", "Duties paid by sender (DDP)"].forEach((t, i) => c.fillText(t, 44, 226 + i * 64));
    barcode(c, 44, 470, 460, 50, 911);
  });
  return s.textures(4);
}

/* ---------------- a gift inside ---------------- */
export function giftPrint() {
  const s = new Sheet(640, 640, { bump: true });
  s.paper("#2743ff", 0.35);
  s.ink("rgba(255,255,255,0.13)", (c) => { for (let i = -640; i < 640; i += 48) { c.save(); c.translate(i, 0); c.rotate(0.6); c.fillRect(0, -200, 16, 1400); c.restore(); } });
  s.foil((c) => { c.textAlign = "center"; c.textBaseline = "middle"; wide(c, 50, 800, true); c.fillText("for you", 320, 320); }, { emboss: 0.8, color: "#ffd2b8" });
  return s.textures(6);
}

================================================================================
10. THE MODELS — lib/story/models.ts (write exactly this)
================================================================================

Plain three.js builders shared by the story, the stills, the card turntable and the rate calculator: the parcel (a regular slotted carton with folding flaps, tape that runs on, a label that slaps on and a stamp), the mailer, the gift, the shreds, the conveyor with its scanner arch and traffic, the halftone map with pins, labels, route arcs, the hero trail, the jet and its shadow, the pop-up doorstep, the stamper, and the customs add-on.

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mulberry32, printedMaterial, type Printed } from "./print";
import {
  boxFaces, fluteTexture, tapePrint, airmailPrint, labelPrint, fragilePrint, stampTexture, giftPrint, bayPrint,
  laserTexture, marbleTexture, doorPrint, nameplatePrint, matPrint, mailerPrint, customsPrint, textSprite, heroLabel, type LabelSpec,
} from "./textures";
import { OUTLINE, LAKES, CITY, ROUTES, ROUTE, MID_LAT, halftone, type CityCode } from "@/lib/map";

/* ------------------------------------------------------------------
   Plain three.js builders shared by the story, the stills, the card
   turntable and the rate calculator.
   ------------------------------------------------------------------ */

const ss = THREE.MathUtils.smoothstep;
export const HERO_BOX = { W: 1.6, H: 1.1, D: 1.2 } as const;
const T = 0.028; // board thickness

/* =================================================================
   TAPE — a strip that runs up one side, across the seam, down the other
   ================================================================= */
export type TapeModel = { root: THREE.Group; set: (p: number) => void };
const PERIOD = 2.4; // scene units per repeat of the tape print

function tapeSegment(len: number, width: number, print: Printed) {
  const map = print.map.clone(), mask = print.mask?.clone() ?? null;
  map.needsUpdate = true; if (mask) mask.needsUpdate = true;
  const m = printedMaterial({ map, mask, bump: null, glow: null }, { side: THREE.DoubleSide });
  m.clearcoatRoughness = 0.04; m.polygonOffset = true; m.polygonOffsetFactor = -2;
  const g = new THREE.PlaneGeometry(len, width); g.translate(len / 2, 0, 0);
  const mesh = new THREE.Mesh(g, m);
  const obj = new THREE.Group(); obj.add(mesh);
  const set = (p: number) => {
    mesh.visible = p > 0.001;
    mesh.scale.x = Math.max(0.0001, p);
    map.repeat.set((len * p) / PERIOD, 1); if (mask) mask.repeat.set((len * p) / PERIOD, 1);
  };
  return { obj, set };
}
function place(o: THREE.Object3D, origin: THREE.Vector3, len: THREE.Vector3, normal: THREE.Vector3) {
  const y = new THREE.Vector3().crossVectors(normal, len);
  o.matrixAutoUpdate = false;
  o.matrix.makeBasis(len, y, normal).setPosition(origin);
}

export function createTape(W: number, H: number, D: number, { kind = "brand", width = 0.26, drop = 0.34, top }: { kind?: "brand" | "airmail"; width?: number; drop?: number; top: number }): TapeModel {
  const print = kind === "airmail" ? airmailPrint() : tapePrint();
  const root = new THREE.Group(); root.name = "tape";
  const e = 0.0025;
  const L = tapeSegment(drop, width, print), Tp = tapeSegment(W + 2 * e, width, print), R = tapeSegment(drop, width, print);
  place(L.obj, new THREE.Vector3(-W / 2 - e, top - drop, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-1, 0, 0));
  place(Tp.obj, new THREE.Vector3(-W / 2 - e, top + e, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0));
  place(R.obj, new THREE.Vector3(W / 2 + e, top, 0), new THREE.Vector3(0, -1, 0), new THREE.Vector3(1, 0, 0));
  root.add(L.obj, Tp.obj, R.obj);
  const total = 2 * drop + W;
  const set = (p: number) => {
    const d = p * total;
    L.set(THREE.MathUtils.clamp(d / drop, 0, 1));
    Tp.set(THREE.MathUtils.clamp((d - drop) / W, 0, 1));
    R.set(THREE.MathUtils.clamp((d - drop - W) / drop, 0, 1));
  };
  set(1);
  void H; void D;
  return { root, set };
}

/* =================================================================
   PARCEL — a regular slotted carton with four hinged flaps
   ================================================================= */
export type ParcelOpts = { W: number; H: number; D: number; plain?: boolean; seed?: number; label?: LabelSpec | null; tape?: "brand" | "airmail" | null; fragile?: boolean; flaps?: boolean; liteLabel?: boolean };
export type ParcelModel = {
  root: THREE.Group; W: number; H: number; D: number; top: number;
  setOpen: (o: number) => void; tape: TapeModel | null; setLabel: (l: number) => void; setStamp: (s: number) => void;
  label: THREE.Mesh | null; stamp: THREE.Mesh | null; inner: THREE.Group;
};

const edgeMats = new Map<string, THREE.MeshStandardMaterial>();
function edgeMat(rep: number) {
  const k = rep.toFixed(1);
  let m = edgeMats.get(k);
  if (!m) { const t = fluteTexture().clone(); t.needsUpdate = true; t.repeat.set(rep, 1); m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }); edgeMats.set(k, m); }
  return m;
}
const matCache = new Map<Printed, THREE.MeshPhysicalMaterial>();
function pm(p: Printed) { let m = matCache.get(p); if (!m) { m = printedMaterial(p, { bumpScale: 0.6 }); m.clearcoat = 0; m.roughness = 0.86; m.metalness = 0; m.metalnessMap = null; m.roughnessMap = null; m.clearcoatMap = null; matCache.set(p, m); } return m; }

export function createParcel(o: ParcelOpts): ParcelModel {
  const { W, H, D } = o;
  const f = boxFaces(W, H, D, { plain: o.plain, seed: o.seed ?? 1 });
  const inner = pm(f.inside), eW = edgeMat(W * 6), eD = edgeMat(D * 6), eH = edgeMat(H * 6);
  const root = new THREE.Group(); root.name = "parcel";
  const body = new THREE.Group(); root.add(body);
  const wall = (w: number, h: number, d: number, mats: THREE.Material[]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats); m.castShadow = true; m.receiveShadow = true; return m; };
  // [px, nx, py, ny, pz, nz]
  const front = wall(W, H, T, [eH, eH, eW, eW, pm(f.front), inner]); front.position.set(0, 0, D / 2 - T / 2);
  const back = wall(W, H, T, [eH, eH, eW, eW, inner, pm(f.back)]); back.position.set(0, 0, -D / 2 + T / 2);
  const left = wall(T, H, D - 2 * T, [inner, pm(f.side), eD, eD, eH, eH]); left.position.set(-W / 2 + T / 2, 0, 0);
  const right = wall(T, H, D - 2 * T, [pm(f.side), inner, eD, eD, eH, eH]); right.position.set(W / 2 - T / 2, 0, 0);
  const bottom = wall(W - 2 * T, T, D - 2 * T, [eD, eD, inner, pm(f.bottom), eW, eW]); bottom.position.set(0, -H / 2 + T / 2, 0);
  body.add(front, back, left, right, bottom);

  // flaps (minor under major)
  const hinges: { g: THREE.Group; axis: "x" | "z"; sign: number; minor: boolean }[] = [];
  const flapsOn = o.flaps !== false;
  if (flapsOn) {
    const major = (sign: 1 | -1) => {
      const g = new THREE.Group(); g.position.set(0, H / 2, sign * (D / 2 - T / 2));
      const m = wall(W, T, D / 2, [eD, eD, pm(f.flapMajor), inner, eW, eW]); m.position.set(0, T * 1.5, -sign * (D / 4 - T / 2));
      if (sign < 0) m.rotation.y = Math.PI;
      g.add(m); root.add(g); hinges.push({ g, axis: "x", sign, minor: false });
    };
    const minor = (sign: 1 | -1) => {
      const g = new THREE.Group(); g.position.set(sign * (W / 2 - T / 2), H / 2, 0);
      const m = wall(D / 2, T, D - 2 * T - 0.004, [eD, eD, pm(f.flapMinor), inner, eD, eD]); m.position.set(-sign * (D / 4 - T / 2), T / 2, 0);
      g.add(m); root.add(g); hinges.push({ g, axis: "z", sign, minor: true });
    };
    minor(-1); minor(1); major(1); major(-1);
  }
  const OPEN = 2.05;
  const setOpen = (op: number) => {
    const c = 1 - op;
    for (const h of hinges) {
      const k = h.minor ? 1 - ss(c, 0, 0.55) : 1 - ss(c, 0.42, 1);
      const a = OPEN * k * (h.minor ? 0.96 : 1);
      if (h.axis === "x") h.g.rotation.x = h.sign * a; else h.g.rotation.z = -h.sign * a;
    }
  };
  setOpen(0);
  const top = H / 2 + (flapsOn ? T * 2 : 0);

  const tape = o.tape ? createTape(W, H, D, { kind: o.tape, top, width: Math.min(0.26, D * 0.24), drop: Math.min(0.34, H * 0.36) }) : null;
  if (tape) root.add(tape.root);

  // label on top, reading from the front
  let label: THREE.Mesh | null = null, stamp: THREE.Mesh | null = null;
  let labelBase: Float32Array | null = null;
  if (o.label !== null) {
    const lw = Math.min(1.0, W * 0.66), lh = lw / 1.5;
    const g = new THREE.PlaneGeometry(lw, lh, 24, 2);
    const lm = printedMaterial(labelPrint(o.label ?? heroLabel, { lite: o.liteLabel }), { bumpScale: 0 });
    lm.clearcoat = 0.35; lm.polygonOffset = true; lm.polygonOffsetFactor = -4;
    label = new THREE.Mesh(g, lm); label.rotation.x = -Math.PI / 2; label.position.set(0, top + 0.004, 0);
    label.castShadow = true;
    root.add(label);
    labelBase = (g.getAttribute("position") as THREE.BufferAttribute).array.slice() as Float32Array;
    const sm = new THREE.MeshStandardMaterial({ map: stampTexture(), transparent: true, roughness: 0.55, opacity: 0, polygonOffset: true, polygonOffsetFactor: -6, depthWrite: false });
    stamp = new THREE.Mesh(new THREE.PlaneGeometry(lw * 0.82, lw * 0.82 * (520 / 1024)), sm);
    stamp.rotation.set(-Math.PI / 2, 0, 0.16); stamp.position.set(lw * 0.06, top + 0.008, 0.02); stamp.visible = false;
    root.add(stamp);
  }
  const setLabel = (l: number) => {
    if (!label || !labelBase) return;
    const e = ss(l, 0, 1);
    label.visible = l > 0.001;
    label.position.y = top + 0.004 + (1 - e) * 0.9;
    label.rotation.z = (1 - e) * 0.35;
    label.rotation.x = -Math.PI / 2 + (1 - e) * 0.25;
    const pos = label.geometry.getAttribute("position") as THREE.BufferAttribute;
    const curl = (1 - e) * 0.22, lw = (label.geometry as THREE.PlaneGeometry).parameters.width;
    for (let i = 0; i < pos.count; i++) { const x = labelBase[i * 3]; const k = Math.abs(x) / (lw / 2); pos.setZ(i, curl * k * k); }
    pos.needsUpdate = true;
  };
  const setStamp = (s: number) => {
    if (!stamp) return;
    stamp.visible = s > 0.001;
    const m = stamp.material as THREE.MeshStandardMaterial;
    m.opacity = Math.min(1, s * 1.6);
    stamp.scale.setScalar(1 + (1 - ss(s, 0, 0.6)) * 0.22);
  };
  if (label) setLabel(1);

  if (o.fragile) {
    const fm = printedMaterial(fragilePrint(), { bumpScale: 0 }); fm.polygonOffset = true; fm.polygonOffsetFactor = -3;
    const fw = Math.min(0.42, W * 0.3);
    const fr = new THREE.Mesh(new THREE.PlaneGeometry(fw, fw * (360 / 520)), fm);
    fr.position.set(W / 2 - fw / 2 - 0.1, -H / 2 + fw * 0.5, D / 2 + 0.0015);
    root.add(fr);
  }
  const innerG = new THREE.Group(); root.add(innerG);
  return { root, W, H, D, top, setOpen, tape, setLabel, setStamp, label, stamp, inner: innerG };
}

/* =================================================================
   MAILER — the Same Day document pouch
   ================================================================= */
export function createMailer() {
  const root = new THREE.Group(); root.name = "mailer";
  const W = 1.5, D = 1.05;
  const g = new RoundedBoxGeometry(W, 0.06, D, 4, 0.03);
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = p.getY(i); const puff = (1 - Math.pow((2 * x) / W, 4)) * (1 - Math.pow((2 * z) / D, 4)); p.setY(i, y * (1 + puff * 1.6)); }
  g.computeVertexNormals();
  const top = printedMaterial(mailerPrint(), { bumpScale: 0 }); top.clearcoat = 0.6; top.clearcoatRoughness = 0.25; top.roughness = 0.5;
  // map the top print by projecting xz → uv
  const uv = g.getAttribute("uv") as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / W + 0.5, -p.getZ(i) / D + 0.5);
  const m = new THREE.Mesh(g, top); m.castShadow = true;
  root.add(m);
  const lw = 0.62, lm = printedMaterial(labelPrint({ ...heroLabel, awb: "BRD 6120 0831 7718", to: { name: "Legal desk", line: "Road No. 1, Banjara Hills", city: "Hyderabad, Telangana", pin: "500034", code: "HYD" }, from: { name: "Rao & Associates", city: "Hyderabad, Telangana", pin: "500082", code: "HYD" }, service: "SAME DAY", seed: 61 }, { lite: true }), { bumpScale: 0 });
  lm.polygonOffset = true; lm.polygonOffsetFactor = -4;
  const label = new THREE.Mesh(new THREE.PlaneGeometry(lw, lw / 1.5), lm); label.rotation.x = -Math.PI / 2; label.position.set(0.28, 0.082, 0.12);
  root.add(label);
  return { root, W, H: 0.12, D };
}

/* =================================================================
   GIFT + SHREDS — what goes in the box
   ================================================================= */
export function createGift() {
  const root = new THREE.Group(); root.name = "gift";
  const W = 0.72, H = 0.34, D = 0.54;
  const pr = printedMaterial(giftPrint(), { bumpScale: 0.8 });
  const side = new THREE.MeshPhysicalMaterial({ color: "#2743ff", roughness: 0.4, clearcoat: 0.4 });
  const box = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 3, 0.02), [side, side, pr, side, side, side]); box.castShadow = true;
  root.add(box);
  const rib = new THREE.MeshPhysicalMaterial({ color: "#ff5a1f", roughness: 0.35, sheen: 1, sheenColor: new THREE.Color("#ffd0b8"), sheenRoughness: 0.4 });
  const r1 = new THREE.Mesh(new THREE.BoxGeometry(W + 0.012, H + 0.012, 0.07), rib); const r2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, H + 0.012, D + 0.012), rib);
  root.add(r1, r2);
  const loop = new THREE.TorusGeometry(0.08, 0.022, 10, 28);
  for (const s of [-1, 1]) { const l = new THREE.Mesh(loop, rib); l.position.set(s * 0.075, H / 2 + 0.05, 0); l.rotation.set(0, s * 0.35, s * 0.9); l.scale.set(1, 0.7, 1); root.add(l); }
  return { root, W, H, D };
}

export function createShreds(n = 110) {
  const g = new THREE.BoxGeometry(0.16, 0.006, 0.026);
  const m = new THREE.MeshStandardMaterial({ roughness: 0.85 });
  const mesh = new THREE.InstancedMesh(g, m, n);
  const r = mulberry32(21);
  const cols = ["#c49a64", "#d8b481", "#ff5a1f", "#f3f1ec", "#b8864f"].map((c) => new THREE.Color(c));
  const data = Array.from({ length: n }, (_, i) => {
    mesh.setColorAt(i, cols[Math.floor(r() * cols.length)]);
    return { x: (r() - 0.5) * 1.3, z: (r() - 0.5) * 0.95, y0: 1.4 + r() * 1.8, yEnd: -0.28 + r() * 0.36, delay: r() * 0.45, rx: r() * 6, ry: r() * 6, rz: r() * 6, spin: 2 + r() * 6 };
  });
  mesh.instanceColor!.needsUpdate = true;
  mesh.castShadow = true;
  const q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1), M = new THREE.Matrix4();
  const set = (t: number) => {
    data.forEach((d, i) => {
      const k = THREE.MathUtils.clamp((t - d.delay) / 0.55, 0, 1);
      const fall = k * k;
      p.set(d.x, THREE.MathUtils.lerp(d.y0, d.yEnd, fall), d.z);
      const settle = 1 - fall;
      q.setFromEuler(e.set(d.rx + settle * d.spin, d.ry + settle * d.spin * 0.6, d.rz * (0.3 + settle)));
      s.setScalar(k > 0 ? 1 : 0.0001);
      M.compose(p, q, s); mesh.setMatrixAt(i, M);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  set(0);
  return { mesh, set };
}

/* =================================================================
   CONVEYOR + SCAN ARCH
   ================================================================= */
export const BELT = { L: 18, W: 2.1, Y: -0.62 } as const; // belt surface height (parcel bottom sits here)

function beltTexture() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 256;
  const x = c.getContext("2d")!;
  x.fillStyle = "#1d2025"; x.fillRect(0, 0, 512, 256);
  x.strokeStyle = "#2c3038"; x.lineWidth = 18; x.lineCap = "round";
  for (let i = 0; i < 4; i++) { const ox = i * 128 + 20; x.beginPath(); x.moveTo(ox, 30); x.lineTo(ox + 60, 128); x.lineTo(ox, 226); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}

export function createConveyor() {
  const root = new THREE.Group(); root.name = "conveyor";
  const { L, W, Y } = BELT;
  const bt = beltTexture(); bt.repeat.set(L / 1.2, 1);
  const belt = new THREE.Mesh(new THREE.BoxGeometry(L, 0.08, W), [
    new THREE.MeshStandardMaterial({ color: "#1d2025", roughness: 0.8 }), new THREE.MeshStandardMaterial({ color: "#1d2025", roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ map: bt, roughness: 0.7 }), new THREE.MeshStandardMaterial({ color: "#16181c" }),
    new THREE.MeshStandardMaterial({ color: "#1d2025", roughness: 0.8 }), new THREE.MeshStandardMaterial({ color: "#1d2025", roughness: 0.8 }),
  ]);
  belt.position.y = Y - 0.04; belt.receiveShadow = true; root.add(belt);
  const steel = new THREE.MeshPhysicalMaterial({ color: "#c8ccd2", metalness: 1, roughness: 0.32 });
  const paint = new THREE.MeshPhysicalMaterial({ color: "#ff5a1f", roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const ink = new THREE.MeshPhysicalMaterial({ color: "#15171b", roughness: 0.5, clearcoat: 0.3 });
  for (const s of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(L, 0.2, 0.08), paint); rail.position.set(0, Y + 0.02, s * (W / 2 + 0.05)); rail.castShadow = true; root.add(rail);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(L, 0.03, 0.14), steel); lip.position.set(0, Y + 0.135, s * (W / 2 + 0.05)); root.add(lip);
    for (let x = -L / 2 + 1; x < L / 2; x += 2.6) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.1), ink); leg.position.set(x, Y - 0.78, s * (W / 2 - 0.1)); root.add(leg); }
  }
  // scan arch at x = 0
  const arch = new THREE.Group(); arch.name = "arch"; root.add(arch);
  for (const s of [-1, 1]) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.6, 0.16), ink); post.position.set(0, Y + 1.1, s * (W / 2 + 0.28)); post.castShadow = true; arch.add(post); }
  const bay = printedMaterial(bayPrint(), { bumpScale: 0 });
  // the bay sign is printed on the beam's +x face — the side the parcels come out of
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.46, W + 0.8), [bay, ink, ink, ink, ink, ink]);
  beam.position.set(0, Y + 2.5, 0); arch.add(beam);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 1.2), steel); head.position.set(0, Y + 2.22, 0); arch.add(head);
  const fanMat = new THREE.MeshBasicMaterial({ map: laserTexture(), transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const fan = new THREE.Mesh(new THREE.PlaneGeometry(W, 2.2), fanMat); fan.rotation.y = Math.PI / 2; fan.position.set(0, Y + 1.1, 0); arch.add(fan);
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 1.1), new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff3b1f").multiplyScalar(3), toneMapped: false }));
  led.position.set(0, Y + 2.155, 0); arch.add(led);

  // traffic on the belt: plain cartons flowing through
  const r = mulberry32(3);
  const traffic: { p: ParcelModel; x0: number }[] = [];
  const sizes: [number, number, number][] = [[0.9, 0.6, 0.7], [1.2, 0.8, 0.9], [0.7, 0.5, 0.6], [1.3, 0.7, 1.0], [0.8, 0.9, 0.8], [1.0, 0.55, 0.75]];
  sizes.forEach(([w, h, d], i) => {
    const p = createParcel({ W: w, H: h, D: d, plain: true, seed: 40 + i, tape: "brand", liteLabel: true, label: { ...heroLabel, awb: `BRD ${4000 + i * 713} ${1000 + i * 37} ${2000 + i * 91}`, seed: 300 + i * 17 } });
    p.root.rotation.y = (r() - 0.5) * 0.25;
    p.root.position.set(0, Y + h / 2, (r() - 0.5) * 0.5);
    root.add(p.root);
    traffic.push({ p, x0: i * 3.0 });
  });
  return { root, belt, bt, arch, fan, led, traffic, head };
}

/* =================================================================
   MAP — halftone India, city pins, trunk routes, the flight
   ================================================================= */
export const MAP = { S: 1.2, Y: -1.32, K: Math.cos((MID_LAT * Math.PI) / 180) } as const;
export function proj(lon: number, lat: number, out = new THREE.Vector3()) {
  const o = CITY[ROUTE.from];
  return out.set((lon - o.lon) * MAP.S * MAP.K, MAP.Y, -(lat - o.lat) * MAP.S);
}
export const cityPos = (c: CityCode, out = new THREE.Vector3()) => proj(CITY[c].lon, CITY[c].lat, out);

export function arcCurve(a: THREE.Vector3, b: THREE.Vector3, lift = 0.2) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.y += a.distanceTo(b) * lift;
  return new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone());
}

function shadowTex() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(16,18,22,0.55)"); g.addColorStop(1, "rgba(16,18,22,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function createMap() {
  const root = new THREE.Group(); root.name = "map";
  const pts = halftone(0.6);
  const dotMat = new THREE.MeshBasicMaterial({ color: "#a29e94", transparent: true, opacity: 0, depthWrite: false });
  const dots = new THREE.InstancedMesh(new THREE.CircleGeometry(0.21, 12), dotMat, pts.length);
  const M = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  pts.forEach(([lo, la], i) => { proj(lo, la, v); M.compose(v, q, one); dots.setMatrixAt(i, M); });
  dots.frustumCulled = false; dots.renderOrder = -2;
  root.add(dots);
  // coastline
  const lineMat = new THREE.LineBasicMaterial({ color: "#5d5a54", transparent: true, opacity: 0 });
  const line = new THREE.Group();
  for (const ring of [OUTLINE, ...LAKES]) line.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ring.map(([lo, la]) => proj(lo, la).setY(MAP.Y + 0.01))), lineMat));
  root.add(line);

  // trunk routes — thin cobalt arcs that draw in
  const routeMat = new THREE.MeshBasicMaterial({ color: "#2743ff", transparent: true, opacity: 0.0, depthWrite: false });
  const routes = ROUTES.filter(([a, b]) => !(a === ROUTE.from && b === ROUTE.to)).map(([a, b]) => {
    const c = arcCurve(cityPos(a), cityPos(b), 0.12);
    const g = new THREE.TubeGeometry(c, 48, 0.06, 6, false);
    const m = new THREE.Mesh(g, routeMat); m.frustumCulled = false; root.add(m);
    return { m, count: g.index!.count };
  });
  // the hero route, Hyderabad to Delhi
  const heroCurve = arcCurve(cityPos(ROUTE.from), cityPos(ROUTE.to), 0.18);
  const trailG = new THREE.TubeGeometry(heroCurve, 160, 0.16, 8, false);
  const trail = new THREE.Mesh(trailG, new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff5a1f"), toneMapped: false, transparent: true, opacity: 1 }));
  trail.frustumCulled = false; root.add(trail);
  const ghost = new THREE.Line(new THREE.BufferGeometry().setFromPoints(heroCurve.getPoints(120)), new THREE.LineDashedMaterial({ color: "#ff5a1f", dashSize: 0.6, gapSize: 0.45, transparent: true, opacity: 0 }));
  ghost.computeLineDistances(); root.add(ghost);

  // city pins
  const pinMat = new THREE.MeshBasicMaterial({ color: "#ff5a1f" });
  const ringMat = new THREE.MeshBasicMaterial({ color: "#ff5a1f", transparent: true, opacity: 0.5, depthWrite: false });
  const labels: THREE.Sprite[] = [];
  const pins = (Object.keys(CITY) as CityCode[]).map((c) => {
    const g = new THREE.Group(); cityPos(c, g.position); g.position.y += 0.02;
    const big = c === ROUTE.from || c === ROUTE.to;
    const dot = new THREE.Mesh(new THREE.CircleGeometry(big ? 0.62 : 0.4, 24), pinMat); dot.rotation.x = -Math.PI / 2;
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.86, 36), ringMat); ring.rotation.x = -Math.PI / 2;
    g.add(dot, ring);
    const { tex, aspect } = textSprite(CITY[c].name.toUpperCase(), { size: big ? 46 : 38, dot: null, bg: big ? "rgba(16,18,22,0.92)" : "rgba(243,241,236,0.9)", color: big ? "#f3f1ec" : "#15171b" });
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, opacity: 0 }));
    const h = big ? 1.25 : 0.9; sp.scale.set(h * aspect, h, 1); sp.center.set(0, -0.35); sp.position.set(0.7, 0.2, 0); sp.renderOrder = 10;
    g.add(sp); labels.push(sp);
    root.add(g);
    return { c, g, ring, big };
  });

  // the jet
  const jet = new THREE.Group(); jet.name = "jet";
  const white = new THREE.MeshPhysicalMaterial({ color: "#1c1f25", roughness: 0.35, clearcoat: 0.8 });
  const orange = new THREE.MeshPhysicalMaterial({ color: "#ff5a1f", roughness: 0.4, clearcoat: 0.6 });
  const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.5, 6, 16), white); fus.rotation.z = Math.PI / 2; jet.add(fus);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 2.2), white); wing.position.set(0.05, -0.04, 0); jet.add(wing);
  const tailW = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 0.8), white); tailW.position.set(-0.8, 0.02, 0); jet.add(tailW);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.45, 0.04), orange); fin.position.set(-0.82, 0.24, 0); jet.add(fin);
  for (const s of [-1, 1]) { const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 12), orange); eng.rotation.z = Math.PI / 2; eng.position.set(0.18, -0.13, s * 0.5); jet.add(eng); }
  jet.scale.setScalar(1.3);
  root.add(jet);
  const jetShadow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, opacity: 0.5 }));
  jetShadow.rotation.x = -Math.PI / 2; root.add(jetShadow);

  return { root, dots, dotMat, line, lineMat, routes, routeMat, heroCurve, trail, trailCount: trailG.index!.count, ghost, pins, labels, jet, jetShadow };
}

/* =================================================================
   DOORSTEP — a pop-up doorstep in Hauz Khas, New Delhi
   ================================================================= */
function softDisc() {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(128, 128, 60, 128, 128, 128);
  g.addColorStop(0, "#fff"); g.addColorStop(1, "#000");
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export function createDoorstep() {
  const root = new THREE.Group(); root.name = "doorstep";
  const S = 1.8; root.scale.setScalar(S); // a real door next to a real parcel
  const mt = marbleTexture(); mt.repeat.set(3, 3);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(4.6, 72), new THREE.MeshStandardMaterial({ map: mt, roughness: 0.28, alphaMap: softDisc(), transparent: true }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; root.add(floor);

  const pop = new THREE.Group(); pop.position.z = -1.7; root.add(pop); // hinged at the floor line
  const plaster = new THREE.MeshStandardMaterial({ color: "#e6dccb", roughness: 0.9 });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(7.2, 4.4, 0.24), plaster); wall.position.set(0, 2.2, -0.12); wall.receiveShadow = true; pop.add(wall);
  const skirting = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.14, 0.04), new THREE.MeshStandardMaterial({ color: "#d8cfc1", roughness: 0.6 })); skirting.position.set(0, 0.07, 0.02); pop.add(skirting);
  const teak = new THREE.MeshPhysicalMaterial({ color: "#1d3128", roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2 });
  const dW = 1.45, dH = 2.7;
  const door = new THREE.Mesh(new THREE.BoxGeometry(dW, dH, 0.08), [teak, teak, teak, teak, printedMaterial(doorPrint(), { bumpScale: 2 }), teak]);
  door.position.set(-0.2, dH / 2, 0.04); door.castShadow = true; pop.add(door);
  const jamb = (w: number, h: number, x: number, y: number) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.16), teak); m.position.set(x, y, 0.06); pop.add(m); };
  jamb(0.14, dH + 0.14, -0.2 - dW / 2 - 0.07, (dH + 0.14) / 2); jamb(0.14, dH + 0.14, -0.2 + dW / 2 + 0.07, (dH + 0.14) / 2); jamb(dW + 0.42, 0.14, -0.2, dH + 0.07);
  const brass = new THREE.MeshPhysicalMaterial({ color: "#d9b36a", metalness: 1, roughness: 0.25 });
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 14), brass); knob.position.set(-0.2 + dW / 2 - 0.16, 1.2, 0.13); pop.add(knob);
  const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 16), brass); rose.rotation.x = Math.PI / 2; rose.position.set(-0.2 + dW / 2 - 0.16, 1.2, 0.1); pop.add(rose);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.215), printedMaterial(nameplatePrint(), { bumpScale: 0 })); plate.position.set(1.15, 1.72, 0.005); pop.add(plate);
  const bell = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.03), new THREE.MeshStandardMaterial({ color: "#f7f5f0", roughness: 0.4 })); bell.position.set(1.15, 1.32, 0.015); pop.add(bell);
  const bellBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16), brass); bellBtn.rotation.x = Math.PI / 2; bellBtn.position.set(1.15, 1.34, 0.035); pop.add(bellBtn);
  // a potted plant by the door
  const plant = new THREE.Group(); plant.position.set(-1.85, 0, 0.55); pop.add(plant);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.23, 0.55, 28), new THREE.MeshStandardMaterial({ color: "#b8603a", roughness: 0.8 })); pot.position.y = 0.275; pot.castShadow = true; plant.add(pot);
  const leafMat = new THREE.MeshStandardMaterial({ color: "#2f6b3a", roughness: 0.55, side: THREE.DoubleSide });
  const r = mulberry32(8);
  for (let i = 0; i < 9; i++) {
    const h = 0.7 + r() * 0.7, leaf = new THREE.Mesh(new THREE.ConeGeometry(0.07, h, 4, 1), leafMat);
    leaf.scale.set(1, 1, 0.25); leaf.position.set((r() - 0.5) * 0.3, 0.55 + h / 2, (r() - 0.5) * 0.3); leaf.rotation.set((r() - 0.5) * 0.3, r() * 3, (r() - 0.5) * 0.35); plant.add(leaf);
  }
  const coir = new THREE.MeshStandardMaterial({ color: "#7d5430", roughness: 1 });
  const mat = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.035, 1.06), [coir, coir, printedMaterial(matPrint(), { bumpScale: 2.5 }), coir, coir, coir]);
  mat.position.set(-0.2, 0.0175, -0.95); mat.receiveShadow = true; root.add(mat);
  return { root, floor, pop, mat, matTop: 0.035 * S, spot: new THREE.Vector3(-0.2, 0.035, -0.95).multiplyScalar(S) };
}

/* =================================================================
   RUBBER STAMP
   ================================================================= */
export function createStamper() {
  const root = new THREE.Group(); root.name = "stamper";
  const wood = new THREE.MeshPhysicalMaterial({ color: "#8a5a32", roughness: 0.45, clearcoat: 0.6 });
  const block = new THREE.Mesh(new RoundedBoxGeometry(0.86, 0.16, 0.5, 3, 0.03), wood); block.position.y = 0.12; root.add(block);
  const rubber = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.04, 0.44), new THREE.MeshStandardMaterial({ color: "#b3201a", roughness: 0.7 })); rubber.position.y = 0.02; root.add(rubber);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.34, 20), wood); neck.position.y = 0.37; root.add(neck);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 18), new THREE.MeshPhysicalMaterial({ color: "#15171b", roughness: 0.3, clearcoat: 1 })); knob.position.y = 0.6; knob.scale.set(1, 0.8, 1); root.add(knob);
  root.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true; });
  return root;
}

/* =================================================================
   CUSTOMS STICKER (international card)
   ================================================================= */
export function addCustoms(p: ParcelModel) {
  const m = printedMaterial(customsPrint(), { bumpScale: 0 }); m.polygonOffset = true; m.polygonOffsetFactor = -3;
  const w = 0.5, s = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.7), m);
  s.position.set(-p.W / 2 + w / 2 + 0.12, 0.05, p.D / 2 + 0.0015); s.rotation.z = 0.04;
  p.root.add(s);
}

================================================================================
11. STILLS AND THE TURNTABLE — lib/story/stills.ts and lib/story/turntable.ts (write exactly these)
================================================================================

Product photos rendered in the browser from the same models (one offscreen renderer, a serial queue, WebP object URLs, released when idle), and the live "flip" for the service cards (one renderer moved into whichever card plays).

lib/story/stills.ts:
"use client";
import * as THREE from "three";
import { createParcel, createMailer, createGift, createShreds, createDoorstep, addCustoms, HERO_BOX } from "./models";
import { heroLabel } from "./textures";
import { fontsReady } from "./print";
import { configureRenderer, studioEnvironment, studioLights } from "./studio";
import { PARCEL_POSE, type StillKey } from "./pose";
import { services } from "@/data/site";

/** Studio stills rendered in the browser from the story's own models. One renderer, serial queue, cached URLs. */
export type { StillKey };
export const STUDIO = { W: 600, H: 800, fov: 24 } as const;

export function createStudioScene(renderer: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  scene.environment = studioEnvironment(renderer);
  scene.environmentIntensity = 0.9;
  scene.add(studioLights());
  return scene;
}

/** A service's parcel in its card pose — shared with the card turntable. */
export function buildService(id: string) {
  const svc = services.find((s) => s.id === id) ?? services[1];
  const g = new THREE.Group();
  const inner = new THREE.Group(); g.add(inner);
  if (svc.id === "document") {
    const m = createMailer(); inner.add(m.root);
    g.rotation.set(0.95, -0.5, 0.08);
    return { root: g, inner, cam: new THREE.Vector3(0, 0.1, 6.2), look: new THREE.Vector3(0, 0, 0), h: m.H };
  }
  const [W, H, D] = svc.size;
  const label = svc.id === "intl"
    ? { ...heroLabel, awb: "BRD 7710 2284 0519", to: { name: "Daniel Tan", line: "22 Orchard Road", city: "Singapore", pin: "238841", code: "SIN" }, service: "INTL", seed: 771 }
    : svc.id === "medium" ? { ...heroLabel, awb: "BRD 3391 5082 4410", to: { name: "Rohit Verma", line: "12, 4th Cross, Indiranagar", city: "Bengaluru, Karnataka", pin: "560038", code: "BLR" }, service: "SURFACE", seed: 339 } : heroLabel;
  const p = createParcel({ W, H, D, tape: svc.id === "intl" ? "airmail" : "brand", fragile: svc.id === "small", seed: 11 + W * 10, label, liteLabel: true });
  if (svc.id === "intl") addCustoms(p);
  inner.add(p.root);
  g.rotation.set(PARCEL_POSE.x, PARCEL_POSE.y, PARCEL_POSE.z);
  return { root: g, inner, cam: new THREE.Vector3(0, 0.15, 6.9), look: new THREE.Vector3(0, 0, 0), h: H };
}

type Job = { key: StillKey; resolve: (url: string) => void; reject: (e: unknown) => void };
const cache = new Map<StillKey, Promise<string>>();
const queue: Job[] = [];
let running = false;
let ctx: { renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera } | null = null;
let idleTimer = 0;

function setup() {
  if (ctx) return ctx;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "low-power" });
  renderer.setPixelRatio(1.5); renderer.setSize(STUDIO.W, STUDIO.H, false);
  configureRenderer(renderer);
  ctx = { renderer, scene: createStudioScene(renderer), camera: new THREE.PerspectiveCamera(STUDIO.fov, STUDIO.W / STUDIO.H, 0.1, 60) };
  return ctx;
}
function teardown() { if (!ctx) return; ctx.renderer.dispose(); ctx.renderer.forceContextLoss(); ctx = null; }

function stage(key: StillKey): { obj: THREE.Object3D; cam: THREE.Vector3; look: THREE.Vector3 } {
  const [kind, arg] = key.split(":");
  if (kind === "svc") { const s = buildService(arg); return { obj: s.root, cam: s.cam, look: s.look }; }
  if (kind === "open") {
    const p = createParcel({ ...HERO_BOX, tape: null, fragile: true, seed: 1, label: null }); p.setOpen(1);
    const gift = createGift(); gift.root.position.set(0, -HERO_BOX.H / 2 + 0.028 + gift.H / 2 + 0.25, 0.02); gift.root.rotation.set(0.12, 0.4, -0.08);
    const sh = createShreds(); sh.set(1); p.inner.add(gift.root, sh.mesh);
    p.root.rotation.set(0.5, -0.55, 0);
    return { obj: p.root, cam: new THREE.Vector3(0, 0.2, 11), look: new THREE.Vector3(0, 0.3, 0) };
  }
  if (kind === "door") {
    const g = new THREE.Group();
    const d = createDoorstep(); g.add(d.root);
    const p = createParcel({ ...HERO_BOX, tape: "brand", fragile: true, seed: 1 }); p.setStamp(1);
    p.root.position.copy(d.spot); p.root.position.y += HERO_BOX.H / 2; p.root.rotation.y = -0.16; g.add(p.root);
    return { obj: g, cam: new THREE.Vector3(2.2, 3.4, 9.6), look: new THREE.Vector3(-0.3, 1.5, -1.6) };
  }
  const p = createParcel({ ...HERO_BOX, tape: "brand", fragile: true, seed: 1 });
  if (kind === "stamped") p.setStamp(1);
  p.root.rotation.set(PARCEL_POSE.x, PARCEL_POSE.y, PARCEL_POSE.z);
  return { obj: p.root, cam: new THREE.Vector3(0, 0.15, 9.4), look: new THREE.Vector3(0, 0, 0) };
}

async function run() {
  if (running) return;
  running = true; clearTimeout(idleTimer);
  await fontsReady();
  while (queue.length) {
    const job = queue.shift()!;
    try {
      const { renderer, scene, camera } = setup();
      const { obj, cam, look } = stage(job.key);
      const wide = job.key === "door";
      camera.aspect = wide ? 4 / 3 : STUDIO.W / STUDIO.H; camera.fov = wide ? 38 : STUDIO.fov; camera.updateProjectionMatrix();
      renderer.setSize(wide ? 800 : STUDIO.W, wide ? 600 : STUDIO.H, false);
      scene.add(obj); camera.position.copy(cam); camera.lookAt(look);
      renderer.render(scene, camera);
      const blob = await new Promise<Blob | null>((r) => renderer.domElement.toBlob(r, "image/webp", 0.93));
      scene.remove(obj);
      if (!blob) throw new Error("toBlob failed");
      job.resolve(URL.createObjectURL(blob));
    } catch (e) { job.reject(e); }
    await new Promise((r) => setTimeout(r, 0));
  }
  running = false;
  idleTimer = window.setTimeout(teardown, 1500);
}

export function getStill(key: StillKey): Promise<string> {
  let p = cache.get(key);
  if (!p) {
    p = new Promise<string>((resolve, reject) => { queue.push({ key, resolve, reject }); });
    cache.set(key, p);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => run(), { timeout: 600 }); else setTimeout(() => run(), 50);
  }
  return p;
}

lib/story/turntable.ts:
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

================================================================================
12. THE 3D SCENES — components/story/StoryScene.tsx and RatesScene.tsx (write exactly these)
================================================================================

The story rig: everything is driven from progress.current inside useFrame and written to refs — nothing re-renders React. The camera blends between eight framed "shots" (target, direction, framed width and height), fitted to the viewport, with log-space blending for the big zoom out to the map and back in to the doorstep.

components/story/StoryScene.tsx:
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
          dpr={[1, tier === 2 ? 1.75 : tier === 1 ? 1.5 : 1.25]}
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

The rate calculator's live parcel: it resizes to the entered dimensions, sits on a scale whose display reads the weight, and turns when dragged. Props feed a ref so React never re-renders the canvas.

components/story/RatesScene.tsx:
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
        <Canvas dpr={[1, tier === 2 ? 2 : 1.5]} camera={{ fov: 26, position: [0, 3, 8], near: 0.1, far: 60 }}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping }} className="!absolute inset-0" frameloop={visible ? "always" : "never"} aria-hidden>
          <Rig state={state} drag={drag} />
        </Canvas>
      )}
    </div>
  );
}

================================================================================
13. THE STORY OVERLAY — components/story/StorySection.tsx
================================================================================

<section id="story" aria-label="BR-Dak — a parcel from Hyderabad to New Delhi">, height 1100svh (phones) / 1300vh (md+). ONE sticky stage inside (plain CSS sticky top-0, h 100svh, overflow hidden, ivory) — no pin spacer. Backdrop: radial-gradient(75% 65% at 50% 46%, #fbfaf7 0%, #f3f1ec 55%, #e6e3db 100%); a .dot-grid at 60% masked by radial-gradient(70% 60% at 50% 50%, #000 30%, transparent 85%); a .grain at 60%.

Shared classes: line = "block w-max overflow-hidden whitespace-nowrap pb-[0.16em] -mb-[0.1em]" (a mask around one line); h2 = wide, clamp(1.8rem,7.4vw,2.9rem) → md clamp(2.4rem,4.4vw,4.7rem), lh .95.

Three layers:
  BACK (z-0): h1 (wide, lh .9, ink) of two masked lines (data-in="line"):
    data-hero-a "Across India,": left gutter, top nav-h + 1.5rem (md + 2rem), clamp(2rem,8.6vw,4.2rem) → md clamp(3.2rem,6.7vw,7.6rem).
    data-hero-b "by tomorrow." (wide-i, accent): bottom right, bottom max(11svh,7.5rem) (md 12svh), right-aligned, same size.
  SCENE (z-10): the StoryScene, lazy (React.lazy of engine → StoryScene), mounted after the first client effect.
  FRONT (z-20, pointer-events none, ink):
    Hero copy (data-hero-copy, each data-in="fade" starting at opacity 0): top right (md+, max 29ch, right-aligned, pointer-events auto) "Door to door from 19,000+ PIN codes. Picked up by 6 pm, flown overnight, at the door before lunch — tracked live all the way." with a Magnetic ghost Button "Book a pickup" → #rates; bottom left (md+) mono .62rem uppercase "Tracking BRD 5829 1047 3361" / "Hyderabad → New Delhi · 1.2 kg" at 55%; the hint (data-hint) centred at the bottom (max(3.5svh,4.5rem)): a 1 × 32 px track with a 12 px ink/70 bar running dak-hint 1.8 s, then "Scroll to ship it".
    Stickers (component Sticker i; class dak-sticker, data-stk=i, data-shape = burst / circle / pill / square, starting at opacity 0): a .face (background + colour per sticker) with a .edge span, the value (wide clamp(1.7rem,2.9vw,2.7rem), lh .9, unit at .5em) and the label (mono .55rem bold uppercase tracking .14em, max 82%). The face has a sheen driven by the CSS variable --sheen. Placement, colours and rest rotation: 0 left 5% top 19% (md 16% / 19%) · accent bg / ink · −12 · 1 left 60% top 15% (md 70% / 15%) · ink / ivory · 9 · 2 left 3% top 63% (md 11% / 60%) · cobalt / ivory · 7 · 3 left 57% top 64% (md 72% / 59%) · kraft / ink · −8.
    01 Packed (bottom left, bottom max(13svh,8.5rem) md 12svh, max 34ch): eyebrow "01 — Packed & sealed"; h2 "Packed like" / "it's ours." (wide-i accent); md+ body "Crinkle fill, a double-wall box and our own tape — sealed at pickup, in front of you."
    02 Labelled (left: phones top nav-h + 1rem; md vertically centred, max 34ch): eyebrow "02 — Labelled"; h2 "One number," / "every scan." (wide-i accent); md+ body "Your tracking number follows the parcel through every hand, hub and flight — and it's the only thing you need to follow it." Right (bottom on phones, centred on md): "Tracking number" (mono .6rem), the number (mono bold clamp(1.05rem,4vw,1.3rem) → md clamp(1.2rem,1.9vw,2rem), tracking .08em, tabular) written by the scroll handler, and "HYD › DEL · 110016 · 1.2 kg".
    03 Sorted (phones top; md bottom left 12svh): eyebrow "03 — Scanned & sorted"; h2 "12,000 an hour." / "Yours, by name." (wide-i accent). The scan box (data-scanbox; bottom right; w min(19rem,78vw); rounded 2xl; ink/10 border; ivory/90 with blur; shadow): "Hyderabad hub · Bay 14" and a status pill — pulsing accent dot "Scanning", turning to an ok-green dot "Scan OK" once scanned; the tracking number in mono bold .95rem; a 3-col list Time "8:15:07 pm" · Weight "1.20 kg" · Chute "DEL-07".
    04 In the air (top left, md nav-h + 2.5rem): eyebrow "04 — In the air"; h2 "Hyderabad to Delhi," / "overnight." (wide-i cobalt). Bottom right a boarding-pass card (ink, ivory, rounded 2xl, inline-grid 3 cols): "Departs" HYD (wide 1.6rem) "10:40 pm IST" · a dashed arrow in accent · "Lands" DEL "12:55 am IST"; under a rule: "<0> km" (the kilometres in wide 1.3rem accent, written by the scroll handler) and "Airborne <0:00>".
    05 Delivered (top left; phones full width): eyebrow "05 — Delivered · Tue 10:14"; h2 (wide clamp(2.2rem,9vw,3.1rem) → md clamp(2.6rem,4.8vw,5.2rem)) "Before your" / "first chai." (wide-i accent); md+ body "Handed over at the door, photographed at the doorstep, and every step sent by text — 1,254 km in under sixteen hours." Bottom right (md+) specs each followed by a green ✓: "Signature on request" · "Photo proof of delivery" · "Live tracking by text" · "Insured up to ₹25,000". The toast (data-toast; top right; phones lower at bottom max(24svh,12rem); w min(22rem,86vw); rounded 1.4rem; white/80 with heavy blur; white/60 border): an ink app tile with the parcel mark in #ff5a1f, "BR-Dak" and "now", and "Delivered at 10:14 AM — handed to Arjun at Flat 4B. Tap to see the doorstep photo." (the first part bold).
    The route readout (data-readout; bottom left max(2.2svh,1rem), phones 5.25rem; w min(22rem,62vw)): a 1 px track with an accent fill and five 10px stage dots (filled accent up to the current stage) evenly spaced; under it the five stage names in mono .55rem (current ink, others 35%; the middle three hidden on the smallest screens).

THE MOTION (one gsap.context, rebuilt when reduced-motion changes; under reduced motion entrance = 1 and the [data-in] elements are simply shown):
  Intro (not under reduced motion): line spans set to yPercent 130. A paused timeline: entrance 0 → 1 (1.9 s power2.out) at 0; lines to 0 (1.3 s expo.out, stagger .12) at .2; fades from opacity 0, y 14 (.9 s, stagger .08) at .6. It plays on intro-done.
  A ScrollTrigger (top top → bottom bottom) writes progress.current and, only when the value changes:
    the stage (last STAGE_AT ≤ p) into state;
    the tracking number decoding: dec = seg(p, label[0] + .01, labelCopyIn[1] + .02); n = floor(dec·length); every character before n (and every space) is real, the rest are SCRAMBLE[(7i + floor(900p)) mod 34] from "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    km = round(seg(p, fly)·1254) with en-IN grouping; airborne clock = round(seg(p, fly)·135) minutes as h:mm;
    scanned = p > scan[0] + .62·len(scan).
  One scrubbed timeline (scrub .6, ease none), positions in progress units:
    hero-a → xPercent −18, yPercent −30, opacity 0 and hero-b → xPercent 18, yPercent 30, opacity 0 over heroOut; hero copy → y −40, opacity 0 over .7 of heroOut; the hint fades by .005.
    Each sticker i at a = statsIn[0] + .012i: from opacity 0, scale .2, rotate −3·rot → opacity 1, scale 1, rot (.035, back.out(2.2)); its face's --sheen sweeps −120% → 120% (.03) at a + .02; it drifts to y −50 − 12i, rotate .4·rot until statsOut; then out at statsOut[0] + .006i → opacity 0, scale .6, y −160, rotate 3·rot (.8 of statsOut).
    The readout fades in at STAGE_AT[0] − .01, its bar scales 0 → 1 to .9, and it fades at .91.
    block(title, copy, in, out) for Packed, Labelled, Sorted and In the air: title lines yPercent 130 → 0 over in (stagger .008, power2.out), copy from opacity 0 y 22 at in + .01; title lines → yPercent −130 over out (stagger .006), copy → opacity 0 y −22.
    The scan box from opacity 0 x 30 (.02) at scan[0] − .01; out (x −20, .015) at sortCopyOut[0].
    Delivered: title lines in over doneCopyIn, copy at +.012; specs from opacity 0 x 20 (.03, stagger .008) at toast[0]; the toast from opacity 0, y −30, scale .94 (back.out(1.6)) over toast.
    tl.set({}, {}, 1).

================================================================================
14. THE CHROME — Intro, Nav, OfferBar, Footer, Still
================================================================================

INTRO — a barcode being scanned. window.__dakIntroDone; onIntroDone(fn) fires immediately if done, else once on "dak:intro-done". Under reduced motion: done at once. Otherwise lock scroll (html.lenis-stopped, Lenis stop, scrollTo 0) and run a rAF loop: target 10; fonts ready → ≥ 50; otherwise target = min(92, max(target, 18 + elapsed/60)); scene-ready → 100; after 4.5 s → 100; shown eases at .1. A red laser line sweeps across the barcode (translateX((sin(elapsed/260)·50 + 50)%)) and a two-digit percent shows round(shown). When shown > 99.2 and ≥ 1.1 s: phase "ok" (the laser fades, a green tick pops in), "lift" after 420 ms, unlock and fire intro-done at 900 ms, unmount at 1.7 s.
  Markup: fixed inset 0 z-90, ink, ivory; it lifts up (−translate-y-full, 900 ms cubic-bezier(.76,0,.24,1), delay 200 ms). Centre column (gap 7): an ivory label card (rounded xl) with 46 deterministic bars (s = (9301s + 49297) mod 233280 from s = 7; width 1 + floor(s/233280·4); margin-right (7i mod 3)) h-14, the tracking number in mono bold .55rem tracking .3em, the laser (2px #ff2a12 with a glow shadow 0 0 12px 3px rgba(255,42,18,.7)) and the green tick disc at the top right corner (scale .5 → 1); the Mark (accent, cut ink) beside "BR-DAK" (wide 1.9rem); "scanning · 00%" → "scan ok · 100%" (mono .6rem uppercase tracking .24em).

NAV — fixed top z-50; ink text, or ivory while any [data-theme='dark'] section is under the bar (one ScrollTrigger per section, "top 44px" → "bottom 44px", refreshPriority −1) or the menu is open. Height 88px → 64px past 40px (700 ms). Left: the Logo (compact when scrolled; the mark's cut lines ink on dark, ivory on light) → #story. Right: a "Track" pill (sm+, h-10, border, mono bold .68rem uppercase, a magnifier icon) → #track; a Menu button (h-10, .8rem semibold; ink bg → accent hover, or ivory bg on dark) with two lines crossing to an X, "Menu" / "Close". The menu: fixed inset 0 z-45, ink with a .dot-grid-light, revealed by clip-path inset(0 0 100% 0) → inset(0) over 900 ms expo; data-lenis-prevent; locks scroll; Escape closes. Left (md 7 cols, bottom-aligned): the nav links in wide clamp(2.2rem,6.2vw,5.4rem), rising in with delay .14 + .06i s after a mono "01…06" at 40%; hover accent italic. Right (md cols 9–12, border-left): "Services" — each "<name> · <eta>" and "from ₹N"; "Pickups, 7 am – 9 pm" and the phone as a tel: link (wide 2xl).

OFFER BAR — hidden if sessionStorage "dak-offer-closed"; appears 1.6 s after intro-done (translate-y 140% → 0, 700 ms expo); a rounded pill (max 600px, ivory/95, ink/10 border, blur): an ink disc with the accent Mark; "First pickup free — anywhere in India, up to 2 kg" (the tail sm+ only); a dashed code chip "FIRSTDAK" that copies to the clipboard and reads "Copied ✓" for 1.6 s; an ink "Book" → #rates; a dismiss ✕.

FOOTER (data-theme dark, ink, ivory, .dot-grid-light at 40%): "Book a pickup" / "We'll be at your door within the hour." (wide clamp(1.8rem,3vw,2.8rem), the tail wide-i accent) with an underlined form id "pickup": a 6-digit PIN code field (numeric, pattern [0-9]{6}), a divider, a phone field and an accent "Book pickup" (→ "Booked ✓", placeholder "Booked — we'll text you."); "Explore" (the nav); "Services" ("<name> · <eta>") and "Help, 24 × 7" with the phone; a giant "BR-DAK" in wide 15vw at ivory/[.06] justified against the Mark at 11vw; bottom bar "© <year> BR-Dak. Express courier." · "Head office · Hyderabad · 38 hubs across India".

STILL: <Still still alt className imgClassName> — waits for an IntersectionObserver (800px margin), dynamically imports the engine, getStill(key); an empty role="img" span until then, then an <img> (object-contain, .dak-still-in).

================================================================================
15. THE PAGE SECTIONS
================================================================================

MANIFESTO (id manifesto, data-theme dark, relative z-30, margin-top −100svh — it slides up over the end of the pinned story; ink, ivory). PerfEdge (exported): a postage-stamp perforation along the top edge — an SVG (viewBox 1200 × (r + 2), r = 1200/n/2, n 60) of semicircular scallops filled with the section colour, absolutely placed bottom-full, height clamp(8px,1.2vw,14px). A .dot-grid-light at 40%. Container pt 16vh (md 22vh), pb 12vh. Centred eyebrow "06 — Why we do this" (ivory/55). h2 (wide clamp(2rem,5vw,5.4rem), lh 1.02, max 21ch, centred) of the words "Every parcel is a promise somebody made. We carry 24 lakh of them a day — and |keep| every one." — each word's opacity scrubs .14 → 1 (stagger .08, "top 78%" → "bottom 42%"); "keep" is a tag (wide-i, accent background, ink, rounded .2em) scaling .5 → 1 and rotating −10° → −3° (back.out(2.4), "top 72%" → "top 45%").
  A 12-col grid (mt 12vh / md 16vh, items-end):
    Fig. 01 (sm 7 / md 5, parallax .25): a regular slotted carton, flat — SVG viewBox 440 × 290: x0 40, y0 70, panels [100, 76, 100, 76], flaps 38, height 120, glue 16; data-draw the outer cut (M x0 (y0 − F) H right V (y0 + H + F) H x0 Z) and the glue tab; data-fade dashed creases (panel verticals and the two flap lines), thick ink slots between the flaps, labels FRONT / SIDE / BACK / SIDE, MAJOR / MINOR and "— CUT   - - CREASE   ▮ SLOT", and an accent tape rectangle (x0 + 14, y0 + 18, 72 × 14). Caption "Fig. 01 — Regular slotted carton, flat · double-wall".
    A spinning badge (sm 5 / md 2, parallax −.2): "PICKED UP · SCANNED · FLOWN · DELIVERED · " on an r 80 circle (accent, mono bold 13.5, spacing 3.4), turning every 22 s, round a 64px accent disc reading "24h" (wide, ink).
    Fig. 02 (md cols 9–12, parallax .45): the shipping label, annotated — SVG viewBox 420 × 240: data-draw the label (M20 20 H230 V210 H20 Z), a header rule at y 44 and a route box (160 58 → 224 110); data-fade a filled ink header band, a filled route chip (160, 92, 64 × 18), 34 barcode bars (x 30 + 3.6i, width 2.8 every third else 1.6, y 150, h 36), a QR block (184, 146, 40²) and three text-line blocks; four callouts (accent dot + leader to x 242 + mono 9.5 label at x 250): "PIN CODE — FIRST SORT" (64, 70) · "ROUTE · CHUTE" (196, 92) · "TRACKING BARCODE" (120, 168) · "QR — PROOF OF DELIVERY" (205, 172). Caption "Fig. 02 — The shipping label, annotated".
  Motion: each [data-drawing] scrubs ("top 88%" → "bottom 55%"): [data-draw] dash offset 1 → 0 (stagger .08), then [data-fade] opacity 0 → 1 (stagger .1) from .35. [data-parallax] moves y 80s → −80s across the section.

TRACK (id track, ivory, z-10, pt 16vh pb 14vh). 12-col grid.
  Left (lg 5): eyebrow "07 — Track"; h2 (wide clamp(2.4rem,4.4vw,5rem), lh .92) "Where's my" / "parcel?" (wide-i accent), lines rising from yPercent 130 (1.2 s expo, stagger .1, "top 82%"); lede "Every scan, every hub, every turn of the van — live. Try our tracking number, or type any number to see how tracking reads." A pill form (white/70, ink/15 border → ink on focus): a tracking-number input (mono bold .95rem uppercase, tracking .08em; prefilled with the hero number; no spellcheck/autocomplete) and an ink "Track" (→ accent hover). Under it either the error "That doesn't look like a tracking number — try 12 digits." (accent) or "Try: <hero number>" as a dotted-underline button. When there is a result: a 2-col grid of tiles — Status (wide 1.35rem; ok-green when delivered, else accent), Route "<from> › <to>", and a full-width tile with the ETA, the percent and a 6px progress bar (width transitions 1 s expo).
  lookup(raw): normalise to alphanumerics uppercase; fewer than 6 → null (error). The hero number (full or short) → the real heroEvents, HYD → DEL, all 7 done, "Delivered Tue 10:14 am". Anything else is deterministic from an FNV-1a hash h: from = HUBS[h mod 14] over ["HYD","DEL","BOM","BLR","MAA","CCU","NAG","AMD","JAI","LKO","IXC","COK","GAU","BBI"]; to = HUBS[(h >>> 5) mod 14] (if equal, three further on); done = 3 + ((h >>> 9) mod 5); a start time t0 = 9:00 + ((h >>> 12) mod 360) minutes and steps [0, 95, 190, 420, 610, 890, 1110] formatted "Mon/Tue/Wed · h:mm am/pm"; seven events Booked · Picked up · At hub · In transit ("<from> → <to>", "On the overnight freighter") · "<last word of the destination> hub" · Out for delivery · Delivered ("Handed over · OTP + photo proof"); eta "Delivered …" when done, else "Arriving <day>, by <time>". Every run bumps a run id that replays the animation. The card's first appearance (rising from y 60, "top 85%") runs the hero number.
  Right (lg 7; data-tr-card): a white card (rounded 1.6rem, deep soft shadow), 2 columns on md:
    Live route: an SVG map from svgProjector(360) — dots (a 7px pattern of r 1.5 rgba(16,18,22,.28)) clipped to the US outline, the outline at 25%; for a result: a faint dashed arc and the accent route arc (2.6, round caps) between the two cities (arcPath), ink pins with ivory centres and mono labels, and a moving dot (accent with a white ring and a soft halo). The arc draws (dash offset) and the dot travels along it to along = clamp((done − 3)/3, .02, 1) over 1.4 s power2.inOut (delay .2).
    Journey: "Journey" and the number; an ordered list with a grey rail and a coloured rail (accent, or ok when delivered) that scales to (done − 1)/6; each event a 15px dot (filled up to done; the current one pinging when not delivered), the status (semibold), the time (or "—"), and "<place> · <note>" (40% when not done); items slide in from x −16 (stagger .09). For the hero number's Delivered event: a small photo card with the "door" still (object-cover, alt "Proof of delivery: the parcel on the doormat of Flat 4B") and "Photo proof · 10:14:32".

SERVICES (id services, paper, z-10, pt 16vh pb 14vh). Eyebrow "08 — Services". Heading (wide clamp(2.6rem,7vw,7.6rem), lh .92, flex wrap justify-between): "Four ways" (from xPercent −10, opacity 0) · a .7em spinning disc (accent circle r 46 with "SAME DAY · EXPRESS · SURFACE · GLOBAL · " on an r 38 path, mono bold 8.2, turning every 16 s; first on phones) · "to send." (wide-i accent, from xPercent 10) — scrubbed "top 85%" → "top 35%". Under it "Tap a parcel to flip it" (mono with a rule) and "Same pickup, same tracking, same people. Pick the speed — we'll pick the fastest way to get it there." Grid 1 / sm 2 / lg 4. Cards start at y 80, opacity 0, rotate ±2 and land via ScrollTrigger.batch ("top 90%", once; 1.2 s expo, stagger .08). The turntable warms with services[1] within 200px (requestIdleCallback, 3 s timeout).
  Each card (article, rounded 1.6rem, background s.tint, ink): "0N / 04" and an ink ETA chip; the stage button (aspect 3:4, 78% wide, data-cursor "3d", aria-label "Flip the <name> parcel"; hover lifts −8px, rotates −1.5°, scales 1.03) holding a blurred floor shadow, the svc:<id> still (600px early), a host 135% of the stage for the live canvas (OVERSCAN 1.35), a red rubber stamp "BOOKED ✓" (wide, 3px #d8231b border, rounded-lg, starting hidden) and "Tap to flip" (on hover; always on phones). Then the sub (mono), the name (wide 1.8rem), the blurb, perk chips (bordered pills), and a footer row "From ₹N" (via inr()) and an ink "Get a rate →" link to #rates.
  Flip (not under reduced motion; skipped if busy): use(id) → mount(host, 1.35) → apply → render → show the canvas. State { hop, spin, tilt, squash, sweep } with timeline onUpdate apply + render: squash .6 (.18 s power2.in) at 0; squash −.25 (.2 s) at .18; hop 1 (.45 s power2.out) at .18; spin 1 (.9 s power2.inOut) at .2; tilt −.25 (.45 s sine, yoyo once) at .2; sweep 1 (1 s) at .3; hop 0 (.42 s power2.in) at .63; squash .5 (.1 s) at 1.05; squash 0 (elastic.out(1.2, .4)) at 1.15; the stamp slams in from opacity 0, scale 1.8, rotate −24 → 1 / 1 / −10 (.28 s power4.in) at 1.05 and fades out (.4 s) at 2.1. Then the still returns and the turntable unmounts after two frames.

RATES (id rates, data-theme dark, ink, ivory, pt 16vh pb 14vh). Eyebrow "09 — Rates"; h2 (wide clamp(2.6rem,6.4vw,7rem)) "What will it cost?" / "Ask the scale." (wide-i accent), lines rising. 12-col grid:
  Stage (lg 7, sticky under the nav on lg): an ivory .dot-grid panel (aspect 4/3.4, rounded 28px) whose clip-path scrubs inset(10% … round 28px) → inset(0) ("top 95%" → "top 40%"); a blurred floor ellipse; the RatesScene (mounted once within 900px) fed { l, w, h, kg, byVolume }; "Live · drag to turn" top left; top right a chip "Billed by size" (accent) or "Billed by weight" (ink/10); bottom left "<l> × <w> × <h> cm" / "Volumetric <x.x> kg · actual <x.x> kg · <km> km".
  Panel (lg 5; steps rise from opacity 0 y 30, stagger .08, "top 80%"):
    From and To city selects (bordered rounded-xl labels with a mono caption and the city in wide 1.15rem, a chevron) with a swap button between them.
    A 2-option radiogroup "Service": Express "Flown overnight" / Surface "By road & rail · cheapest" (selected = ivory bg, ink).
    Four sliders (class dak-range with a --fill percentage; data-cursor "drag"): Length 10–80 cm, Width 10–60 cm, Height 5–60 cm (step 1), Weight 0.5–30 kg (step .1, rounded to one decimal); each with its label (mono) and value (wide 1.4rem tabular + unit). Defaults 30 × 22 × 12 cm, 1.9 kg, HYD → DEL, express.
    A quote card (ivory/15 border, ivory/[.04]): "<zone name> · <mode>", the price (wide clamp(2.4rem,4vw,3.4rem), accent, tabular, "₹x,xxx", from inr(), whole rupees) tweened over .8 s power3.out straight into the text node; "Arrives" and the ETA; "Billed on <charge> kg — the higher of the actual weight and the volumetric weight (L × W × H in cm ÷ 5000), in 0.5 kg slabs." followed by "Light but bulky? A smaller box would save you money." when billed by size, else "Pack snug and you'll never pay to ship air."; a Magnetic accent "Book this pickup →" (→ "Pickup booked ✓" on ok-green; resets when the price changes) and "Fuel surcharge and GST included · insured up to ₹5,000".

NETWORK (id network, data-theme dark, cobalt, ivory, overflow hidden, pt 16vh pb 14vh; .dot-grid-light at 50%). Left (md 6): eyebrow "10 — The network"; h2 (wide clamp(2.6rem,6vw,6.6rem)) "Every PIN code." / "Every night." (wide-i accent), lines rising; lede "Thirty-eight hubs, a fleet of night freighters and 9,400 vans and bikes — sorting India's parcels while it sleeps."; a live pill with a pinging accent dot "Moving right now · <38,214>" whose number rises by 3–11 every 700 ms; a 2-col dl of the four network figures as Counters (wide clamp(2rem,3.4vw,3.2rem); "Parcels a day" shown as 24 lakh). Right (md 6): an SVG map (svgProjector(600), max 560px, aria-label "Map of India showing the BR-Dak trunk network"): dots (9px pattern, r 2, rgba(243,241,236,.5)) clipped to the outline, fading in (scrub "top 70%" → "center 55%"); the outline (ivory/70, 1.2) drawing itself (scrub "top 85%" → "center 50%"); every ROUTES arc in accent (2.6 and opaque for HYD → DEL, else 1.4 at 75%) drawing in (stagger .04, scrub "top 60%" → "center 40%"), each with a white r 3.2 dot travelling along it forever (SVG animateMotion, dur 3 + (i mod 5)·.8 s, begin (.37i mod 3) s); every hub an accent-ringed ink dot (6.5 for the central hub, else 4.5) popping in (back.out(3), "center 70%") with an accent pulse ring (scale 3, fade, every 2 s, staggered .25); labels for DEL, BOM, HYD, CCU, MAA, GAU, NAG in mono bold 10 white (east of 84°E anchored to the left of the dot), the hub reading "NAGPUR · CENTRAL HUB".

REVIEWS (id reviews, ivory, pt 10vh pb 16vh). Two floating tinted cards top right on md+ (the "open" still on #f6dccf and the "stamped" still on #dfe3f3, rounded 1.2rem, soft shadow) drifting from y 60 + 30i rotate −12 / 10 to y −50 − 20i rotate −5 / 4 with scroll. Eyebrow "11 — Reviews"; md+ the heading row sits 34vh lower; h2 (wide clamp(2.6rem,6.6vw,7rem)) "Signed for," / "happily." (wide-i accent), each line rising from yPercent 110; "01 / 05" and round previous/next buttons (hover ink fill; disabled at the ends). A horizontal snap carousel (dak-no-scrollbar, focusable, "Customer reviews", data-cursor "drag"): cards w min(86vw, 430px), rounded 1.6rem, each tilted ±1.2° alternately; backgrounds cycle paper / ink (ivory text) / accent (ink text); five accent stars (aria-label "5 out of 5") and the index; the quote (.semi 1.35rem → md 1.5rem) in curly quotes; an initial disc (cobalt / accent / ink by card), the name and the place. Buttons scroll by one card + 20px; cards rise in at "top 88%" (stagger .07).

================================================================================
16. PERFORMANCE, ACCESSIBILITY, QUALITY BAR
================================================================================

- One sticky stage (plain CSS sticky) and one R3F canvas for the story; it stops rendering off-screen. All 3D motion is written to refs in useFrame; the tracking number, kilometres and airborne clock are written straight to text nodes; the rate calculator never re-renders its canvas.
- three.js loads only through lib/story/engine.ts, dynamically, once. Stills render one at a time on one offscreen renderer released when idle; the card turntable is a single renderer moved between cards and warmed before the first tap.
- DPR by quality tier; every print waits for the fonts; every random value is seeded.
- The intro waits for real readiness (fonts and three rendered frames), capped at 4.5 s, and never runs under reduced motion.
- prefers-reduced-motion: no intro, no idle motion, no Lenis, no cursor; the story stays scroll-driven; the card flip is skipped.
- Every interactive element is a real button, link, select, radio or range with an accessible name; decorative SVGs and canvases are aria-hidden; a skip link leads to #main.
- Forms (tracking lookup, pickup booking, offer code) are front-end only.
- It must build with `npm run build` and type-check clean, and look and move like a finished brand film: crisp labels and tape at any DPR, a carton that folds like board, a believable hub, a map that reads instantly, and no hitch through the zoom out to the map and back in to the doorstep.
