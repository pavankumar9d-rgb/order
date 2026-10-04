"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (prefersReduced) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.2,
      wheelMultiplier: 1.0,
      autoRaf: true,
    });

    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    document.documentElement.classList.add("lenis");

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a[href^="#"]');
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href === "#") return;
      try {
        const el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.6 });
        }
      } catch (err) {
        // ignore invalid selector
      }
    };

    document.addEventListener("click", handleAnchorClick);

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);

    document.fonts?.ready?.then(() => {
      ScrollTrigger.refresh();
    });

    let prevWidth = window.innerWidth;
    let resizeTimeout: any = null;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const currentWidth = window.innerWidth;
        if (Math.abs(currentWidth - prevWidth) >= 2) {
          prevWidth = currentWidth;
          ScrollTrigger.refresh();
        }
      }, 250);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(refreshTimer);
      clearTimeout(resizeTimeout);
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("resize", handleResize);
      lenis.destroy();
      document.documentElement.classList.remove("lenis");
      window.__lenis = undefined;
    };
  }, [prefersReduced]);

  return <>{children}</>;
}
