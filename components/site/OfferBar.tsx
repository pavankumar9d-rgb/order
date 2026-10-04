"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { onIntroDone } from "./Intro";
import { Mark } from "./Logo";

export default function OfferBar() {
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("pavan-offer-closed")) return;

    setClosed(false);
    onIntroDone(() => {
      setTimeout(() => {
        setVisible(true);
      }, 1600);
    });
  }, []);

  if (closed) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText("FIRSTPAVAN");
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1600);
  };

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem("pavan-offer-closed", "true");
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-[600px] transition-transform duration-700 [transition-timing-function:var(--ease-expo)] ${
        visible ? "translate-y-0" : "translate-y-[140%]"
      }`}
    >
      <div className="bg-ivory/95 backdrop-blur-md border border-ink/10 rounded-full px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3 text-ink">
        {/* Left icon & text */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-8 w-8 rounded-full bg-ink flex items-center justify-center shrink-0">
            <Mark className="h-4.5 w-auto text-accent" cut="#101216" />
          </div>
          <span className="text-xs font-medium truncate">
            First pickup free <span className="hidden sm:inline text-ink/60">— anywhere in India, up to 2 kg</span>
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="border border-dashed border-ink/40 hover:border-accent hover:text-accent font-mono text-[0.65rem] font-bold px-2 py-1 rounded transition-colors"
            title="Click to copy code"
          >
            {copied ? "Copied ✓" : "FIRSTPAVAN"}
          </button>

          <Link
            href="#rates"
            className="bg-ink hover:bg-accent text-ivory text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            Book
          </Link>

          <button
            type="button"
            onClick={handleClose}
            className="h-6 w-6 rounded-full flex items-center justify-center text-ink/50 hover:text-ink transition-colors ml-1"
            aria-label="Dismiss offer"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
