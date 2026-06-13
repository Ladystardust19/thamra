"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "ჩვენ შესახებ", href: "#story" },
  { label: "მეცნიერება",   href: "#science" },
  { label: "შეიძინე",      href: "#shop" },
  { label: "კონტაქტი",     href: "#footer" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  if (pathname === "/quiz") return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">

      {/* 2 — NAVIGATION */}
      <nav
        className={`transition-all duration-500 ${
          scrolled
            ? "bg-cream/95 shadow-[0_4px_24px_-12px_rgba(61,51,53,0.25)] backdrop-blur-sm"
            : "bg-transparent"
        }`}
      >
        <div className="relative mx-auto flex w-full max-w-[1400px] items-center px-6 py-4 sm:px-12">

          {/* Left nav links */}
          <div className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`font-body text-[17px] font-normal uppercase tracking-[0.1em] transition-colors duration-500 ${
                  scrolled
                    ? "text-ink hover:text-oxblood"
                    : "text-cream-soft/90 hover:text-white"
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right action */}
          <div className="ml-auto flex items-center">
            <a
              href="#shop"
              className={`font-body text-[17px] font-normal uppercase tracking-[0.15em] transition-colors duration-500 ${
                scrolled
                  ? "text-oxblood hover:text-oxblood-dark"
                  : "text-cream-soft/90 hover:text-white"
              }`}
            >
              რეგისტრაცია
            </a>
          </div>

        </div>
      </nav>
    </header>
  );
}
