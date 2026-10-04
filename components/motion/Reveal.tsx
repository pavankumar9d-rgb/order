"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children?: React.ReactNode;
  lines?: string;
  className?: string;
  delay?: number;
}

export default function Reveal({
  children,
  lines,
  className,
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) {
            setTimeout(() => {
              el.classList.add("is-in");
            }, delay * 1000);
          } else {
            el.classList.add("is-in");
          }
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  if (lines) {
    const splitLines = lines.split("\n");
    return (
      <div ref={ref} data-reveal className={cn(className)}>
        {splitLines.map((line, idx) => (
          <span key={idx} className="line-mask">
            <span style={{ transitionDelay: `${idx * 80}ms` }}>{line}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-reveal
      className={cn(className)}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
