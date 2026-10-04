"use client";

import React, { useState } from "react";
import Link from "next/link";
import { brand, nav, services } from "@/data/site";
import { Mark } from "@/components/site/Logo";

export default function Footer() {
  const [booked, setBooked] = useState(false);
  const [pin, setPin] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBooked(true);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer
      data-theme="dark"
      className="bg-ink text-ivory dot-grid-light relative z-20 pt-24 pb-36 overflow-hidden"
    >
      <div className="container-x">
        {/* Top: Pickup Form */}
        <div className="max-w-4xl mb-24">
          <div className="eyebrow text-ivory/50 mb-3">Book a pickup</div>
          <h2 className="wide text-[clamp(1.8rem,3vw,2.8rem)] leading-[1.1] mb-8">
            We'll be at your door <span className="wide-i text-accent">within the hour.</span>
          </h2>

          <form
            id="pickup"
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-stretch border-b border-ivory/30 pb-3 gap-4"
          >
            {booked ? (
              <div className="flex-1 py-3 text-ok font-medium flex items-center gap-2">
                <span>Booked ✓</span>
                <span className="text-ivory/60 text-sm">— we'll text you in 5 minutes.</span>
              </div>
            ) : (
              <>
                <div className="flex-1 flex items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="6-digit PIN code"
                    className="w-full bg-transparent text-ivory placeholder:text-ivory/40 font-mono text-sm focus:outline-none"
                  />
                </div>

                <div className="hidden sm:block w-[1px] bg-ivory/20 self-stretch my-1" />

                <div className="flex-1 flex items-center">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Mobile number"
                    className="w-full bg-transparent text-ivory placeholder:text-ivory/40 font-mono text-sm focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-accent hover:bg-accent-deep text-ink font-semibold px-6 py-2.5 rounded-full text-sm transition-colors shrink-0"
                >
                  Book pickup
                </button>
              </>
            )}
          </form>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-20">
          <div>
            <div className="eyebrow text-ivory/40 mb-4">Explore</div>
            <ul className="space-y-2.5">
              {nav.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-sm text-ivory/70 hover:text-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="eyebrow text-ivory/40 mb-4">Services</div>
            <ul className="space-y-2.5">
              {services.map((svc) => (
                <li key={svc.id}>
                  <Link
                    href="#services"
                    className="text-sm text-ivory/70 hover:text-accent transition-colors block"
                  >
                    <span>{svc.name}</span>
                    <span className="text-ivory/40 text-xs ml-2">· {svc.eta}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-2">
            <div className="eyebrow text-ivory/40 mb-4">Help, 24 × 7</div>
            <div className="space-y-2">
              <a
                href={`tel:${brand.phone.replace(/\s+/g, "")}`}
                className="wide text-2xl md:text-3xl text-ivory hover:text-accent transition-colors block"
              >
                {brand.phone}
              </a>
              <p className="body-sm text-ivory/60 max-w-sm mt-3">
                Live dispatch desks operating 24 hours across Hyderabad, Delhi, Mumbai, Bengaluru and Chennai.
              </p>
            </div>
          </div>
        </div>

        {/* Giant Watermark Logo */}
        <div className="border-t border-ivory/10 pt-16 pb-12 flex items-center justify-between select-none pointer-events-none">
          <span className="wide text-[15vw] leading-none text-ivory/[0.06] tracking-tighter">
            {brand.wordmark}
          </span>
          <Mark className="h-[11vw] w-auto text-ivory/[0.06]" cut="#101216" />
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-ivory/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-ivory/50">
          <div>
            © {currentYear} {brand.name}. {brand.product}.
          </div>
          <div>Head office · {brand.hq} · 38 hubs across India</div>
        </div>
      </div>
    </footer>
  );
}
