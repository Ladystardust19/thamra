"use client";

import { useEffect, useRef } from "react";

const CARDS = [
  {
    problem: "ჰორმონალური ცვლილებები",
    complex: "Hormonal Balance Support™",
    desc: "მენოპაუზის პერიოდში ფოლიკულის მგრძნობელობისა და თმის სიმკვრივის მხარდაჭერა.",
  },
  {
    problem: "თმის კვებითი საჭიროება",
    complex: "Follicle Nutrition Matrix™",
    desc: "თმისთვის მნიშვნელოვანი საკვები ნივთიერებების გააზრებული ყოველდღიური მხარდაჭერა.",
  },
  {
    problem: "ფიზიოლოგიური დატვირთვა",
    complex: "Inner Balance Complex™",
    desc: "ორგანიზმის შიდა ბალანსის მხარდაჭერა იმ პერიოდში, როდესაც ჰორმონალური ცვლილებები თმის ციკლზეც აისახება.",
  },
  {
    problem: "სკალპის გარემოს ბალანსი",
    complex: "Scalp Vitality Complex™",
    desc: "თავის კანის გარემოს მხარდაჭერა — იქ, სადაც თმის ზრდა იწყება.",
  },
  {
    problem: "ბიოშეღწევადობის მხარდაჭერა",
    complex: "BioAbsorb Technology™",
    desc: "ფორმულა აერთიანებს შერჩეულ კომპონენტებს, რომლებიც ხელს უწყობს თმისთვის მნიშვნელოვანი საკვები ნივთიერებების უკეთეს ათვისებას.",
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
<h2 className="ia-headline">ხუთი მიზნობრივი კომპლექსი ერთ კოვზში.</h2>
        </div>

        {/* ── CARD GRID ── */}
        <div className="ia-grid">
          {CARDS.map((card, i) => (
            <div
              key={card.complex}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="ia-card"
            >
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
