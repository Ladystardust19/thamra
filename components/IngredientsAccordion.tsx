"use client";

import { useEffect, useRef } from "react";

const S = { fill: "none", stroke: "#C9A96E", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const ICONS = [
  /* Hormonal Balance — sine wave suggesting hormonal rhythm */
  <svg key="h" viewBox="0 0 40 40" width="48" height="48" {...S}>
    <path d="M4 22 Q9 10 14 22 Q19 34 24 22 Q29 10 36 16" />
    <circle cx="36" cy="16" r="1.5" fill="#C9A96E" stroke="none" />
  </svg>,
  /* Follicle Nutrition — seedling / upward growth */
  <svg key="f" viewBox="0 0 40 40" width="48" height="48" {...S}>
    <line x1="20" y1="34" x2="20" y2="12" />
    <path d="M20 18 C20 18 12 14 10 8 C14 8 20 12 20 18Z" />
    <path d="M20 24 C20 24 28 20 30 14 C26 14 20 18 20 24Z" />
  </svg>,
  /* Inner Balance — two arcs mirroring each other */
  <svg key="i" viewBox="0 0 40 40" width="48" height="48" {...S}>
    <path d="M20 8 C20 8 10 14 10 20 S20 32 20 32" />
    <path d="M20 8 C20 8 30 14 30 20 S20 32 20 32" />
    <line x1="20" y1="8" x2="20" y2="32" strokeDasharray="2 3" strokeWidth={1} />
  </svg>,
  /* Scalp Vitality — droplet */
  <svg key="s" viewBox="0 0 40 40" width="48" height="48" {...S}>
    <path d="M20 7 C20 7 9 19 9 26 a11 11 0 0 0 22 0 C31 19 20 7 20 7Z" />
    <path d="M14.5 28 Q20 23 25.5 28" strokeWidth={1} opacity={0.6} />
  </svg>,
];

const CARDS = [
  {
    problem: "ჰორმონალური ცვლილებები",
    complex: "Hormonal Balance Support",
    desc: "მენოპაუზის პერიოდში თმის ბუნებრივი სიმკვრივის ზრუნვა.",
  },
  {
    problem: "თმის კვებითი საჭიროება",
    complex: "Follicle Nutrition Matrix",
    desc: "ფოლიკულის ყოველდღიური კვება შიგნიდან.",
  },
  {
    problem: "ფიზიოლოგიური დატვირთვა",
    complex: "Inner Balance Complex",
    desc: "სტრესისა და შინაგანი ბალანსის ზრუნვა.",
  },
  {
    problem: "სკალპის გარემოს ბალანსი",
    complex: "Scalp Vitality Complex",
    desc: "სკალპის ჯანსაღი გარემოს ზრუნვა.",
  },
];

export default function IngredientsAccordion() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    cardsRef.current.forEach((card) => {
      if (!card) return;
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const card = entry.target as HTMLDivElement;
          const idx = cardsRef.current.indexOf(card);
          card.style.transition = `opacity 0.6s ease ${idx * 80}ms, transform 0.6s ease ${idx * 80}ms`;
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
          observer.unobserve(card);
        });
      },
      { threshold: 0.15 }
    );

    cardsRef.current.forEach((card) => { if (card) observer.observe(card); });
    return () => observer.disconnect();
  }, []);

  return (
    <section className="ia-section">
      <div className="ia-container">

        {/* ── TOP ── */}
        <div className="ia-top">
<h2 className="ia-headline">
  <span style={{
    display: "block",
    fontFamily: "var(--font-cormorant), Georgia, serif",
    fontSize: "clamp(1.1rem, 1.8vw, 1.4rem)",
    fontWeight: 300,
    fontStyle: "italic",
    letterSpacing: "0.18em",
    color: "#C9A96E",
    marginBottom: "0.55em",
    textTransform: "none",
  }}>
    Thamra Hair Longevity Complex™
  </span>
  Thamra ერთდროულად მუშაობს იმ პროცესებზე, რომლებიც მენოპაუზის პერიოდში თმის ცვლილებებთან არის დაკავშირებული.
</h2>
        </div>

        {/* ── CARD GRID ── */}
        <div className="ia-grid">
          {CARDS.map((card, i) => (
            <div
              key={card.complex}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="ia-card"
            >
              <div className="ia-card-icon">{ICONS[i]}</div>
              <span className="ia-card-label">{card.problem}</span>
              <p className="ia-complex">{card.complex}</p>
              <p className="ia-card-desc">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* ── BOTTOM ── */}
        <div className="ia-bottom">
          <a href="/quiz" className="ia-cta">გაიგე რა სჭირდება შენს თმას →</a>
        </div>

      </div>
    </section>
  );
}
