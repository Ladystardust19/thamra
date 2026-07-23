"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/*
 * Global site footer. Rendered once from the root layout so its links (and the
 * legally-required policy pages) are reachable from every public page. Hidden on
 * the full-screen quiz funnel and the internal admin / cabinet areas.
 */

const CONTAINER = "mx-auto w-full max-w-[1400px] px-6 sm:px-12";
const LABEL = "font-body text-[14px] font-normal uppercase tracking-[0.22em]";

const NAV_LINKS = [
  { l: "მთავარი", h: "/" },
  { l: "ჩვენ შესახებ", h: "/#about" },
  { l: "პროგრამები", h: "/programs" },
  { l: "ტესტი", h: "/quiz" },
];

const INFO_LINKS = [
  { l: "კონტაქტი", h: "/contact" },
  { l: "მიწოდება, გაუქმება და დაბრუნება", h: "/delivery-returns" },
  { l: "კონფიდენციალურობის პოლიტიკა", h: "/privacy" },
  { l: "წესები და პირობები", h: "/terms" },
];

export default function SiteFooter() {
  const pathname = usePathname();
  if (
    pathname === "/quiz" ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/cabinet")
  ) {
    return null;
  }

  const linkCls =
    "font-body text-[16px] font-light text-cream-soft/70 transition-colors hover:text-cream-soft";

  return (
    <footer id="footer" className="bg-oxblood text-cream-soft">
      <div className={`${CONTAINER} pt-[100px] pb-[60px]`}>
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-8">
          {/* nav */}
          <div>
            <h4 className={`${LABEL} text-cream-soft/70`}>ნავიგაცია</h4>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((x) => (
                <li key={x.l}>
                  <Link href={x.h} className={linkCls}>
                    {x.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* info / policies */}
          <div>
            <h4 className={`${LABEL} text-cream-soft/70`}>ინფორმაცია</h4>
            <ul className="mt-5 space-y-3">
              {INFO_LINKS.map((x) => (
                <li key={x.l}>
                  <Link href={x.h} className={linkCls}>
                    {x.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <h4 className={`${LABEL} text-cream-soft/70`}>კონტაქტი</h4>
            <ul className="mt-5 space-y-3">
              <li className="font-body text-[16px] font-light text-cream-soft">THAMRA</li>
              <li>
                <a href="tel:+995598511112" className={linkCls}>
                  +995 598 51 11 12
                </a>
              </li>
              <li>
                <a href="mailto:infothamra@gmail.com" className={linkCls}>
                  infothamra@gmail.com
                </a>
              </li>
              <li className="font-body text-[16px] font-light text-cream-soft/70">
                თბილისი, ვაჟა-ფშაველას გამზირი 41
              </li>
            </ul>
          </div>

          {/* social */}
          <div>
            <h4 className={`${LABEL} text-cream-soft/70`}>გამოგვყევი</h4>
            <div className="mt-5 flex gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61591199567325"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-soft/25 text-cream-soft/70 transition-colors hover:border-cream-soft hover:text-cream-soft"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M14.5 8.5h2V5.5h-2c-2 0-3.3 1.3-3.3 3.4v1.6H9v3h2.2v7h3v-7h2.1l.4-3h-2.5V9c0-.3.2-.5.6-.5z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-cream-soft/15 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-[13px] font-light tracking-[0.04em] text-cream-soft/70">
            © 2026 Thamra. ყველა უფლება დაცულია.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/privacy"
              className="font-body text-[13px] font-light tracking-[0.04em] text-cream-soft/70 transition-colors hover:text-cream-soft"
            >
              კონფიდენციალურობის პოლიტიკა
            </Link>
            <Link
              href="/terms"
              className="font-body text-[13px] font-light tracking-[0.04em] text-cream-soft/70 transition-colors hover:text-cream-soft"
            >
              წესები და პირობები
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
