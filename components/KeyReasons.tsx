"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import type { CSSProperties } from "react";

const C = {
  bg:      "#F2EBE3",
  oxblood: "#8B2F3A",
  gold:    "#C9A96E",
  dark:    "#4A3F3C",
  muted:   "#6B5F5A",
} as const;

// Arc on the LEFT side — shifted right for symmetry with labels
// Quadratic bezier: M 250,60 Q 590,400 250,740
const VIEW_W = 900;
const VIEW_H = 800;
const ARC_PATH = "M 250,60 Q 590,400 250,740";

// Node positions at t = 0.1, 0.3, 0.5, 0.7, 0.9
// Q(250,60)(590,400)(250,740)
const NODES = [
  {
    id: "hormones",
    num: "01",
    label: "HORMONES",
    cx: 311, cy: 128,
    title: "Estrogen Falls. DHT Takes Over.",
    text: "Estrogen used to protect your follicles from DHT — the hormone that shrinks them. During menopause, that protection disappears. DHT miniaturizes follicles until hair stops growing.",
    complex: "DHT Defense Complex™",
    ingredients: "Saw Palmetto · Zinc · Biotin",
  },
  {
    id: "nutrition",
    num: "02",
    label: "NUTRITION",
    cx: 393, cy: 264,
    title: "Your Body Stops Feeding Your Hair.",
    text: "After 40, your body absorbs less iron and zinc. Collagen drops 1% per year. Your follicles are starving — even if your diet is perfect.",
    complex: "Follicle Fuel Matrix™",
    ingredients: "Marine Collagen · L-Cysteine · Iron Bisglycinate",
  },
  {
    id: "stress",
    num: "03",
    label: "STRESS",
    cx: 420, cy: 400,
    title: "Cortisol Forces Hair to Stop Growing.",
    text: "Hormonal shifts spike cortisol. Elevated cortisol pushes follicles into shedding phase early. Your hair isn't weak — your body told it to stop.",
    complex: "Stress Shield Blend™",
    ingredients: "Ashwagandha KSM-66 · B6 · B12 · Folate",
  },
  {
    id: "scalp",
    num: "04",
    label: "SCALP",
    cx: 393, cy: 536,
    title: "Weak Soil. Weak Roots.",
    text: "Vitamin D and selenium deficiency slows cellular renewal in the scalp. The foundation where hair grows can no longer support healthy follicles.",
    complex: "Scalp Vitality Complex™",
    ingredients: "Vitamin D3 · Selenium · Horsetail Extract",
  },
  {
    id: "absorption",
    num: "05",
    label: "ABSORPTION",
    cx: 311, cy: 672,
    title: "Ingredients That Don't Absorb Are Wasted.",
    text: "After 40, bioavailability drops. Most supplements pass through without being absorbed. The best formula means nothing if your body can't use it.",
    complex: "BioAbsorb Technology™",
    ingredients: "Vitamin C · Bioperine",
  },
] as const;

const CARD_W = 380;
const CARD_GAP = 24;

