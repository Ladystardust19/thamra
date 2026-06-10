"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { CSSProperties } from "react";
import { motion, useInView, animate } from "framer-motion";

/* ── Deterministic wavy strand paths (module scope — no hydration mismatch) ── */
function makeStrands(count: number, cx: number, cy: number, len: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const angle  = (i / count) * Math.PI * 2 - Math.PI / 2;
    const w      = Math.sin(i * 2.7) * 10;
    const ex     = cx + Math.cos(angle) * len + w;
    const ey     = cy + Math.sin(angle) * len + w * 0.4;
    const cpx    = cx + Math.cos(angle) * len * 0.5 + Math.sin(angle) * 14;
    const cpy    = cy + Math.sin(angle) * len * 0.5 - Math.cos(angle) * 14;
    return `M ${cx.toFixed(1)} ${cy.toFixed(1)} Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  });
}

const SPARSE = makeStrands(9,  150, 155, 92);
const DENSE  = makeStrands(28, 150, 155, 110);

/* ── Data ─────────────────────────────────────────────────────────────── */

const STATS = [
  { value: 87, suffix: "%",   label: "less shedding by Week 4" },
  { value: 91, suffix: "%",   label: "saw visible regrowth by Week 12" },
  { value: 30, suffix: "K+",  label: "women transformed" },
  { value: 12, suffix: " wk", label: "to full visible results" },
] as const;

const PHASES = [
  {
    num: "01",
    month: "MONTH 1",
    days: "Days 1–30",
    accent: "#C9A96E",
    headline: "The Foundation Forms",
    body: "Shedding begins to slow. Follicles receive targeted nutrition for the first time. Cortisol drops. Most women notice less hair on the brush by week 3.",
    tags: ["↓ Shedding", "↑ Scalp health", "DHT blocked"],
  },
  {
    num: "02",
    month: "MONTH 2",
    days: "Days 31–60",
    accent: "#8B2F3A",
    headline: "Growth Restarts",
    body: "New fine strands emerge at the hairline and crown. Existing hair noticeably thicker. Collagen and keratin rebuild the shaft from the inside out.",
    tags: ["New growth", "↑ Thickness", "Shine returns"],
  },
  {
    num: "03",
    month: "MONTH 3",
    days: "Days 61–90",
    accent: "#4A3F3C",
    headline: "Visible Transformation",
    body: "Full density shift. Volume that others notice. Dormant follicles are now active. The result of 90 days of complete systemic support.",
    tags: ["Full density", "↑ Volume", "Lasting results"],
  },
] as const;

/* ── Root component ───────────────────────────────────────────────────── */

export default function BeforeAfter() {
  const ref     = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section style={{ backgroundColor: "#FDFBF8" }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: "0 auto", padding: "140px 24px" }}>

        {/* ── Header ── */}
        <motion.div
          style={{ textAlign: "center", marginBottom: 72 }}
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <span style={LABEL}>THE TRANSFORMATION</span>
          <h2 style={HEADLINE}>Real Women. Real Results.</h2>
          <p style={SUBTITLE}>
            90 days on Advanced Hair Biomatrix™ — documented phase by phase.
          </p>
        </motion.div>

        {/* ── Stat counters ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 max-w-3xl mx-auto">
          {STATS.map((s, i) => (
            <StatItem key={s.label} stat={s} index={i} isInView={isInView} />
          ))}
        </div>

        {/* ── Drag-to-compare slider ── */}
        <ComparisonSlider isInView={isInView} />

        {/* ── 90-day phase timeline ── */}
        <div className="mt-20">
          <motion.h3
            style={{
              textAlign: "center",
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
              fontWeight: 300,
              color: "#8B2F3A",
              margin: "0 0 40px",
            }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            What Happens Inside Your Body
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PHASES.map((phase, i) => (
              <PhaseCard key={phase.num} phase={phase} index={i} isInView={isInView} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

/* ── Animated stat counter ────────────────────────────────────────────── */

function StatItem({
  stat,
  index,
  isInView,
}: {
  stat: typeof STATS[number];
  index: number;
  isInView: boolean;
}) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const ctrl = animate(0, stat.value, {
      duration: 1.9,
      delay: index * 0.12,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [isInView, stat.value, index]);

  return (
    <motion.div
      style={{ textAlign: "center", padding: "28px 12px" }}
      initial={{ opacity: 0, y: 18 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1, ease: "easeOut" }}
    >
      {/* Gold hairline rule */}
      <div style={{ width: 28, height: 1, background: "#C9A96E", margin: "0 auto 14px" }} />
      <div
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "clamp(2.75rem, 6vw, 4.25rem)",
          fontWeight: 300,
          lineHeight: 1,
          color: "#8B2F3A",
        }}
      >
        {val}
        {stat.suffix}
      </div>
      <div
        style={{
          fontFamily: "var(--font-jost), sans-serif",
          fontSize: 13,
          fontWeight: 300,
          color: "#6B5F5A",
          marginTop: 8,
          lineHeight: 1.5,
        }}
      >
        {stat.label}
      </div>
    </motion.div>
  );
}

/* ── Drag-to-compare slider ───────────────────────────────────────────── */

function ComparisonSlider({ isInView }: { isInView: boolean }) {
  const [pos, setPos]   = useState(50);
  const dragging         = useRef(false);
  const containerRef     = useRef<HTMLDivElement>(null);

  const updatePos = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    setPos(Math.max(5, Math.min(95, ((clientX - left) / width) * 100)));
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      updatePos(e.clientX);
    },
    [updatePos],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragging.current) updatePos(e.clientX);
    },
    [updatePos],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
    >
      {/* Badge */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <span
          style={{
            display: "inline-block",
            padding: "6px 20px",
            border: "1px solid rgba(201,169,110,0.45)",
            borderRadius: 100,
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: 12,
            fontWeight: 400,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#C9A96E",
          }}
        >
          12-Week Documented Comparison — Drag to Reveal
        </span>
      </div>

      {/* Slider */}
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          position: "relative",
          height: 460,
          maxWidth: 740,
          margin: "0 auto",
          borderRadius: 6,
          overflow: "hidden",
          cursor: "ew-resize",
          userSelect: "none",
          touchAction: "none",
          boxShadow: "0 24px 64px rgba(61,51,53,0.13)",
        }}
      >

        {/* ── AFTER panel (base layer, always visible) ── */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(155deg, #EDE5DC 0%, #D6C9B5 55%, #E8DDD0 100%)",
          }}
        >
          <svg
            viewBox="0 0 300 310"
            preserveAspectRatio="xMidYMid meet"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.85 }}
            aria-hidden
          >
            <circle cx="150" cy="155" r="108" fill="rgba(201,169,110,0.07)" />
            <circle cx="150" cy="155" r="9"   fill="rgba(201,169,110,0.45)" />
            {DENSE.map((d, i) => (
              <path
                key={i} d={d}
                stroke="#C9A96E"
                strokeWidth={i % 3 === 0 ? 2.4 : 1.7}
                fill="none"
                opacity={0.55 + (i % 5) * 0.09}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* AFTER label chip */}
          <div style={chipStyle("right")}>Week 12 — AFTER</div>

          {/* Bottom caption */}
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: "32px 24px 20px",
              background: "linear-gradient(to top, rgba(214,201,181,0.55), transparent)",
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: 22, fontStyle: "italic", fontWeight: 300,
              color: "#8B2F3A", textAlign: "right",
            }}
          >
            Density restored. Growth visible.
          </div>
        </div>

        {/* ── BEFORE panel (clipped to the left of the divider) ── */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(155deg, #C6BEB6 0%, #A8A098 55%, #B8B0A8 100%)",
            clipPath: `inset(0 ${100 - pos}% 0 0)`,
          }}
        >
          <svg
            viewBox="0 0 300 310"
            preserveAspectRatio="xMidYMid meet"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.7 }}
            aria-hidden
          >
            <circle cx="150" cy="155" r="108" fill="rgba(60,52,48,0.06)" />
            <circle cx="150" cy="155" r="9"   fill="rgba(80,72,68,0.3)" />
            {SPARSE.map((d, i) => (
              <path
                key={i} d={d}
                stroke="#7A7068"
                strokeWidth={1.5}
                fill="none"
                opacity={0.45 + (i % 3) * 0.12}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* BEFORE label chip */}
          <div style={chipStyle("left")}>Week 0 — BEFORE</div>

          {/* Bottom caption */}
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: "32px 24px 20px",
              background: "linear-gradient(to top, rgba(100,92,88,0.18), transparent)",
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: 22, fontStyle: "italic", fontWeight: 300,
              color: "#3D3335",
            }}
          >
            Thinning. Shedding. Dormant follicles.
          </div>
        </div>

        {/* ── Divider + handle ── */}
        <div
          style={{
            position: "absolute",
            left: `${pos}%`,
            top: 0, bottom: 0,
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          <div style={{ flex: 1, width: 2, background: "rgba(255,255,255,0.9)" }} />
          {/* Handle circle */}
          <div
            style={{
              width: 46, height: 46,
              borderRadius: "50%",
              background: "#8B2F3A",
              border: "3px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              flexShrink: 0,
              boxShadow: "0 4px 18px rgba(0,0,0,0.22)",
            }}
          >
            <svg width="7" height="13" viewBox="0 0 7 13" fill="none" aria-hidden>
              <path d="M6 1L1 6.5 6 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <svg width="7" height="13" viewBox="0 0 7 13" fill="none" aria-hidden>
              <path d="M1 1l5 5.5-5 5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ flex: 1, width: 2, background: "rgba(255,255,255,0.9)" }} />
        </div>

      </div>

      {/* Hint */}
      <p
        style={{
          textAlign: "center",
          marginTop: 10,
          fontFamily: "var(--font-jost), sans-serif",
          fontSize: 12,
          color: "#6B5F5A",
          letterSpacing: "0.06em",
        }}
      >
        ← drag to compare →
      </p>
    </motion.div>
  );
}

/* ── Phase card ───────────────────────────────────────────────────────── */

function PhaseCard({
  phase,
  index,
  isInView,
}: {
  phase: typeof PHASES[number];
  index: number;
  isInView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: 0.55 + index * 0.13, ease: "easeOut" }}
      style={{
        background: "#FDFBF8",
        border: "1px solid rgba(0,0,0,0.07)",
        borderTop: `3px solid ${phase.accent}`,
        borderRadius: 4,
        padding: "28px 26px 26px",
      }}
    >
      {/* Numbered circle */}
      <div
        style={{
          width: 44, height: 44,
          borderRadius: "50%",
          background: phase.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: 17,
            fontWeight: 300,
            color: "white",
            lineHeight: 1,
          }}
        >
          {phase.num}
        </span>
      </div>

      <div
        style={{
          fontFamily: "var(--font-jost), sans-serif",
          fontSize: 11,
          fontWeight: 400,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: phase.accent,
          marginBottom: 8,
        }}
      >
        {phase.month} · {phase.days}
      </div>

      <h3
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: 26,
          fontWeight: 300,
          color: "#8B2F3A",
          margin: "0 0 10px",
          lineHeight: 1.2,
        }}
      >
        {phase.headline}
      </h3>

      <p
        style={{
          fontFamily: "var(--font-jost), sans-serif",
          fontSize: 15,
          fontWeight: 300,
          color: "#4A3F3C",
          lineHeight: 1.78,
          margin: "0 0 18px",
        }}
      >
        {phase.body}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {phase.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontFamily: "var(--font-jost), sans-serif",
              fontSize: 11,
              fontWeight: 400,
              letterSpacing: "0.07em",
              color: "#6B5F5A",
              background: "rgba(201,169,110,0.09)",
              border: "1px solid rgba(201,169,110,0.28)",
              borderRadius: 100,
              padding: "3px 10px",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function chipStyle(side: "left" | "right"): CSSProperties {
  return {
    position: "absolute",
    top: 18,
    [side]: 18,
    fontFamily: "var(--font-jost), sans-serif",
    fontSize: 11,
    fontWeight: 400,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: side === "right" ? "#8B2F3A" : "#4A3F3C",
    background: "rgba(253,251,248,0.88)",
    padding: "5px 12px",
    borderRadius: 3,
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
  };
}

/* ── Shared text styles ───────────────────────────────────────────────── */

const LABEL: CSSProperties = {
  display: "block",
  fontFamily: "var(--font-jost), sans-serif",
  fontSize: 14,
  fontWeight: 400,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "#C9A96E",
  marginBottom: 20,
};

const HEADLINE: CSSProperties = {
  fontFamily: "var(--font-cormorant), Georgia, serif",
  fontSize: "clamp(2.4rem, 5.5vw, 3.25rem)",
  fontWeight: 300,
  lineHeight: 1.1,
  color: "#8B2F3A",
  margin: "0 0 16px",
};

const SUBTITLE: CSSProperties = {
  fontFamily: "var(--font-jost), sans-serif",
  fontSize: 18,
  fontWeight: 300,
  lineHeight: 1.7,
  color: "#4A3F3C",
  margin: 0,
};
