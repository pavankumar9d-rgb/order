"use client";

import React, { useEffect, useRef, useState } from "react";
import type { StillKey } from "@/lib/story/pose";

interface StillProps {
  still: StillKey;
  alt: string;
  className?: string;
  imgClassName?: string;
}

export default function Still({ still, alt, className = "", imgClassName = "" }: StillProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let unmounted = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          import("@/lib/story/engine").then(({ getStill }) => {
            if (unmounted) return;
            getStill(still).then((url) => {
              if (!unmounted && url) {
                setSrc(url);
              }
            });
          });
        }
      },
      { rootMargin: "800px" }
    );

    observer.observe(el);

    return () => {
      unmounted = true;
      observer.disconnect();
    };
  }, [still]);

  return (
    <div ref={containerRef} className={`relative flex items-center justify-center ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`dak-still-in w-full h-full object-contain ${imgClassName}`}
        />
      ) : (
        <span role="img" aria-label={alt} className="block w-full h-full" />
      )}
    </div>
  );
}
