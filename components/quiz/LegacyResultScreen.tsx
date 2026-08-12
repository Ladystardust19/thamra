"use client";

/* ============================================================================
 * ⚠️ LEGACY (v1) result screen — extracted from the old QuizClient so it keeps
 * rendering during the v2 rollout for every non-verified_high_fit category.
 *
 * 2026-08 UI PASS: the PRESENTATION was re-skinned to the new premium editorial
 * language used by ResultScreen (card-less, hairline rules, editorial numerals,
 * custom monochrome marks, gold invitation CTA). All DATA LOGIC and Georgian
 * COPY are unchanged — only markup/classes changed. The two custom
 * visualizations (hair-stress spectrum meter, comparison matrix) keep their
 * Quiz.module.css internals; only their section chrome was restyled.
 *
 * The paid-consultation CTA stays gated by `allowConsultationCta` (computed by
 * QuizClient from the v2 model). Delete this file together with
 * lib/legacyScoring.ts when a full v2 page ships for these categories.
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

// ─── Shared premium bits (mirror ResultScreen's language) ─────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-ink">
      {children}
    </p>
  );
}

function GoldRule({ className = "" }: { className?: string }) {
  return <span className={`mx-auto block h-px w-10 bg-gold/50 ${className}`} aria-hidden />;
}

// Thin monochrome check — no OS emoji, warm palette.
function Check() {
  return (
    <svg className="mt-[5px] shrink-0 text-gold-ink" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Independently collapsible "learn more" row — hairline, no card. */
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
    <div className="border-t border-hairline last:border-b">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex flex-col">
          <span className="font-display text-[19px] font-normal leading-tight text-oxblood md:text-[21px]">
            {label}
          </span>
          {teaser && <span className="mt-1 font-body text-[13px] font-light text-muted">{teaser}</span>}
        </span>
        <svg
          className={(open ? "rotate-180 " : "") + "shrink-0 text-gold-ink transition-transform"}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="pb-7">{children}</div>}
    </div>
  );
}

/** Simple line icons for the 5 formula-benefit tiles (stroke = currentColor). */
function BenefitIcon({ name }: { name: BenefitTile["icon"] }) {
  const common = {
    width: 22,
    height: 22,
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

// ─── Result editorial content helpers (unchanged logic) ───────────────────────

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
    <RevealSection
      id="result-menopause-connection"
      className="mx-auto max-w-[640px] px-5 pt-20 text-center md:pt-24"
    >
      <Eyebrow>შენი შეფასება</Eyebrow>
      <GoldRule className="mt-6" />
      {c.headline && (
        <h1 className="mx-auto mt-7 max-w-[20ch] font-display text-[30px] font-normal leading-[1.12] text-oxblood md:text-[42px]">
          {c.headline}
        </h1>
      )}
      {c.timing && (
        <p className="mx-auto mt-6 max-w-[54ch] font-body text-[16px] font-light leading-[1.75] text-read md:text-[17px]">
          {c.timing}
        </p>
      )}
    </RevealSection>
  );
}

