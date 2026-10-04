"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export function useMediaQuery(query: string, initial = false): boolean {
  const [matches, setMatches] = useState(initial);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)", false);
}

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)", false);
}

export function useIsTouch(): boolean {
  return useMediaQuery("(hover: none), (pointer: coarse)", false);
}

export function useQualityTier(): 0 | 1 | 2 {
  const [tier, setTier] = useState<0 | 1 | 2>(1);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const nav = navigator as any;
    const cores = nav.hardwareConcurrency || 4;
    const mem = nav.deviceMemory || 4;
    const dpr = window.devicePixelRatio || 1;

    if (isMobile || cores <= 4 || mem <= 4) {
      setTier(0);
    } else if (cores >= 8 && mem >= 8 && dpr <= 2) {
      setTier(2);
    } else {
      setTier(1);
    }
  }, []);

  return tier;
}

export function useInView(
  ref: React.RefObject<Element | null>,
  options: { rootMargin?: string; threshold?: number | number[]; once?: boolean } = {}
): boolean {
  const { rootMargin = "0px 0px -10% 0px", threshold = 0.1, once = false } = options;
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsInView(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold, once]);

  return isInView;
}

export function usePointer(): React.RefObject<{ x: number; y: number }> {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onMove = (e: MouseEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return pointer;
}

export function useLatest<T>(value: T): React.RefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

export function useEvent<T extends (...args: any[]) => any>(handler: T): T {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });
  return useCallback(((...args: any[]) => handlerRef.current(...args)) as T, []);
}
