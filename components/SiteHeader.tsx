"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "ჩვენ შესახებ", href: "#story" },
  { label: "მეცნიერება", href: "#science" },
  { label: "შეიძინე", href: "#shop" },
  { label: "კონტაქტი", href: "#footer" },
];

export default function SiteHeader() {
  const [dismissed, setDismissed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* 1 — ANNOUNCEMENT BAR */}
      {!dismissed && (
        <div className="relative flex h-10 items-center justify-center bg-oxblood px-10 text-center">
          <p className="font-body text-[13px] font-light tracking-[0.04em] text-cream-soft">
            უფასო მიწოდება თბილისში · ყველა შეკვეთაზე
          </p>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="დახურვა"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-cream-soft/70 transition-colors hover:text-cream-soft"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}

      {/* 2 — NAVIGATION */}
      <nav
        className={`sticky top-0 z-40 bg-cream/95 backdrop-blur-sm transition-shadow duration-300 ${
          scrolled ? "shadow-[0_4px_24px_-12px_rgba(61,51,53,0.3)]" : ""
        }`}
      >
        <div className="relative mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 py-4 sm:px-10">
          {/* left links (desktop) */}
          <div className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-body text-[13px] font-normal uppercase tracking-[0.1em] text-ink transition-colors hover:text-oxblood"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* centered logo */}
          <a
            href="#"
            className="absolute left-1/2 -translate-x-1/2 font-display text-2xl font-normal tracking-[0.3em] text-oxblood"
          >
            THAMRA
          </a>

          {/* right actions */}
          <div className="ml-auto flex items-center gap-5">
            <a
              href="#shop"
              className="font-body text-[12px] font-normal uppercase tracking-[0.15em] text-oxblood transition-colors duration-300 hover:text-oxblood-dark"
            >
              რეგისტრაცია
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
