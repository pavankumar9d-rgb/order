"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { network } from "@/data/site";
import { CITY, ROUTES, svgProjector, outlinePath, arcPath, type CityCode } from "@/lib/map";
import Counter from "@/components/motion/Counter";

export default function NetworkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [movingCount, setMovingCount] = useState(38214);

  // Moving right now counter rising 3-11 every 700ms
  useEffect(() => {
    const timer = setInterval(() => {
      setMovingCount((prev) => prev + Math.floor(Math.random() * 9) + 3);
    }, 700);
    return () => clearInterval(timer);
  }, []);

  const proj = svgProjector(600);
  const outPath = outlinePath(proj);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Heading lines rise
      const headingLines = el.querySelectorAll(".network-heading .line-mask > span");
      gsap.fromTo(
        headingLines,
        { yPercent: 130 },
        {
          yPercent: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
          },
        }
      );

      // Map animations
      const mapDots = el.querySelector("[data-map-dots]");
      if (mapDots) {
        gsap.fromTo(
          mapDots,
          { opacity: 0 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 70%",
              end: "center 55%",
              scrub: true,
            },
          }
        );
      }

      const mapOutline = el.querySelector<SVGPathElement>("[data-map-outline]");
      if (mapOutline) {
        const len = mapOutline.getTotalLength?.() || 2000;
        gsap.set(mapOutline, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(mapOutline, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "center 50%",
            scrub: true,
          },
        });
      }

      const arcs = el.querySelectorAll<SVGPathElement>("[data-route-arc]");
      arcs.forEach((arc) => {
        const len = arc.getTotalLength?.() || 600;
        gsap.set(arc, { strokeDasharray: len, strokeDashoffset: len });
      });

      gsap.to(arcs, {
        strokeDashoffset: 0,
        stagger: 0.04,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 60%",
          end: "center 40%",
          scrub: true,
        },
      });

      const hubs = el.querySelectorAll("[data-hub-pin]");
      gsap.from(hubs, {
        scale: 0,
        transformOrigin: "center center",
        stagger: 0.03,
        duration: 0.8,
        ease: "back.out(3)",
        scrollTrigger: {
          trigger: el,
          start: "center 70%",
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const labeledCities: CityCode[] = ["DEL", "BOM", "HYD", "CCU", "MAA", "GAU", "NAG"];

  return (
    <section
      id="network"
      ref={sectionRef}
      data-theme="dark"
      className="relative z-10 bg-cobalt text-ivory overflow-hidden pt-[16vh] pb-[14vh] container-x"
    >
      {/* Dot grid */}
      <div className="dot-grid-light absolute inset-0 opacity-50 pointer-events-none" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column (6 cols) */}
        <div className="md:col-span-6 flex flex-col gap-6">
          <div>
            <span className="eyebrow text-ivory/60 block mb-3">10 — The network</span>
          </div>

          <div className="network-heading">
            <h2 className="wide text-[clamp(2.6rem,6vw,6.6rem)] leading-[0.92] tracking-tight">
              <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                <span className="block">Every PIN code.</span>
              </span>
              <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                <span className="block text-accent wide-i">Every night.</span>
              </span>
            </h2>
          </div>

          <p className="lede text-ivory/80 max-w-lg">
            Thirty-eight hubs, a fleet of night freighters and 9,400 vans and bikes — sorting India's parcels while it sleeps.
          </p>

          {/* Live Pill */}
          <div className="inline-flex items-center gap-2.5 bg-ink/30 border border-ivory/15 backdrop-blur-md px-4 py-2 rounded-full w-max my-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-ivory">
              Moving right now · <span className="font-bold tabular-nums">{movingCount.toLocaleString("en-IN")}</span>
            </span>
          </div>

          {/* 2-col DL of four network figures as Counters */}
          <dl className="grid grid-cols-2 gap-8 pt-6 border-t border-ivory/20">
            {network.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <dd className="wide text-[clamp(2rem,3.4vw,3.2rem)] leading-none text-ivory">
                  {item.l.includes("Parcels a day") ? (
                    <>
                      <Counter value={item.v} />
                      <span className="text-xl font-normal font-mono">{item.s}</span>
                    </>
                  ) : (
                    <>
                      <Counter value={item.v} suffix={item.s} />
                    </>
                  )}
                </dd>
                <dt className="font-mono text-xs text-ivory/70 uppercase tracking-wider mt-2">
                  {item.l}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Right Column (6 cols): SVG Trunk Map */}
        <div className="md:col-span-6 flex items-center justify-center">
          <div className="w-full max-w-[560px] aspect-square relative flex items-center justify-center">
            <svg
              viewBox={`0 0 ${proj.W} ${proj.H}`}
              className="w-full h-full"
              aria-label="Map of India showing the Pavan Express trunk network"
              role="img"
            >
              <defs>
                <pattern id="netDotPattern" width="9" height="9" patternUnits="userSpaceOnUse">
                  <circle cx="4.5" cy="4.5" r="2" fill="rgba(243,241,236,0.5)" />
                </pattern>
                <clipPath id="netIndiaClip">
                  <path d={outPath} clipRule="evenodd" />
                </clipPath>
              </defs>

              {/* Halftone dots */}
              <rect
                data-map-dots
                width={proj.W}
                height={proj.H}
                fill="url(#netDotPattern)"
                clipPath="url(#netIndiaClip)"
              />

              {/* Self-drawing outline */}
              <path
                data-map-outline
                d={outPath}
                fill="none"
                stroke="rgba(243, 241, 236, 0.7)"
                strokeWidth="1.2"
              />

              {/* ROUTES arcs */}
              {ROUTES.map(([a, b], i) => {
                const pathD = arcPath(a, b, proj);
                const isHero = a === "HYD" && b === "DEL";
                const dur = 3 + (i % 5) * 0.8;
                const begin = (0.37 * i) % 3;

                return (
                  <g key={i}>
                    <path
                      id={`route-arc-${i}`}
                      data-route-arc
                      d={pathD}
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth={isHero ? 2.6 : 1.4}
                      strokeOpacity={isHero ? 1 : 0.75}
                      strokeLinecap="round"
                    />

                    {/* Animated moving dot on path */}
                    <circle r="3.2" fill="#ffffff">
                      <animateMotion
                        dur={`${dur}s`}
                        repeatCount="indefinite"
                        begin={`${begin}s`}
                      >
                        <mpath href={`#route-arc-${i}`} />
                      </animateMotion>
                    </circle>
                  </g>
                );
              })}

              {/* Hub Pins */}
              {(Object.keys(CITY) as CityCode[]).map((code) => {
                const c = CITY[code];
                const cx = proj.x(c.lon);
                const cy = proj.y(c.lat);
                const isCentral = code === "NAG";
                const r = isCentral ? 6.5 : 4.5;
                const isEast = c.lon > 84;

                return (
                  <g key={code} data-hub-pin>
                    {/* Pulse ring */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth="1.5"
                      className="animate-ping"
                      style={{
                        animationDuration: "2s",
                        animationIterationCount: "indefinite",
                        animationDelay: `${(c.lat * 0.25) % 2}s`,
                        transformOrigin: `${cx}px ${cy}px`,
                      }}
                    />

                    {/* Outer accent ring */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r + 1.5}
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth="1.5"
                    />

                    {/* Center ink dot */}
                    <circle cx={cx} cy={cy} r={r} fill="var(--color-ink)" />

                    {/* Labels for DEL, BOM, HYD, CCU, MAA, GAU, NAG */}
                    {labeledCities.includes(code) && (
                      <text
                        x={isEast ? cx - r - 6 : cx + r + 6}
                        y={cy + 3.5}
                        textAnchor={isEast ? "end" : "start"}
                        fill="#ffffff"
                        className="font-mono font-bold text-[10px]"
                      >
                        {isCentral ? "NAGPUR · CENTRAL HUB" : code}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
