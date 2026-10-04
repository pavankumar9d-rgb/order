"use client";

import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { gsap } from "@/lib/gsap";
import { cities, quote, zoneName, inr, type CityId, type Mode } from "@/data/site";
import Magnetic from "@/components/ui/Magnetic";

const RatesScene = lazy(() => import("@/components/story/RatesScene"));

export default function RatesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stagePanelRef = useRef<HTMLDivElement>(null);
  const priceTextRef = useRef<HTMLSpanElement>(null);

  const [fromCity, setFromCity] = useState<CityId>("HYD");
  const [toCity, setToCity] = useState<CityId>("DEL");
  const [mode, setMode] = useState<Mode>("express");
  const [length, setLength] = useState(30);
  const [width, setWidth] = useState(22);
  const [height, setHeight] = useState(12);
  const [weight, setWeight] = useState(1.9);

  const [sceneReady, setSceneReady] = useState(false);
  const [booked, setBooked] = useState(false);

  // Quote calculation
  const q = useMemo(() => {
    return quote({
      l: length,
      w: width,
      h: height,
      kg: weight,
      from: fromCity,
      to: toCity,
      mode,
    });
  }, [length, width, height, weight, fromCity, toCity, mode]);

  // Reset booked when quote changes
  useEffect(() => {
    setBooked(false);
  }, [q.price]);

  // Price tween
  useEffect(() => {
    const el = priceTextRef.current;
    if (!el) return;

    const state = { val: 0 };
    const curText = el.textContent?.replace(/[^0-9]/g, "");
    if (curText) state.val = parseInt(curText, 10) || 0;

    const tween = gsap.to(state, {
      val: q.price,
      duration: 0.8,
      ease: "power3.out",
      onUpdate: () => {
        if (el) el.textContent = inr(Math.round(state.val));
      },
    });

    return () => {
      tween.kill();
    };
  }, [q.price]);

  // Mount 3D scene within 900px
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSceneReady(true);
          io.disconnect();
        }
      },
      { rootMargin: "900px" }
    );
    io.observe(el);

    const ctx = gsap.context(() => {
      // Heading lines rise
      const headingLines = el.querySelectorAll(".rates-heading .line-mask > span");
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

      // Stage clip-path scrub
      if (stagePanelRef.current) {
        gsap.fromTo(
          stagePanelRef.current,
          { clipPath: "inset(10% 10% 10% 10% round 28px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 28px)",
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 95%",
              end: "top 40%",
              scrub: true,
            },
          }
        );
      }

      // Panel steps rise
      const steps = el.querySelectorAll("[data-rates-step]");
      gsap.from(steps, {
        y: 30,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
        },
      });
    }, el);

    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, []);

  const swapCities = () => {
    setFromCity(toCity);
    setToCity(fromCity);
  };

  return (
    <section
      id="rates"
      ref={sectionRef}
      data-theme="dark"
      className="relative z-10 bg-ink text-ivory pt-[16vh] pb-[14vh] container-x"
    >
      <div className="mb-4">
        <span className="eyebrow text-ivory/50 block">09 — Rates</span>
      </div>

      <div className="rates-heading mb-12">
        <h2 className="wide text-[clamp(2.6rem,6.4vw,7rem)] leading-[0.92] tracking-tight">
          <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
            <span className="block">What will it cost?</span>
          </span>
          <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
            <span className="block text-accent wide-i">Ask the scale.</span>
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column (7 cols): Stage Panel */}
        <div className="lg:col-span-7 lg:sticky lg:top-[calc(var(--nav-h)+1rem)]">
          <div
            ref={stagePanelRef}
            className="relative bg-ivory text-ink dot-grid aspect-[4/3.4] rounded-[28px] overflow-hidden shadow-2xl p-6 flex flex-col justify-between"
          >
            {/* Floor Ellipse */}
            <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-3/5 h-16 bg-ink/15 rounded-full blur-xl pointer-events-none" />

            {/* Top row */}
            <div className="relative z-10 flex items-center justify-between font-mono text-xs">
              <span className="text-grey uppercase tracking-wider">Live · drag to turn</span>
              <span
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                  q.byVolume ? "bg-accent text-ink" : "bg-ink/10 text-ink"
                }`}
              >
                {q.byVolume ? "Billed by size" : "Billed by weight"}
              </span>
            </div>

            {/* 3D Scene */}
            <div className="absolute inset-0">
              {sceneReady && (
                <Suspense fallback={null}>
                  <RatesScene
                    config={{
                      l: length,
                      w: width,
                      h: height,
                      kg: weight,
                      byVolume: q.byVolume,
                    }}
                  />
                </Suspense>
              )}
            </div>

            {/* Bottom info */}
            <div className="relative z-10 font-mono text-xs text-ink/75 leading-relaxed">
              <div className="font-bold text-ink">
                {length} × {width} × {height} cm
              </div>
              <div>
                Volumetric {q.dim.toFixed(2)} kg · actual {weight.toFixed(1)} kg · {q.km} km
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Control Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Cities Select */}
          <div data-rates-step className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
            {/* From */}
            <div className="border border-ivory/20 bg-ink-soft rounded-xl p-3 focus-within:border-accent">
              <span className="font-mono text-[0.62rem] text-ivory/50 uppercase block mb-1">
                From
              </span>
              <select
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value as CityId)}
                className="w-full bg-transparent wide text-[1.15rem] text-ivory focus:outline-none cursor-pointer"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id} className="bg-ink text-ivory">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={swapCities}
              className="h-10 w-10 rounded-full border border-ivory/20 hover:border-accent text-ivory hover:text-accent flex items-center justify-center transition-colors shrink-0"
              title="Swap origin and destination"
              aria-label="Swap origin and destination"
            >
              ⇄
            </button>

            {/* To */}
            <div className="border border-ivory/20 bg-ink-soft rounded-xl p-3 focus-within:border-accent">
              <span className="font-mono text-[0.62rem] text-ivory/50 uppercase block mb-1">
                To
              </span>
              <select
                value={toCity}
                onChange={(e) => setToCity(e.target.value as CityId)}
                className="w-full bg-transparent wide text-[1.15rem] text-ivory focus:outline-none cursor-pointer"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id} className="bg-ink text-ivory">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mode Radiogroup */}
          <div
            data-rates-step
            className="grid grid-cols-2 gap-3 p-1.5 bg-ink-soft border border-ivory/15 rounded-xl"
            role="radiogroup"
            aria-label="Service"
          >
            <button
              type="button"
              role="radio"
              aria-checked={mode === "express"}
              onClick={() => setMode("express")}
              className={`p-3 rounded-lg text-left transition-all ${
                mode === "express"
                  ? "bg-ivory text-ink shadow-md"
                  : "text-ivory hover:text-accent"
              }`}
            >
              <div className="font-semibold text-sm">Express</div>
              <div className="font-mono text-[0.65rem] opacity-70">Flown overnight</div>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={mode === "surface"}
              onClick={() => setMode("surface")}
              className={`p-3 rounded-lg text-left transition-all ${
                mode === "surface"
                  ? "bg-ivory text-ink shadow-md"
                  : "text-ivory hover:text-accent"
              }`}
            >
              <div className="font-semibold text-sm">Surface</div>
              <div className="font-mono text-[0.65rem] opacity-70">By road & rail · cheapest</div>
            </button>
          </div>

          {/* 4 Sliders */}
          <div data-rates-step className="space-y-4 bg-ink-soft border border-ivory/15 rounded-2xl p-5">
            {/* Length */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-mono text-xs text-ivory/60">Length</span>
                <span className="wide text-[1.4rem] tabular-nums text-ivory">
                  {length} <span className="text-xs font-mono font-normal">cm</span>
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                step={1}
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value, 10))}
                className="dak-range"
                data-cursor="drag"
                style={{ "--fill": `${((length - 10) / (80 - 10)) * 100}%` } as any}
              />
            </div>

            {/* Width */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-mono text-xs text-ivory/60">Width</span>
                <span className="wide text-[1.4rem] tabular-nums text-ivory">
                  {width} <span className="text-xs font-mono font-normal">cm</span>
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={1}
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value, 10))}
                className="dak-range"
                data-cursor="drag"
                style={{ "--fill": `${((width - 10) / (60 - 10)) * 100}%` } as any}
              />
            </div>

            {/* Height */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-mono text-xs text-ivory/60">Height</span>
                <span className="wide text-[1.4rem] tabular-nums text-ivory">
                  {height} <span className="text-xs font-mono font-normal">cm</span>
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={1}
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value, 10))}
                className="dak-range"
                data-cursor="drag"
                style={{ "--fill": `${((height - 5) / (60 - 5)) * 100}%` } as any}
              />
            </div>

            {/* Weight */}
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-mono text-xs text-ivory/60">Weight</span>
                <span className="wide text-[1.4rem] tabular-nums text-ivory">
                  {weight.toFixed(1)} <span className="text-xs font-mono font-normal">kg</span>
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={30}
                step={0.1}
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                className="dak-range"
                data-cursor="drag"
                style={{ "--fill": `${((weight - 0.5) / (30 - 0.5)) * 100}%` } as any}
              />
            </div>
          </div>

          {/* Quote Card */}
          <div
            data-rates-step
            className="border border-ivory/15 bg-ivory/[0.04] rounded-2xl p-6 flex flex-col gap-4 shadow-xl"
          >
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-xs text-ivory/70 uppercase tracking-wider">
                {zoneName[q.zone]} · {mode}
              </span>
              <span className="font-mono text-xs text-accent">{q.eta}</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span
                ref={priceTextRef}
                className="wide text-[clamp(2.4rem,4vw,3.4rem)] text-accent tabular-nums leading-none"
              >
                {inr(q.price)}
              </span>
            </div>

            <p className="font-mono text-xs text-ivory/70 leading-relaxed border-t border-ivory/10 pt-3">
              Billed on {q.charge.toFixed(1)} kg — the higher of actual weight and volumetric weight (L × W × H in cm ÷ 5000), in 0.5 kg slabs.{" "}
              <span className="text-ivory">
                {q.byVolume
                  ? "Light but bulky? A smaller box would save you money."
                  : "Pack snug and you'll never pay to ship air."}
              </span>
            </p>

            <div className="pt-2 flex flex-col gap-3">
              <Magnetic>
                <button
                  type="button"
                  onClick={() => setBooked(true)}
                  className={`w-full py-4 rounded-full font-semibold text-sm transition-all duration-300 shadow-md ${
                    booked
                      ? "bg-ok text-white cursor-default"
                      : "bg-accent hover:bg-accent-deep text-ink cursor-pointer"
                  }`}
                  data-cursor="cta"
                >
                  {booked ? "Pickup booked ✓" : "Book this pickup →"}
                </button>
              </Magnetic>

              <div className="font-mono text-[0.65rem] text-ivory/40 text-center">
                Fuel surcharge and GST included · insured up to ₹5,000
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
