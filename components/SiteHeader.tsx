"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type NavLink = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

const NAV_LINKS: NavLink[] = [
  { label: "ჩვენ შესახებ", href: "/about" },
  {
    label: "პროდუქტები",
    children: [
      { label: "მენოპაუზის თმის ფორმულა", href: "/product" },
      { label: "ნანო კოლაგენი", href: "/product/nano-collagen" },
    ],
  },
  { label: "პროგრამები",   href: "/programs" },
  { label: "კონსულტაცია",  href: "/consultation" },
  { label: "მეცნიერება",   href: "/#science" },
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

  // Pages with a light background at the very top (no dark hero) need the solid
  // header from the start, otherwise the light nav text is invisible.
  const solidHeader =
    pathname?.startsWith("/cabinet") || pathname?.startsWith("/product");
  const dark = scrolled || menuOpen || solidHeader;
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
            {links.map((l) =>
              l.children ? (
                <div key={l.label} className="group relative">
                  <button
                    type="button"
                    className={`flex items-center gap-1.5 font-body text-[17px] font-normal uppercase tracking-[0.1em] transition-colors duration-500 ${
                      dark ? "text-ink hover:text-oxblood" : "text-cream-soft/90 hover:text-white"
                    }`}
                  >
                    {l.label}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-300 group-hover:rotate-180"
                      aria-hidden
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  <div className="invisible absolute left-0 top-full pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="min-w-[240px] overflow-hidden rounded-md border border-gold/15 bg-cream/98 py-2 shadow-[0_12px_32px_-12px_rgba(61,51,53,0.35)] backdrop-blur-sm">
                      {l.children.map((c) => (
                        <a
                          key={c.href}
                          href={c.href}
                          className="block px-5 py-3 font-body text-[15px] font-normal uppercase tracking-[0.08em] text-ink transition-colors hover:bg-gold/5 hover:text-oxblood"
                        >
                          {c.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  className={`font-body text-[17px] font-normal uppercase tracking-[0.1em] transition-colors duration-500 ${
                    dark ? "text-ink hover:text-oxblood" : "text-cream-soft/90 hover:text-white"
                  }`}
                >
                  {l.label}
                </a>
              )
            )}
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
            {links.map((l) =>
              l.children ? (
                <div
                  key={l.label}
                  className="border-b border-gold/10 last:border-0 py-2"
                >
                  <span className="block font-body text-[13px] font-normal uppercase tracking-[0.2em] text-ink/50 py-2">
                    {l.label}
                  </span>
                  {l.children.map((c) => (
                    <a
                      key={c.href}
                      href={c.href}
                      onClick={() => setMenuOpen(false)}
                      className="block font-body text-[17px] font-normal uppercase tracking-[0.1em] text-ink py-3 pl-4 hover:text-oxblood transition-colors"
                    >
                      {c.label}
                    </a>
                  ))}
                </div>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-body text-[18px] font-normal uppercase tracking-[0.1em] text-ink py-3.5 border-b border-gold/10 last:border-0 hover:text-oxblood transition-colors"
                >
                  {l.label}
                </a>
              )
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
