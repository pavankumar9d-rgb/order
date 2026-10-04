"use client";

import React, { useRef, useState, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { reviews } from "@/data/site";
import Still from "@/components/site/Still";
import { pad } from "@/lib/utils";

export default function ReviewsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Heading lines rise
      const headingLines = el.querySelectorAll(".reviews-heading .line-mask > span");
      gsap.fromTo(
        headingLines,
        { yPercent: 110 },
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

      // Floating cards drift
      const floatCards = el.querySelectorAll<HTMLElement>("[data-floating-card]");
      floatCards.forEach((fc, i) => {
        const startY = 60 + 30 * i;
        const endY = -50 - 20 * i;
        const startRot = i === 0 ? -12 : 10;
        const endRot = i === 0 ? -5 : 4;

        gsap.fromTo(
          fc,
          { y: startY, rotate: startRot },
          {
            y: endY,
            rotate: endRot,
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

      // Carousel cards rise
      const cards = el.querySelectorAll<HTMLElement>("[data-review-card]");
      gsap.from(cards, {
        y: 60,
        opacity: 0,
        duration: 1.1,
        stagger: 0.07,
        ease: "expo.out",
        scrollTrigger: {
          trigger: el.querySelector("[data-carousel-wrap]"),
          start: "top 88%",
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const scrollToIndex = (idx: number) => {
    const targetIdx = Math.max(0, Math.min(reviews.length - 1, idx));
    setCurrentIndex(targetIdx);
    const container = carouselRef.current;
    if (container) {
      const card = container.children[targetIdx] as HTMLElement;
      if (card) {
        container.scrollTo({
          left: card.offsetLeft - container.offsetLeft,
          behavior: "smooth",
        });
      }
    }
  };

  const cardBgs = [
    "bg-paper text-ink",
    "bg-ink text-ivory",
    "bg-accent text-ink",
  ];

  const initialBgs = [
    "bg-cobalt text-ivory",
    "bg-accent text-ink",
    "bg-ink text-ivory",
  ];

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="relative z-10 bg-ivory text-ink pt-[10vh] pb-[16vh] overflow-hidden"
    >
      <div className="container-x relative">
        {/* Floating tinted cards top right on md+ */}
        <div className="hidden md:block absolute right-[var(--gutter)] top-0 pointer-events-none z-10">
          <div className="relative w-64 h-64">
            {/* Open still on #f6dccf */}
            <div
              data-floating-card
              className="absolute right-12 top-0 w-36 h-36 rounded-[1.2rem] p-3 shadow-xl flex items-center justify-center will-change-transform"
              style={{ backgroundColor: "#f6dccf" }}
            >
              <Still
                still="open"
                alt="Open parcel preview"
                className="w-full h-full"
              />
            </div>

            {/* Stamped still on #dfe3f3 */}
            <div
              data-floating-card
              className="absolute right-0 top-24 w-36 h-36 rounded-[1.2rem] p-3 shadow-xl flex items-center justify-center will-change-transform"
              style={{ backgroundColor: "#dfe3f3" }}
            >
              <Still
                still="stamped"
                alt="Delivered stamped parcel preview"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Eyebrow */}
        <div className="mb-4">
          <span className="eyebrow block">11 — Reviews</span>
        </div>

        {/* Heading Row (md sits 34vh lower) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mt-[34vh]">
          <div className="reviews-heading">
            <h2 className="wide text-[clamp(2.6rem,6.6vw,7rem)] leading-[0.92] tracking-tight">
              <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                <span className="block">Signed for,</span>
              </span>
              <span className="line-mask block pb-[0.16em] -mb-[0.1em]">
                <span className="block text-accent wide-i">happily.</span>
              </span>
            </h2>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-ink/60">
              {pad(currentIndex + 1)} / {pad(reviews.length)}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollToIndex(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="h-11 w-11 rounded-full border border-ink/20 flex items-center justify-center text-ink hover:bg-ink hover:text-ivory disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Previous review"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollToIndex(currentIndex + 1)}
                disabled={currentIndex === reviews.length - 1}
                className="h-11 w-11 rounded-full border border-ink/20 flex items-center justify-center text-ink hover:bg-ink hover:text-ivory disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Next review"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Snap Carousel */}
        <div data-carousel-wrap className="relative -mx-[var(--gutter)] px-[var(--gutter)]">
          <div
            ref={carouselRef}
            tabIndex={0}
            aria-label="Customer reviews"
            data-cursor="drag"
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory dak-no-scrollbar py-6 focus:outline-none"
          >
            {reviews.map((rev, idx) => {
              const bgClass = cardBgs[idx % cardBgs.length];
              const initBg = initialBgs[idx % initialBgs.length];
              const tilt = idx % 2 === 0 ? "rotate-[1.2deg]" : "-rotate-[1.2deg]";
              const initialLetter = rev.name.charAt(0);

              return (
                <div
                  key={idx}
                  data-review-card
                  className={`w-[min(86vw,430px)] shrink-0 rounded-[1.6rem] p-8 snap-start flex flex-col justify-between shadow-md transition-transform duration-300 hover:rotate-0 ${bgClass} ${tilt}`}
                >
                  <div>
                    {/* Stars and Index */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-1 text-accent" aria-label="5 out of 5">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <span key={s} className="text-base">★</span>
                        ))}
                      </div>
                      <span className="font-mono text-xs opacity-60">
                        {pad(idx + 1)}
                      </span>
                    </div>

                    {/* Quote in curly quotes */}
                    <blockquote className="semi text-[1.35rem] md:text-[1.5rem] leading-snug tracking-tight">
                      “{rev.quote}”
                    </blockquote>
                  </div>

                  {/* Author Row */}
                  <div className="flex items-center gap-3.5 mt-8 pt-6 border-t border-current/10">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${initBg}`}
                    >
                      {initialLetter}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{rev.name}</div>
                      <div className="font-mono text-xs opacity-60 mt-0.5">{rev.place}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
