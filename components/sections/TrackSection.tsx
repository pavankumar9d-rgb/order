"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { hero, heroEvents, type TrackEvent } from "@/data/site";
import { CITY, svgProjector, outlinePath, arcPath, type CityCode } from "@/lib/map";
import { clamp } from "@/lib/utils";
import Still from "@/components/site/Still";

const HUBS: CityCode[] = [
  "HYD", "DEL", "BOM", "BLR", "MAA", "CCU", "NAG", "AMD", "JAI", "LKO", "IXC", "COK", "GAU", "BBI"
];

function fnv1a(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

type LookupResult = {
  isHero: boolean;
  from: CityCode;
  to: CityCode;
  done: number;
  events: TrackEvent[];
  eta: string;
  status: string;
};

function lookup(raw: string): LookupResult | null {
  const norm = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (norm.length < 6) return null;

  const heroNorm = hero.awb.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const heroShortNorm = hero.awbShort.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

  if (norm === heroNorm || norm === heroShortNorm || norm.includes("582910473361")) {
    return {
      isHero: true,
      from: "HYD",
      to: "DEL",
      done: 7,
      events: heroEvents,
      eta: "Delivered Tue 10:14 am",
      status: "Delivered",
    };
  }

  const h = fnv1a(norm);
  const fromIdx = h % 14;
  let toIdx = (h >>> 5) % 14;
  if (toIdx === fromIdx) toIdx = (toIdx + 3) % 14;

  const from = HUBS[fromIdx];
  const to = HUBS[toIdx];
  const done = 3 + ((h >>> 9) % 5); // 3 to 7

  const days = ["Mon", "Tue", "Wed"];
  const startMins = 9 * 60 + ((h >>> 12) % 360);
  const steps = [0, 95, 190, 420, 610, 890, 1110];

  const formatTime = (offsetMins: number) => {
    const total = startMins + offsetMins;
    const day = days[Math.floor(total / (24 * 60)) % 3];
    const hour24 = Math.floor((total % (24 * 60)) / 60);
    const mins = total % 60;
    const ampm = hour24 >= 12 ? "pm" : "am";
    const hour12 = hour24 % 12 || 12;
    return `${day} · ${hour12}:${mins < 10 ? "0" : ""}${mins} ${ampm}`;
  };

  const toName = CITY[to].name;
  const toWords = toName.split(" ");
  const lastWord = toWords[toWords.length - 1];

  const events: TrackEvent[] = [
    { status: "Booked", time: formatTime(steps[0]), place: `${CITY[from].name} branch`, note: "Pickup scheduled" },
    { status: "Picked up", time: formatTime(steps[1]), place: CITY[from].name, note: "Verified & sealed" },
    { status: "At hub", time: formatTime(steps[2]), place: `${CITY[from].name} hub`, note: "Weighed & sorted" },
    { status: "In transit", time: formatTime(steps[3]), place: `${from} → ${to}`, note: "On the overnight freighter" },
    { status: `${lastWord} hub`, time: formatTime(steps[4]), place: `${CITY[to].name} distribution centre`, note: "Outward scan" },
    { status: "Out for delivery", time: formatTime(steps[5]), place: `${CITY[to].name} city`, note: "With delivery rider" },
    { status: "Delivered", time: formatTime(steps[6]), place: CITY[to].name, note: "Handed over · OTP + photo proof" },
  ];

  const isDoneDelivered = done === 7;
  const status = isDoneDelivered ? "Delivered" : events[done - 1].status;
  const eta = isDoneDelivered ? `Delivered ${events[6].time}` : `Arriving ${events[6].time}`;

  return {
    isHero: false,
    from,
    to,
    done,
    events,
    eta,
    status,
  };
}

export default function TrackSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState<string>(hero.awb);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(() => lookup(hero.awb));
  const [runId, setRunId] = useState(0);

  const arcRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const res = lookup(query);
    if (!res) {
      setError(true);
      setResult(null);
    } else {
      setError(false);
      setResult(res);
      setRunId((r) => r + 1);
    }
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const headingLines = el.querySelectorAll(".track-heading .line-mask > span");
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
            start: "top 82%",
          },
        }
      );

      const card = el.querySelector("[data-tr-card]");
      if (card) {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        });
      }
    }, el);

    return () => ctx.revert();
  }, []);

  // Arc & dot animation whenever runId changes
  useEffect(() => {
    if (!result || !arcRef.current || !dotRef.current) return;

    const arc = arcRef.current;
    const dot = dotRef.current;
    const len = arc.getTotalLength();
    const along = clamp((result.done - 3) / 3, 0.02, 1);

    gsap.set(arc, { strokeDasharray: len, strokeDashoffset: len });

    const obj = { p: 0 };
    gsap.to(obj, {
      p: along,
      duration: 1.4,
      delay: 0.2,
      ease: "power2.inOut",
      onUpdate: () => {
        const currentLen = len * obj.p;
        arc.style.strokeDashoffset = `${len - currentLen}`;
        const pt = arc.getPointAtLength(currentLen);
        dot.setAttribute("cx", `${pt.x}`);
        dot.setAttribute("cy", `${pt.y}`);
      },
    });
  }, [runId, result]);

  const proj = svgProjector(360);
  const outPath = outlinePath(proj);

  return (
    <section
      id="track"
      ref={sectionRef}
      className="relative z-10 bg-ivory text-ink pt-[16vh] pb-[14vh] container-x"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="track-heading">
            <span className="eyebrow block mb-3">07 — Track</span>
            <h2 className="wide text-[clamp(2.4rem,4.4vw,5rem)] leading-[0.92] tracking-tight">
              <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                <span className="block">Where's my</span>
              </span>
              <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                <span className="block text-accent wide-i">parcel?</span>
              </span>
            </h2>
          </div>

          <p className="lede text-ink-soft max-w-md">
            Every scan, every hub, every turn of the van — live. Try our tracking number, or type any number to see how tracking reads.
          </p>

          {/* Form */}
          <form
            onSubmit={handleTrack}
            className="flex items-center bg-white/70 border border-ink/15 focus-within:border-ink rounded-full p-1.5 shadow-sm max-w-md transition-colors"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. PE 5829 1047 3361"
              spellCheck={false}
              autoComplete="off"
              className="flex-1 bg-transparent px-4 py-2 font-mono font-bold text-[0.95rem] tracking-[0.08em] uppercase text-ink focus:outline-none"
            />
            <button
              type="submit"
              className="bg-ink hover:bg-accent text-ivory font-semibold text-xs px-6 py-2.5 rounded-full transition-colors shrink-0"
              data-cursor="cta"
            >
              Track
            </button>
          </form>

          {/* Error or Prefill Link */}
          {error ? (
            <div className="text-accent text-xs font-mono">
              That doesn't look like a tracking number — try 12 digits.
            </div>
          ) : (
            <div className="text-xs text-ink/60 font-mono">
              Try:{" "}
              <button
                type="button"
                onClick={() => {
                  setQuery(hero.awb);
                  setResult(lookup(hero.awb));
                  setError(false);
                  setRunId((r) => r + 1);
                }}
                className="underline decoration-dotted hover:text-accent font-bold"
              >
                {hero.awb}
              </button>
            </div>
          )}

          {/* Quick Result Stats Tiles */}
          {result && (
            <div className="grid grid-cols-2 gap-3 max-w-md mt-4">
              <div className="bg-white/80 rounded-2xl p-4 border border-ink/10 shadow-sm">
                <span className="eyebrow block mb-1">Status</span>
                <span
                  className={`wide text-[1.35rem] leading-tight block ${
                    result.done === 7 ? "text-ok" : "text-accent"
                  }`}
                >
                  {result.status}
                </span>
              </div>

              <div className="bg-white/80 rounded-2xl p-4 border border-ink/10 shadow-sm">
                <span className="eyebrow block mb-1">Route</span>
                <span className="wide text-[1.35rem] leading-tight block text-ink">
                  {result.from} › {result.to}
                </span>
              </div>

              <div className="col-span-2 bg-white/80 rounded-2xl p-4 border border-ink/10 shadow-sm">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-mono text-xs font-semibold text-ink">{result.eta}</span>
                  <span className="font-mono text-xs text-ink/50">
                    {Math.round((result.done / 7) * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-ink/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-1000 [transition-timing-function:var(--ease-expo)]"
                    style={{ width: `${(result.done / 7) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Tracking Card */}
        <div
          data-tr-card
          className="lg:col-span-7 bg-white rounded-[1.6rem] p-6 md:p-8 shadow-2xl border border-ink/5"
        >
          {result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Map Column */}
              <div className="flex flex-col gap-3">
                <div className="relative bg-ivory rounded-2xl p-4 overflow-hidden aspect-square flex items-center justify-center">
                  <svg viewBox={`0 0 ${proj.W} ${proj.H}`} className="w-full h-full">
                    <defs>
                      <pattern id="dotPattern" width="7" height="7" patternUnits="userSpaceOnUse">
                        <circle cx="3.5" cy="3.5" r="1.5" fill="rgba(16,18,22,0.28)" />
                      </pattern>
                      <clipPath id="indiaOutlineClip">
                        <path d={outPath} clipRule="evenodd" />
                      </clipPath>
                    </defs>

                    {/* Halftone dots clipped to outline */}
                    <rect
                      width={proj.W}
                      height={proj.H}
                      fill="url(#dotPattern)"
                      clipPath="url(#indiaOutlineClip)"
                    />

                    {/* Outline */}
                    <path
                      d={outPath}
                      fill="none"
                      stroke="var(--color-ink)"
                      strokeWidth="1.2"
                      opacity="0.25"
                    />

                    {/* Faint dashed arc */}
                    <path
                      d={arcPath(result.from, result.to, proj)}
                      fill="none"
                      stroke="var(--color-ink)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      opacity="0.3"
                    />

                    {/* Accent drawn route arc */}
                    <path
                      ref={arcRef}
                      d={arcPath(result.from, result.to, proj)}
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    />

                    {/* Moving Dot */}
                    <circle
                      ref={dotRef}
                      r="4.5"
                      fill="var(--color-accent)"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Origin Pin */}
                    <circle
                      cx={proj.x(CITY[result.from].lon)}
                      cy={proj.y(CITY[result.from].lat)}
                      r="4"
                      fill="var(--color-ink)"
                    />
                    <circle
                      cx={proj.x(CITY[result.from].lon)}
                      cy={proj.y(CITY[result.from].lat)}
                      r="1.8"
                      fill="var(--color-ivory)"
                    />
                    <text
                      x={proj.x(CITY[result.from].lon) + 7}
                      y={proj.y(CITY[result.from].lat) + 3}
                      fill="var(--color-ink)"
                      className="font-mono font-bold text-[9px]"
                    >
                      {result.from}
                    </text>

                    {/* Dest Pin */}
                    <circle
                      cx={proj.x(CITY[result.to].lon)}
                      cy={proj.y(CITY[result.to].lat)}
                      r="4"
                      fill="var(--color-ink)"
                    />
                    <circle
                      cx={proj.x(CITY[result.to].lon)}
                      cy={proj.y(CITY[result.to].lat)}
                      r="1.8"
                      fill="var(--color-ivory)"
                    />
                    <text
                      x={proj.x(CITY[result.to].lon) + 7}
                      y={proj.y(CITY[result.to].lat) + 3}
                      fill="var(--color-ink)"
                      className="font-mono font-bold text-[9px]"
                    >
                      {result.to}
                    </text>
                  </svg>
                </div>
                <div className="font-mono text-[0.68rem] text-ink/50 text-center">
                  Live freight corridor: {CITY[result.from].name} to {CITY[result.to].name}
                </div>
              </div>

              {/* Journey Events Column */}
              <div className="flex flex-col gap-4">
                <div className="flex items-baseline justify-between border-b border-ink/10 pb-3">
                  <span className="font-display font-bold text-sm text-ink">Journey</span>
                  <span className="font-mono text-xs text-grey">{query}</span>
                </div>

                <div className="relative pl-6 space-y-6">
                  {/* Track Rails */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-ink/10" />
                  <div
                    className={`absolute left-[7px] top-2 w-[2px] transition-all duration-700 origin-top ${
                      result.done === 7 ? "bg-ok" : "bg-accent"
                    }`}
                    style={{
                      height: `calc(${(Math.max(0, result.done - 1) / 6) * 100}% - 4px)`,
                    }}
                  />

                  {result.events.map((evt, idx) => {
                    const isDone = idx < result.done;
                    const isCurrent = idx === result.done - 1;

                    return (
                      <div
                        key={idx}
                        className={`relative transition-opacity duration-300 ${
                          isDone ? "opacity-100" : "opacity-40"
                        }`}
                      >
                        {/* Dot */}
                        <div
                          className={`absolute -left-[23px] top-1 h-[14px] w-[14px] rounded-full border-2 border-white flex items-center justify-center transition-colors ${
                            isDone
                              ? result.done === 7
                                ? "bg-ok"
                                : "bg-accent"
                              : "bg-paper border-ink/20"
                          }`}
                        >
                          {isCurrent && result.done < 7 && (
                            <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
                          )}
                        </div>

                        <div className="flex items-baseline justify-between">
                          <span className="font-semibold text-sm text-ink">{evt.status}</span>
                          <span className="font-mono text-[0.7rem] text-grey">{evt.time}</span>
                        </div>
                        <div className="font-mono text-xs text-ink-soft mt-0.5">
                          {evt.place} · {evt.note}
                        </div>

                        {/* Photo proof for hero delivered */}
                        {result.isHero && idx === 6 && (
                          <div className="mt-3 p-3 bg-paper/60 rounded-xl flex items-center gap-3 border border-ink/5">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-ivory shrink-0">
                              <Still
                                still="door"
                                alt="Proof of delivery: parcel on doormat"
                                imgClassName="object-cover w-full h-full"
                              />
                            </div>
                            <div>
                              <div className="font-mono text-[0.68rem] font-bold text-ink">
                                Photo proof · 10:14:32
                              </div>
                              <div className="font-mono text-[0.62rem] text-grey">
                                Flat 4B, B-14, Hauz Khas
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
