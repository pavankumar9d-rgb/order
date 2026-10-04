"use client";

import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";

export default function Cursor() {
  const prefersReduced = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const [mode, setMode] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [isFine, setIsFine] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || prefersReduced) return;

    const fineQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsFine(fineQuery.matches);
    const fineListener = (e: MediaQueryListEvent) => setIsFine(e.matches);
    fineQuery.addEventListener("change", fineListener);

    if (!fineQuery.matches) return () => fineQuery.removeEventListener("change", fineListener);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let reqId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      const target = (e.target as HTMLElement)?.closest("[data-cursor]");
      const cursorAttr = target?.getAttribute("data-cursor") || null;
      setMode(cursorAttr);
    };

    const onMouseEnter = () => setVisible(true);
    const onMouseLeave = () => setVisible(false);

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);

    const loop = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      reqId = requestAnimationFrame(loop);
    };

    reqId = requestAnimationFrame(loop);

    return () => {
      fineQuery.removeEventListener("change", fineListener);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(reqId);
    };
  }, [prefersReduced]);

  if (prefersReduced || !isFine) return null;

  let size = 32;
  let bg = "transparent";
  let border = "1px solid var(--color-ivory)";
  let mixBlend: any = "difference";
  let labelText = "";

  if (mode === "link") {
    size = 48;
  } else if (mode === "cta") {
    size = 64;
    bg = "rgba(243, 241, 236, 0.2)";
  } else if (mode === "view") {
    size = 80;
    bg = "var(--color-ivory)";
    border = "none";
    mixBlend = "normal";
    labelText = "View";
  } else if (mode === "drag") {
    size = 80;
    bg = "var(--color-ivory)";
    border = "none";
    mixBlend = "normal";
    labelText = "Drag";
  } else if (mode === "3d" || mode === "rotate") {
    size = 80;
    bg = "var(--color-ivory)";
    border = "none";
    mixBlend = "normal";
    labelText = "Rotate";
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      {/* 6px Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 h-[6px] w-[6px] rounded-full pointer-events-none will-change-transform"
        style={{
          backgroundColor: "#F5F3EE",
          mixBlendMode: "difference",
        }}
      />

      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full flex items-center justify-center pointer-events-none will-change-transform"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: bg,
          border: border,
          mixBlendMode: mixBlend,
          transition: "width 500ms var(--ease-expo), height 500ms var(--ease-expo), background-color 500ms var(--ease-expo), border 500ms var(--ease-expo)",
        }}
      >
        {labelText && (
          <span
            ref={labelRef}
            className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.15em] text-ink select-none"
          >
            {labelText}
          </span>
        )}
      </div>
    </div>
  );
}
