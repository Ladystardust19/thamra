"use client";

/* ============================================================================
 * ⚠️ LEGACY (v1) result screen — extracted verbatim from the old QuizClient so
 * it keeps rendering during the v2 rollout. Rendered only in production as a
 * placeholder until the new dynamic result page ships (separate step).
 *
 * The ONE behavioural change vs. the old code: the paid-consultation CTA is now
 * gated by the `allowConsultationCta` prop (computed by QuizClient from the v2
 * result model) instead of the old, unsafe local qualifiesForConsultation().
 * Delete this file together with lib/legacyScoring.ts when the new result page
 * replaces it.
 * ========================================================================== */

import React, { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./Quiz.module.css";
import { computeResult, type Answers, type Result } from "@/lib/legacyScoring";
import {
  ABOUT_THAMRA,
  ABOUT_WHO,
  ABOUT_BENEFITS,
  ABOUT_TRUST,
  ABOUT_ORIGIN,
  CONSULTATION_CTA,
  type BenefitTile,
} from "@/lib/resultContent";
import { track } from "@/lib/analytics";

// ─── Reusable result bits ─────────────────────────────────────────────────────

/** Independently collapsible "learn more" card with a teaser header. */
function InfoCard({
  label,
  teaser,
  defaultOpen = false,
  children,
}: {
  label: string;
  teaser: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`${styles.infoCard} ${open ? styles.infoCardOpen : ""}`}>
      <button
        type="button"
        className={styles.infoCardHeader}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.infoCardHeaderText}>
          <span className={styles.infoCardLabel}>{label}</span>
          {teaser && <span className={styles.infoCardTeaser}>{teaser}</span>}
        </span>
        <span className={open ? styles.infoCardChevronOpen : styles.infoCardChevron} aria-hidden>
          ⌄
        </span>
      </button>
      {open && <div className={styles.infoCardPanel}>{children}</div>}
    </div>
  );
}

/** Simple line icons for the 5 formula-benefit tiles (stroke = currentColor). */
function BenefitIcon({ name }: { name: BenefitTile["icon"] }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "shed":
      return (
        <svg {...common}>
          <path d="M7 21c0-5 1-9 3-13" />
          <path d="M12 21c0-6 1.5-11 4-15" />
          <path d="M17 21c0-4 .5-7 1.5-10" />
        </svg>
      );
    case "strand":
      return (
        <svg {...common}>
          <path d="M7 3c4 3 4 6 0 9s-4 6 0 9" />
          <path d="M15 3c4 3 4 6 0 9s-4 6 0 9" />
        </svg>
      );
    case "calm":
      return (
        <svg {...common}>
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        </svg>
      );
    case "scalp":
      return (
        <svg {...common}>
          <path d="M12 21v-8" />
          <path d="M12 13c0-3-2-5-5-5 0 3 2 5 5 5z" />
          <path d="M12 11c0-3 2-5 5-5 0 3-2 5-5 5z" />
        </svg>
      );
    case "hydrate":
      return (
        <svg {...common}>
          <path d="M12 3s6 6 6 10a6 6 0 0 1-12 0c0-4 6-10 6-10z" />
        </svg>
      );
  }
}

// ─── Result editorial content helpers ─────────────────────────────────────────

const HAIR_CHANGE_ORDER = ["shedding", "volume", "partcrown", "quality", "stresssleep"] as const;
type HairChangeKey = (typeof HAIR_CHANGE_ORDER)[number];

const HAIR_CHANGE_ROWS: Record<HairChangeKey, { title: string; text: string }> = {
  shedding: { title: "ცვენა", text: "დაბანის ან დავარცხნის შემდეგ უფრო მეტი თმა გრჩება, ვიდრე ადრე." },
  volume: { title: "მოცულობა", text: "თმის საერთო სისქე ან კუდის მოცულობა შენთვის შესამჩნევად შემცირდა." },
  partcrown: { title: "გაყოფის ხაზი და გვირგვინი", text: "გაყოფის ხაზი ან გვირგვინის არე უფრო გამოკვეთილი გახდა." },
  quality: { title: "თმის ხარისხი", text: "თმა გახდა უფრო მშრალი, თხელი, მტვრევადი ან დაკარგა ბზინვარება." },
  stresssleep: { title: "ძილი და სტრესი", text: "თმის ცვლილებასთან ერთად ძილის ან სტრესის ცვლილებაც გამოიკვეთა." },
};

