"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ── Data ────────────────────────────────────────────────────────── */

const ITEMS = [
  {
    id: "dht",
    num: "01",
    name: "DHT DEFENSE COMPLEX™",
    icon: "leaf",
    ingredients: "Saw Palmetto · Zinc · Biotin",
    description:
      "Blocks the DHT hormone that shrinks and destroys hair follicles during menopause. Saw Palmetto is the most studied natural DHT inhibitor, supported by Zinc for follicle protein synthesis and Biotin for keratin production.",
    badge: "HORMONAL PROTECTION",
    circleBg: "rgba(139, 47, 58, 0.08)",
    circleBorder: "rgba(139, 47, 58, 0.18)",
  },
  {
    id: "follicle",
    num: "02",
    name: "FOLLICLE FUEL MATRIX™",
    icon: "drop",
    ingredients: "Marine Collagen · L-Cysteine · Iron Bisglycinate",
    description:
      "Delivers the raw building blocks your follicles need. Marine Collagen provides amino acids for hair structure. L-Cysteine is the primary amino acid in keratin. Iron Bisglycinate replenishes stores that deplete during hormonal shifts.",
    badge: "STRUCTURAL REBUILDING",
    circleBg: "rgba(201, 169, 110, 0.1)",
    circleBorder: "rgba(201, 169, 110, 0.3)",
  },
  {
    id: "stress",
    num: "03",
    name: "STRESS SHIELD BLEND™",
    icon: "flame",
    ingredients: "Ashwagandha KSM-66 · B6 · B12 · Folate",
    description:
      "Lowers cortisol and returns follicles to active growth cycle. KSM-66 is the highest-concentration Ashwagandha extract, clinically shown to reduce cortisol. B-vitamins support nervous system resilience during hormonal transition.",
    badge: "CORTISOL REGULATION",
    circleBg: "rgba(196, 130, 30, 0.08)",
    circleBorder: "rgba(196, 130, 30, 0.2)",
  },
  {
    id: "scalp",
    num: "04",
    name: "SCALP VITALITY COMPLEX™",
    icon: "sprout",
    ingredients: "Vitamin D3 · Selenium · Horsetail Extract",
    description:
      "Restores the scalp ecosystem where hair grows. Vitamin D3 receptors exist in every follicle. Selenium supports thyroid function and cellular renewal. Silica from Horsetail strengthens the hair shaft from root to tip.",
    badge: "SCALP ENVIRONMENT",
    circleBg: "rgba(74, 124, 89, 0.08)",
    circleBorder: "rgba(74, 124, 89, 0.2)",
  },
  {
    id: "bioabsorb",
    num: "05",
    name: "BIOABSORB TECHNOLOGY™",
    icon: "sparkle",
    ingredients: "Vitamin C · Bioperine",
    description:
      "Ensures maximum absorption of every ingredient. Vitamin C multiplies iron bioavailability. Bioperine increases nutrient absorption by up to 30%. An ingredient your body cannot absorb is money wasted.",
    badge: "ABSORPTION ENHANCEMENT",
    circleBg: "rgba(107, 95, 90, 0.08)",
    circleBorder: "rgba(107, 95, 90, 0.18)",
  },
] as const;

/* ── Main component ──────────────────────────────────────────────── */

