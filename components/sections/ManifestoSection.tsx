"use client";

import React, { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function PerfEdge({ color = "var(--color-ink)" }: { color?: string }) {
  const n = 60;
  const W = 1200;
  const r = W / n / 2;
  const H = r + 2;

  // Semicircular scallops along the top edge
  const scallops: string[] = [];
  for (let i = 0; i < n; i++) {
    const cx = (i * 2 + 1) * r;
    scallops.push(`A ${r} ${r} 0 0 0 ${cx + r} 0`);
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="absolute bottom-full left-0 w-full h-[clamp(8px,1.2vw,14px)] pointer-events-none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={`M 0 0 ${scallops.join(" ")} L ${W} ${H} L 0 ${H} Z`}
        fill={color}
      />
    </svg>
  );
}

export default function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Words scrub
      const words = el.querySelectorAll<HTMLElement>("[data-scrub-word]");
      gsap.fromTo(
        words,
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.08,
          scrollTrigger: {
            trigger: el.querySelector("[data-heading]"),
            start: "top 78%",
            end: "bottom 42%",
            scrub: true,
          },
        }
      );

      // Keep tag motion
      const keepTag = el.querySelector<HTMLElement>("[data-keep-tag]");
      if (keepTag) {
        gsap.fromTo(
          keepTag,
          { scale: 0.5, rotate: -10 },
          {
            scale: 1,
            rotate: -3,
            ease: "back.out(2.4)",
            scrollTrigger: {
              trigger: el.querySelector("[data-heading]"),
              start: "top 72%",
              end: "top 45%",
              scrub: true,
            },
          }
        );
      }

      // Drawings scrub
      const drawings = el.querySelectorAll<HTMLElement>("[data-drawing]");
      drawings.forEach((d) => {
        const drawPaths = d.querySelectorAll<SVGPathElement>("[data-draw]");
        const fadeElements = d.querySelectorAll<SVGElement>("[data-fade]");

        drawPaths.forEach((p) => {
          const len = p.getTotalLength?.() || 800;
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.set(fadeElements, { opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: d,
            start: "top 88%",
            end: "bottom 55%",
            scrub: true,
          },
        });

        tl.to(drawPaths, { strokeDashoffset: 0, stagger: 0.08, duration: 0.6 })
          .to(fadeElements, { opacity: 1, stagger: 0.1, duration: 0.4 }, 0.35);
      });

      // Parallax
      const parallaxes = el.querySelectorAll<HTMLElement>("[data-parallax]");
      parallaxes.forEach((p) => {
        const speed = parseFloat(p.getAttribute("data-parallax") || "0.2");
        gsap.fromTo(
          p,
          { y: 80 * speed },
          {
            y: -80 * speed,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const headingText =
    "Every parcel is a promise somebody made. We carry 24 lakh of them a day — and keep every one.";
  const parts = headingText.split(" ");

  return (
    <section
      id="manifesto"
      ref={sectionRef}
      data-theme="dark"
      className="relative z-30 -mt-[100svh] bg-ink text-ivory dot-grid-light pt-[16vh] md:pt-[22vh] pb-[12vh] overflow-hidden"
    >
      <PerfEdge color="var(--color-ink)" />

      <div className="container-x">
        {/* Eyebrow */}
        <div className="text-center mb-6">
          <span className="eyebrow text-ivory/55">06 — Why we do this</span>
        </div>

        {/* Heading */}
        <h2
          data-heading
          className="wide text-[clamp(2rem,5vw,5.4rem)] leading-[1.02] max-w-[21ch] mx-auto text-center tracking-tight"
        >
          {parts.map((word, i) => {
            if (word.toLowerCase().includes("keep")) {
              return (
                <span
                  key={i}
                  data-keep-tag
                  className="inline-block px-3 py-0.5 mx-1.5 bg-accent text-ink wide-i rounded-[0.2em] transform -rotate-3 will-change-transform align-middle shadow-lg"
                >
                  keep
                </span>
              );
            }
            return (
              <span
                key={i}
                data-scrub-word
                className="inline-block mx-1.5 opacity-14 transition-opacity"
              >
                {word}
              </span>
            );
          })}
        </h2>

        {/* 12-Col Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end mt-[12vh] md:mt-[16vh]">
          {/* Fig. 01 — Carton flat */}
          <div
            data-parallax="0.25"
            className="md:col-span-5 flex flex-col gap-3"
          >
            <div data-drawing className="bg-ink-soft border border-ivory/15 rounded-2xl p-6 shadow-2xl">
              <svg viewBox="0 0 440 290" className="w-full h-auto text-ivory">
                {/* Outer cut */}
                <path
                  data-draw
                  d="M 40 32 H 392 V 228 H 40 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  data-draw
                  d="M 24 70 H 40 V 190 H 24 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />

                {/* Dashed creases */}
                <g data-fade stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.6">
                  <line x1="140" y1="32" x2="140" y2="228" />
                  <line x1="216" y1="32" x2="216" y2="228" />
                  <line x1="316" y1="32" x2="316" y2="228" />
                  <line x1="40" y1="70" x2="392" y2="70" />
                  <line x1="40" y1="190" x2="392" y2="190" />
                </g>

                {/* Slots */}
                <g data-fade fill="currentColor">
                  <rect x="138" y="32" width="4" height="38" />
                  <rect x="214" y="32" width="4" height="38" />
                  <rect x="314" y="32" width="4" height="38" />
                  <rect x="138" y="190" width="4" height="38" />
                  <rect x="214" y="190" width="4" height="38" />
                  <rect x="314" y="190" width="4" height="38" />
                </g>

                {/* Accent tape rectangle */}
                <rect
                  data-fade
                  x="54"
                  y="88"
                  width="72"
                  height="14"
                  fill="var(--color-accent)"
                  opacity="0.85"
                />

                {/* Labels */}
                <g data-fade fill="currentColor" opacity="0.75" className="font-mono text-[9px] uppercase tracking-wider">
                  <text x="90" y="135" textAnchor="middle">Front</text>
                  <text x="178" y="135" textAnchor="middle">Side</text>
                  <text x="266" y="135" textAnchor="middle">Back</text>
                  <text x="354" y="135" textAnchor="middle">Side</text>
                  <text x="90" y="55" textAnchor="middle" fontSize="7">Major</text>
                  <text x="178" y="55" textAnchor="middle" fontSize="7">Minor</text>
                  <text x="40" y="265" fontSize="8">— CUT   - - CREASE   ▮ SLOT</text>
                </g>
              </svg>
            </div>
            <span className="font-mono text-xs text-ivory/50">
              Fig. 01 — Regular slotted carton, flat · double-wall
            </span>
          </div>

          {/* Spinning Badge */}
          <div
            data-parallax="-0.2"
            className="md:col-span-2 flex flex-col items-center justify-center py-6"
          >
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg
                viewBox="0 0 200 200"
                className="absolute inset-0 w-full h-full animate-[spin_22s_linear_infinite]"
              >
                <path
                  id="circlePath"
                  d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0"
                  fill="none"
                />
                <text
                  fill="var(--color-accent)"
                  className="font-mono font-bold text-[13.5px] uppercase tracking-[3.4px]"
                >
                  <textPath href="#circlePath">
                    PICKED UP · SCANNED · FLOWN · DELIVERED ·{" "}
                  </textPath>
                </text>
              </svg>
              <div className="h-16 w-16 rounded-full bg-accent text-ink flex items-center justify-center wide text-xl shadow-lg">
                24h
              </div>
            </div>
          </div>

          {/* Fig. 02 — Label annotated */}
          <div
            data-parallax="0.45"
            className="md:col-span-5 flex flex-col gap-3"
          >
            <div data-drawing className="bg-ink-soft border border-ivory/15 rounded-2xl p-6 shadow-2xl">
              <svg viewBox="0 0 420 240" className="w-full h-auto text-ivory">
                {/* Drawn borders */}
                <path
                  data-draw
                  d="M 20 20 H 230 V 210 H 20 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <line data-draw x1="20" y1="44" x2="230" y2="44" stroke="currentColor" strokeWidth="1.2" />
                <rect data-draw x="160" y="58" width="64" height="52" fill="none" stroke="currentColor" strokeWidth="1" />

                {/* Fade contents */}
                <g data-fade>
                  <rect x="20" y="20" width="210" height="24" fill="currentColor" opacity="0.15" />
                  <rect x="160" y="92" width="64" height="18" fill="var(--color-accent)" />
                  <text x="192" y="105" textAnchor="middle" fill="var(--color-ink)" className="font-mono font-bold text-[9px]">
                    DEL-07
                  </text>

                  {/* 34 Barcode bars */}
                  {Array.from({ length: 34 }).map((_, i) => (
                    <rect
                      key={i}
                      x={30 + i * 3.6}
                      y={150}
                      width={i % 3 === 0 ? 2.8 : 1.6}
                      height={36}
                      fill="currentColor"
                    />
                  ))}

                  {/* QR Block */}
                  <rect x="184" y="146" width="40" height="40" fill="currentColor" opacity="0.9" />

                  {/* Text line blocks */}
                  <rect x="30" y="60" width="110" height="8" rx="2" fill="currentColor" opacity="0.5" />
                  <rect x="30" y="74" width="80" height="8" rx="2" fill="currentColor" opacity="0.3" />
                  <rect x="30" y="88" width="95" height="8" rx="2" fill="currentColor" opacity="0.3" />

                  {/* Callouts */}
                  {/* Callout 1 */}
                  <circle cx="64" cy="70" r="3" fill="var(--color-accent)" />
                  <line x1="64" y1="70" x2="242" y2="70" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="250" y="73" fill="currentColor" className="font-mono text-[9.5px]">PIN CODE — FIRST SORT</text>

                  {/* Callout 2 */}
                  <circle cx="196" cy="92" r="3" fill="var(--color-accent)" />
                  <line x1="196" y1="92" x2="242" y2="92" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="250" y="95" fill="currentColor" className="font-mono text-[9.5px]">ROUTE · CHUTE</text>

                  {/* Callout 3 */}
                  <circle cx="120" cy="168" r="3" fill="var(--color-accent)" />
                  <line x1="120" y1="168" x2="242" y2="168" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="250" y="171" fill="currentColor" className="font-mono text-[9.5px]">TRACKING BARCODE</text>

                  {/* Callout 4 */}
                  <circle cx="205" cy="172" r="3" fill="var(--color-accent)" />
                  <line x1="205" y1="172" x2="242" y2="172" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="250" y="175" fill="currentColor" className="font-mono text-[9.5px]">QR — PROOF OF DELIVERY</text>
                </g>
              </svg>
            </div>
            <span className="font-mono text-xs text-ivory/50">
              Fig. 02 — The shipping label, annotated
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