const GEO_COUNT = ["ერთ", "ორ", "სამ", "ოთხ", "ხუთ"];

// ─── Hair-spectrum visualization — organic overlapping-strand band ─────────────
const fmtN = (n: number) => Math.round(n * 10) / 10;

function buildStrandPath(baseY: number, amp: number, phase: number): string {
  const W = 400;
  const N = 8;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= N; i++) {
    const x = (W * i) / N;
    const y = baseY + amp * Math.sin(phase + (i / N) * Math.PI * 2.4);
    pts.push([x, y]);
  }
  let d = `M ${fmtN(pts[0][0])} ${fmtN(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${fmtN(c1x)} ${fmtN(c1y)}, ${fmtN(c2x)} ${fmtN(c2y)}, ${fmtN(p2[0])} ${fmtN(p2[1])}`;
  }
  return d;
}

const HAIR_STRANDS = Array.from({ length: 13 }, (_, i) => {
  const t = i / 12;
  const baseY = 7 + t * 50;
  const amp = 3 + (i % 4) * 1.6;
  const phase = i * 0.7;
  const stroke = i % 3 === 0 ? "rgba(120,30,42,0.16)" : "rgba(255,248,240,0.34)";
  const width = i % 2 === 0 ? 1 : 1.4;
  return { d: buildStrandPath(baseY, amp, phase), stroke, width };
});

function orbPosition(idx: number): number {
  const clamped = Math.max(0, Math.min(3, idx));
  return 12 + clamped * (76 / 3);
}

/** Derive the meaningful hair-change categories from the raw answers. */
function getSelectedHairChangeKeys(a: Answers): HairChangeKey[] {
  const set = new Set<HairChangeKey>();
  const q3 = Array.isArray(a.q3) ? a.q3 : [];
  const q5 = Array.isArray(a.q5) ? a.q5 : [];
  if (q5.includes("a5_shedding")) set.add("shedding");
  if (q5.includes("a5_volume") || a.q9 === "a9_finer" || a.q8 === "a8_selfonly") set.add("volume");
  if (
    q5.includes("a5_partcrown") ||
    a.q6 === "a6_part" ||
    a.q6 === "a6_crown" ||
    a.q8 === "a8_wider" ||
    a.q8 === "a8_scalp" ||
    a.q8 === "a8_bald"
  )
    set.add("partcrown");
  if (q5.includes("a5_finedry") || a.q9 === "a9_drier" || a.q9 === "a9_breaks" || a.q9 === "a9_several") set.add("quality");
  if (q3.indexOf("a3_sleep") !== -1 || q3.indexOf("a3_stress") !== -1) set.add("stresssleep");
  return HAIR_CHANGE_ORDER.filter((k) => set.has(k));
}

type MenoBucket = "strong" | "moderate" | "low";

function menoBucket(r: Result): MenoBucket {
  if (r.preMenopause) return "low";
  if (r.menoLevel.index >= 3) return "strong";
  if (r.menoLevel.index >= 1) return "moderate";
  return "low";
}

function getMenopauseConnectionContent(r: Result, a: Answers) {
  const bucket = menoBucket(r);
  const headline =
    bucket === "strong"
      ? "შენი თმის ცვლილება მენოპაუზის პერიოდთან ძლიერად იკვეთება"
      : bucket === "moderate"
      ? "შენი თმის ცვლილება შესაძლოა მენოპაუზის პერიოდთან იყოს დაკავშირებული"
      : "";

  let timing: string | null = null;
  if (bucket !== "low") {
    timing =
      a.q4 === "a4_same"
        ? "ისიც, რომ ეს ცვლილებები მენოპაუზის ნიშნებთან ახლოს დაიწყო, ამ კავშირს კიდევ უფრო აძლიერებს."
        : "ამ პერიოდში თმაზე ერთდროულად რამდენიმე ცვლილების გამოჩენა ხშირია.";
  }
  return { headline, timing };
}

