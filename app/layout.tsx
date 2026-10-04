import type { Metadata, Viewport } from "next";
import { Archivo, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Cursor from "@/components/ui/Cursor";

const display = Archivo({ subsets: ["latin"], variable: "--font-display", axes: ["wdth"], style: ["normal", "italic"], display: "swap" });
const body = Inter_Tight({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600", "700"], display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500", "700"], display: "swap" });

const TITLE = "Pavan Express — Across India, by tomorrow";
const DESC = "Express courier reaching 19,000+ PIN codes across India: picked up by 6 pm, flown overnight and delivered before lunch — tracked live all the way.";

export const metadata: Metadata = {
  title: { default: TITLE, template: "%s — Pavan Express" },
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
