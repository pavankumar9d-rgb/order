"use client";

import React, { Suspense, useEffect, useRef, useState, lazy } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion, useIsMobile } from "@/lib/hooks";
import { BEAT, STAGE_AT } from "@/lib/story/timeline";
import { hero, stickers, stages, brand } from "@/data/site";
import { seg, clamp } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Magnetic from "@/components/ui/Magnetic";
import { Mark } from "@/components/site/Logo";

const StoryScene = lazy(() => import("@/components/story/StoryScene"));

const SCRAMBLE = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export default function StorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef({ current: 0 });
  const entranceRef = useRef({ current: 0 });
  const prefersReduced = useReducedMotion();
  const isMobile = useIsMobile();

  const [mounted, setMounted] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [isScanned, setIsScanned] = useState(false);

  const trackingTextRef = useRef<HTMLDivElement>(null);
  const kmTextRef = useRef<HTMLSpanElement>(null);
  const airborneTextRef = useRef<HTMLSpanElement>(null);
  const readoutBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mounted) return;

    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const ctx = gsap.context(() => {
      const heroSpans = sectionEl.querySelectorAll<HTMLElement>("[data-hero-a] .line-mask > span, [data-hero-b] .line-mask > span");
      const fadeElements = sectionEl.querySelectorAll<HTMLElement>('[data-in="fade"]');

      if (prefersReduced) {
        entranceRef.current.current = 1;
        gsap.set(heroSpans, { yPercent: 0 });
        gsap.set(fadeElements, { opacity: 1, y: 0 });
      } else {
        gsap.set(heroSpans, { yPercent: 130 });
        gsap.set(fadeElements, { opacity: 0, y: 14 });

        const introTl = gsap.timeline({ paused: true });
        introTl
          .to(entranceRef.current, { current: 1, duration: 1.9, ease: "power2.out" }, 0)
          .to(heroSpans, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.12 }, 0.2)
          .to(fadeElements, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.6);

        const onIntro = () => introTl.play();
        if ((window as any).__dakIntroDone) {
          introTl.play();
        } else {
          window.addEventListener("dak:intro-done", onIntro, { once: true });
        }
      }

      // Main scrubbed timeline
      const heroA = sectionEl.querySelector('[data-hero-a]');
      const heroB = sectionEl.querySelector('[data-hero-b]');
      const heroCopy = sectionEl.querySelectorAll('[data-hero-copy]');
      const hint = sectionEl.querySelector('[data-hint]');
      const stickerEls = sectionEl.querySelectorAll('.dak-sticker');
      const readout = sectionEl.querySelector('[data-readout]');

      const step1 = sectionEl.querySelector('[data-step="1"]');
      const step2 = sectionEl.querySelector('[data-step="2"]');
      const step2Right = sectionEl.querySelector('[data-step="2-right"]');
      const step3 = sectionEl.querySelector('[data-step="3"]');
      const step3Right = sectionEl.querySelector('[data-step="3-right"]');
      const step4 = sectionEl.querySelector('[data-step="4"]');
      const step4Right = sectionEl.querySelector('[data-step="4-right"]');
      const step5 = sectionEl.querySelector('[data-step="5"]');
      const step5Specs = sectionEl.querySelector('[data-step="5-specs"]');
      const step5Toast = sectionEl.querySelector('[data-step="5-toast"]');

      const p01Title = sectionEl.querySelectorAll('[data-p01-title] .line-mask > span');
      const p01Copy = sectionEl.querySelector('[data-p01-copy]');

      const p02Title = sectionEl.querySelectorAll('[data-p02-title] .line-mask > span');
      const p02Copy = sectionEl.querySelector('[data-p02-copy]');

      const p03Title = sectionEl.querySelectorAll('[data-p03-title] .line-mask > span');
      const p03Copy = sectionEl.querySelector('[data-p03-copy]');

      const p04Title = sectionEl.querySelectorAll('[data-p04-title] .line-mask > span');
      const p04Copy = sectionEl.querySelector('[data-p04-copy]');

      const p05Title = sectionEl.querySelectorAll('[data-p05-title] .line-mask > span');
      const p05Copy = sectionEl.querySelector('[data-p05-copy]');
      const specs = sectionEl.querySelectorAll('[data-spec]');
      const toast = sectionEl.querySelector('[data-toast]');

      gsap.set(
        [step1, step2, step2Right, step3, step3Right, step4, step4Right, step5, step5Specs, step5Toast],
        { autoAlpha: 0, y: 22 }
      );
      gsap.set(stickerEls, { opacity: 0, scale: 0.2 });
      if (step3Right) gsap.set(step3Right, { x: 30, y: 0 });
      if (step4Right) gsap.set(step4Right, { y: 24 });
      gsap.set(toast, { opacity: 0, y: -30, scale: 0.94 });
      gsap.set(specs, { opacity: 0, x: 20 });
      gsap.set(readout, { opacity: 0 });

      const scrubTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.1,
          onUpdate: (self) => {
            const p = self.progress;
            progressRef.current.current = p;

            let st = 0;
            for (let i = 0; i < STAGE_AT.length; i++) {
              if (p >= STAGE_AT[i]) st = i;
            }
            setCurrentStage(st);

            // Tracking number decode
            const labelSpan = trackingTextRef.current;
            if (labelSpan) {
              const dec = seg(p, BEAT.label[0] + 0.01, BEAT.labelCopyIn[1] + 0.02);
              const realAwb = hero.awb;
              const n = Math.floor(dec * realAwb.length);
              let decoded = "";
              for (let i = 0; i < realAwb.length; i++) {
                if (i < n || realAwb[i] === " ") {
                  decoded += realAwb[i];
                } else {
                  const sIdx = (7 * i + Math.floor(900 * p)) % 34;
                  decoded += SCRAMBLE[sIdx];
                }
              }
              labelSpan.textContent = decoded;
            }

            // Kilometres and airborne clock
            const flySeg = seg(p, BEAT.fly[0], BEAT.fly[1]);
            if (kmTextRef.current) {
              const km = Math.round(flySeg * 1254);
              kmTextRef.current.textContent = `${km.toLocaleString("en-IN")} km`;
            }
            if (airborneTextRef.current) {
              const totalMins = Math.round(flySeg * 135);
              const hrs = Math.floor(totalMins / 60);
              const mins = totalMins % 60;
              airborneTextRef.current.textContent = `Airborne ${hrs}:${mins < 10 ? "0" : ""}${mins}`;
            }

            // Scanned state
            const scanLen = BEAT.scan[1] - BEAT.scan[0];
            const scannedNow = p > BEAT.scan[0] + 0.62 * scanLen;
            setIsScanned(scannedNow);

            if (readoutBarRef.current) {
              const scale = seg(p, STAGE_AT[0] - 0.01, 0.9);
              readoutBarRef.current.style.transform = `scaleX(${scale})`;
            }
          },
        },
      });

      // Hero Out
      scrubTl.to(heroA, { xPercent: -18, yPercent: -30, opacity: 0, duration: BEAT.heroOut[1] - BEAT.heroOut[0], ease: "none" }, BEAT.heroOut[0]);
      scrubTl.to(heroB, { xPercent: 18, yPercent: 30, opacity: 0, duration: BEAT.heroOut[1] - BEAT.heroOut[0], ease: "none" }, BEAT.heroOut[0]);
      scrubTl.to(heroCopy, { y: -40, opacity: 0, duration: (BEAT.heroOut[1] - BEAT.heroOut[0]) * 0.7, ease: "none" }, BEAT.heroOut[0]);
      scrubTl.to(hint, { opacity: 0, duration: 0.005, ease: "none" }, 0);

      // Stickers
      const rots = [-12, 9, 7, -8];
      stickerEls.forEach((el, i) => {
        const rot = rots[i];
        const a = BEAT.statsIn[0] + 0.012 * i;
        scrubTl.fromTo(
          el,
          { opacity: 0, scale: 0.2, rotate: -3 * rot },
          { opacity: 1, scale: 1, rotate: rot, duration: 0.035, ease: "back.out(2.2)" },
          a
        );
        scrubTl.fromTo(
          el,
          { "--sheen": "-120%" },
          { "--sheen": "120%", duration: 0.03, ease: "none" },
          a + 0.02
        );
        scrubTl.to(
          el,
          { y: -50 - 12 * i, rotate: 0.4 * rot, duration: BEAT.statsOut[0] - (a + 0.035), ease: "none" },
          a + 0.035
        );
        scrubTl.to(
          el,
          { opacity: 0, scale: 0.6, y: -160, rotate: 3 * rot, duration: (BEAT.statsOut[1] - BEAT.statsOut[0]) * 0.8, ease: "none" },
          BEAT.statsOut[0] + 0.006 * i
        );
      });

      // Readout
      scrubTl.fromTo(readout, { opacity: 0 }, { opacity: 1, duration: 0.02 }, STAGE_AT[0] - 0.01);
      scrubTl.to(readout, { opacity: 0, duration: 0.02 }, 0.91);

      // 01 Packed
      if (step1) {
        scrubTl.to(step1, { autoAlpha: 1, y: 0, duration: 0.035, ease: "power2.out" }, 0.18);
        scrubTl.to(step1, { autoAlpha: 0, y: -22, duration: 0.025, ease: "power2.in" }, 0.31);
      }

      // 02 Labelled
      const step2Elements = [step2, step2Right].filter(Boolean);
      if (step2Elements.length) {
        scrubTl.to(step2Elements, { autoAlpha: 1, y: 0, duration: 0.03, ease: "power2.out" }, 0.32);
        scrubTl.to(step2Elements, { autoAlpha: 0, y: -22, duration: 0.025, ease: "power2.in" }, 0.44);
      }

      // 03 Sorted
      if (step3) {
        scrubTl.to(step3, { autoAlpha: 1, y: 0, duration: 0.03, ease: "power2.out" }, 0.45);
        scrubTl.to(step3, { autoAlpha: 0, y: -22, duration: 0.025, ease: "power2.in" }, 0.62);
      }
      if (step3Right) {
        scrubTl.to(step3Right, { autoAlpha: 1, x: 0, y: 0, duration: 0.03, ease: "power2.out" }, 0.45);
        scrubTl.to(step3Right, { autoAlpha: 0, x: -20, duration: 0.025, ease: "power2.in" }, 0.62);
      }

      // 04 In the air
      if (step4) {
        scrubTl.to(step4, { autoAlpha: 1, y: 0, duration: 0.03, ease: "power2.out" }, 0.63);
        scrubTl.to(step4, { autoAlpha: 0, y: -22, duration: 0.025, ease: "power2.in" }, 0.83);
      }
      if (step4Right) {
        scrubTl.to(step4Right, { autoAlpha: 1, y: 0, duration: 0.03, ease: "power2.out" }, 0.63);
        scrubTl.to(step4Right, { autoAlpha: 0, y: -20, duration: 0.025, ease: "power2.in" }, 0.83);
      }

      // 05 Delivered
      if (step5) {
        scrubTl.to(step5, { autoAlpha: 1, y: 0, duration: 0.03, ease: "power2.out" }, 0.84);
      }
      if (step5Specs) {
        scrubTl.to(step5Specs, { autoAlpha: 1, y: 0, duration: 0.025, ease: "power2.out" }, 0.86);
        scrubTl.fromTo(specs, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.03, stagger: 0.008 }, 0.86);
      }
      if (step5Toast) {
        scrubTl.to(step5Toast, { autoAlpha: 1, y: 0, duration: 0.025 }, 0.865);
        scrubTl.fromTo(toast, { opacity: 0, y: -30, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.035, ease: "back.out(1.6)" }, 0.865);
      }
      const step5Elements = [step5, step5Specs, step5Toast].filter(Boolean);
      if (step5Elements.length) {
        scrubTl.to(step5Elements, { autoAlpha: 0, y: -20, duration: 0.02 }, 0.93);
      }

      scrubTl.set({}, {}, 1);
    }, sectionRef);

    return () => ctx.revert();
  }, [mounted, prefersReduced]);

  return (
    <section
      id="story"
      ref={sectionRef}
      aria-label="Pavan Express — a parcel from Hyderabad to New Delhi"
      className="relative h-[1100svh] md:h-[1300vh] w-full"
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-[100svh] w-full overflow-hidden bg-ivory"
        style={{
          background: "radial-gradient(75% 65% at 50% 46%, #fbfaf7 0%, #f3f1ec 55%, #e6e3db 100%)",
        }}
      >
        {/* Dot grid masked & Grain */}
        <div
          className="dot-grid absolute inset-0 opacity-60 pointer-events-none"
          style={{
            maskImage: "radial-gradient(70% 60% at 50% 50%, #000 30%, transparent 85%)",
            WebkitMaskImage: "radial-gradient(70% 60% at 50% 50%, #000 30%, transparent 85%)",
          }}
        />
        <div className="grain absolute inset-0 opacity-60 pointer-events-none" />

        {/* ================= BACK LAYER (z-0) ================= */}
        <div className="absolute inset-0 z-0 pointer-events-none container-x">
          <h1 className="wide text-ink leading-[0.9]">
            {/* data-hero-a */}
            <span
              data-hero-a
              className="absolute left-[var(--gutter)] top-[calc(var(--nav-h)+1.5rem)] md:top-[calc(var(--nav-h)+2rem)] block text-[clamp(2rem,8.6vw,4.2rem)] md:text-[clamp(3.2rem,6.7vw,7.6rem)]"
            >
              <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                <span className="block will-change-transform">Across India,</span>
              </span>
            </span>

            {/* data-hero-b */}
            <span
              data-hero-b
              className="absolute right-[var(--gutter)] bottom-[max(11svh,7.5rem)] md:bottom-[12svh] text-right text-accent wide-i block text-[clamp(2rem,8.6vw,4.2rem)] md:text-[clamp(3.2rem,6.7vw,7.6rem)]"
            >
              <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                <span className="block will-change-transform">by tomorrow.</span>
              </span>
            </span>
          </h1>
        </div>

        {/* ================= SCENE LAYER (z-10) ================= */}
        <div className="absolute inset-0 z-10">
          {mounted && (
            <Suspense fallback={null}>
              <StoryScene progress={progressRef.current} entrance={entranceRef.current} />
            </Suspense>
          )}
        </div>

        {/* ================= FRONT LAYER (z-20) ================= */}
        <div className="absolute inset-0 z-20 pointer-events-none text-ink container-x">
          {/* Hero Copy (Top right & bottom left) */}
          <div
            data-hero-copy
            data-in="fade"
            className="hidden md:flex flex-col items-end gap-5 absolute right-[var(--gutter)] top-[calc(var(--nav-h)+2rem)] max-w-[29ch] text-right pointer-events-auto"
          >
            <p className="body-sm text-ink-soft">
              Door to door from 19,000+ PIN codes. Picked up by 6 pm, flown overnight, at the door before lunch — tracked live all the way.
            </p>
            <Magnetic>
              <Button href="#rates" variant="ghost" size="md">
                Book a pickup
              </Button>
            </Magnetic>
          </div>

          <div
            data-hero-copy
            data-in="fade"
            className="hidden md:block absolute left-[var(--gutter)] bottom-[max(11svh,7.5rem)] font-mono text-[0.62rem] uppercase tracking-wider text-ink/55 leading-relaxed"
          >
            <div>Tracking {hero.awb}</div>
            <div>Hyderabad → New Delhi · 1.2 kg</div>
          </div>

          {/* Hint */}
          <div
            data-hint
            className="absolute left-1/2 -translate-x-1/2 bottom-[max(3.5svh,4.5rem)] flex flex-col items-center gap-2 pointer-events-none"
          >
            <div className="h-8 w-[1px] bg-ink/20 relative overflow-hidden">
              <div
                className="w-full h-3 bg-ink/70 absolute top-0"
                style={{ animation: "dak-hint 1.8s ease-in-out infinite" }}
              />
            </div>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink/60">
              Scroll to ship it
            </span>
          </div>

          {/* Stickers */}
          {stickers.map((stk, i) => {
            const positions = [
              "left-[5%] md:left-[16%] top-[19%] md:top-[19%]",
              "left-[60%] md:left-[70%] top-[15%] md:top-[15%]",
              "left-[3%] md:left-[11%] top-[63%] md:top-[60%]",
              "left-[57%] md:left-[72%] top-[64%] md:top-[59%]",
            ];
            const colors = [
              "bg-accent text-ink",
              "bg-ink text-ivory",
              "bg-cobalt text-ivory",
              "bg-kraft text-ink",
            ];

            return (
              <div
                key={i}
                data-stk={i}
                data-shape={stk.shape}
                className={`dak-sticker absolute ${positions[i]}`}
              >
                <div className={`face ${colors[i]} p-3`}>
                  <span className="edge" />
                  <div className="wide text-[clamp(1.7rem,2.9vw,2.7rem)] leading-[0.9]">
                    {stk.value}
                    <span className="text-[0.5em] align-top">{stk.unit}</span>
                  </div>
                  <div className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] max-w-[82%] mt-1">
                    {stk.label}
                  </div>
                </div>
              </div>
            );
          })}

          {/* 01 Packed */}
          <div data-step="1" className="absolute left-[var(--gutter)] bottom-[max(13svh,8.5rem)] md:bottom-[12svh] max-w-[34ch] pointer-events-none">
            <div data-p01-title>
              <span className="eyebrow block mb-2">01 — Packed & sealed</span>
              <h2 className="wide text-[clamp(1.8rem,7.4vw,2.9rem)] md:text-[clamp(2.4rem,4.4vw,4.7rem)] leading-[0.95]">
                <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                  <span className="block">Packed like</span>
                </span>
                <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                  <span className="block text-accent wide-i">it's ours.</span>
                </span>
              </h2>
            </div>
            <p data-p01-copy className="hidden md:block body-sm text-ink-soft mt-3">
              Crinkle fill, a double-wall box and our own tape — sealed at pickup, in front of you.
            </p>
          </div>

          {/* 02 Labelled */}
          <div data-step="2" className="absolute left-[var(--gutter)] top-[calc(var(--nav-h)+1rem)] md:top-1/2 md:-translate-y-1/2 max-w-[34ch] pointer-events-none">
            <div data-p02-title>
              <span className="eyebrow block mb-2">02 — Labelled</span>
              <h2 className="wide text-[clamp(1.8rem,7.4vw,2.9rem)] md:text-[clamp(2.4rem,4.4vw,4.7rem)] leading-[0.95]">
                <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                  <span className="block">One number,</span>
                </span>
                <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                  <span className="block text-accent wide-i">every scan.</span>
                </span>
              </h2>
            </div>
            <p data-p02-copy className="hidden md:block body-sm text-ink-soft mt-3">
              Your tracking number follows the parcel through every hand, hub and flight — and it's the only thing you need to follow it.
            </p>
          </div>

          <div
            data-step="2-right"
            className="absolute right-[var(--gutter)] bottom-[max(13svh,8.5rem)] md:bottom-auto md:top-1/2 md:-translate-y-1/2 text-right pointer-events-none"
          >
            <div className="font-mono text-[0.6rem] text-grey uppercase tracking-widest mb-1">
              Tracking number
            </div>
            <div
              ref={trackingTextRef}
              className="font-mono font-bold text-[clamp(1.05rem,4vw,1.3rem)] md:text-[clamp(1.2rem,1.9vw,2rem)] tracking-[0.08em] tabular-nums"
            >
              {hero.awb}
            </div>
            <div className="font-mono text-[0.72rem] text-ink/60 mt-1">
              HYD › DEL · 110016 · 1.2 kg
            </div>
          </div>

          {/* 03 Sorted */}
          <div data-step="3" className="absolute left-[var(--gutter)] top-[calc(var(--nav-h)+1rem)] md:top-auto md:bottom-[12svh] max-w-[34ch] pointer-events-none">
            <div data-p03-title>
              <span className="eyebrow block mb-2">03 — Scanned & sorted</span>
              <h2 className="wide text-[clamp(1.8rem,7.4vw,2.9rem)] md:text-[clamp(2.4rem,4.4vw,4.7rem)] leading-[0.95]">
                <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                  <span className="block">12,000 an hour.</span>
                </span>
                <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                  <span className="block text-accent wide-i">Yours, by name.</span>
                </span>
              </h2>
            </div>
            <p data-p03-copy className="hidden md:block body-sm text-ink-soft mt-3">
              Automated high-speed chutes route each box to its freighter before the tape has cooled.
            </p>
          </div>

          {/* Scan Box */}
          <div
            data-step="3-right"
            data-scanbox
            className="absolute right-[var(--gutter)] bottom-[max(12svh,8rem)] w-[min(19rem,78vw)] rounded-2xl border border-ink/10 bg-ivory/90 backdrop-blur-md p-4 shadow-xl pointer-events-none"
          >
            <div className="flex items-center justify-between pb-3 border-b border-ink/10">
              <span className="font-mono text-[0.65rem] text-grey">Hyderabad hub · Bay 14</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.6rem] font-mono font-medium ${
                  isScanned ? "bg-ok/10 text-ok" : "bg-accent/10 text-accent"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isScanned ? "bg-ok" : "bg-accent animate-pulse"
                  }`}
                />
                {isScanned ? "Scan OK" : "Scanning"}
              </span>
            </div>
            <div className="py-2.5 font-mono font-bold text-[0.95rem] tracking-wider text-ink">
              {hero.awbShort}
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-ink/10 font-mono text-[0.65rem]">
              <div>
                <span className="text-grey block">Time</span>
                <span className="font-semibold text-ink">8:15:07 pm</span>
              </div>
              <div>
                <span className="text-grey block">Weight</span>
                <span className="font-semibold text-ink">1.20 kg</span>
              </div>
              <div>
                <span className="text-grey block">Chute</span>
                <span className="font-semibold text-ink">DEL-07</span>
              </div>
            </div>
          </div>

          {/* 04 In the air */}
          <div data-step="4" className="absolute left-[var(--gutter)] top-[calc(var(--nav-h)+1.5rem)] md:top-[calc(var(--nav-h)+2.5rem)] max-w-[34ch] pointer-events-none">
            <div data-p04-title>
              <span className="eyebrow block mb-2">04 — In the air</span>
              <h2 className="wide text-[clamp(1.8rem,7.4vw,2.9rem)] md:text-[clamp(2.4rem,4.4vw,4.7rem)] leading-[0.95]">
                <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                  <span className="block">Hyderabad to Delhi,</span>
                </span>
                <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                  <span className="block text-cobalt wide-i">overnight.</span>
                </span>
              </h2>
            </div>
            <p data-p04-copy className="hidden md:block body-sm text-ink-soft mt-3">
              Non-stop freighter flight cruising at 32,000 ft while the country sleeps.
            </p>
          </div>

          {/* Boarding-pass card */}
          <div
            data-step="4-right"
            data-boarding-card
            className="absolute right-[var(--gutter)] bottom-[max(12svh,8rem)] bg-ink text-ivory rounded-2xl p-5 shadow-2xl pointer-events-none w-[min(20rem,82vw)]"
          >
            <div className="grid grid-cols-3 items-center text-center gap-2">
              <div className="text-left">
                <span className="font-mono text-[0.55rem] text-grey uppercase block">Departs</span>
                <span className="wide text-[1.6rem] leading-none block my-1">HYD</span>
                <span className="font-mono text-[0.6rem] text-grey-light block">10:40 pm IST</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="font-mono text-[0.6rem] text-accent">Freighter</span>
                <span className="text-accent text-xl">⇢</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-[0.55rem] text-grey uppercase block">Lands</span>
                <span className="wide text-[1.6rem] leading-none block my-1">DEL</span>
                <span className="font-mono text-[0.6rem] text-grey-light block">12:55 am IST</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-ivory/15 flex items-center justify-between">
              <span ref={kmTextRef} className="wide text-[1.3rem] text-accent">
                0 km
              </span>
              <span ref={airborneTextRef} className="font-mono text-[0.7rem] text-ivory/70">
                Airborne 0:00
              </span>
            </div>
          </div>

          {/* 05 Delivered */}
          <div data-step="5" className="absolute left-[var(--gutter)] top-[calc(var(--nav-h)+1.5rem)] max-w-[42ch] pointer-events-none">
            <div data-p05-title>
              <span className="eyebrow block mb-2">05 — Delivered · Tue 10:14</span>
              <h2 className="wide text-[clamp(2.2rem,9vw,3.1rem)] md:text-[clamp(2.6rem,4.8vw,5.2rem)] leading-[0.95]">
                <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                  <span className="block">Before your</span>
                </span>
                <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                  <span className="block text-accent wide-i">first chai.</span>
                </span>
              </h2>
            </div>
            <p data-p05-copy className="hidden md:block body-sm text-ink-soft mt-3">
              Handed over at the door, photographed at the doorstep, and every step sent by text — 1,254 km in under sixteen hours.
            </p>
          </div>

          {/* Bottom Right Specs */}
          <div data-step="5-specs" className="hidden md:flex flex-col items-end gap-2 absolute right-[var(--gutter)] bottom-[max(12svh,8rem)] text-right font-mono text-[0.75rem] text-ink/80 pointer-events-none">
            <div data-spec className="flex items-center gap-2">
              <span>Signature on request</span>
              <span className="text-ok font-bold">✓</span>
            </div>
            <div data-spec className="flex items-center gap-2">
              <span>Photo proof of delivery</span>
              <span className="text-ok font-bold">✓</span>
            </div>
            <div data-spec className="flex items-center gap-2">
              <span>Live tracking by text</span>
              <span className="text-ok font-bold">✓</span>
            </div>
            <div data-spec className="flex items-center gap-2">
              <span>Insured up to ₹25,000</span>
              <span className="text-ok font-bold">✓</span>
            </div>
          </div>

          {/* Toast */}
          <div
            data-step="5-toast"
            data-toast
            className="absolute right-[var(--gutter)] top-[calc(var(--nav-h)+2rem)] md:top-[calc(var(--nav-h)+2rem)] bottom-auto w-[min(22rem,86vw)] rounded-[1.4rem] bg-white/80 backdrop-blur-xl border border-white/60 p-4 shadow-2xl pointer-events-none flex items-start gap-3.5"
          >
            <div className="h-10 w-10 rounded-xl bg-ink flex items-center justify-center shrink-0">
              <Mark className="h-6 w-auto text-accent" cut="#101216" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-xs uppercase tracking-wider text-ink">
                  {brand.name}
                </span>
                <span className="font-mono text-[0.62rem] text-grey">now</span>
              </div>
              <p className="text-xs text-ink/90 mt-1 leading-snug">
                <strong>Delivered at 10:14 AM</strong> — handed to Arjun at Flat 4B. Tap to see the doorstep photo.
              </p>
            </div>
          </div>

          {/* Route Readout */}
          <div
            data-readout
            className="absolute left-[var(--gutter)] bottom-[max(2.2svh,1rem)] md:bottom-[max(2.2svh,1rem)] w-[min(22rem,62vw)] pointer-events-none"
          >
            <div className="relative w-full h-[2px] bg-ink/15 mb-3 flex items-center justify-between">
              <div
                ref={readoutBarRef}
                className="absolute left-0 top-0 h-full bg-accent origin-left w-full will-change-transform"
                style={{ transform: "scaleX(0)" }}
              />
              {stages.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 relative z-10 ${
                    idx <= currentStage ? "bg-accent" : "bg-paper border border-ink/20"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between font-mono text-[0.55rem] uppercase tracking-wider">
              {stages.map((stg, idx) => {
                const isCurrent = idx === currentStage;
                const isEdge = idx === 0 || idx === stages.length - 1;
                return (
                  <span
                    key={idx}
                    className={`transition-colors duration-300 ${
                      !isEdge ? "hidden sm:inline" : ""
                    } ${isCurrent ? "text-ink font-bold" : "text-ink/35"}`}
                  >
                    {stg}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