export default function KeyReasons() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId,  setHoverId]  = useState<string | null>(null);
  const [svgScale, setSvgScale] = useState(1);

  const sectionRef = useRef<HTMLElement>(null);
  const svgRef     = useRef<SVGSVGElement>(null);
  const isInView   = useInView(sectionRef, { once: true, amount: 0.15 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 0.5"],
  });
  const sectionOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const sectionY       = useTransform(scrollYProgress, [0, 1], [60, 0]);

  useEffect(() => {
    if (!svgRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setSvgScale(entry.contentRect.width / VIEW_W);
    });
    ro.observe(svgRef.current);
    return () => ro.disconnect();
  }, []);

  const isActive  = (id: string) => id === activeId;
  const isHovered = (id: string) => id === hoverId;

  const activeNode = NODES.find(n => n.id === activeId);

  const handleNodeClick = (id: string) => {
    setActiveId(prev => (prev === id ? null : id));
  };

  const cardStyle = (node: typeof NODES[number]): CSSProperties => ({
    position: "absolute",
    top:  node.cy * svgScale - 60,
    left: (node.cx + 64) * svgScale + CARD_GAP,
    width: CARD_W,
    background: "#FDFBF8",
    border: "1px solid rgba(139,47,58,0.1)",
    borderRadius: 8,
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    padding: 36,
    zIndex: 10,
    pointerEvents: "none",
  });

  return (
    <motion.section
      ref={sectionRef}
      style={{
        position: "relative",
        backgroundColor: "#FDFBF8",
        minHeight: "100vh",
        padding: "120px 0",
        opacity: sectionOpacity,
        y: sectionY,
      }}
    >
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── DESKTOP (md+) ── */}
        <div
          className="hidden md:flex items-start gap-0"
          style={{ maxWidth: 1400, margin: "0 auto", padding: "0 48px" }}
        >
          {/* LEFT: label + headline + subtitle */}
          <div style={{ flex: "0 0 38%", paddingRight: 48, paddingTop: 40 }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span style={LABEL_ST}>THE SCIENCE</span>
              <h2 style={HEADLINE_ST}>
                Key Reasons for Hair Loss During Menopause
              </h2>
              <p style={SUB_ST}>
                Tap each factor to learn what happens inside your body — and how Thamra intercepts it.
              </p>
            </motion.div>
          </div>

          {/* RIGHT: SVG arc + popover card */}
          <div style={{
            flex: 1,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              style={{ width: "100%", overflow: "visible" }}
              aria-label="Five key reasons for hair loss during menopause"
            >
              {/* Arc */}
              <motion.path
                d={ARC_PATH}
                fill="none"
                stroke={C.oxblood}
                strokeWidth="2"
                strokeOpacity="0.28"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
              />

              {/* Arc terminal dots */}
              <motion.circle cx="250" cy="60" r="7" fill={C.oxblood} fillOpacity="0.25"
                initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }} />
              <motion.circle cx="250" cy="740" r="7" fill={C.oxblood} fillOpacity="0.25"
                initial={{ scale: 0 }} animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{ delay: 1.6, duration: 0.3 }} />

              {/* Nodes */}
              {NODES.map((node, i) => {
                const active  = isActive(node.id);
                const hovered = isHovered(node.id);

                return (
                  <motion.g
                    key={node.id}
                    onMouseEnter={() => setHoverId(node.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onClick={() => handleNodeClick(node.id)}
                    style={{ cursor: "pointer" }}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1, y: [0, -8, 0] } : { opacity: 0 }}
                    transition={{
                      opacity: { delay: 0.5 + i * 0.1, duration: 0.4 },
                      y: { duration: 2.6 + i * 0.35, repeat: Infinity, ease: "easeInOut", delay: i * 0.55 },
                    }}
                  >
                    <motion.g
                      style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                      animate={{ scale: active ? 1.1 : hovered ? 1.05 : 1 }}
                      transition={{ type: "spring", stiffness: 320, damping: 22 }}
                    >
                      {/* Gold glow ring */}
                      <motion.ellipse
                        cx={node.cx} cy={node.cy} rx={75} ry={50}
                        fill="none" stroke={C.gold} strokeWidth="2"
                        animate={{ strokeOpacity: active ? 0.6 : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                      {/* Node oval */}
                      <motion.ellipse
                        cx={node.cx} cy={node.cy} rx={60} ry={38}
                        fill={C.oxblood} stroke={C.oxblood} strokeWidth="1.5"
                        animate={{
                          fillOpacity:   active ? 1 : hovered ? 0.45 : 0.18,
                          strokeOpacity: active ? 1 : hovered ? 0.7  : 0.45,
                        }}
                        transition={{ duration: 0.25 }}
                      />
                    </motion.g>

                    {/* Connector line */}
                    <line
                      x1={node.cx + 62} y1={node.cy}
                      x2={node.cx + 78} y2={node.cy}
                      stroke={C.oxblood}
                      strokeOpacity={active ? 0.6 : 0.3}
                      strokeWidth="1.2"
                    />

                    {/* Label */}
                    <text
                      x={node.cx + 85}
                      y={node.cy + 7}
                      fontFamily="var(--font-jost), sans-serif"
                      fontSize="18"
                      fontWeight="500"
                      fill={C.oxblood}
                      textAnchor="start"
                      style={{ letterSpacing: "0.15em", textTransform: "uppercase", userSelect: "none", filter: "drop-shadow(0 1px 4px rgba(255,255,255,0.8))" }}
                    >
                      {node.label}
                    </text>
                  </motion.g>
                );
              })}
            </svg>

            {/* Popover card */}
            <AnimatePresence>
              {activeNode && (
                <motion.div
                  key={activeNode.id}
                  style={cardStyle(activeNode)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                >
                  {/* Arrow pointing left toward node */}
                  <span style={{
                    position: "absolute",
                    left: -8,
                    top: 56,
                    width: 14,
                    height: 14,
                    background: "#FDFBF8",
                    border: "1px solid rgba(139,47,58,0.1)",
                    borderRight: "none",
                    borderTop: "none",
                    transform: "rotate(45deg)",
                  }} />
                  <div style={{ width: 36, height: 1, background: C.gold, marginBottom: 18 }} />
                  <span style={CARD_LABEL_ST}>{activeNode.num} — {activeNode.label}</span>
                  <h3 style={CARD_TITLE_ST}>{activeNode.title}</h3>
                  <p style={CARD_TEXT_ST}>{activeNode.text}</p>
                  <div style={{ marginTop: 22 }}>
                    <span style={CARD_ANSWER_ST}>THAMRA'S ANSWER</span>
                    <div style={CARD_COMPLEX_ST}>{activeNode.complex}</div>
                    <div style={CARD_INGREDIENTS_ST}>{activeNode.ingredients}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── MOBILE (under md) ── */}
        <div className="md:hidden" style={{ padding: "0 24px" }}>
          <span style={LABEL_ST}>THE SCIENCE</span>
          <h2 style={{ ...HEADLINE_ST, fontSize: "clamp(2.25rem, 8.5vw, 3rem)", marginTop: 12 }}>
            Key Reasons for Hair Loss During Menopause
          </h2>
          <p style={{ ...SUB_ST, marginTop: 16 }}>
            Tap each factor to learn what happens inside your body.
          </p>

          <div style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            margin: "28px -24px 0",
            padding: "0 24px 12px",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch" as const,
          }}>
            {NODES.map(node => (
              <motion.button
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                whileTap={{ scale: 0.95 }}
                style={{
                  flexShrink: 0,
                  scrollSnapAlign: "start",
                  padding: "10px 20px",
                  borderRadius: 100,
                  border: `1px solid ${C.oxblood}`,
                  background: isActive(node.id) ? C.oxblood : "transparent",
                  color: isActive(node.id) ? C.bg : C.oxblood,
                  fontFamily: "var(--font-jost), sans-serif",
                  fontSize: 14,
                  fontWeight: 400,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  cursor: "pointer",
                  transition: "background 0.25s, color 0.25s",
                }}
              >
                {node.label}
              </motion.button>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <AnimatePresence mode="wait">
              {activeNode && (
                <motion.div
                  key={activeNode.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  style={{
                    background: "#FDFBF8",
                    border: "1px solid rgba(139,47,58,0.1)",
                    borderRadius: 8,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                    padding: 28,
                  }}
                >
                  <div style={{ width: 36, height: 1, background: C.gold, marginBottom: 16 }} />
                  <span style={CARD_LABEL_ST}>{activeNode.num} — {activeNode.label}</span>
                  <h3 style={CARD_TITLE_ST}>{activeNode.title}</h3>
                  <p style={{ ...CARD_TEXT_ST, maxWidth: "100%" }}>{activeNode.text}</p>
                  <div style={{ marginTop: 20 }}>
                    <span style={CARD_ANSWER_ST}>THAMRA'S ANSWER</span>
                    <div style={CARD_COMPLEX_ST}>{activeNode.complex}</div>
                    <div style={CARD_INGREDIENTS_ST}>{activeNode.ingredients}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </motion.section>
  );
}

/* ── Styles ── */

const LABEL_ST: CSSProperties = {
  display: "block",
  fontFamily: "var(--font-jost), sans-serif",
  fontSize: 16,
  fontWeight: 400,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "#C9A96E",
  marginBottom: 20,
  textShadow: "0 1px 6px rgba(255,255,255,0.7)",
};

const HEADLINE_ST: CSSProperties = {
  fontFamily: "var(--font-cormorant), Georgia, serif",
  fontSize: 72,
  fontWeight: 300,
  lineHeight: 1.08,
  color: "#8B2F3A",
  margin: 0,
  textShadow: "0 2px 12px rgba(255,255,255,0.6)",
};

const SUB_ST: CSSProperties = {
  fontFamily: "var(--font-jost), sans-serif",
  fontSize: 24,
  fontWeight: 300,
  lineHeight: 1.7,
  color: "#6B5F5A",
  marginTop: 24,
  maxWidth: 440,
  textShadow: "0 1px 8px rgba(255,255,255,0.65)",
};

const CARD_LABEL_ST: CSSProperties = {
  display: "block",
  fontFamily: "var(--font-jost), sans-serif",
  fontSize: 14,
  fontWeight: 400,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "#C9A96E",
  marginBottom: 12,
};

const CARD_TITLE_ST: CSSProperties = {
  fontFamily: "var(--font-cormorant), Georgia, serif",
  fontSize: 28,
  fontWeight: 300,
  lineHeight: 1.3,
  color: "#8B2F3A",
  margin: "0 0 10px 0",
};

const CARD_TEXT_ST: CSSProperties = {
  fontFamily: "var(--font-jost), sans-serif",
  fontSize: 20,
  fontWeight: 300,
  lineHeight: 1.75,
  color: "#4A3F3C",
  margin: 0,
  maxWidth: 340,
};

const CARD_ANSWER_ST: CSSProperties = {
  display: "block",
  fontFamily: "var(--font-jost), sans-serif",
  fontSize: 13,
  fontWeight: 400,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "#C9A96E",
  marginBottom: 6,
};

const CARD_COMPLEX_ST: CSSProperties = {
  fontFamily: "var(--font-cormorant), Georgia, serif",
  fontSize: 22,
  fontStyle: "italic",
  fontWeight: 300,
  color: "#8B2F3A",
  marginBottom: 4,
};

const CARD_INGREDIENTS_ST: CSSProperties = {
  fontFamily: "var(--font-jost), sans-serif",
  fontSize: 18,
  fontWeight: 300,
  color: "#6B5F5A",
};
