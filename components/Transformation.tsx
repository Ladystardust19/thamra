"use client";

import { Fragment, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ReactCompareSlider, ReactCompareSliderImage, ReactCompareSliderHandle } from "react-compare-slider";
import type { CSSProperties } from "react";

/* ── Brand tokens ────────────────────────────────────────────────── */
const GOLD    = "#C9A96E";
const OXBLOOD = "#8B2F3A";
const CREAM   = "#F5F0EB";
const DARK    = "#3D3335";
const MUTED   = "#6B5F5A";
const BG      = "#F2EBE3";

const JOST      = "var(--font-jost), sans-serif";
const CORMORANT = "var(--font-cormorant), Georgia, serif";

/* ── Root ────────────────────────────────────────────────────────── */
export default function Transformation() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.05 });
  return (
    <div ref={ref}>
      <Part1Hero     isInView={isInView} />
      <Part2Timeline isInView={isInView} />
      <Part3Slider   />
      <Part4Quote    isInView={isInView} />
      <Part5Badges   isInView={isInView} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PART 1 — Brand-color editorial hero (no image dependency)
══════════════════════════════════════════════════════════════════ */

/* Deterministic strand background — hydration-safe */
const HERO_STRANDS = [
  { px: 4,  wobble:  8, h: 90, t: 1.2 },
  { px: 10, wobble: -7, h: 75, t: 0.9 },
  { px: 16, wobble:  9, h: 88, t: 1.1 },
  { px: 22, wobble: -8, h: 68, t: 0.8 },
  { px: 28, wobble:  7, h: 94, t: 1.3 },
  { px: 34, wobble: -9, h: 78, t: 1.0 },
  { px: 40, wobble:  8, h: 86, t: 1.2 },
  { px: 46, wobble: -7, h: 72, t: 0.9 },
  { px: 52, wobble:  9, h: 96, t: 1.4 },
  { px: 58, wobble: -8, h: 80, t: 1.1 },
  { px: 64, wobble:  7, h: 84, t: 1.0 },
  { px: 70, wobble: -9, h: 70, t: 0.8 },
  { px: 76, wobble:  8, h: 92, t: 1.3 },
  { px: 82, wobble: -7, h: 77, t: 1.0 },
  { px: 88, wobble:  9, h: 88, t: 1.1 },
  { px: 94, wobble: -8, h: 74, t: 0.9 },
] as const;

function Part1Hero({ isInView }: { isInView: boolean }) {
  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: "80vh",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>

      {/* Woman image */}
      <Image
        src="/transformation-hero.png"
        alt="Thamra transformation"
        fill
        priority
        quality={100}
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center top" }}
      />

      {/* Oxblood colour wash — ties image into brand palette */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(to right, rgba(139,47,58,0.80) 0%, rgba(139,47,58,0.45) 50%, rgba(139,47,58,0.12) 80%, transparent 100%)`,
      }} aria-hidden />

      {/* Content — left-aligned over the oxblood wash */}
      <motion.div
        style={{ position: "absolute", top: "18%", left: 60, zIndex: 1, maxWidth: 500 }}
        initial={{ opacity: 0, y: 28 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
      >
        {/* Gold ornament row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{ width: 44, height: 1, background: GOLD, opacity: 0.65 }} />
          <svg width="7" height="7" viewBox="0 0 8 8" aria-hidden>
            <rect x="0.5" y="0.5" width="7" height="7" transform="rotate(45 4 4)" fill={GOLD} fillOpacity="0.85" />
          </svg>
          <span style={{ fontFamily: JOST, fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD }}>
            THE TRANSFORMATION
          </span>
          <svg width="7" height="7" viewBox="0 0 8 8" aria-hidden>
            <rect x="0.5" y="0.5" width="7" height="7" transform="rotate(45 4 4)" fill={GOLD} fillOpacity="0.85" />
          </svg>
          <div style={{ width: 44, height: 1, background: GOLD, opacity: 0.65 }} />
        </div>

        <h2 style={{
          fontFamily: CORMORANT,
          fontSize: "clamp(2.6rem, 5vw, 3.8rem)",
          fontWeight: 300,
          fontStyle: "italic",
          lineHeight: 1.12,
          color: CREAM,
          margin: "0 0 20px",
          letterSpacing: "0.01em",
          textShadow: "0 2px 18px rgba(0,0,0,0.35)",
        }}>
          The Return of Fuller Hair
        </h2>

        <p style={{
          fontFamily: JOST,
          fontSize: 16,
          fontWeight: 300,
          lineHeight: 1.7,
          color: "rgba(245,240,235,0.72)",
          margin: "0 0 28px",
          maxWidth: 380,
        }}>
          90 days of Advanced Hair Biomatrix™ — documented phase by phase.
        </p>

        <div style={{ width: 48, height: 1, background: GOLD, marginBottom: 20, opacity: 0.5 }} />

        <span style={{
          fontFamily: JOST,
          fontSize: 11,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(201,169,110,0.72)",
        }}>
          Real Women · Documented Results
        </span>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PART 2 — 3-phase evolution timeline
══════════════════════════════════════════════════════════════════ */

const PHASES = [
  { num: "01", month: "MONTH 1", days: "DAYS 1–30",  title: "Stabilization",  desc: "Shedding begins to slow. Follicles receive nutrition. Cortisol drops. Most women notice less hair on the brush by week 3." },
  { num: "02", month: "MONTH 2", days: "DAYS 31–60", title: "Activation",     desc: "New fine strands emerge at the hairline. Existing hair visibly thicker. Keratin rebuilds from the inside out." },
  { num: "03", month: "MONTH 3", days: "DAYS 61–90", title: "Transformation", desc: "Full density shift. Volume that others notice. Dormant follicles are active again. The visible result of 90 days." },
] as const;

/* ── Phase strand data — rx = relative x (0–1), h = height px ───── */
const PHASE_STRANDS = [
  /* Phase 1 — sparse, thinning, two broken tips */
  [
    { rx: 0.14, h: 46, w1:  5, w2: -3, thick: 1.3, op: 0.50, broken: true,  shine: false },
    { rx: 0.34, h: 60, w1: -6, w2:  4, thick: 1.1, op: 0.42, broken: false, shine: false },
    { rx: 0.54, h: 42, w1:  5, w2: -3, thick: 1.2, op: 0.46, broken: true,  shine: false },
    { rx: 0.72, h: 54, w1: -5, w2:  3, thick: 1.0, op: 0.38, broken: false, shine: false },
    { rx: 0.88, h: 50, w1:  6, w2: -4, thick: 1.1, op: 0.44, broken: false, shine: false },
  ],
  /* Phase 2 — medium, fine new strands emerging */
  [
    { rx: 0.08, h: 62, w1:  4, w2: -3, thick: 1.7, op: 0.60, broken: false, shine: false },
    { rx: 0.20, h: 48, w1: -4, w2:  3, thick: 0.9, op: 0.46, broken: false, shine: false },
    { rx: 0.31, h: 70, w1:  5, w2: -3, thick: 1.8, op: 0.66, broken: false, shine: false },
    { rx: 0.43, h: 52, w1: -4, w2:  3, thick: 1.0, op: 0.48, broken: false, shine: false },
    { rx: 0.54, h: 74, w1:  5, w2: -4, thick: 1.9, op: 0.68, broken: false, shine: false },
    { rx: 0.65, h: 55, w1: -5, w2:  3, thick: 1.0, op: 0.48, broken: false, shine: false },
    { rx: 0.76, h: 66, w1:  4, w2: -3, thick: 1.6, op: 0.62, broken: false, shine: false },
    { rx: 0.88, h: 50, w1: -4, w2:  3, thick: 1.1, op: 0.50, broken: false, shine: false },
  ],
  /* Phase 3 — full, dense, healthy, with shine */
  [
    { rx: 0.06, h: 70, w1:  4, w2: -3, thick: 2.0, op: 0.76, broken: false, shine: false },
    { rx: 0.16, h: 80, w1: -4, w2:  3, thick: 2.2, op: 0.84, broken: false, shine: true  },
    { rx: 0.25, h: 66, w1:  4, w2: -3, thick: 1.9, op: 0.76, broken: false, shine: false },
    { rx: 0.34, h: 84, w1: -5, w2:  4, thick: 2.3, op: 0.88, broken: false, shine: false },
    { rx: 0.43, h: 72, w1:  5, w2: -3, thick: 2.1, op: 0.80, broken: false, shine: true  },
    { rx: 0.52, h: 88, w1: -4, w2:  3, thick: 2.4, op: 0.90, broken: false, shine: false },
    { rx: 0.61, h: 74, w1:  4, w2: -3, thick: 2.1, op: 0.82, broken: false, shine: false },
    { rx: 0.70, h: 82, w1: -5, w2:  4, thick: 2.2, op: 0.86, broken: false, shine: true  },
    { rx: 0.79, h: 68, w1:  4, w2: -3, thick: 1.9, op: 0.76, broken: false, shine: false },
    { rx: 0.88, h: 78, w1: -4, w2:  3, thick: 2.0, op: 0.80, broken: false, shine: false },
    { rx: 0.95, h: 62, w1:  3, w2: -2, thick: 1.7, op: 0.72, broken: false, shine: false },
  ],
] as const;

function PhaseDecoration({ index }: { index: number }) {
  const strands = PHASE_STRANDS[index];
  const CX = 60, CY = 64, R = 52;
  const baseY = CY + R - 14;
  const halfW = Math.sqrt(R * R - (baseY - CY) ** 2);
  const xMin  = CX - halfW + 4;
  const xRange = (halfW - 4) * 2;

  const color  = index === 0 ? "#9A8880" : index === 1 ? "#B8956A" : GOLD;
  const ringOp = index === 0 ? 0.18 : index === 1 ? 0.30 : 0.55;
  const fillOp = index === 0 ? 0.05 : index === 1 ? 0.07 : 0.10;
  const clipId = `hc${index}`;
  const gradId = `hg${index}`;

  return (
    <div style={{ marginBottom: 32 }}>
      <svg width={120} height={136} viewBox="0 0 120 136" aria-hidden>
        <defs>
          <clipPath id={clipId}>
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
          <radialGradient id={gradId} cx="50%" cy="65%" r="55%">
            <stop offset="0%"   stopColor={color} stopOpacity={fillOp * 2.2} />
            <stop offset="100%" stopColor={color} stopOpacity={fillOp * 0.3} />
          </radialGradient>
        </defs>

        {/* Outer decorative rings */}
        <circle cx={CX} cy={CY} r={R + 1.5} fill="none" stroke={color} strokeWidth={0.8} strokeOpacity={ringOp} />
        <circle cx={CX} cy={CY} r={R + 4}   fill="none" stroke={color} strokeWidth={0.4} strokeOpacity={ringOp * 0.35} />

        {/* Circle background fill */}
        <circle cx={CX} cy={CY} r={R} fill={`url(#${gradId})`} />

        <g clipPath={`url(#${clipId})`}>
          {/* Scalp base band */}
          <rect x={CX - R} y={baseY - 2} width={R * 2} height={R + 4} fill={color} fillOpacity={0.07} />
          {/* Scalp line */}
          <line x1={xMin} y1={baseY} x2={xMin + xRange} y2={baseY} stroke={color} strokeWidth={1.2} strokeOpacity={0.28} />

          {strands.map((s, i) => {
            const sx   = xMin + s.rx * xRange;
            const tipX = sx + (s.w1 + s.w2) * 0.4;
            const tipY = baseY - s.h;
            /* Cubic bezier for natural S-curve */
            const cx1 = sx  + s.w1 * 0.5;
            const cy1 = baseY - s.h * 0.28;
            const cx2 = sx  + s.w1 * 0.8 + s.w2 * 0.3;
            const cy2 = baseY - s.h * 0.65;
            const d   = `M ${sx} ${baseY} C ${cx1} ${cy1} ${cx2} ${cy2} ${tipX} ${tipY}`;
            const dr  = `M ${sx} ${baseY} L ${sx + s.w1 * 0.15} ${baseY - s.h * 0.12}`;

            return (
              <g key={i}>
                {/* Follicle dot */}
                <circle cx={sx} cy={baseY} r={s.thick * 0.85} fill={color} fillOpacity={s.op * 0.7} />
                {/* Root swell */}
                <path d={dr} fill="none" stroke={color} strokeWidth={s.thick * 1.6} strokeOpacity={s.op * 0.55} strokeLinecap="round" />
                {/* Shaft */}
                <path d={d}  fill="none" stroke={color} strokeWidth={s.thick}       strokeOpacity={s.op}         strokeLinecap="round" />
                {/* Broken tip — phase 1 */}
                {s.broken && (
                  <path d={`M ${tipX} ${tipY} L ${tipX - 4} ${tipY - 9}`} fill="none" stroke={color} strokeWidth={0.8} strokeOpacity={s.op * 0.45} strokeLinecap="round" />
                )}
                {/* New growth dot — phase 2 fine strands */}
                {index === 1 && s.thick < 1.1 && (
                  <circle cx={tipX} cy={tipY} r={1.8} fill={GOLD} fillOpacity={0.6} />
                )}
                {/* Shine highlight — phase 3 */}
                {s.shine && (
                  <path
                    d={`M ${cx1 + 1} ${cy1 + 4} Q ${(cx1 + cx2) / 2 + 2} ${(cy1 + cy2) / 2} ${cx2 + 1} ${cy2 - 4}`}
                    fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={0.7} strokeLinecap="round"
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* Day range watermark inside circle */}
        <text x={CX} y={CY + R - 5} textAnchor="middle" fontFamily={JOST} fontSize={8} letterSpacing="0.16em" fill={color} fillOpacity={0.25}>
          {index === 0 ? "DAY 1–30" : index === 1 ? "DAY 31–60" : "DAY 61–90"}
        </text>

        {/* Phase 3 sparkle above circle */}
        {index === 2 && (
          <g>
            <line x1={56} y1={10} x2={64} y2={10} stroke={GOLD} strokeWidth={0.9} strokeOpacity={0.7} />
            <line x1={60} y1={6}  x2={60} y2={14} stroke={GOLD} strokeWidth={0.9} strokeOpacity={0.7} />
          </g>
        )}
      </svg>
    </div>
  );
}

function Part2Timeline({ isInView }: { isInView: boolean }) {
  return (
    <div style={{ backgroundColor: BG, padding: "100px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px" }}>

        {/* Header */}
        <motion.div
          style={{ textAlign: "center", marginBottom: 80 }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span style={{ display: "block", fontFamily: JOST, fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD, marginBottom: 20 }}>
            THE EVOLUTION
          </span>
          <h3 style={{ fontFamily: CORMORANT, fontSize: "clamp(1.9rem, 4vw, 2.7rem)", fontWeight: 300, fontStyle: "italic", color: DARK, margin: "0 auto 24px", maxWidth: 560, lineHeight: 1.25 }}>
            Hair renewal is a process. We document it for you.
          </h3>
          <div style={{ width: 48, height: 1, background: GOLD, margin: "0 auto", opacity: 0.5 }} />
        </motion.div>

        {/* 3 columns */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
          {PHASES.map((phase, i) => (
            <Fragment key={phase.title}>
              <motion.div
                style={{ flex: 1, minWidth: 0 }}
                initial={{ opacity: 0, y: 18 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.2 + i * 0.15, ease: "easeOut" }}
              >
                {/* Large faint phase number */}
                <span style={{
                  display: "block",
                  fontFamily: CORMORANT,
                  fontSize: 52,
                  fontWeight: 300,
                  fontStyle: "italic",
                  color: `rgba(139,47,58,0.16)`,
                  lineHeight: 1,
                  marginBottom: 6,
                }}>
                  {phase.num}
                </span>

                <PhaseDecoration index={i} />

                <span style={{ display: "block", fontFamily: JOST, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 10 }}>
                  {phase.month} · {phase.days}
                </span>
                <h4 style={{ fontFamily: CORMORANT, fontSize: 31, fontWeight: 300, color: OXBLOOD, margin: "0 0 14px", lineHeight: 1.1 }}>
                  {phase.title}
                </h4>
                <p style={{ fontFamily: JOST, fontSize: 14, fontWeight: 300, color: MUTED, lineHeight: 1.78, margin: 0 }}>
                  {phase.desc}
                </p>
              </motion.div>

              {/* Arrow between columns */}
              {i < 2 && (
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", marginTop: 108 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: `1px solid rgba(139,47,58,0.28)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={OXBLOOD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </div>
                </div>
              )}
            </Fragment>
          ))}
        </div>

        {/* Footer label */}
        <div style={{ textAlign: "center", marginTop: 64 }}>
          <span style={{ fontFamily: JOST, fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD }}>
            12-WEEK DOCUMENTED RESULTS
          </span>
          <div style={{ width: 40, height: 1, background: GOLD, margin: "10px auto 0", opacity: 0.42 }} />
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PART 3 — Before / After slider
══════════════════════════════════════════════════════════════════ */
function Part3Slider() {
  return (
    <div>
      <div style={{ position: "relative", width: "100%" }}>
        <ReactCompareSlider
          itemOne={
            <ReactCompareSliderImage
              src="/before-thamra.png"
              alt="Before Thamra"
              style={{ objectFit: "cover", height: 520 }}
            />
          }
          itemTwo={
            <ReactCompareSliderImage
              src="/after-thamra.png"
              alt="After 12 weeks Thamra"
              style={{ objectFit: "cover", height: 520 }}
            />
          }
          handle={
            <ReactCompareSliderHandle
              buttonStyle={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                backgroundColor: OXBLOOD,
                border: `2px solid ${GOLD}`,
                boxShadow: `0 4px 22px rgba(139,47,58,0.45)`,
                color: GOLD,
                backdropFilter: "blur(4px)",
              }}
              linesStyle={{ background: GOLD, width: 1.5, opacity: 0.75 }}
            />
          }
          style={{ width: "100%", height: 520 }}
        />

        <div style={sliderLabel("left")}>BEFORE</div>
        <div style={sliderLabel("right")}>AFTER 12 WEEKS</div>
      </div>

      {/* Drag hint — oxblood strip */}
      <div style={{ backgroundColor: OXBLOOD, padding: "14px 0", textAlign: "center" }}>
        <span style={{ fontFamily: JOST, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(245,240,235,0.55)" }}>
          ← drag to compare →
        </span>
      </div>
    </div>
  );
}

function sliderLabel(side: "left" | "right"): CSSProperties {
  const isLeft = side === "left";
  return {
    position: "absolute",
    top: 20,
    [side]: 20,
    fontFamily: JOST,
    fontSize: 11,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: isLeft ? CREAM : DARK,
    backgroundColor: isLeft ? OXBLOOD : GOLD,
    padding: "6px 14px",
    zIndex: 10,
    pointerEvents: "none",
  };
}

/* ══════════════════════════════════════════════════════════════════
   PART 4 — Featured testimonial quote on oxblood
══════════════════════════════════════════════════════════════════ */
function Part4Quote({ isInView }: { isInView: boolean }) {
  return (
    <div style={{ backgroundColor: BG, padding: "100px 24px", textAlign: "center" }}>
      <motion.div
        style={{ maxWidth: 640, margin: "0 auto" }}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
      >
        {/* Decorative gold quote mark */}
        <span style={{ fontFamily: CORMORANT, fontSize: 88, lineHeight: 0.8, color: `rgba(201,169,110,0.45)`, display: "block", marginBottom: 24 }} aria-hidden>
          &ldquo;
        </span>

        <blockquote style={{
          fontFamily: CORMORANT,
          fontSize: "clamp(1.75rem, 4vw, 2.6rem)",
          fontWeight: 300,
          fontStyle: "italic",
          color: DARK,
          lineHeight: 1.35,
          margin: "0 0 40px",
        }}>
          For the first time in years, I stopped thinking about my hair.
        </blockquote>

        <div style={{ width: 40, height: 1, background: GOLD, margin: "0 auto 28px", opacity: 0.55 }} />

        <p style={{ fontFamily: JOST, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: DARK, margin: "0 0 8px" }}>
          MARIAM, 53
        </p>
        <p style={{ fontFamily: JOST, fontSize: 12, color: MUTED, margin: 0, letterSpacing: "0.06em" }}>
          Verified THAMRA Customer
        </p>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PART 5 — THAMRA transition divider into next section
══════════════════════════════════════════════════════════════════ */
function Part5Badges({ isInView }: { isInView: boolean }) {
  return (
    <motion.div
      style={{ backgroundColor: BG, padding: "64px 0", textAlign: "center" }}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.7, delay: 0.3 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, maxWidth: 480, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ flex: 1, height: 1, background: "rgba(201,169,110,0.35)" }} />
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          <rect x="1" y="1" width="8" height="8" transform="rotate(45 5 5)" fill={GOLD} fillOpacity="0.55" />
        </svg>
        <span style={{ fontFamily: CORMORANT, fontSize: 13, letterSpacing: "0.38em", textTransform: "uppercase", color: `rgba(139,47,58,0.45)` }}>
          THAMRA
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          <rect x="1" y="1" width="8" height="8" transform="rotate(45 5 5)" fill={GOLD} fillOpacity="0.55" />
        </svg>
        <div style={{ flex: 1, height: 1, background: "rgba(201,169,110,0.35)" }} />
      </div>
    </motion.div>
  );
}
