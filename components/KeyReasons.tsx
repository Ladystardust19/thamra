"use client";

import { useEffect, useRef } from "react";

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
    text: "მენოპაუზის პერიოდში ჰორმონალური ცვლილებები აისახება სკალპის გარემოს ბალანსზეც. სწორედ აქ იწყება თმის ზრდა, ამიტომ მისი მხარდაჭერა მნიშვნელოვანია თმის სიმტკიცისა და იერის შენარჩუნებისთვის.",
  },
];

export default function KeyReasons() {
  const blocksRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) return;

    blocksRef.current.forEach((b) => {
      if (!b) return;
      b.style.opacity = "0";
      b.style.transform = "translateY(15px)";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    blocksRef.current.forEach((b) => { if (b) observer.observe(b); });
    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ backgroundColor: "#F2EBE3", padding: "140px 0 80px" }}>
      <div className="kr-wrapper">

        {/* ── LEFT — sticky ── */}
        <div className="kr-left">
          <span className="kr-label">THE SCIENCE</span>

          <h2 className="kr-headline">
            რატომ იცვლება თმა მენოპაუზის დროს?
          </h2>

          <p className="kr-subtitle">
            მენოპაუზის პერიოდში, ერთდროულად ქალის სხეულში სხვადასხვა პროცესი მიმდინარეობს, რომელიც გავლენას ახდენს თმის სიმკვრივესა და სიჯანსაღეზე. ცალკე აღებული ინგრედიენტების მიღება არ არის საკმარისი ამ კომპლექსური პრობლემის გადასაჭრელად.
          </p>

          <a href="#" className="key-reasons-cta" style={{ marginTop: 40 }}>
            გაიგე რა სჭირდება შენს თმას →
          </a>
        </div>

        {/* ── RIGHT — scrollable list ── */}
        <div className="kr-right">
          {CAUSES.map((cause, i) => (
            <div
              key={cause.num}
              ref={(el) => { blocksRef.current[i] = el; }}
              className="kr-block"
              style={{
                transition: `opacity 0.6s ease ${i * 60}ms, transform 0.6s ease ${i * 60}ms`,
              }}
            >
              <div className="kr-block-inner">
                <span className="kr-num">{cause.num}</span>
                <div className="kr-text">
                  <h3 className="kr-title">{cause.title}</h3>
                  <p className="kr-desc">{cause.text}</p>
                </div>
              </div>
              {i < CAUSES.length - 1 && (
                <div className="kr-divider" />
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
