"use client";

import React, { useRef, useEffect } from "react";
import { useReducedMotion } from "@/lib/hooks";

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export default function Magnetic({ children, strength = 0.22, className = "" }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined" || prefersReduced) return;
    const el = ref.current;
    if (!el) return;

    const fineQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fineQuery.matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let reqId: number | null = null;
    let isHovered = false;

    const loop = () => {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;

      if (el) {
        el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      if (isHovered || Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        reqId = requestAnimationFrame(loop);
      } else {
        if (el) el.style.transform = "translate3d(0px, 0px, 0)";
        reqId = null;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      targetX = (e.clientX - centerX) * strength;
      targetY = (e.clientY - centerY) * strength;
      if (!reqId) {
        reqId = requestAnimationFrame(loop);
      }
    };

    const onMouseEnter = () => {
      isHovered = true;
      if (!reqId) reqId = requestAnimationFrame(loop);
    };

    const onMouseLeave = () => {
      isHovered = false;
      targetX = 0;
      targetY = 0;
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseenter", onMouseEnter);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseenter", onMouseEnter);
      el.removeEventListener("mouseleave", onMouseLeave);
      if (reqId) cancelAnimationFrame(reqId);
    };
  }, [strength, prefersReduced]);

  return (
    <div ref={ref} className={`inline-block will-change-transform ${className}`}>
      {children}
    </div>
  );
}
