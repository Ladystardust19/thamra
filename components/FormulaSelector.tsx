"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { FORMULAS, FORMULA_HEADLINE, FORMULA_CTA } from "@/lib/formulas";

/*
 * "Every stage" formula selector: one static powder photo, three product tabs.
 * Switching a tab swaps only the name, the two paragraphs and the CTA target.
 *
 * Grid areas — mobile:  head / tabs / img / panel
 *              desktop: img + head over (panel | tabs)
 * All three panels share one grid cell on desktop so the tallest one sets the
 * height and the CTA doesn't jump between tabs.
 */

const IVORY = "#F7F3EC";
const BURGUNDY = "#5A1A1F";
const GOLD = "#B89A65";

export default function FormulaSelector() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const last = FORMULAS.length - 1;
    const next =
      e.key === "ArrowDown" || e.key === "ArrowRight" ? (i === last ? 0 : i + 1)
      : e.key === "ArrowUp" || e.key === "ArrowLeft" ? (i === 0 ? last : i - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section
      aria-labelledby="formulas-heading"
      className="w-full"
      style={{ backgroundColor: IVORY }}
    >
      <div
        className="mx-auto grid w-full max-w-[1280px] gap-x-12 px-5 py-16 sm:px-10 md:py-24 lg:gap-x-14 lg:px-12 lg:py-[120px] [grid-template-areas:'head'_'tabs'_'img'_'panel'] lg:grid-cols-[44%_minmax(0,1fr)_168px] lg:[grid-template-areas:'img_head_head'_'img_panel_tabs']"
      >
        {/* Shared headline */}
        <h2
          id="formulas-heading"
          className="font-display font-normal [grid-area:head] lg:max-w-[560px] lg:self-end"
          style={{
            color: BURGUNDY,
            fontSize: "clamp(1.75rem, 3vw, 2.625rem)",
            lineHeight: 1.3,
          }}
        >
          {FORMULA_HEADLINE}
        </h2>

        {/* Tabs — 3 columns on mobile, slim vertical column on desktop */}
        <div
          role="tablist"
          aria-label="THAMRA ფორმულები"
          className="mt-8 grid grid-cols-3 gap-2 [grid-area:tabs] lg:mt-10 lg:flex lg:flex-col lg:gap-2.5 lg:self-start"
        >
          {FORMULAS.map((f, i) => {
            const selected = i === active;
            return (
              <button
                key={f.slug}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                id={`formula-tab-${f.slug}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`formula-panel-${f.slug}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className="flex min-h-[52px] items-center justify-center px-2 py-2.5 text-center font-body text-[12px] font-normal leading-snug tracking-[0.12em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none sm:text-[13px] lg:min-h-[54px] lg:text-[13.5px]"
                style={{
                  backgroundColor: selected ? BURGUNDY : "#FCFAF6",
                  color: selected ? IVORY : BURGUNDY,
                  border: `1px solid ${selected ? BURGUNDY : "rgba(90, 26, 31, 0.22)"}`,
                  outlineColor: GOLD,
                  cursor: selected ? "default" : "pointer",
                }}
              >
                {f.tab}
              </button>
            );
          })}
        </div>

        {/* The one static photograph — never changes with the tab */}
        <div className="mt-8 flex items-center justify-center [grid-area:img] lg:mt-0">
          <Image
            src="/thamra-powder.webp"
            alt="THAMRA-ს ბორდოსფერი ფხვნილი ოქროსფერ კოვზში"
            width={1254}
            height={1254}
            sizes="(min-width: 1024px) 520px, (min-width: 640px) 420px, 80vw"
            className="h-auto w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[540px]"
            style={{
              // Feather the photo's own backdrop into the section ivory; the
              // powder itself is untouched (mask only, no filter).
              WebkitMaskImage:
                "radial-gradient(ellipse 50% 50% at 50% 50%, #000 52%, transparent 100%)",
              maskImage:
                "radial-gradient(ellipse 50% 50% at 50% 50%, #000 52%, transparent 100%)",
            }}
          />
        </div>

        {/* Text panel */}
        <div className="mt-6 [grid-area:panel] lg:mt-10 lg:border-t lg:pt-10" style={{ borderColor: "rgba(184, 154, 101, 0.45)" }}>
          <div className="grid lg:max-w-[480px]">
            {FORMULAS.map((f, i) => {
              const selected = i === active;
              return (
                <div
                  key={f.slug}
                  id={`formula-panel-${f.slug}`}
                  role="tabpanel"
                  aria-labelledby={`formula-tab-${f.slug}`}
                  aria-hidden={!selected}
                  tabIndex={selected ? 0 : -1}
                  className={`[grid-area:1/1] flex flex-col transition-opacity duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none ${
                    selected ? "visible opacity-100" : "invisible opacity-0 max-lg:hidden"
                  }`}
                  style={{ outlineColor: GOLD }}
                >
                  <h3
                    className="font-display font-normal"
                    style={{ color: BURGUNDY, fontSize: "clamp(1.25rem, 1.8vw, 1.5rem)", lineHeight: 1.35 }}
                  >
                    {f.name}
                  </h3>
                  <span aria-hidden className="mt-4 block h-px w-10" style={{ backgroundColor: GOLD }} />
                  <p className="mt-6 font-body text-[16px] font-light leading-[1.72] text-read sm:text-[17px]">
                    {f.paragraphs[0]}
                  </p>
                  <p className="mt-5 font-body text-[16px] font-light leading-[1.72] text-read sm:text-[17px]">
                    {f.paragraphs[1]}
                  </p>
                  {/* mt-auto pins the CTA to the bottom of the shared cell, so
                      it holds the same spot on desktop for every tab */}
                  <div className="mt-auto pt-9">
                    <Link
                      href={f.href}
                      tabIndex={selected ? 0 : -1}
                      className="inline-flex min-h-[48px] items-center justify-center px-7 font-body text-[14px] font-normal tracking-[0.08em] transition-colors duration-200 bg-[#5A1A1F] hover:bg-[#46141A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none max-sm:w-full"
                      style={{ color: IVORY, outlineColor: GOLD }}
                    >
                      {FORMULA_CTA}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