export default function IngredientsAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.15 });

  return (
    <section
      style={{
        backgroundColor: "#FDFBF8",
        padding: "140px 0",
      }}
    >
      <div
        ref={containerRef}
        style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px" }}
      >
        {/* ── Section header — full width, centered ── */}
        <motion.div
          style={{ textAlign: "center", marginBottom: 72 }}
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-jost), sans-serif",
              fontSize: 18,
              fontWeight: 400,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#C9A96E",
              marginBottom: 20,
            }}
          >
            THE FORMULA
          </span>
          <h2
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(2.4rem, 6vw, 3.25rem)",
              fontWeight: 300,
              lineHeight: 1.1,
              color: "#8B2F3A",
              margin: 0,
            }}
          >
            Advanced Hair Biomatrix™
          </h2>
          <p
            style={{
              fontFamily: "var(--font-jost), sans-serif",
              fontSize: 18,
              fontWeight: 300,
              lineHeight: 1.75,
              color: "#4A3F3C",
              maxWidth: 600,
              margin: "20px auto 0",
            }}
          >
            15 clinically studied ingredients. 5 targeted complexes. Each one
            intercepts a specific cause — together, they form one complete system.
          </p>
        </motion.div>

        {/* ── Two-column body: accordion left, image right ── */}
        <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-20">

          {/* LEFT: connected accordion */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Accordion wrapper */}
            <div
              style={{
                position: "relative",
                paddingTop: 32,
                paddingBottom: 32,
              }}
            >
              {/* Vertical gold line */}
              <motion.div
                style={{
                  position: "absolute",
                  left: 7,
                  top: 32,
                  bottom: 32,
                  width: 2,
                  background: "rgba(201, 169, 110, 0.3)",
                  transformOrigin: "top center",
                }}
                initial={{ scaleY: 0 }}
                animate={isInView ? { scaleY: 1 } : {}}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.25 }}
              />

              {/* Top timeline label */}
              <motion.span
                style={{
                  position: "absolute",
                  top: 6,
                  left: 26,
                  fontFamily: "var(--font-jost), sans-serif",
                  fontSize: 13,
                  fontWeight: 400,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#C9A96E",
                }}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                MENOPAUSE TRIGGERS
              </motion.span>


              {/* Accordion items */}
              {ITEMS.map((item, i) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isOpen={openId === item.id}
                  isInView={isInView}
                  index={i}
                  onToggle={() =>
                    setOpenId((prev) => (prev === item.id ? null : item.id))
                  }
                />
              ))}
            </div>

          </div>

          {/* RIGHT: sticky product image */}
          <motion.div
            className="w-full lg:w-[520px] xl:w-[600px] lg:flex-shrink-0 lg:sticky lg:top-28"
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            <img
              src="/formula-wellness.png"
              alt="Advanced Hair Biomatrix™ formula"
              style={{ display: "block", width: "100%" }}
            />

            {/* Footer coda — directly under the image */}
            <motion.div
              style={{ textAlign: "center", marginTop: 40 }}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
            >
              <div style={{ width: 80, height: 1, background: "#C9A96E", margin: "0 auto" }} />
              <p
                style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontSize: 38,
                  fontStyle: "italic",
                  fontWeight: 300,
                  color: "#8B2F3A",
                  margin: "24px 0 12px",
                }}
              >
                One scoop. Every morning.
              </p>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

/* ── Complex icon ────────────────────────────────────────────────── */

function ComplexIcon({ name, color }: { name: string; color: string }) {
  const props = {
    width: 22, height: 22, viewBox: "0 0 24 24",
    fill: "none", stroke: color,
    strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "leaf")
    return (
      <svg {...props}>
        <path d="M6 20c0-9 7-16 16-16C22 13 15 20 6 20z" />
        <path d="M6 20C10 14 14 11 20 8" />
      </svg>
    );
  if (name === "drop")
    return (
      <svg {...props}>
        <path d="M12 3C12 3 6 9.5 6 14a6 6 0 0 0 12 0c0-4.5-6-11-6-11z" />
      </svg>
    );
  if (name === "flame")
    return (
      <svg {...props}>
        <path d="M12 2c0 0-5 5-5 10a5 5 0 0 0 10 0c0-2-1.5-4-2.5-5 0 2-1 3.5-2.5 4C13 9 12 5.5 12 2z" />
      </svg>
    );
  if (name === "sprout")
    return (
      <svg {...props}>
        <path d="M12 22V12" />
        <path d="M12 12C12 8 15 5 19 5c0 4-3 7-7 7z" />
        <path d="M12 12C12 8 9 5 5 5c0 4 3 7 7 7z" />
      </svg>
    );
  // sparkle
  return (
    <svg {...props}>
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
      <path d="M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" />
    </svg>
  );
}

