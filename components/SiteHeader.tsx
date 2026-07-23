"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "ჩვენ შესახებ", href: "/#about" },
  { label: "პროგრამები",   href: "/programs" },
  { label: "მეცნიერება",   href: "/#science" },
  { label: "კონტაქტი",     href: "/contact" },
  { label: "ჩემი ოთახი",    href: "/cabinet" },
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
  const links = NAV_LINKS;

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
            {links.map((l) => (
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
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="font-body text-[18px] font-normal uppercase tracking-[0.1em] text-ink py-3.5 border-b border-gold/10 last:border-0 hover:text-oxblood transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
