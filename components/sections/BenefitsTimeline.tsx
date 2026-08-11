"use client";

import { useEffect, useRef, useState } from "react";

type Stage = { badge: string; title?: string; points: string[] };

// Product-page timeline copy. First stage carried over from the quiz result;
// the later stages use the approved month-based progression.
const STAGES: Stage[] = [
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
      "სავარცხელზე და ბალიშზე ნაკლებ ღერს ხედავ",
      "თმა უფრო სავსე, ჯანსაღი და მოვლილია",
    ],
  },
  {
    badge: "4–6 თვე",
    points: [
      "თმა ხდება უფრო სქელი და მოცულობითი",
      "ახალი თმა იზრდება უფრო სწრაფად",
      "თმის უფრო მტკიცე და გამძლეა",
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

// Product-page timeline modeled after Seed's "Benefits that build over time":
// a centered headline, then a two-column layout — the reused quiz-result
// timeline on the left, a media cluster on the right. Past/current stages read
// full-opacity; upcoming stages dim as you scroll (single IntersectionObserver).

export default function BenefitsTimeline() {
  const olRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState<Set<number>>(() => new Set());
  const [dimmed, setDimmed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const ol = olRef.current;
    if (!ol) return;
    const rows = Array.from(ol.children) as HTMLElement[];
    setDimmed(true);

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
      { rootMargin: "0px 0px -45% 0px", threshold: 0 },
    );
    rows.forEach((r) => obs.observe(r));
    return () => obs.disconnect();
  }, []);

  return (
    <section>
      {/* Headline block — centered */}
      <header className="text-center">
        <h2 className="mx-auto max-w-[20ch] font-display text-[28px] font-normal leading-[1.15] text-oxblood md:text-[40px]">
          THAMRA-ს განსხვავება:
          <br />
          ხილული შედეგი ეტაპობრივად
        </h2>
      </header>

      {/* Centered timeline */}
      <div className="mx-auto mt-12 max-w-[680px] md:mt-16">
        <ol ref={olRef} className="m-0 list-none p-0">
          {STAGES.map((s, i) => (
            <li
              key={s.badge}
              data-i={i}
              style={{ opacity: dimmed && !active.has(i) && i !== 0 ? 0.35 : 1 }}
              className={
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
                {s.title && (
                  <h3 className="font-display text-[19px] font-semibold leading-tight text-ink md:text-[22px]">
                    {s.title}
                  </h3>
                )}
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
    </section>
  );
}
