"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "ჩვენ შესახებ", href: "#story" },
  { label: "მეცნიერება",   href: "#science" },
  { label: "ტესტი",         href: "/quiz" },
  { label: "კონტაქტი",     href: "#footer" },
  { label: "კაბინეტი",     href: "/cabinet" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  if (pathname === "/quiz") return null;

  const dark = scrolled || menuOpen || pathname?.startsWith("/cabinet");

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        className={`transition-all duration-500 ${
          dark
            ? "bg-cream/95 shadow-[0_4px_24px_-12px_rgba(61,51,53,0.25)] backdrop-blur-sm"
            : "bg-transparent"
        }`}
      >
        <div className="relative mx-auto flex w-full max-w-[1400px] items-center px-6 py-4 sm:px-12">

          {/* Desktop nav links */}
          <div className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`font-body text-[17px] font-normal uppercase tracking-[0.1em] transition-colors duration-500 ${
                  scrolled ? "text-ink hover:text-oxblood" : "text-cream-soft/90 hover:text-white"
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-4">
            {/* CTA — hidden on very small screens, shown sm+ */}
            <a
              href="/quiz"
              className={`hidden sm:inline-block font-body text-[13px] font-normal uppercase tracking-[0.15em] px-4 py-2.5 border transition-colors duration-500 ${
                dark
                  ? "border-oxblood text-oxblood hover:bg-oxblood hover:text-cream-soft"
                  : "border-cream-soft/70 text-cream-soft/90 hover:border-white hover:text-white"
              }`}
            >
              ტესტის გავლა
            </a>

            {/* Hamburger — mobile only */}
            <button
              className="flex lg:hidden flex-col justify-center items-center w-9 h-9 gap-[5px] shrink-0"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "მენიუს დახურვა" : "მენიუს გახსნა"}
            >
              <span className={`block w-6 h-[1.5px] transition-all duration-300 origin-center ${dark ? "bg-ink" : "bg-cream-soft"} ${menuOpen ? "translate-y-[6.5px] rotate-45" : ""}`} />
              <span className={`block w-6 h-[1.5px] transition-all duration-300 ${dark ? "bg-ink" : "bg-cream-soft"} ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block w-6 h-[1.5px] transition-all duration-300 origin-center ${dark ? "bg-ink" : "bg-cream-soft"} ${menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            menuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          } bg-cream/98 backdrop-blur-sm border-t border-gold/10`}
        >
          <div className="px-6 pb-6 pt-3 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="font-body text-[18px] font-normal uppercase tracking-[0.1em] text-ink py-3.5 border-b border-gold/10 last:border-0 hover:text-oxblood transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href="/quiz"
              onClick={() => setMenuOpen(false)}
              className="mt-4 block text-center font-body text-[14px] font-normal uppercase tracking-[0.15em] px-5 py-3.5 bg-oxblood text-cream-soft hover:bg-oxblood/80 transition-colors rounded-sm"
            >
              ტესტის გავლა
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
