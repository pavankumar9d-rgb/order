"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useReducedMotion } from "@/lib/hooks";
import { fontsReady } from "@/lib/story/print";
import { Mark } from "@/components/site/Logo";
import { brand, hero } from "@/data/site";
import { pad } from "@/lib/utils";

export function onIntroDone(fn: () => void) {
  if (typeof window === "undefined") return;
  if ((window as any).__dakIntroDone) {
    fn();
  } else {
    window.addEventListener("dak:intro-done", fn, { once: true });
  }
}

export default function Intro() {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"scanning" | "ok" | "lift" | "unmount">("scanning");
  const [percent, setPercent] = useState(0);
  const laserRef = useRef<HTMLDivElement>(null);

  // Generate 46 deterministic bars:
  // s = (9301s + 49297) mod 233280 from s = 7;
  // width 1 + floor(s/233280·4); margin-right (7i mod 3)
  const bars = useMemo(() => {
    let s = 7;
    const result: { width: number; marginRight: number }[] = [];
    for (let i = 0; i < 46; i++) {
      s = (9301 * s + 49297) % 233280;
      const width = 1 + Math.floor((s / 233280) * 4);
      const marginRight = (7 * i) % 3;
      result.push({ width, marginRight });
    }
    return result;
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mounted) return;

    const isShowcase = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("showcase");

    const hasSeenIntro = (() => {
      try {
        if (isShowcase) return false; // Always play in showcase mode
        return sessionStorage.getItem("pavan-intro-seen") === "1";
      } catch (e) {
        return false;
      }
    })();

    if (prefersReduced || hasSeenIntro) {
      (window as any).__dakIntroDone = true;
      window.dispatchEvent(new CustomEvent("dak:intro-done"));
      setPhase("unmount");
      return;
    }

    const unlockScroll = () => {
      document.documentElement.classList.remove("lenis-stopped");
      if (window.__lenis) window.__lenis.start();
    };

    // Lock scroll for dramatic intro
    document.documentElement.classList.add("lenis-stopped");
    if (window.__lenis) {
      window.__lenis.stop();
      window.__lenis.scrollTo(0, { immediate: true });
    }

    let start = performance.now();
    let shown = 0;
    let reqId: number;
    let phaseState: "scanning" | "ok" | "lift" | "unmount" = "scanning";

    const finishIntro = () => {
      if (phaseState === "lift" || phaseState === "unmount") return;
      phaseState = "lift";
      setPhase("lift");
      (window as any).__dakIntroDone = true;
      try {
        sessionStorage.setItem("pavan-intro-seen", "1");
      } catch (e) {}
      window.dispatchEvent(new CustomEvent("dak:intro-done"));
      unlockScroll();

      setTimeout(() => {
        phaseState = "unmount";
        setPhase("unmount");
      }, 950);
    };

    // In normal mode allow skipping, in showcase mode let it play out fully
    if (!isShowcase) {
      window.addEventListener("wheel", finishIntro, { once: true, passive: true });
      window.addEventListener("touchstart", finishIntro, { once: true, passive: true });
      window.addEventListener("keydown", finishIntro, { once: true });
      window.addEventListener("click", finishIntro, { once: true });
    }

    const loop = (now: number) => {
      const elapsed = now - start;
      const scanDuration = isShowcase ? 2600 : 1600;
      const progress = Math.min(1, elapsed / scanDuration);

      shown = progress * 100;
      setPercent(Math.round(shown));

      if (laserRef.current && phaseState === "scanning") {
        const xPos = Math.sin(elapsed / 220) * 45 + 50;
        laserRef.current.style.transform = `translateX(${xPos}%)`;
      }

      if (progress >= 1 && phaseState === "scanning") {
        phaseState = "ok";
        setPhase("ok");

        setTimeout(() => {
          finishIntro();
        }, 400);
      }

      if (phaseState !== "unmount") {
        reqId = requestAnimationFrame(loop);
      }
    };

    reqId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(reqId);
      if (!isShowcase) {
        window.removeEventListener("wheel", finishIntro);
        window.removeEventListener("touchstart", finishIntro);
        window.removeEventListener("keydown", finishIntro);
        window.removeEventListener("click", finishIntro);
      }
      unlockScroll();
    };
  }, [mounted, prefersReduced]);

  if (!mounted || phase === "unmount" || prefersReduced) return null;

  return (
    <div
      className={`fixed inset-0 z-[90] bg-ink text-ivory flex flex-col items-center justify-center transition-transform duration-[900ms] [transition-timing-function:cubic-bezier(0.76,0,0.24,1)] ${
        phase === "lift" ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{ transitionDelay: phase === "lift" ? "200ms" : "0ms" }}
    >
      <div className="flex flex-col items-center gap-7">
        {/* Label Card */}
        <div className="relative bg-ivory text-ink rounded-xl p-6 shadow-2xl overflow-hidden w-[280px]">
          {/* Green Tick Disc at top right */}
          <div
            className={`absolute top-3 right-3 h-6 w-6 rounded-full bg-ok text-white flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              phase === "ok" || phase === "lift" ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            ✓
          </div>

          <div className="font-mono font-bold text-[0.55rem] tracking-[0.3em] uppercase text-ink mb-3 select-none">
            {hero.awb}
          </div>

          {/* Barcode container */}
          <div className="relative h-14 flex items-stretch overflow-hidden">
            {bars.map((b, i) => (
              <span
                key={i}
                className="bg-ink h-full block shrink-0"
                style={{
                  width: `${b.width}px`,
                  marginRight: `${b.marginRight}px`,
                }}
              />
            ))}

            {/* Red Laser Line */}
            <div
              ref={laserRef}
              className={`absolute top-0 bottom-0 w-[2px] bg-[#ff2a12] transition-opacity duration-300 pointer-events-none ${
                phase === "scanning" ? "opacity-100" : "opacity-0"
              }`}
              style={{
                boxShadow: "0 0 12px 3px rgba(255, 42, 18, 0.7)",
                left: 0,
              }}
            />
          </div>
        </div>

        {/* Wordmark and Scan Readout */}
        <div className="flex items-center gap-3">
          <Mark className="h-8 w-auto text-accent" cut="#101216" />
          <span className="wide text-[1.9rem] leading-none tracking-tight">{brand.wordmark}</span>
        </div>

        <div className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-ivory/70">
          {phase === "scanning" ? `scanning · ${pad(percent)}%` : "scan ok · 100%"}
        </div>
      </div>
    </div>
  );
}