function HairStressSection({ r }: { r: Result }) {
  const idx = Math.max(0, Math.min(3, r.hairStressLevel.index));
  return (
    <RevealSection id="result-hair-stress" className="mx-auto max-w-[640px] px-5 py-16 text-center md:py-20">
      <Eyebrow>თმის სტრესის დონე</Eyebrow>
      <p className="mt-4 font-display text-[30px] font-normal leading-none text-[#3E5C61] md:text-[38px]">
        {r.hairStressLevel.label}
      </p>

      {/* Spectrum meter — self-contained viz, kept on its module styles. */}
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
    <RevealSection id="result-hair-changes" className="mx-auto max-w-[640px] px-5 py-8">
      <div className="text-center">
        <Eyebrow>შენი პასუხების მიხედვით</Eyebrow>
        <h2 className="mx-auto mt-4 max-w-[20ch] font-display text-[26px] font-normal leading-[1.2] text-oxblood md:text-[32px]">
          {`შენს შემთხვევაში ცვლილება ${countWord} მიმართულებაში იკვეთება`}
        </h2>
        <GoldRule className="mt-6" />
      </div>

      <div className="mx-auto mt-12 flex max-w-[560px] flex-col gap-8">
        {keys.map((k, i) => (
          <div key={k} className="flex gap-5 md:gap-7">
            <span
              aria-hidden
              className="select-none font-display text-[34px] font-normal leading-[0.8] text-gold/60 md:text-[44px] [font-variant-numeric:tabular-nums]"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1 pt-1">
              <h3 className="font-display text-[20px] font-semibold leading-tight text-ink md:text-[22px]">
                {HAIR_CHANGE_ROWS[k].title}
              </h3>
              <p className="mt-2 font-body text-[15px] font-light leading-[1.65] text-read md:text-[16px]">
                {HAIR_CHANGE_ROWS[k].text}
              </p>
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
    <RevealSection id="result-treatment" className={`${styles.compareSection} border-y border-hairline bg-surface py-16 md:py-20`}>
      <div className="mx-auto max-w-[680px] px-5">
        <h2 className="text-center font-display text-[26px] font-normal leading-[1.22] text-oxblood md:text-[32px]">
          რით განსხვავდება THAMRA?
        </h2>
        {intro && (
          <p className="mx-auto mt-5 max-w-[56ch] text-center font-body text-[15px] font-light leading-[1.7] text-read md:text-[16px]">
            {intro}
          </p>
        )}
        <GoldRule className="mt-6" />

        <div className={`${styles.compareTableWrap} mt-10`}>
          <ComparisonMatrix />
        </div>

        <p className={`${styles.compareLegend} mt-6`}>
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
      </div>
    </RevealSection>
  );
}

function ConsultationCtaSection() {
  const c = CONSULTATION_CTA;
  return (
    <RevealSection id="result-consultation" className="mx-auto mt-12 max-w-[720px] scroll-mt-24 px-5 md:mt-16">
      <div className="rounded-[22px] border border-gold/40 bg-paper p-8 shadow-[0_16px_50px_-24px_rgba(61,51,53,0.28)] md:p-12">
        <div className="text-center">
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h2 className="mx-auto mt-4 max-w-[22ch] font-display text-[26px] font-normal leading-[1.22] text-oxblood md:text-[32px]">
            {c.headline}
          </h2>
          <GoldRule className="mt-5" />
          <p className="mx-auto mt-6 max-w-[56ch] font-body text-[16px] font-light leading-[1.75] text-read md:text-[17px]">
            {c.lead}
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-[560px] flex-col gap-8 border-t border-hairline pt-8">
          {c.directions.map((d, i) => (
            <div key={i} className="flex gap-5 md:gap-7">
              <span
                aria-hidden
                className="select-none font-display text-[30px] font-normal leading-[0.8] text-gold/60 md:text-[40px] [font-variant-numeric:tabular-nums]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 pt-1">
                <h3 className="font-display text-[19px] font-semibold leading-tight text-ink md:text-[21px]">
                  {d.title}
                </h3>
                <p className="mt-2 font-body text-[15px] font-light leading-[1.65] text-read md:text-[16px]">
                  {d.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-hairline pt-8 text-center">
          <Link
            href="/consultation"
            className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gold px-8 py-[18px] font-body text-[16px] font-semibold text-oxblood shadow-[0_10px_28px_-12px_rgba(201,169,110,0.7)] transition-all duration-200 hover:bg-[#bfa15f] hover:shadow-[0_14px_32px_-10px_rgba(201,169,110,0.85)] sm:w-auto sm:min-w-[320px]"
            onClick={() => track({ event_type: "consultation_checkout_click", screen: "result" })}
          >
            <span>{c.cta}</span>
            <svg
              className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
            >
              <path d="M3 8h9M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
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
    <div className="bg-cream pb-24">
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

      {/* გაიგე მეტი THAMRA-ზე — independent progressive-disclosure rows */}
      <RevealSection id="result-about" className="mx-auto max-w-[760px] px-5 py-16 md:py-20">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
          <div className="text-center md:text-left">
            <Eyebrow>{ABOUT_THAMRA.eyebrow}</Eyebrow>
            <h2 className="mt-4 font-display text-[26px] font-normal leading-[1.2] text-oxblood md:text-[32px]">
              რა არის THAMRA
            </h2>
            <GoldRule className="mt-5 md:mx-0" />
            <p className="mt-6 font-body text-[16px] font-light leading-[1.75] text-read md:text-[17px]">
              {ABOUT_THAMRA.definition}
            </p>
          </div>
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/product-showcase.webp"
              alt="THAMRA — Women's Hair Longevity"
              width={1512}
              height={1000}
              loading="lazy"
              className="w-full max-w-[380px] rounded-2xl border border-gold/25 object-cover shadow-[0_10px_30px_-16px_rgba(61,51,53,0.25)]"
            />
          </div>
        </div>

        <div className="mt-10">
          <InfoCard label={ABOUT_WHO.cardLabel} teaser={ABOUT_WHO.teaser} defaultOpen>
            <ul className="flex flex-col gap-2.5">
              {ABOUT_WHO.bullets.map((b, i) => (
                <li key={i} className="flex gap-3 font-body text-[15px] font-light leading-[1.6] text-read md:text-[16px]">
                  <Check />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </InfoCard>

          <InfoCard label={ABOUT_BENEFITS.cardLabel} teaser={ABOUT_BENEFITS.teaser}>
            <div className="grid gap-6 sm:grid-cols-2">
              {ABOUT_BENEFITS.tiles.map((t) => (
                <div key={t.icon} className="flex gap-3.5">
                  <span className="mt-0.5 shrink-0 text-gold-ink" aria-hidden>
                    <BenefitIcon name={t.icon} />
                  </span>
                  <div>
                    <p className="font-display text-[17px] font-normal leading-snug text-oxblood">{t.benefit}</p>
                    <p className="mt-1 font-body text-[14px] font-light leading-[1.55] text-read">{t.mechanism}</p>
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>

          <InfoCard label={ABOUT_TRUST.cardLabel} teaser={ABOUT_TRUST.teaser}>
            <p className="font-body text-[15px] font-light leading-[1.7] text-read md:text-[16px]">{ABOUT_TRUST.intro}</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {ABOUT_TRUST.experts.map((e) => (
                <div key={e.name} className="flex items-center gap-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="h-14 w-14 shrink-0 rounded-full border border-gold/30 object-cover"
                    src={e.photo}
                    alt={e.name}
                    width={56}
                    height={56}
                    loading="lazy"
                  />
                  <div>
                    <p className="font-display text-[16px] font-normal leading-tight text-ink">{e.name}</p>
                    <p className="mt-0.5 font-body text-[13px] font-light leading-snug text-muted">{e.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>

          <InfoCard label={ABOUT_ORIGIN.cardLabel} teaser={ABOUT_ORIGIN.teaser}>
            {ABOUT_ORIGIN.paragraphs.map((p, i) => (
              <p
                key={i}
                className={
                  "font-body text-[15px] font-light leading-[1.75] text-read md:text-[16px] " +
                  (i > 0 ? "mt-4" : "")
                }
              >
                {p}
              </p>
            ))}
          </InfoCard>
        </div>
      </RevealSection>

      {/* Closing block — passive expert-review note for the non-qualifying group. */}
      {!allowConsultationCta && (
        <RevealSection
          id="result-booking"
          className="mx-auto max-w-[640px] px-5 pb-8 text-center"
        >
          <GoldRule />
          <h2 className="mx-auto mt-8 max-w-[24ch] font-display text-[24px] font-normal leading-[1.25] text-oxblood md:text-[30px]">
            შენი შედეგი თამრას თმის ექსპერტთან ერთად
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] font-body text-[16px] font-light leading-[1.75] text-read md:text-[17px]">
            ამ ეტაპზე თამრა პირველ 50 ქალთან მუშაობს.
          </p>
          <p className="mx-auto mt-3 max-w-[52ch] font-body text-[16px] font-light leading-[1.75] text-read md:text-[17px]">
            შენს პასუხებს განვიხილავთ და შევამოწმებთ, ემთხვევა თუ არა შენი თმის ცვლილების მიზეზი იმას, რაზეც თამრა
            მუშაობს. თუ ემთხვევა, დაგიკავშირდებით და ერთად გავარკვევთ, საიდან სჯობს დაიწყო.
          </p>
        </RevealSection>
      )}
    </div>
  );
}
