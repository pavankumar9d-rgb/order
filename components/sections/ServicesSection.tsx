"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { services, inr } from "@/data/site";
import { getTurntable, type FlipState } from "@/lib/story/turntable";
import { useReducedMotion } from "@/lib/hooks";
import Still from "@/components/site/Still";
import { pad } from "@/lib/utils";

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const [activeFlipping, setActiveFlipping] = useState<string | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Warm turntable
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          const warm = () => {
            getTurntable().then((tt) => {
              try {
                tt.warm(services[1].id);
              } catch (e) {
                // ignore
              }
            });
          };
          if ("requestIdleCallback" in window) {
            (window as any).requestIdleCallback(warm, { timeout: 3000 });
          } else {
            setTimeout(warm, 1000);
          }
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);

    const ctx = gsap.context(() => {
      // Header scrub
      const leftH = el.querySelector("[data-hdr-left]");
      const rightH = el.querySelector("[data-hdr-right]");
      gsap.fromTo(
        leftH,
        { xPercent: -10, opacity: 0 },
        {
          xPercent: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "top 35%",
            scrub: true,
          },
        }
      );
      gsap.fromTo(
        rightH,
        { xPercent: 10, opacity: 0 },
        {
          xPercent: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "top 35%",
            scrub: true,
          },
        }
      );

      // Card batch landing
      const cards = el.querySelectorAll<HTMLElement>("[data-svc-card]");
      cards.forEach((card, idx) => {
        const rot = idx % 2 === 0 ? 2 : -2;
        gsap.set(card, { y: 80, opacity: 0, rotate: rot });
      });

      ScrollTrigger.batch(cards, {
        start: "top 90%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            rotate: 0,
            duration: 1.2,
            stagger: 0.08,
            ease: "expo.out",
          });
        },
      });
    }, el);

    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, []);

  const handleFlip = async (id: string, cardEl: HTMLElement) => {
    if (prefersReduced) return;
    const tt = await getTurntable();
    if (tt.busy) return;
    tt.busy = true;
    setActiveFlipping(id);

    const host = cardEl.querySelector<HTMLElement>("[data-canvas-host]");
    const stamp = cardEl.querySelector<HTMLElement>("[data-stamp]");
    const still = cardEl.querySelector<HTMLElement>("[data-still-wrap]");

    if (!host) {
      tt.busy = false;
      return;
    }

    tt.use(id);
    tt.mount(host, 1.35);

    const state: FlipState = { hop: 0, spin: 0, tilt: 0, squash: 0, sweep: 0 };
    tt.apply(state);
    tt.render();

    if (still) still.style.opacity = "0";

    const tl = gsap.timeline({
      onUpdate: () => {
        tt.apply(state);
        tt.render();
      },
      onComplete: () => {
        if (still) still.style.opacity = "1";
        // unmount after two frames
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            tt.unmount();
            tt.busy = false;
            setActiveFlipping(null);
          });
        });
      },
    });

    tl.to(state, { squash: 0.6, duration: 0.18, ease: "power2.in" }, 0)
      .to(state, { squash: -0.25, duration: 0.2 }, 0.18)
      .to(state, { hop: 1, duration: 0.45, ease: "power2.out" }, 0.18)
      .to(state, { spin: 1, duration: 0.9, ease: "power2.inOut" }, 0.2)
      .to(state, { tilt: -0.25, duration: 0.45, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0.2)
      .to(state, { sweep: 1, duration: 1.0 }, 0.3)
      .to(state, { hop: 0, duration: 0.42, ease: "power2.in" }, 0.63)
      .to(state, { squash: 0.5, duration: 0.1 }, 1.05)
      .to(state, { squash: 0, duration: 0.4, ease: "elastic.out(1.2, 0.4)" }, 1.15);

    if (stamp) {
      tl.fromTo(
        stamp,
        { opacity: 0, scale: 1.8, rotate: -24 },
        { opacity: 1, scale: 1, rotate: -10, duration: 0.28, ease: "power4.in" },
        1.05
      ).to(stamp, { opacity: 0, duration: 0.4 }, 2.1);
    }
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative z-10 bg-paper text-ink pt-[16vh] pb-[14vh] container-x"
    >
      <div className="mb-4">
        <span className="eyebrow block">08 — Services</span>
      </div>

      {/* Heading */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
        <h2 className="wide text-[clamp(2.6rem,7vw,7.6rem)] leading-[0.92] flex flex-wrap items-center gap-x-6 tracking-tight">
          <span data-hdr-left className="inline-block">Four ways</span>
          <span className="inline-block order-first sm:order-none align-middle my-2">
            {/* Spinning Disc */}
            <span className="relative inline-flex items-center justify-center w-[0.7em] h-[0.7em] align-middle">
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full animate-[spin_16s_linear_infinite]"
              >
                <circle cx="50" cy="50" r="46" fill="var(--color-accent)" />
                <path
                  id="svcPath"
                  d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                  fill="none"
                />
                <text
                  fill="var(--color-ink)"
                  className="font-mono font-bold text-[8.2px] uppercase tracking-wider"
                >
                  <textPath href="#svcPath">
                    SAME DAY · EXPRESS · SURFACE · GLOBAL ·{" "}
                  </textPath>
                </text>
              </svg>
            </span>
          </span>
          <span data-hdr-right className="inline-block text-accent wide-i">to send.</span>
        </h2>
      </div>

      {/* Subhead & Instructions */}
      <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 border-b border-ink/15 pb-8 mb-12">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-ink/60">
          <span>Tap a parcel to flip it</span>
          <span className="w-12 h-[1px] bg-ink/20 inline-block" />
        </div>
        <p className="body-sm text-ink-soft max-w-md">
          Same pickup, same tracking, same people. Pick the speed — we'll pick the fastest way to get it there.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((svc, idx) => (
          <article
            key={svc.id}
            data-svc-card
            className="rounded-[1.6rem] p-6 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all duration-300"
            style={{ backgroundColor: svc.tint }}
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-semibold text-ink/60">
                {pad(idx + 1)} / 04
              </span>
              <span className="bg-ink text-ivory font-mono text-[0.68rem] px-2.5 py-1 rounded-full font-medium">
                {svc.eta}
              </span>
            </div>

            {/* Stage button */}
            <button
              type="button"
              onClick={(e) => handleFlip(svc.id, e.currentTarget.closest("article")!)}
              className="group relative w-[78%] mx-auto aspect-[3/4] flex items-center justify-center cursor-pointer transition-transform duration-500 [transition-timing-function:var(--ease-expo)] hover:-translate-y-2 hover:-rotate-[1.5deg] hover:scale-[1.03] focus:outline-none"
              data-cursor="3d"
              aria-label={`Flip the ${svc.name} parcel`}
            >
              {/* Floor shadow */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-ink/20 rounded-full blur-md pointer-events-none" />

              {/* Still */}
              <div
                data-still-wrap
                className="relative z-10 w-full h-full flex items-center justify-center transition-opacity duration-200"
              >
                <Still
                  still={`svc:${svc.id}`}
                  alt={`${svc.name} package`}
                  className="w-full h-full"
                />
              </div>

              {/* Live Canvas Host (135% for overscan) */}
              <div
                data-canvas-host
                className="absolute inset-[-17.5%] w-[135%] h-[135%] pointer-events-none z-20 overflow-hidden"
              />

              {/* Rubber Stamp */}
              <div
                data-stamp
                className="absolute z-30 pointer-events-none opacity-0 border-[3px] border-[#d8231b] text-[#d8231b] wide font-extrabold text-xl px-4 py-1.5 rounded-lg shadow-xl uppercase tracking-wider"
              >
                BOOKED ✓
              </div>

              {/* Tap to flip tooltip */}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 font-mono text-[0.62rem] uppercase tracking-wider text-ink/50 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                Tap to flip
              </span>
            </button>

            {/* Info */}
            <div className="mt-6 flex flex-col gap-2">
              <span className="font-mono text-xs text-ink/60 uppercase tracking-wider">
                {svc.sub}
              </span>
              <h3 className="wide text-[1.8rem] leading-none text-ink">{svc.name}</h3>
              <p className="body-sm text-ink-soft text-xs line-clamp-3 my-2 leading-relaxed">
                {svc.blurb}
              </p>

              {/* Perks */}
              <div className="flex flex-wrap gap-1.5 my-2">
                {svc.perks.map((perk, pIdx) => (
                  <span
                    key={pIdx}
                    className="border border-ink/15 bg-white/40 text-ink font-mono text-[0.65rem] px-2 py-0.5 rounded-full"
                  >
                    {perk}
                  </span>
                ))}
              </div>

              {/* Footer row */}
              <div className="flex items-baseline justify-between pt-4 mt-2 border-t border-ink/10">
                <span className="font-mono text-sm font-semibold text-ink">
                  From {inr(svc.from)}
                </span>
                <Link
                  href="#rates"
                  className="font-medium text-xs text-ink hover:text-accent flex items-center gap-1 transition-colors"
                >
                  <span>Get a rate</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
