"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ScrollTrigger } from "@/lib/gsap";
import Logo from "@/components/site/Logo";
import { nav, brand, services } from "@/data/site";
import { cn, pad } from "@/lib/utils";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // ScrollTriggers for [data-theme='dark'] sections
    const triggers: ScrollTrigger[] = [];
    const darkSections = document.querySelectorAll<HTMLElement>("[data-theme='dark']");

    darkSections.forEach((sec) => {
      const st = ScrollTrigger.create({
        trigger: sec,
        start: "top 44px",
        end: "bottom 44px",
        refreshPriority: -1,
        onEnter: () => setIsDark(true),
        onEnterBack: () => setIsDark(true),
        onLeave: () => {
          // Check if any other dark section is active
          const anyDark = Array.from(darkSections).some((s) => {
            const r = s.getBoundingClientRect();
            return r.top <= 44 && r.bottom >= 44;
          });
          setIsDark(anyDark);
        },
        onLeaveBack: () => {
          const anyDark = Array.from(darkSections).some((s) => {
            const r = s.getBoundingClientRect();
            return r.top <= 44 && r.bottom >= 44;
          });
          setIsDark(anyDark);
        },
      });
      triggers.push(st);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
      triggers.forEach((t) => t.kill());
    };
  }, [menuOpen]);

  // Lock scroll when menu open
  useEffect(() => {
    if (menuOpen) {
      document.documentElement.classList.add("lenis-stopped");
      if (window.__lenis) window.__lenis.stop();
    } else {
      document.documentElement.classList.remove("lenis-stopped");
      if (window.__lenis) window.__lenis.start();
    }
  }, [menuOpen]);

  const activeDark = isDark || menuOpen;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 w-full z-50 transition-all duration-700 [transition-timing-function:var(--ease-expo)] flex items-center justify-between container-x",
          scrolled ? "h-16" : "h-[var(--nav-h)]",
          activeDark ? "text-ivory" : "text-ink"
        )}
      >
        {/* Left: Logo */}
        <Link
          href="#story"
          className="inline-flex items-center gap-2 focus-visible:outline-accent"
          onClick={() => setMenuOpen(false)}
        >
          <Logo compact={scrolled} cut={activeDark ? "#101216" : "var(--color-ivory)"} />
        </Link>

        {/* Right: Track Pill & Menu Button */}
        <div className="flex items-center gap-3">
          <Link
            href="#track"
            className={cn(
              "hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-full border font-mono font-bold text-[0.68rem] uppercase tracking-wider transition-colors",
              activeDark
                ? "border-ivory/20 hover:border-ivory text-ivory"
                : "border-ink/20 hover:border-ink text-ink"
            )}
            data-cursor="link"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Track</span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              "h-10 px-5 rounded-full font-semibold text-[0.8rem] transition-colors flex items-center gap-2.5",
              activeDark
                ? "bg-ivory text-ink hover:bg-white"
                : "bg-ink text-ivory hover:bg-accent"
            )}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            data-cursor="link"
          >
            <div className="relative w-3.5 h-3 flex flex-col justify-between">
              <span
                className={cn(
                  "block w-full h-[2px] bg-current transition-transform duration-300 origin-center",
                  menuOpen ? "translate-y-[5px] rotate-45" : ""
                )}
              />
              <span
                className={cn(
                  "block w-full h-[2px] bg-current transition-transform duration-300 origin-center",
                  menuOpen ? "-translate-y-[5px] -rotate-45" : ""
                )}
              />
            </div>
            <span>{menuOpen ? "Close" : "Menu"}</span>
          </button>
        </div>
      </header>

      {/* Menu Overlay */}
      <div
        data-lenis-prevent
        className={cn(
          "fixed inset-0 z-45 bg-ink text-ivory dot-grid-light flex flex-col justify-between container-x pt-[calc(var(--nav-h)+2rem)] pb-12 transition-all duration-[900ms] [transition-timing-function:var(--ease-expo)]",
          menuOpen
            ? "[clip-path:inset(0)] opacity-100 pointer-events-auto"
            : "[clip-path:inset(0_0_100%_0)] opacity-0 pointer-events-none"
        )}
        aria-hidden={!menuOpen}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full items-end pb-8">
          {/* Left: Nav links */}
          <div className="md:col-span-7 flex flex-col gap-2">
            {nav.map((item, idx) => (
              <div key={idx} className="overflow-hidden">
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="group flex items-baseline gap-4 wide text-[clamp(2.2rem,6.2vw,5.4rem)] leading-[1.05] transition-colors hover:text-accent hover:wide-i"
                  style={{
                    transitionDelay: `${0.14 + 0.06 * idx}s`,
                  }}
                  data-cursor="link"
                >
                  <span className="font-mono text-xs md:text-sm text-ivory/40">
                    {pad(idx + 1)}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </div>
            ))}
          </div>

          {/* Right: Services & Contact */}
          <div className="md:col-span-5 md:border-l md:border-ivory/15 md:pl-10 flex flex-col justify-between h-full pt-4 md:pt-0">
            <div>
              <div className="eyebrow text-ivory/50 mb-6">Services</div>
              <div className="flex flex-col gap-5">
                {services.map((svc) => (
                  <Link
                    key={svc.id}
                    href="#services"
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-baseline justify-between border-b border-ivory/10 pb-3 hover:border-accent transition-colors"
                  >
                    <div>
                      <span className="font-medium text-base group-hover:text-accent transition-colors">
                        {svc.name}
                      </span>
                      <span className="font-mono text-xs text-ivory/50 ml-3">· {svc.eta}</span>
                    </div>
                    <span className="font-mono text-xs text-accent">from ₹{svc.from}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-ivory/15">
              <div className="font-mono text-xs text-ivory/60 mb-2">Pickups, 7 am – 9 pm</div>
              <a
                href={`tel:${brand.phone.replace(/\s+/g, "")}`}
                className="wide text-2xl md:text-3xl text-ivory hover:text-accent transition-colors"
              >
                {brand.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