/* ── AccordionItem ───────────────────────────────────────────────── */

type Item = (typeof ITEMS)[number];

function AccordionItem({
  item,
  isOpen,
  isInView,
  index,
  onToggle,
}: {
  item: Item;
  isOpen: boolean;
  isInView: boolean;
  index: number;
  onToggle: () => void;
}) {
  return (
    <motion.div
      style={{ display: "flex", alignItems: "flex-start" }}
      initial={{ opacity: 0, x: -14 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.45 + index * 0.1, ease: "easeOut" }}
    >
      {/* ── Left column: node + horizontal connector ── */}
      {/* Total width = 8px (left half of node) + 8px (right half) + 20px (connector) = 36px
          paddingTop centers the node with the collapsed header (70px circle + 24px top padding) */}
      <div
        style={{
          width: 36,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          paddingTop: 38,
          alignSelf: "flex-start",
        }}
      >
        {/* Node circle */}
        <motion.div
          animate={{
            width: isOpen ? 20 : 16,
            height: isOpen ? 20 : 16,
            backgroundColor: isOpen ? "#8B2F3A" : "#F5EDE4",
            boxShadow: isOpen
              ? "0 0 0 7px rgba(201, 169, 110, 0.15)"
              : "0 0 0 0px rgba(201, 169, 110, 0)",
          }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          style={{
            borderRadius: "50%",
            border: "1.5px solid #C9A96E",
            flexShrink: 0,
            position: "relative",
            zIndex: 10,
          }}
        />
        {/* Horizontal connector */}
        <div
          style={{
            width: 20,
            height: 2,
            background: "rgba(201, 169, 110, 0.3)",
            flexShrink: 0,
          }}
        />
      </div>

      {/* ── Right column: accordion header + expandable content ── */}
      <div
        style={{
          flex: 1,
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          minWidth: 0,
        }}
      >
        {/* Header button */}
        <button
          onClick={onToggle}
          aria-expanded={isOpen}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "24px 0",
            cursor: "pointer",
            background: "none",
            border: "none",
            textAlign: "left",
          }}
        >
          {/* Complex icon */}
          <div
            style={{
              flexShrink: 0,
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: item.circleBg,
              border: `1px solid ${item.circleBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ComplexIcon name={item.icon} color={item.circleBorder} />
          </div>

          {/* Name + ingredients */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-jost), sans-serif",
                fontSize: 16,
                fontWeight: 400,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#8B2F3A",
                lineHeight: 1.3,
              }}
            >
              {item.num} — {item.name}
            </div>
            <div
              style={{
                fontFamily: "var(--font-jost), sans-serif",
                fontSize: 14,
                fontStyle: "italic",
                fontWeight: 300,
                color: "#6B5F5A",
                marginTop: 6,
              }}
            >
              {item.ingredients}
            </div>
          </div>

          {/* Chevron */}
          <motion.svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8B2F3A"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ flexShrink: 0, opacity: 0.7 }}
          >
            <path d="M6 9l6 6 6-6" />
          </motion.svg>
        </button>

        {/* Expandable content */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ paddingBottom: 28 }}>
                <p
                  style={{
                    fontFamily: "var(--font-jost), sans-serif",
                    fontSize: 16,
                    fontWeight: 300,
                    color: "#4A3F3C",
                    lineHeight: 1.8,
                    maxWidth: 550,
                    margin: 0,
                  }}
                >
                  {item.description}
                </p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 16,
                    padding: "5px 14px",
                    border: "1px solid rgba(139, 47, 58, 0.45)",
                    borderRadius: 100,
                    fontFamily: "var(--font-jost), sans-serif",
                    fontSize: 11,
                    fontWeight: 400,
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                    color: "#8B2F3A",
                  }}
                >
                  {item.badge}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
