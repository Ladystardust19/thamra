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
 * The paid-consultation CTA has been retired — every category now ends with the
 * text-only expert-review note (EXPERT_REVIEW). Delete this file together with
 * lib/legacyScoring.ts when a full v2 page ships for these categories.
 * ========================================================================== */

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./Quiz.module.css";
import { computeResult, type Answers, type Result } from "@/lib/legacyScoring";
import {
  ABOUT_THAMRA,
  ABOUT_WHO,
  ABOUT_BENEFITS,
  ABOUT_TRUST,
  ABOUT_ORIGIN,
  type BenefitTile,
} from "@/lib/resultContent";
import { EXPERT_REVIEW } from "@/lib/resultContentV2";

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

// Closing "expert review" block — shown at the end of the quiz for EVERY
// category. Text only: contact info is captured at the gate, so this is a
// passive "we'll review and contact you" note with no price and no button.
function ExpertReviewSection() {
  return (
    <RevealSection id="result-booking" className="mx-auto max-w-[640px] px-5 py-12 text-center md:py-16">
      <GoldRule />
      <h2 className="mx-auto mt-8 max-w-[24ch] font-display text-[24px] font-normal leading-[1.25] text-oxblood md:text-[30px]">
        {EXPERT_REVIEW.heading}
      </h2>
      {EXPERT_REVIEW.paragraphs.map((p, i) => (
        <p
          key={i}
          className="mx-auto mt-5 max-w-[52ch] font-body text-[16px] font-light leading-[1.75] text-read md:text-[17px] first-of-type:mt-8"
        >
          {p}
        </p>
      ))}
    </RevealSection>
  );
}

// ─── Result page ──────────────────────────────────────────────────────────────

export default function LegacyResultScreen({
  answers,
}: {
  answers: Answers;
}) {
  const r = computeResult(answers);

  return (
    <div className="bg-cream pb-24">
      {/* SECTION 1 — menopause connection */}
      <MenopauseConnectionSection r={r} answers={answers} />

      {/* SECTION 2 — hair stress level */}
      <HairStressSection r={r} />

      {/* Closing block — text-only expert-review note for every category. The
          paid consultation CTA has been retired from the quiz end. */}
      <ExpertReviewSection />

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

      {/* How THAMRA compares — last */}
      <TreatmentComparisonSection answers={answers} />
    </div>
  );
}