// ─── Editorial reveal wrapper (fade + translateY, reduced-motion safe) ─────────

function RevealSection({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      id={id}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}

// ─── Result sections ──────────────────────────────────────────────────────────

function MenopauseConnectionSection({ r, answers }: { r: Result; answers: Answers }) {
  const c = getMenopauseConnectionContent(r, answers);
  if (!c.headline && !c.timing) return null;
  return (
    <RevealSection id="result-menopause-connection" className={`${styles.mSection} ${styles.mHero}`}>
      <span className={styles.mEyebrow}>შენი შეფასება</span>
      {c.headline && <h1 className={styles.mHeadline}>{c.headline}</h1>}
      {c.timing && <p className={styles.mBody}>{c.timing}</p>}
    </RevealSection>
  );
}

function HairStressSection({ r }: { r: Result }) {
  const idx = Math.max(0, Math.min(3, r.hairStressLevel.index));
  return (
    <RevealSection id="result-hair-stress" className={styles.mSection}>
      <span className={styles.mEyebrow}>თმის სტრესის დონე</span>
      <p className={styles.mBigWord}>{r.hairStressLevel.label}</p>

      <div className={styles.spectrumWrap}>
        <div
          className={styles.spectrumStage}
          role="meter"
          aria-valuemin={1}
          aria-valuemax={4}
          aria-valuenow={idx + 1}
          aria-label={`თმის სტრესის დონე: ${r.hairStressLevel.label}`}
        >
          <div className={styles.spectrumBand}>
            <svg className={styles.spectrumStrands} viewBox="0 0 400 64" preserveAspectRatio="none" aria-hidden="true">
              {HAIR_STRANDS.map((s, i) => (
                <path
                  key={i}
                  d={s.d}
                  fill="none"
                  stroke={s.stroke}
                  strokeWidth={s.width}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          </div>
          <span className={styles.spectrumOrb} style={{ left: `${orbPosition(idx)}%` }} aria-hidden="true" />
        </div>
        <div className={styles.spectrumEnds}>
          <span>მსუბუქი ცვლილება</span>
          <span>მკვეთრად გამოხატული</span>
        </div>
      </div>
    </RevealSection>
  );
}

function HairChangesSection({ answers }: { answers: Answers }) {
  const keys = getSelectedHairChangeKeys(answers);
  const countWord = GEO_COUNT[keys.length - 1] ?? String(keys.length);
  return (
    <RevealSection id="result-hair-changes" className={styles.mSection}>
      <span className={styles.mEyebrow}>შენი პასუხების მიხედვით</span>
      <h2 className={styles.mHeadline}>{`შენს შემთხვევაში ცვლილება ${countWord} მიმართულებაში იკვეთება`}</h2>
      <div className={styles.changeRows}>
        {keys.map((k, i) => (
          <div key={k} className={styles.changeRow}>
            <span className={styles.changeNum} aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className={styles.changeBody}>
              <h3 className={styles.changeTitle}>{HAIR_CHANGE_ROWS[k].title}</h3>
              <p className={styles.changeText}>{HAIR_CHANGE_ROWS[k].text}</p>
            </div>
          </div>
        ))}
      </div>
    </RevealSection>
  );
}

// ─── Treatment comparison ─────────────────────────────────────────────────────

type ComparisonLevel = "full" | "partial" | "not_primary";
type TreatmentCategory = "general_supplements" | "topical_treatments" | "procedures" | "none";

const COMPARISON_COLUMNS = ["ბიოტინი და მულტივიტამინები", "შამპუნები და სერუმები"] as const;

interface ComparisonRow {
  label: string;
  levels: [ComparisonLevel, ComparisonLevel, ComparisonLevel];
}

const COMPARISON_ROWS: ComparisonRow[] = [
  { label: "შექმნილია მენოპაუზის პერიოდში თმის კომპლექსური ზრუნვისთვის", levels: ["full", "not_primary", "not_primary"] },
  { label: "ითვალისწინებს თმის ცვლილებებთან დაკავშირებულ ჰორმონალურ ფაქტორებს", levels: ["full", "not_primary", "not_primary"] },
  { label: "ითვალისწინებს სტრესისა და ძილის გავლენას", levels: ["full", "not_primary", "not_primary"] },
  { label: "ზრუნავს თმის სიმკვრივეზე, ზრდის ციკლსა და სტრუქტურაზე", levels: ["full", "partial", "partial"] },
  { label: "მოქმედებს შიგნიდან", levels: ["full", "full", "not_primary"] },
  { label: "უზრუნველყოფს გარეგან მოვლას", levels: ["not_primary", "not_primary", "full"] },
];

const COMPARISON_INTRO: Record<TreatmentCategory, string> = {
  general_supplements:
    "შენ აქამდე ზოგადი თმის დანამატები სცადე. THAMRA განსხვავებულია იმით, რომ თავიდანვე მენოპაუზის პერიოდში შეცვლილი თმის რამდენიმე საჭიროებისთვის შეიქმნა.",
  topical_treatments: "",
  procedures:
    "შენ უკვე სცადე თმისთვის განკუთვნილი პროცედურები. THAMRA მათგან განსხვავებით ყოველდღიური, თანმიმდევრული ზრუნვისთვის შექმნილი 6-თვიანი პროგრამაა.",
  none:
    "ეს შეიძლება იყოს შენი პირველი მიზანმიმართული ნაბიჯი. THAMRA თავიდანვე მენოპაუზის პერიოდში შეცვლილი თმის მრავალმხრივი ზრუნვისთვის შეიქმნა.",
};

const LEVEL_SR: Record<ComparisonLevel, string> = {
  full: "კომპლექსურად",
  partial: "ნაწილობრივ",
  not_primary: "არ არის ძირითადი მიმართულება",
};

const LEVEL_GLYPH: Record<ComparisonLevel, string> = {
  full: "✓",
  partial: "◐",
  not_primary: "—",
};

/** Map the previous-treatment answer (q12, multi-select) into comparison categories. */
function getSelectedTreatmentCategories(a: Answers): TreatmentCategory[] {
  const q12 = Array.isArray(a.q12) ? a.q12 : [];
  const cats: TreatmentCategory[] = [];
  if (q12.indexOf("a12_supp") !== -1) cats.push("general_supplements");
  if (q12.indexOf("a12_minox") !== -1) cats.push("topical_treatments");
  if (q12.indexOf("a12_proc") !== -1) cats.push("procedures");
  return cats.length > 0 ? cats : ["none"];
}

function getPersonalizedComparisonIntro(c: TreatmentCategory): string {
  return COMPARISON_INTRO[c];
}

function ComparisonMarker({ level, columnLabel }: { level: ComparisonLevel; columnLabel: string }) {
  return (
    <span className={styles.markerWrap}>
      <span className={`${styles.glyph} ${styles["glyph_" + level]}`} aria-hidden>
        {LEVEL_GLYPH[level]}
      </span>
      <span className={styles.srOnly}>{`${columnLabel} — ${LEVEL_SR[level]}`}</span>
    </span>
  );
}

function ComparisonMatrix() {
  const lastRow = COMPARISON_ROWS.length - 1;
  return (
    <div className={styles.matrix} role="table" aria-label="შედარება THAMRA-სთან">
      <div className={styles.matrixHead} role="row">
        <span className={`${styles.cellLabel} ${styles.cellHeadLabel}`} role="columnheader" aria-hidden />
        <span className={`${styles.cellHeadThamra} ${styles.cellThamra} ${styles.cellThamraTop}`} role="columnheader">
          <span className={styles.brandWord}>THAMRA</span>
        </span>
        {COMPARISON_COLUMNS.map((c) => (
          <span key={c} className={styles.cellHeadComp} role="columnheader">
            {c}
          </span>
        ))}
      </div>
      {COMPARISON_ROWS.map((row, i) => (
        <div className={styles.matrixRow} role="row" key={i}>
          <span className={styles.cellLabel} role="cell">
            {row.label}
          </span>
          <span
            className={`${styles.cellMarker} ${styles.cellThamra} ${i === lastRow ? styles.cellThamraBottom : ""}`}
            role="cell"
          >
            <ComparisonMarker level={row.levels[0]} columnLabel="THAMRA" />
          </span>
          {COMPARISON_COLUMNS.map((c, ci) => (
            <span key={c} className={`${styles.cellMarker} ${styles.cellComp}`} role="cell">
              <ComparisonMarker level={row.levels[ci + 1]} columnLabel={c} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function TreatmentComparisonSection({ answers }: { answers: Answers }) {
  const categories = getSelectedTreatmentCategories(answers);
  const intro = getPersonalizedComparisonIntro(categories[0]);

  return (
    <RevealSection id="result-treatment" className={`${styles.mSection} ${styles.compareSection}`}>
      <h2 className={styles.compareHeadline}>
        რით განსხვავდება <span className={styles.brandWord}>THAMRA</span>?
      </h2>
      {intro && <p className={styles.compareIntro}>{intro}</p>}
      <div className={styles.compareTableWrap}>
        <ComparisonMatrix />
      </div>
      <p className={styles.compareLegend}>
        <span>
          <span className={`${styles.legendGlyph} ${styles.glyph_full}`} aria-hidden>✓</span> კომპლექსურად
        </span>
        <span>
          <span className={`${styles.legendGlyph} ${styles.glyph_partial}`} aria-hidden>◐</span> ნაწილობრივ — ითვალისწინებს, თუმცა არა კომპლექსურად
        </span>
        <span>
          <span className={`${styles.legendGlyph} ${styles.glyph_not_primary}`} aria-hidden>—</span> არ არის ძირითადი მიმართულება
        </span>
      </p>
    </RevealSection>
  );
}

function ConsultationCtaSection() {
  const c = CONSULTATION_CTA;
  return (
    <RevealSection id="result-consultation" className={`${styles.mSection} ${styles.bookingSection}`}>
      <span className={styles.mEyebrow}>{c.eyebrow}</span>
      <h2 className={styles.mHeadline}>{c.headline}</h2>
      <p className={styles.mBody}>{c.lead}</p>
      <div className={styles.changeRows}>
        {c.directions.map((d, i) => (
          <div key={i} className={styles.changeRow}>
            <span className={styles.changeNum} aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className={styles.changeBody}>
              <h3 className={styles.changeTitle}>{d.title}</h3>
              <p className={styles.changeText}>{d.text}</p>
            </div>
          </div>
        ))}
      </div>
      <Link
        href="/consultation"
        className={styles.mBtn}
        onClick={() => track({ event_type: "consultation_checkout_click", screen: "result" })}
      >
        {c.cta}
      </Link>
    </RevealSection>
  );
}

// ─── Result page ──────────────────────────────────────────────────────────────

export default function LegacyResultScreen({
  answers,
  allowConsultationCta,
}: {
  answers: Answers;
  /** Computed by QuizClient from the v2 result model. A red-flag / medical-review
   *  respondent is never allowed the paid CTA. */
  allowConsultationCta: boolean;
}) {
  const r = computeResult(answers);

  return (
    <div className={styles.resultWrap}>
      <div className={styles.resultHero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.resultHeroImg}
          src="/product-showcase.webp"
          alt="THAMRA — Women's Hair Longevity"
          width={1512}
          height={1000}
          loading="eager"
        />
      </div>

      {/* SECTION 1 — menopause connection */}
      <MenopauseConnectionSection r={r} answers={answers} />

      {/* SECTION 2 — hair stress level */}
      <HairStressSection r={r} />

      {/* Paid consultation CTA — gated by the v2 model (never for red-flag /
          medical-review; never on strong competing trigger alone). */}
      {allowConsultationCta && <ConsultationCtaSection />}

      {/* SECTION 3 — personalized hair changes */}
      <HairChangesSection answers={answers} />

      {/* Treatment comparison */}
      <TreatmentComparisonSection answers={answers} />

      {/* გაიგე მეტი THAMRA-ზე — independent progressive-disclosure cards */}
      <RevealSection id="result-about" className={styles.mSection}>
        <div className={styles.aboutIntro}>
          <span className={styles.mEyebrow}>{ABOUT_THAMRA.eyebrow}</span>
          <h2 className={styles.aboutHeading}>
            რა არის <span className={styles.brandWord}>THAMRA</span>
          </h2>
          <p className={styles.aboutDefinition}>{ABOUT_THAMRA.definition}</p>
        </div>

        <div className={styles.infoCards}>
          <InfoCard label={ABOUT_WHO.cardLabel} teaser={ABOUT_WHO.teaser} defaultOpen>
            <ul className={styles.whoList}>
              {ABOUT_WHO.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </InfoCard>

          <InfoCard label={ABOUT_BENEFITS.cardLabel} teaser={ABOUT_BENEFITS.teaser}>
            <div className={styles.benefitGrid}>
              {ABOUT_BENEFITS.tiles.map((t) => (
                <div key={t.icon} className={styles.benefitTile}>
                  <span className={styles.benefitIcon} aria-hidden>
                    <BenefitIcon name={t.icon} />
                  </span>
                  <div className={styles.benefitText}>
                    <p className={styles.benefitTitle}>{t.benefit}</p>
                    <p className={styles.benefitMech}>{t.mechanism}</p>
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>

          <InfoCard label={ABOUT_TRUST.cardLabel} teaser={ABOUT_TRUST.teaser}>
            <p className={styles.aboutBody}>{ABOUT_TRUST.intro}</p>
            <div className={styles.expertGrid}>
              {ABOUT_TRUST.experts.map((e) => (
                <div key={e.name} className={styles.expertCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={styles.expertPhoto} src={e.photo} alt={e.name} width={56} height={56} loading="lazy" />
                  <div className={styles.expertMeta}>
                    <p className={styles.expertName}>{e.name}</p>
                    <p className={styles.expertRole}>{e.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>

          <InfoCard label={ABOUT_ORIGIN.cardLabel} teaser={ABOUT_ORIGIN.teaser}>
            {ABOUT_ORIGIN.paragraphs.map((p, i) => (
              <p key={i} className={styles.aboutBody} style={i > 0 ? { marginTop: 12 } : undefined}>
                {p}
              </p>
            ))}
          </InfoCard>
        </div>
      </RevealSection>

      {/* Closing block — passive expert-review note for the non-qualifying group. */}
      {!allowConsultationCta && (
        <RevealSection id="result-booking" className={`${styles.mSection} ${styles.bookingSection}`}>
          <h2 className={styles.mHeadline}>შენი შედეგი თამრას თმის ექსპერტთან ერთად</h2>
          <p className={styles.mBody}>ამ ეტაპზე თამრა პირველ 50 ქალთან მუშაობს.</p>
          <p className={styles.mBody}>
            შენს პასუხებს განვიხილავთ და შევამოწმებთ, ემთხვევა თუ არა შენი თმის ცვლილების მიზეზი იმას, რაზეც თამრა
            მუშაობს. თუ ემთხვევა, დაგიკავშირდებით და ერთად გავარკვევთ, საიდან სჯობს დაიწყო.
          </p>
        </RevealSection>
      )}
    </div>
  );
}
