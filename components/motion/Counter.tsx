"use client";

import React, { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";

interface CounterProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  locale?: string;
  className?: string;
}

export default function Counter({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  locale = "en-IN",
  className = "",
}: CounterProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const formatNumber = (n: number) => {
      return (
        prefix +
        n.toLocaleString(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) +
        suffix
      );
    };

    if (prefersReduced) {
      el.textContent = formatNumber(value);
      return;
    }

    el.textContent = formatNumber(0);
    const state = { v: 0 };

    const tween = gsap.to(state, {
      v: value,
      duration: 1.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true,
      },
      onUpdate: () => {
        if (el) el.textContent = formatNumber(state.v);
      },
    });

    return () => {
      tween.kill();
    };
  }, [value, decimals, suffix, prefix, locale, prefersReduced]);

  return <span ref={spanRef} className={className} />;
}
