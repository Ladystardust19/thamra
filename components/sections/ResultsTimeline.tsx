"use client";

import { useEffect, useRef, useState } from "react";

// Results timeline: four stages of what to expect over time on a vertical rail
// (pure-CSS pseudo-element dot + connector). Scroll reveal is opacity-only and
// reversible, driven by a single IntersectionObserver — no animation library.

export type Stage = { badge: string; points: string[] };

// Approved body copy, verbatim. Each stage is a time window and its outcomes.
export const STAGES: Stage[] = [
  {
    badge: "1-2 კვირა",
    points: [
      "ძილი ღრმავდება, დილით უფრო მოსვენებული იღვიძებ.",
      "სხეული სტრესის რეჟიმიდან გამოდის.",
      "სწორედ აქედან იწყება ყველაფერი, რადგან თმა პირველი რეაგირებს სტრესზე და ბოლო აღდგება.",
    ],
  },
  {
    badge: "1–3 თვე",
    points: [
      "ყოველდღიური თმის ცვენა შესამჩნევად მცირდება",
      "სავარცხელზე და ბალიშზე ნაკლებ თმას ხედავ",
      "თმა უფრო სავსე, ჯანსაღი და მოვლილია",
    ],
  },
  {
    badge: "4–6 თვე",
    points: [
      "თმა ხდება უფრო სქელი და მოცულობითი",
      "ახალი ღერი იზრდება უფრო ძლიერი",
      "თმა უფრო ბზინვარე და ჯანსაღია",
    ],
  },
  {
    badge: "7+ თვე",
    points: [
      "გრძელდება ზრუნვა თმის ზრდასა და ჯანმრთელობაზე",
      "ფორმულა განაგრძობს მუშაობას ხუთივე მიზეზზე",
      "მიღწეული შედეგი ნარჩუნდება",
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
      <div className="mx-auto w-full max-w-[760px] px-6 py-20 md:py-28">
        <header className="text-center">
          <h2 className="mx-auto max-w-[18ch] font-display text-[28px] font-normal leading-[1.18] text-oxblood md:text-[40px]">
            THAMRA პირველივე კვირიდან იწყებს მუშაობას.
          </h2>
          <span className="mx-auto mt-6 block h-px w-10 bg-gold/50" aria-hidden />
        </header>

        <ol ref={olRef} className="mx-auto mt-14 max-w-[620px] list-none p-0 md:mt-20">
          {STAGES.map((s, i) => {
            // "on" once the row is active on scroll. Before the observer runs
            // (no-JS / reduced motion), dimmed is false → every stage renders
            // complete: filled nodes, gold rail, full-opacity copy.
            const on = !dimmed || active.has(i);
            const notLast = i < STAGES.length - 1;
            return (
              <li
                key={s.badge}
                data-i={i}
                className="relative grid grid-cols-[56px_1fr] gap-5 pb-16 last:pb-0 md:gap-8"
              >
                {/* Rail — positioned at row level so the line spans the whole gap
                    between nodes (into the bottom padding), giving one unbroken
                    rail rather than segments. */}
                {notLast && (
                  <>
                    <span
                      aria-hidden
                      className="absolute left-7 top-11 bottom-0 w-px -translate-x-1/2 bg-hairline"
                    />
                    {/* gold progress fill — grows downward once this stage is on */}
                    <span
                      aria-hidden
                      className={
                        "absolute left-7 top-11 bottom-0 w-px -translate-x-1/2 origin-top bg-gold transition-transform duration-700 ease-out " +
                        (on ? "scale-y-100" : "scale-y-0")
                      }
                    />
                  </>
                )}

                {/* Numbered milestone node */}
                <div className="flex justify-center">
                  <span
                    className={
                      "relative z-10 flex h-11 w-11 items-center justify-center rounded-full border font-display text-[15px] leading-none transition-colors duration-500 [font-variant-numeric:tabular-nums] " +
                      (on
                        ? "border-oxblood bg-oxblood text-cream-soft"
                        : "border-hairline bg-cream text-muted")
                    }
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Stage content — the time window is the header */}
                <div
                  className="pt-1 transition-opacity duration-300"
                  style={{ opacity: dimmed && !active.has(i) ? 0.5 : 1 }}
                >
                  <h3 className="font-display text-[24px] font-normal leading-[1.15] text-oxblood md:text-[30px]">
                    {s.badge}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {s.points.map((p) => (
                      <li
                        key={p}
                        className="flex gap-3 font-body text-[15px] font-light leading-[1.65] text-read md:text-[16px]"
                      >
                        <span
                          aria-hidden
                          className="mt-[9px] h-[5px] w-[5px] shrink-0 rounded-full bg-gold/70"
                        />
                        <span className="max-w-[52ch]">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
