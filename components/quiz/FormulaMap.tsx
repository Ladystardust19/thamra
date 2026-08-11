"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FORMULA_INTRO, PRINCIPAL_INGREDIENTS, FULL_LIST_CTA } from "@/lib/thamraFormula";
import IngredientsDrawer from "./IngredientsDrawer";

// Ingredient section (responsive spec, brand colors) with auto-rotation:
// advances every 5s, pauses off-screen, resets the timer on pill click, and shows
// a progress overlay that fills the active pill in sync. Content/markup semantics
// are unchanged — only layout/sizing/spacing/behavior differ.

const ROTATE_MS = 5000;

export default function FormulaMap() {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const ing = PRINCIPAL_INGREDIENTS[active];
  const len = PRINCIPAL_INGREDIENTS.length;
  const fade = { duration: reduce ? 0 : 0.35 };

  // Pause auto-rotation while the section is off-screen; start fresh from 0 when
  // it scrolls back into view, so we never land mid-cycle.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.2,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (inView && !paused) setActive(0);
  }, [inView, paused]);

  // Auto-advance. Disabled when reduced motion is preferred, the section is
  // off-screen, or the user has clicked a pill (which stops rotation).
  useEffect(() => {
    if (reduce || !inView || paused) return;
    const id = setTimeout(() => setActive((i) => (i + 1) % len), ROTATE_MS);
    return () => clearTimeout(id);
  }, [active, inView, reduce, paused, len]);

  // Preload the next image so the swap doesn't flash.
  useEffect(() => {
    const next = PRINCIPAL_INGREDIENTS[(active + 1) % len];
    if (next?.image && typeof window !== "undefined") {
      const img = new window.Image();
      img.src = next.image;
    }
  }, [active, len]);

  // Pills render is reused in two places: a full-width row under the heading
  // (<1024px) and inside the left column (>=1024px). Only one is visible per bp.
  const renderPills = () => (
    <div className="grid grid-cols-3 gap-2">
      {PRINCIPAL_INGREDIENTS.map((it, i) => {
        const isActive = i === active;
        return (
          <button
            key={it.name}
            type="button"
            aria-label={it.name}
            aria-pressed={isActive}
            onClick={() => {
              setActive(i);
              setPaused(true);
            }}
            className={`relative flex items-center justify-center overflow-hidden rounded-[4px] px-2 py-4 text-center font-body text-[13px] transition-colors md:px-6 lg:py-6 ${
              isActive
                ? "bg-cream-soft text-burgundy"
                : "bg-cream-soft/10 text-cream-soft hover:bg-cream-soft/[0.15]"
            }`}
          >
            {isActive && !reduce && !paused && (
              <motion.span
                key={`progress-${active}`}
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 h-full rounded-[4px] bg-burgundy/10"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
              />
            )}
            <span className="relative z-10">{it.name}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className="w-full bg-burgundy px-6 py-10 text-cream-soft md:px-8 md:py-12 lg:px-28 lg:py-20"
    >
      {/* Inner container (1600) → content row (1376) */}
      <div className="mx-auto max-w-[1600px]">
        <div className="mx-auto max-w-[1376px]">
          <h2 className="mx-auto mb-10 text-center font-display text-[28px] font-light leading-[1.2] tracking-[-0.84px] md:text-[36px] md:tracking-[-1.08px] lg:mb-20 lg:max-w-[930px] lg:text-[48px] lg:tracking-[-1.44px]">
            {FORMULA_INTRO.heading}
          </h2>

          {/* Pills — full-width row under the heading (<1024px only) */}
          <div className="mb-6 lg:hidden">{renderPills()}</div>

          {/* Two-column row: image above text on mobile; text | image on md+ */}
          <div className="flex flex-col-reverse gap-6 md:flex-row md:items-stretch md:gap-0">
            {/* Left column: pills (lg+) + selected description */}
            <div className="flex flex-col justify-center md:w-1/2 md:rounded-l-[4px] md:border md:border-r-0 md:border-cream-soft/20 md:p-6 lg:justify-between xl:p-20">
              {/* Pills inside the left column (>=1024px only) */}
              <div className="mb-10 hidden lg:block">{renderPills()}</div>

              <div aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={ing.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={fade}
                  >
                    <p className="max-w-md font-body text-[15px] font-light leading-relaxed text-cream-soft/85">
                      {ing.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Right column: image — square 1:1 on mobile, 50%/full-height on md+ */}
            <div className="relative aspect-square w-full overflow-hidden rounded-[2px] bg-burgundy-soft md:aspect-auto md:w-1/2 md:rounded-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={ing.name}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={fade}
                >
                  {ing.image ? (
                    <Image
                      src={ing.image}
                      alt={ing.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center">
                      <span className="font-display text-5xl font-light text-cream-soft/40" aria-hidden>
                        T
                      </span>
                      <span className="font-body text-[12px] tracking-wide text-cream-soft/50">
                        სურათი მალე
                      </span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Full-formula control */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 font-body text-sm text-cream-soft/90 transition-colors hover:text-cream-soft"
            >
              <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-gold" aria-hidden />
              {FULL_LIST_CTA}
            </button>
          </div>
        </div>
      </div>

      <IngredientsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}
