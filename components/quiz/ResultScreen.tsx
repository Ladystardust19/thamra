"use client";

import { useState } from "react";
import Link from "next/link";
import type { RawAnswers } from "@/lib/scoring";
import {
  buildVhfNarrative,
  type SummaryData,
  type Verdict,
} from "@/lib/resultNarrative";
import {
  FOUNDER_STORY,
  CONSULTATION,
  SECTION_LABELS,
  SUMMARY_LABELS,
  BRIDGES,
} from "@/lib/resultContentV2";
import FormulaMap from "./FormulaMap";
import ResultsTimeline from "@/components/sections/ResultsTimeline";

// ── Small building blocks ───────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-ink">
      {children}
    </p>
  );
}

// Body paragraph inside the expandable detail regions (17px reading size).
function Para({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 font-body text-[17px] font-light leading-[1.7] text-read first:mt-0">
      {children}
    </p>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      className={open ? "rotate-180 transition-transform" : "transition-transform"}
      aria-hidden
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// A numbered, conclusion-first section: badge + heading + takeaway always
// visible; the full prose lives behind a "ვრცლად" expander.
function NumberedCard({
  index,
  total,
  heading,
  takeaway,
  alwaysExtra,
  details,
}: {
  index: number;
  total: number;
  heading: string;
  takeaway: string;
  alwaysExtra?: React.ReactNode;
  details?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="mx-auto max-w-[640px] px-5">
      <div className="rounded-2xl border border-hairline bg-paper p-6 shadow-[0_2px_10px_rgba(61,51,53,0.05)] md:p-8">
        <span className="inline-block rounded-full bg-gold/20 px-2.5 py-1 font-body text-[11px] font-bold tracking-[0.12em] text-gold-ink">
          {index} / {total}
        </span>
        <h2 className="mt-3 font-display text-[26px] font-normal leading-[1.2] text-oxblood md:text-[32px]">
          {heading}
        </h2>
        <p className="mt-3 font-body text-[17px] font-normal leading-[1.6] text-ink">
          {takeaway}
        </p>

        {alwaysExtra}

        {details && (
          <>
            {open && <div className="mt-5 border-t border-hairline pt-5">{details}</div>}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="mt-5 inline-flex items-center gap-1.5 font-body text-[14px] font-semibold text-gold-ink"
            >
              {open ? BRIDGES.collapse : BRIDGES.expand}
              <Chevron open={open} />
            </button>
          </>
        )}
      </div>
    </section>
  );
}

// A one-line scroll cue between sections. Non-interactive by design: a short
// connecting rule + a downward chevron read as "keep going", not "click me".
function Bridge({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center gap-2 px-5 py-7 text-center">
      <span className="h-5 w-px bg-hairline" aria-hidden />
      <p className="font-body text-[13px] font-medium leading-[1.5] text-muted">{children}</p>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="text-gold-ink">
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// Summary card — the whole answer on one screen.
function SummaryCard({ summary }: { summary: SummaryData }) {
  // "მიზეზი" is now the page H1, so the card carries the supporting facts only.
  const rows: Array<{ label: string; value: string; emphasize?: boolean }> = [
    ...(summary.stage ? [{ label: SUMMARY_LABELS.stage, value: summary.stage }] : []),
    { label: SUMMARY_LABELS.tried, value: summary.tried ?? SUMMARY_LABELS.triedNothing },
    { label: SUMMARY_LABELS.missing, value: summary.missing, emphasize: true },
  ];
  return (
    <section className="mx-auto max-w-[640px] px-5">
      <div className="rounded-2xl border border-gold/40 bg-paper p-6 shadow-[0_2px_10px_rgba(61,51,53,0.05)] md:p-8">
        <dl className="flex flex-col divide-y divide-hairline">
          {rows.map((r) => (
            <div
              key={r.label}
              className="grid grid-cols-[88px_1fr] gap-3 py-3 first:pt-0 last:pb-0"
            >
              <dt className="font-body text-[13px] font-semibold text-muted">{r.label}</dt>
              <dd
                className={
                  r.emphasize
                    ? "font-body text-[15px] font-medium leading-[1.5] text-oxblood"
                    : "font-body text-[15px] leading-[1.5] text-ink"
                }
              >
                {r.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// ✓ does / ✗ missing verdict for one tried treatment.
function VerdictRow({ v }: { v: Verdict }) {
  return (
    <div className="rounded-xl border border-hairline bg-cream/60 p-4">
      <p className="font-display text-[16px] font-semibold text-ink">{v.heading}</p>
      <div className="mt-2 flex flex-col gap-1.5">
        <p className="flex gap-2 font-body text-[14px] leading-[1.5] text-read">
          <span className="font-semibold text-emerald-600">✓</span>
          <span>{v.does}</span>
        </p>
        <p className="flex gap-2 font-body text-[14px] leading-[1.5] text-read">
          <span className="font-semibold text-oxblood">✗</span>
          <span>{v.missing}</span>
        </p>
      </div>
    </div>
  );
}

// ── Result screen (verified_high_fit) ───────────────────────────────────────

export default function ResultScreen({ answers }: { answers: RawAnswers }) {
  const n = buildVhfNarrative(answers);
  if (!n) return null;
  const pt = n.prevTreatment;

  return (
    <div className="bg-cream pb-24">
      {/* Header — real H1 naming her result */}
      <header className="mx-auto max-w-[640px] px-5 pt-16 text-center md:pt-20">
        <Eyebrow>შენი პერსონალური შედეგი</Eyebrow>
        <h1 className="mt-3 font-display text-[30px] font-normal leading-[1.15] text-oxblood md:text-[40px]">
          {n.summary.cause}
        </h1>
      </header>

      {/* Summary card — the supporting facts in one screen */}
      <div className="mt-8">
        <SummaryCard summary={n.summary} />
      </div>

      {/* 1/3 — mechanism */}
      <div className="mt-10">
        <NumberedCard
          index={1}
          total={3}
          heading={n.mechanism.heading ?? ""}
          takeaway={n.mechanismTakeaway}
          details={n.mechanism.paragraphs.map((p, i) => (
            <Para key={i}>{p}</Para>
          ))}
        />
      </div>

      <Bridge>{BRIDGES.toProgression}</Bridge>

      {/* 2/3 — progression */}
      <NumberedCard
        index={2}
        total={3}
        heading={n.progression.heading ?? ""}
        takeaway={n.progressionTakeaway}
        details={n.progression.paragraphs.map((p, i) => (
          <Para key={i}>{p}</Para>
        ))}
      />

      <Bridge>{BRIDGES.toPrevTreatment}</Bridge>

      {/* 3/3 — previous treatments (verdict rows always visible) */}
      <NumberedCard
        index={3}
        total={3}
        heading={pt.title}
        takeaway={pt.conclusion}
        alwaysExtra={
          pt.verdicts.length > 0 ? (
            <div className="mt-5 flex flex-col gap-3">
              {pt.verdicts.map((v) => (
                <VerdictRow key={v.heading} v={v} />
              ))}
            </div>
          ) : null
        }
        details={
          <>
            {pt.intro.map((p, i) => (
              <Para key={`intro-${i}`}>{p}</Para>
            ))}
            {pt.treatments.map((block, bi) => (
              <div key={`t-${bi}`} className="mt-6">
                {block.heading && (
                  <h3 className="mb-2 font-display text-[18px] font-semibold leading-tight text-ink md:text-[20px]">
                    {block.heading}
                  </h3>
                )}
                {block.paragraphs.map((p, i) => (
                  <Para key={i}>{p}</Para>
                ))}
              </div>
            ))}
            {pt.duration.length > 0 && (
              <div className="mt-6">
                {pt.duration.map((p, i) => (
                  <Para key={`d-${i}`}>{p}</Para>
                ))}
              </div>
            )}
            {pt.outcomes.length > 0 && (
              <div className="mt-6">
                {pt.outcomes.map((p, i) => (
                  <Para key={`o-${i}`}>{p}</Para>
                ))}
              </div>
            )}
          </>
        }
      />

      <Bridge>{BRIDGES.toStory}</Bridge>

      {/* Founder story */}
      <section className="mx-auto max-w-[640px] px-5 py-12 md:py-16">
        <div className="text-center">
          <Eyebrow>{SECTION_LABELS.founderEyebrow}</Eyebrow>
          <h2 className="mt-3 font-display text-[26px] font-normal leading-[1.2] text-oxblood md:text-[32px]">
            {FOUNDER_STORY.heading}
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/maia-sidamonishvili-jakeli.webp"
            alt="მაია სიდამონიშვილი — ექიმი გინეკოლოგი, თამრას დამფუძნებელი"
            className="mx-auto mt-8 w-[200px] rounded-2xl object-cover shadow-[0_4px_18px_rgba(61,51,53,0.12)]"
          />
        </div>
        <div className="mt-10">
          {FOUNDER_STORY.blocks.map((b, i) => (
            <div key={i}>
              {b.act && (
                <h3 className="mt-12 mb-4 font-display text-[20px] font-normal leading-[1.25] text-oxblood md:text-[22px]">
                  {b.act}
                </h3>
              )}
              {b.strong ? (
                <p className="my-6 border-l-2 border-gold pl-5 font-display text-[20px] font-normal italic leading-[1.5] text-read md:text-[22px]">
                  {b.text}
                </p>
              ) : (
                <p className="mt-4 font-body text-[17px] font-light leading-[1.75] text-read">
                  {b.text}
                </p>
              )}
            </div>
          ))}
          <p className="mt-10 font-display text-[18px] italic text-ink">
            {FOUNDER_STORY.signature}
          </p>
          <p className="font-body text-[13px] text-muted">{FOUNDER_STORY.signatureRole}</p>
        </div>
      </section>

      {/* Ingredients / formula (full-bleed) */}
      <div className="my-6">
        <FormulaMap />
      </div>

      {/* Results timeline */}
      <ResultsTimeline />

      {/* Consultation CTA (100 ₾, quiz-finisher discount) */}
      <section id="consultation" className="mx-auto mt-4 max-w-[760px] scroll-mt-24 px-5">
        <div className="rounded-3xl border border-gold/30 bg-paper p-7 md:p-10">
          <h2 className="font-display text-[24px] font-normal leading-[1.25] text-oxblood md:text-[30px]">
            {CONSULTATION.heading}
          </h2>
          <Para>{CONSULTATION.lead}</Para>

          <p className="mt-6 font-body text-[15px] font-medium text-ink">
            {CONSULTATION.bulletsIntro}
          </p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {CONSULTATION.bullets.map((b) => (
              <li
                key={b}
                className="flex gap-2.5 font-body text-[15px] font-light leading-[1.6] text-read"
              >
                <span className="mt-[3px] text-gold">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="mt-7 rounded-2xl bg-surface p-5 text-center">
            <p className="font-display text-[20px] font-normal text-oxblood">
              {CONSULTATION.ctaTitle}
            </p>
            <p className="mt-1 font-body text-[14px] font-light text-read">
              {CONSULTATION.ctaSub}
            </p>

            {/* Price */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <span className="rounded-full bg-oxblood/10 px-3 py-1 font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-oxblood">
                −{CONSULTATION.discountPct}%
              </span>
              <span className="font-body text-[18px] text-muted line-through">
                {CONSULTATION.priceOriginal} ₾
              </span>
              <span className="font-display text-[34px] font-normal leading-none text-oxblood">
                {CONSULTATION.priceNow} ₾
              </span>
            </div>

            <Link
              href="/checkout?plan=consultation"
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-oxblood px-6 py-4 font-body text-[16px] text-cream-soft transition-colors hover:bg-oxblood-dark sm:w-auto"
            >
              {CONSULTATION.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
