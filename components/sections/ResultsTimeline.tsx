"use client";

import { useEffect, useRef, useState } from "react";

// Results timeline: four stages of what to expect over time on a vertical rail
// (pure-CSS pseudo-element dot + connector). Scroll reveal is opacity-only and
// reversible, driven by a single IntersectionObserver — no animation library.

export type Stage = { badge: string; title: string; points: string[] };

// Bullets are the approved body copy, split verbatim at sentence boundaries.
// Exported so the product-page timeline can reuse the same source of truth.
export const STAGES: Stage[] = [
  {
    badge: "1-2 კვირა",
    title: "მშვიდი ღამეები",
    points: [
      "ძილი ღრმავდება, დილით უფრო მოსვენებული იღვიძებ.",
      "სხეული სტრესის რეჟიმიდან გამოდის.",
      "სწორედ აქედან იწყება ყველაფერი, რადგან თმა პირველი რეაგირებს სტრესზე და ბოლო აღდგება.",
    ],
  },
  {
    badge: "4-8 კვირა",
    title: "ცვენა ნელდება",
    points: [
      "სავარცხელზე და ბალიშზე ნაკლებ თმას ხედავ.",
      "თმა უფრო სავსე და მოვლილი ჩანს.",
      "ეს პირველი ნიშანია, რომ ფესვი უკვე სხვა პირობებში მუშაობს.",
    ],
  },
  {
    badge: "3-4 თვე",
    title: "ახალი ღერი",
    points: [
      "საფეთქლებთან და გაყოფის ხაზზე ახალი, მოკლე ღერები ჩნდება.",
      "თმა უფრო მკვრივია შეხებით.",
      "ეს ის მომენტია, როდესაც სარკეში ყურება ხდება სასიამოვნო.",
    ],
  },
  {
    badge: "6+ თვე",
    title: "სიმკვრივე რჩება",
    points: [
      "თმა უფრო სქელი, ძლიერი და გამძლეა.",
      "ფორმულა აგრძელებს მუშაობას იმ ძირითად ბიოლოგიურ ფაქტორებზე, რომლებიც მენოპაუზის პერიოდში თმის ცვლილებას განაპირობებს.",
    ],
  },
];

export default function ResultsTimeline() {
  const olRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState<Set<number>>(() => new Set());
  // Stays false until the observer is running, so no-JS / reduced-motion render
  // every row fully opaque and readable.
  const [dimmed, setDimmed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return; // reduced motion: no observer, all rows stay opacity 1
    const ol = olRef.current;
    if (!ol) return;
    const rows = Array.from(ol.children) as HTMLElement[];
    setDimmed(true);

    // A row is active while it overlaps the top half of the viewport, i.e. once
    // its top edge crosses the 50% line. Reversible (no unobserve).
    const obs = new IntersectionObserver(
      (entries) => {
        setActive((prev) => {
          const next = new Set(prev);
          for (const e of entries) {
            const i = Number((e.target as HTMLElement).dataset.i);
            if (e.isIntersecting) next.add(i);
            else next.delete(i);
          }
          return next;
        });
      },
      { rootMargin: "0px 0px -50% 0px", threshold: 0 },
    );
    rows.forEach((r) => obs.observe(r));
    return () => obs.disconnect();
  }, []);

  return (
    <section className="bg-surface/40">
      <div className="mx-auto w-full max-w-[820px] px-6 py-20 md:py-28">
        <header className="text-center">
          <h2 className="mx-auto max-w-[16ch] font-display text-[28px] font-normal leading-[1.2] text-oxblood md:text-[40px]">
            THAMRA პირველივე კვირიდან იწყებს მუშაობას.
          </h2>
        </header>

        <div className="mt-10 rounded-2xl border border-champagne/25 bg-cream p-8 md:mt-14 md:p-12">
          <ol ref={olRef} className="m-0 list-none p-0">
            {STAGES.map((s, i) => (
              <li
                key={s.badge}
                data-i={i}
                style={{ opacity: dimmed && !active.has(i) ? 0.35 : 1 }}
                className={
                  // Rail via pseudo-elements: ::after = dot, ::before = connector.
                  // currentColor (oxblood) drives both; children set their own colors.
                  "relative pl-8 pb-12 text-oxblood transition-opacity duration-200 " +
                  "before:absolute before:left-0 before:top-[13px] before:-bottom-[13px] before:w-px before:bg-current before:content-[''] " +
                  "last:pb-0 last:before:content-none " +
                  "after:absolute after:-left-[3px] after:top-[13px] after:h-[7px] after:w-[7px] after:rounded-full after:bg-current after:content-['']"
                }
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="whitespace-nowrap rounded-full bg-champagne px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-oxblood">
                    {s.badge}
                  </span>
                  <h3 className="font-display text-[19px] font-semibold leading-tight text-ink md:text-[22px]">
                    {s.title}
                  </h3>
                </div>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 marker:text-champagne">
                  {s.points.map((p) => (
                    <li
                      key={p}
                      className="max-w-[60ch] font-body text-[15px] font-light leading-[1.7] text-read md:text-[16px]"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
