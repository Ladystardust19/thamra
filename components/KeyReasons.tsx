"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const CAUSES = [
  {
    num: "01",
    title: "ჰორმონალური ცვლილებები",
    text: "მენოპაუზის პერიოდში ესტროგენის შემცირება თმის ფოლიკულზე მოქმედებს. შედეგად, თმა თანდათან თხელდება და კარგავს ბუნებრივ მოცულობას.",
  },
  {
    num: "02",
    title: "თმის ზრდის ციკლი",
    text: "მენოპაუზასთან დაკავშირებულმა ცვლილებებმა შეიძლება გავლენა მოახდინოს თმის ბუნებრივი ზრდისა და განახლების პროცესზე.",
  },
  {
    num: "03",
    title: "ჰორმონალური სტრესი",
    text: "მენოპაუზის პერიოდში ჰორმონალური ცვლილებები ორგანიზმში შიდა სტრესს ქმნის, რაც აისახება თმის ზრდის ციკლზე, სიმკვრივესა და ჯანსაღ იერზე.",
  },
  {
    num: "04",
    title: "მიკროელემენტების საჭიროება",
    text: "მენოპაუზის პერიოდში თმისთვის მნიშვნელოვანი მიკროელემენტების საჭიროება იცვლება. სწორედ ამიტომ, თმის სიჯანსაღის შენარჩუნება, ხშირად მხოლოდ კვებაზე დაყრდნობით რთულდება და უფრო ჭკვიანურ მიდგომას მოითხოვს.",
  },
  {
    num: "05",
    title: "სკალპის გარემოს ბალანსი",
    text: "მენოპაუზის პერიოდში ჰორმონალური ცვლილებები აისახება სკალპის გარემოს ბალანსზეც. სწორედ აქ იწყება თმის ზრდა, ამიტომ მასზე ზრუნვა მნიშვნელოვანია თმის სიმტკიცისა და იერის შენარჩუნებისთვის.",
  },
];

const AUTO_INTERVAL = 5000;

export default function KeyReasons() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % CAUSES.length);
    }, AUTO_INTERVAL);
  }, []);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const goTo = useCallback((i: number) => {
    setActive(i);
    startTimer();
  }, [startTimer]);

  const prev = () => goTo((active - 1 + CAUSES.length) % CAUSES.length);
  const next = () => goTo((active + 1) % CAUSES.length);

  return (
    <section className="kr-section" style={{ backgroundColor: "#F2EBE3" }}>
      <div className="kr-wrapper">

        {/* LEFT — sticky headline */}
        <div className="kr-left">
          <h2 className="kr-headline">
            რატომ იცვლება თმა მენოპაუზის დროს?
          </h2>
          <p className="kr-subtitle">
            მენოპაუზის პერიოდში, ერთდროულად ქალის სხეულში სხვადასხვა პროცესი მიმდინარეობს, რომელიც გავლენას ახდენს თმის სიმკვრივესა და სიჯანსაღეზე. ცალკე აღებული ინგრედიენტების მიღება არ არის საკმარისი ამ კომპლექსური პრობლემის გადასაჭრელად.
          </p>
          <a href="/quiz" className="key-reasons-cta" style={{ marginTop: 40 }}>
            გაიგე რა სჭირდება შენს თმას →
          </a>
        </div>

        {/* RIGHT — interactive slider */}
        <div className="kr-right">

          {/* Step tabs */}
          <div className="kr-tabs" role="tablist">
            {CAUSES.map((c, i) => (
              <button
                key={c.num}
                role="tab"
                aria-selected={i === active}
                onClick={() => goTo(i)}
                className={"kr-tab" + (i === active ? " kr-tab--active" : "")}
                aria-label={c.title}
              >
                {c.num}
              </button>
            ))}
          </div>

          {/* Slide */}
          <div
            className="kr-slide"
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
            }}
            role="tabpanel"
          >
            <div key={active} className="kr-slide-content">
              <span className="kr-num" aria-hidden="true">{CAUSES[active].num}</span>
              <h3 className="kr-title">{CAUSES[active].title}</h3>
              <p className="kr-desc">{CAUSES[active].text}</p>
            </div>
          </div>

          {/* Bottom nav */}
          <div className="kr-nav">
            <button onClick={prev} className="kr-nav-btn" aria-label="წინა">&#8592;</button>
            <div className="kr-progress-bar" role="progressbar" aria-valuenow={active + 1} aria-valuemax={CAUSES.length}>
              <div
                className="kr-progress-fill"
                style={{ width: `${((active + 1) / CAUSES.length) * 100}%` }}
              />
            </div>
            <button onClick={next} className="kr-nav-btn" aria-label="შემდეგი">&#8594;</button>
          </div>

        </div>
      </div>
    </section>
  );
}
