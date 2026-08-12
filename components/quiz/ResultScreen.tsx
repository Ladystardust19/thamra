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

// A numbered editorial passage. An oversized thin-serif index sits beside the
// heading + takeaway; the full prose lives behind a quiet "ვრცლად" affordance.
// No card, no border, no shadow — the words sit on the paper and are separated
// by whitespace and hairlines.
function NumberedSection({
  index,
  heading,
  takeaway,
  alwaysExtra,
  details,
}: {
  index: number;
  heading: string;
  takeaway: string;
  alwaysExtra?: React.ReactNode;
  details?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="mx-auto max-w-[640px] px-5">
      <div className="flex gap-5 md:gap-8">
        <span
          aria-hidden
          className="select-none font-display text-[42px] font-normal leading-[0.8] text-gold/60 md:text-[58px] [font-variant-numeric:tabular-nums]"
        >
          {String(index).padStart(2, "0")}
        </span>
        <div className="flex-1 pt-1.5 md:pt-2.5">
          <h2 className="font-display text-[26px] font-normal leading-[1.18] text-oxblood md:text-[32px]">
            {heading}
          </h2>
          <p className="mt-3 font-body text-[17px] font-normal leading-[1.65] text-ink">
            {takeaway}
          </p>

          {alwaysExtra}

          {details && (
            <>
              {open && (
                <div className="mt-6 border-t border-hairline/70 pt-6">{details}</div>
              )}
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="mt-6 inline-flex items-center gap-1.5 font-body text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-ink"
              >
                {open ? BRIDGES.collapse : BRIDGES.expand}
                <Chevron open={open} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// A one-line scroll cue between sections. Non-interactive by design: a short
// connecting rule + a downward chevron read as "keep going", not "click me".
function Bridge({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center gap-3 px-5 py-10 text-center">
      <span className="h-6 w-px bg-gold/30" aria-hidden />
      <p className="max-w-[380px] font-body text-[13px] font-light italic leading-[1.6] text-muted">
        {children}
      </p>
    </div>
  );
}

// Supporting facts as an editorial spec list — hairline-ruled, no container.
// "მიზეზი" is the page H1, so this carries the supporting facts only.
function SummaryList({ summary }: { summary: SummaryData }) {
  const rows: Array<{ label: string; value: string; emphasize?: boolean }> = [
    ...(summary.stage ? [{ label: SUMMARY_LABELS.stage, value: summary.stage }] : []),
    { label: SUMMARY_LABELS.tried, value: summary.tried ?? SUMMARY_LABELS.triedNothing },
    { label: SUMMARY_LABELS.missing, value: summary.missing, emphasize: true },
  ];
  return (
    <section className="mx-auto max-w-[560px] px-5">
      <dl className="divide-y divide-hairline/60 border-y border-hairline/70">
        {rows.map((r) => (
          <div
            key={r.label}
            className="grid grid-cols-[104px_1fr] items-baseline gap-5 py-4"
          >
            <dt className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              {r.label}
            </dt>
            <dd
              className={
                r.emphasize
                  ? "font-body text-[16px] font-medium leading-[1.5] text-oxblood"
                  : "font-body text-[16px] font-light leading-[1.5] text-ink"
              }
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// Thin monochrome marks — a fine check for "does", a fine minus for "missing".
// No OS emoji, no green: both drawn in the warm palette.
function Mark({ kind }: { kind: "does" | "missing" }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={
        kind === "does"
          ? "mt-[5px] shrink-0 text-gold-ink"
          : "mt-[5px] shrink-0 text-muted"
      }
    >
      {kind === "does" ? (
        <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M3.5 8h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      )}
    </svg>
  );
}

// does / missing verdict for one tried treatment — hairline-ruled, no card.
function VerdictRow({ v }: { v: Verdict }) {
  return (
    <div className="py-4">
      <p className="font-display text-[17px] font-normal text-oxblood">{v.heading}</p>
      <div className="mt-2.5 flex flex-col gap-2">
        <p className="flex gap-2.5 font-body text-[14px] font-light leading-[1.55] text-read">
          <Mark kind="does" />
          <span>{v.does}</span>
        </p>
        <p className="flex gap-2.5 font-body text-[14px] font-light leading-[1.55] text-read">
          <Mark kind="missing" />
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
      {/* Header — the diagnostic moment */}
      <header className="mx-auto max-w-[640px] px-5 pt-20 text-center md:pt-28">
        <Eyebrow>შენი პერსონალური შედეგი</Eyebrow>
        <span className="mx-auto mt-6 block h-px w-10 bg-gold/50" aria-hidden />
        <h1 className="mt-7 font-display text-[34px] font-normal leading-[1.1] text-oxblood md:text-[46px]">
          {n.summary.cause}
        </h1>
      </header>

      {/* Supporting facts — an editorial spec list, no card */}
      <div className="mt-12">
        <SummaryList summary={n.summary} />
      </div>

      {/* 01 — mechanism */}
      <div className="mt-16">
        <NumberedSection
          index={1}
          heading={n.mechanism.heading ?? ""}
          takeaway={n.mechanismTakeaway}
          details={n.mechanism.paragraphs.map((p, i) => (
            <Para key={i}>{p}</Para>
          ))}
        />
      </div>

      <Bridge>{BRIDGES.toProgression}</Bridge>

      {/* 02 — progression */}
      <NumberedSection
        index={2}
        heading={n.progression.heading ?? ""}
        takeaway={n.progressionTakeaway}
        details={n.progression.paragraphs.map((p, i) => (
          <Para key={i}>{p}</Para>
        ))}
      />

      <Bridge>{BRIDGES.toPrevTreatment}</Bridge>

      {/* 03 — previous treatments (verdicts always visible) */}
      <NumberedSection
        index={3}
        heading={pt.title}
        takeaway={pt.conclusion}
        alwaysExtra={
          pt.verdicts.length > 0 ? (
            <div className="mt-6 divide-y divide-hairline/60 border-t border-hairline/70">
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

      {/* Founder story — set on a subtly deeper "letter" ground to mark it as a
          pause: a personal letter from the founder, not another content block. */}
      <section className="border-y border-hairline bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-[640px] px-5">
          {/* Masthead */}
          <div className="text-center">
            <Eyebrow>{SECTION_LABELS.founderEyebrow}</Eyebrow>
            <h2 className="mt-4 font-display text-[28px] font-normal leading-[1.18] text-oxblood md:text-[36px]">
              {FOUNDER_STORY.heading}
            </h2>
          </div>

          {/* Portrait — arched editorial figure, gold hairline frame, no shadow */}
          <figure className="mx-auto mt-10 w-[220px] md:w-[240px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/maia-sidamonishvili-jakeli.webp"
              alt="მაია სიდამონიშვილი — ექიმი გინეკოლოგი, თამრას დამფუძნებელი"
              className="aspect-[4/5] w-full rounded-t-[110px] rounded-b-xl border border-gold/40 object-cover object-top"
            />
          </figure>

          {/* Letter body */}
          <div className="mt-12">
            {FOUNDER_STORY.blocks.map((b, i) => (
              <div key={i}>
                {b.act && (
                  <div className={i === 0 ? "mb-6" : "mt-14 mb-6"}>
                    <span className="block h-px w-10 bg-gold/60" aria-hidden />
                    <h3 className="mt-5 font-display text-[20px] font-normal leading-[1.25] text-oxblood md:text-[22px]">
                      {b.act}
                    </h3>
                  </div>
                )}
                {b.strong ? (
                  <p className="my-6 border-l-2 border-gold pl-5 font-display text-[20px] font-normal italic leading-[1.5] text-read md:text-[22px]">
                    {b.text}
                  </p>
                ) : (
                  <p className="mt-4 font-body text-[17px] font-light leading-[1.8] text-read">
                    {b.text}
                  </p>
                )}
              </div>
            ))}

            {/* Sign-off */}
            <div className="mt-14">
              <span className="block h-px w-12 bg-gold/50" aria-hidden />
              <p className="mt-6 font-display text-[22px] font-normal text-oxblood">
                {FOUNDER_STORY.signature}
              </p>
              <p className="mt-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                {FOUNDER_STORY.signatureRole}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredients / formula (full-bleed) */}
      <div className="my-6">
        <FormulaMap />
      </div>

      {/* Results timeline */}
      <ResultsTimeline />

      {/* Consultation CTA (100 ₾, quiz-finisher discount) — the closing invitation.
          One refined panel: masthead → what's included → booking. */}
      <section id="consultation" className="mx-auto mt-12 max-w-[720px] scroll-mt-24 px-5 md:mt-16">
        <div className="rounded-[22px] border border-gold/40 bg-paper p-8 shadow-[0_16px_50px_-24px_rgba(61,51,53,0.28)] md:p-12">
          {/* Masthead */}
          <div className="text-center">
            <h2 className="mx-auto max-w-[22ch] font-display text-[26px] font-normal leading-[1.22] text-oxblood md:text-[34px]">
              {CONSULTATION.heading}
            </h2>
            <span className="mx-auto mt-5 block h-px w-10 bg-gold/50" aria-hidden />
            <p className="mx-auto mt-6 max-w-[56ch] font-body text-[16px] font-light leading-[1.75] text-read md:text-[17px]">
              {CONSULTATION.lead}
            </p>
          </div>

          {/* What's included */}
          <div className="mx-auto mt-10 max-w-[520px] border-t border-hairline pt-8">
            <p className="font-body text-[15px] font-medium leading-[1.5] text-ink md:text-[16px]">
              {CONSULTATION.bulletsIntro}
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {CONSULTATION.bullets.map((b) => (
                <li
                  key={b}
                  className="flex gap-3 font-body text-[15px] font-light leading-[1.6] text-read md:text-[16px]"
                >
                  <svg
                    className="mt-[5px] shrink-0 text-gold-ink"
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden
                  >
                    <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Booking */}
          <div className="mt-10 border-t border-hairline pt-8 text-center">
            <p className="font-display text-[20px] font-normal leading-[1.3] text-oxblood md:text-[22px]">
              {CONSULTATION.ctaTitle}
            </p>
            <p className="mx-auto mt-2 max-w-[46ch] font-body text-[14px] font-light leading-[1.6] text-read">
              {CONSULTATION.ctaSub}
            </p>

            {/* Price */}
            <div className="mt-6">
              <div className="flex items-baseline justify-center gap-3">
                <span className="font-body text-[44px] font-semibold leading-none tracking-[-0.015em] text-oxblood [font-variant-numeric:tabular-nums]">
                  {CONSULTATION.priceNow}
                  <span className="ml-[0.16em] text-[0.52em] font-medium tracking-normal">₾</span>
                </span>
                <span className="font-body text-[18px] font-light text-muted line-through decoration-1 decoration-muted/55">
                  {CONSULTATION.priceOriginal} ₾
                </span>
              </div>
              <p className="mt-2 font-body text-[12.5px] tracking-[0.04em] text-muted">
                −{CONSULTATION.discountPct}% ტესტის მონაწილეებისთვის
              </p>
            </div>

            <Link
              href="/checkout?plan=consultation"
              className="group mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gold px-8 py-[18px] font-body text-[16px] font-semibold text-oxblood shadow-[0_10px_28px_-12px_rgba(201,169,110,0.7)] transition-all duration-200 hover:bg-[#bfa15f] hover:shadow-[0_14px_32px_-10px_rgba(201,169,110,0.85)] sm:w-auto sm:min-w-[300px]"
            >
              <span>{CONSULTATION.ctaButton}</span>
              <svg
                className="transition-transform duration-200 group-hover:translate-x-1"
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
      </section>
    </div>
  );
}
