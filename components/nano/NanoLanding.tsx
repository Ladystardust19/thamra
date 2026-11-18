"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HERO,
  BUNDLES,
  COMPARE,
  INGREDIENTS,
  TIMELINE,
  RITUAL,
  EXPERT,
  FAQ,
  FINAL_CTA,
  STICKY_CTA,
  CATALOG_ID,
} from "@/lib/nanoCollagen";

/*
 * THAMRA — NANO COLLAGEN HAIR ACTIVE DA-1 landing page (8 sections).
 * Luxury wellness aesthetic (Ritual / AG1): warm cream canvas, oxblood (berry)
 * accents, gold hairlines. The hero bundle selector and the mobile sticky bar
 * share one piece of state so the chosen plan + price stay in sync everywhere.
 *
 * `prices` maps each bundle's catalog id → its price (or null if not in the
 * catalog yet); it is resolved server-side so the shown and charged amount match.
 */

type Prices = Record<string, number | null>;

export default function NanoLanding({ prices }: { prices: Prices }) {
  // Default to the "most popular" 3-month bundle — standard high-intent default.
  const [selected, setSelected] = useState(BUNDLES[1].id);
  const selectedPrice = prices[selected] ?? null;
  const checkoutHref = `/checkout?plan=${selected}`;

  return (
    <>
      <main className="bg-cream pb-[calc(76px+env(safe-area-inset-bottom,0px))] lg:pb-0">
        <Hero
          prices={prices}
          selected={selected}
          onSelect={setSelected}
          checkoutHref={checkoutHref}
        />
        <Compare />
        <Ingredients />
        <Timeline />
        <Ritual />
        <Expert />
        <Faq />
        <FinalCta href={checkoutHref} />
      </main>

      {/* ---- Mobile sticky purchase bar (hidden on desktop) ---- */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-paper/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto flex h-[76px] max-w-2xl items-center gap-3 px-4">
          <div className="min-w-0 flex-1">
            <div className="truncate font-body text-[12px] uppercase tracking-[0.14em] text-muted">
              THAMRA NANO COLLAGEN
            </div>
            {selectedPrice !== null && (
              <div className="font-display text-[1.5rem] leading-none text-oxblood">
                {selectedPrice} ₾
              </div>
            )}
          </div>
          <Link
            href={checkoutHref}
            className="shrink-0 rounded-full bg-oxblood px-6 py-3.5 font-body text-[15px] text-cream-soft transition-colors hover:bg-oxblood-dark"
          >
            {STICKY_CTA}
          </Link>
        </div>
      </div>
    </>
  );
}

/* ============================ 1. HERO ============================ */
function Hero({
  prices,
  selected,
  onSelect,
  checkoutHref,
}: {
  prices: Prices;
  selected: string;
  onSelect: (id: string) => void;
  checkoutHref: string;
}) {
  const oneMonth = prices[CATALOG_ID] ?? null;
  const selectedPrice = prices[selected] ?? null;
  // Regular reference for the 3-month (3× the monthly) → strike-through.
  const regular3m = oneMonth !== null ? oneMonth * 3 : null;
  const showStrike = selected !== CATALOG_ID && regular3m !== null;

  return (
    <section className="px-5 pt-24 md:px-8 lg:pt-32">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Packaging */}
        <div className="order-1 lg:order-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[1.75rem] bg-surface">
            <Image
              src="/nano-collagen/hero.webp"
              alt="THAMRA Nano Collagen — შეფუთვა და კენკრის სასმელი"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Copy + purchase */}
        <div className="order-2 lg:order-1">
          <p className="font-body text-[12px] uppercase tracking-[0.22em] text-gold-ink">
            {HERO.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-[2.1rem] font-normal leading-[1.08] text-oxblood md:text-[2.9rem]">
            {HERO.title}
          </h1>
          <p className="mt-5 max-w-lg font-body text-[16px] font-light leading-relaxed text-read">
            {HERO.subhead}
          </p>

          {/* 3 key benefits */}
          <ul className="mt-7 flex flex-col gap-4">
            {HERO.benefits.map((b) => (
              <li key={b.title} className="flex gap-3.5">
                <span className="text-[20px] leading-none">{b.icon}</span>
                <span className="font-body text-[15px] leading-snug text-read">
                  <span className="font-normal text-ink">{b.title}: </span>
                  {b.text}
                </span>
              </li>
            ))}
          </ul>

          {/* Bundle selector */}
          <fieldset className="mt-8 max-w-lg">
            <legend className="sr-only">შეძენის ვარიანტი</legend>
            <div className="flex flex-col gap-3">
              {BUNDLES.map((b) => {
                const checked = selected === b.id;
                const price = prices[b.id] ?? null;
                return (
                  <label
                    key={b.id}
                    className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors ${
                      checked
                        ? "border-oxblood bg-paper"
                        : "border-hairline bg-cream hover:border-oxblood/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="nano-bundle"
                      value={b.id}
                      checked={checked}
                      onChange={() => onSelect(b.id)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        checked ? "border-oxblood" : "border-muted/50"
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full bg-oxblood transition-transform"
                        style={{ transform: checked ? "scale(1)" : "scale(0)" }}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-body text-[15px] font-normal text-ink">
                          {b.title}
                        </span>
                        <span className="font-body text-[13px] text-muted">
                          · {b.servings}
                        </span>
                        {b.badge && (
                          <span className="rounded-full bg-oxblood px-2.5 py-0.5 font-body text-[11px] uppercase tracking-[0.08em] text-cream-soft">
                            {b.badge}
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block font-body text-[13px] font-light text-muted">
                        {b.note}
                      </span>
                    </span>
                    {price !== null && (
                      <span className="shrink-0 font-display text-[1.35rem] leading-none text-oxblood">
                        {price} ₾
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Price + CTA */}
          <div className="mt-7 flex flex-wrap items-baseline gap-3">
            {selectedPrice !== null && (
              <span className="font-display text-[2.6rem] font-normal leading-none text-oxblood">
                {selectedPrice} ₾
              </span>
            )}
            {showStrike && selectedPrice !== regular3m && (
              <span className="font-body text-[16px] text-muted line-through">
                {regular3m} ₾
              </span>
            )}
          </div>

          <Link
            href={checkoutHref}
            className="mt-5 flex w-full items-center justify-center rounded-full bg-oxblood px-6 py-4 font-body text-[16px] tracking-wide text-cream-soft transition-colors hover:bg-oxblood-dark sm:w-auto sm:px-12"
          >
            {HERO.cta}
          </Link>
          <p className="mt-4 max-w-md font-body text-[13px] font-light leading-relaxed text-muted">
            {HERO.note}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ==================== 2. WHY THE FORMULA WORKS ==================== */
function Compare() {
  return (
    <section className="px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 className="mx-auto max-w-3xl text-center font-display text-[1.8rem] font-normal leading-tight text-oxblood md:text-[2.4rem]">
          {COMPARE.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center font-body text-[15px] font-light leading-relaxed text-read">
          {COMPARE.intro}
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {/* Ordinary */}
          <div className="rounded-3xl border border-hairline bg-surface p-7 md:p-8">
            <span className="inline-block rounded-full bg-cream px-3.5 py-1 font-body text-[12px] uppercase tracking-[0.1em] text-muted">
              {COMPARE.ordinary.label}
            </span>
            <ul className="mt-6 flex flex-col gap-5">
              {COMPARE.ordinary.points.map((p) => (
                <li key={p.title} className="flex gap-3">
                  <span className="mt-0.5 font-body text-[18px] leading-none text-muted">
                    ✕
                  </span>
                  <span>
                    <span className="block font-body text-[15px] font-normal text-ink">
                      {p.title}
                    </span>
                    <span className="mt-1 block font-body text-[14px] font-light leading-relaxed text-read">
                      {p.text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* THAMRA */}
          <div className="rounded-3xl border border-oxblood bg-paper p-7 shadow-[0_1px_30px_rgba(139,47,58,0.07)] md:p-8">
            <span className="inline-block rounded-full bg-oxblood px-3.5 py-1 font-body text-[12px] uppercase tracking-[0.1em] text-cream-soft">
              {COMPARE.thamra.label}
            </span>
            <ul className="mt-6 flex flex-col gap-5">
              {COMPARE.thamra.points.map((p) => (
                <li key={p.title} className="flex gap-3">
                  <span className="mt-0.5 font-body text-[18px] leading-none text-oxblood">
                    ✓
                  </span>
                  <span>
                    <span className="block font-body text-[15px] font-normal text-ink">
                      {p.title}
                    </span>
                    <span className="mt-1 block font-body text-[14px] font-light leading-relaxed text-read">
                      {p.text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==================== 3. 8 ACTIVE INGREDIENTS ==================== */
function Ingredients() {
  return (
    <section className="bg-paper px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[1.8rem] font-normal leading-tight text-oxblood md:text-[2.4rem]">
            {INGREDIENTS.title}
          </h2>
          <p className="mt-4 font-body text-[15px] font-light leading-relaxed text-read">
            {INGREDIENTS.subhead}
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {INGREDIENTS.items.map((ing, i) => (
            <li
              key={ing.name}
              className="flex gap-4 rounded-2xl border border-hairline bg-cream p-5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold font-display text-[15px] text-gold-ink">
                {i + 1}
              </span>
              <span>
                <span className="block font-body text-[15px] font-normal text-ink">
                  {ing.name}
                </span>
                <span className="mt-1 block font-body text-[14px] font-light leading-relaxed text-read">
                  {ing.text}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ==================== 4. 90-DAY TIMELINE ==================== */
function Timeline() {
  return (
    <section className="px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-4xl">
        <h2 className="mx-auto max-w-2xl text-center font-display text-[1.8rem] font-normal leading-tight text-oxblood md:text-[2.4rem]">
          {TIMELINE.title}
        </h2>

        <ol className="relative mt-14 flex flex-col gap-10 before:absolute before:left-[18px] before:top-2 before:h-[calc(100%-2rem)] before:w-px before:bg-hairline md:before:left-[22px]">
          {TIMELINE.steps.map((s, i) => (
            <li key={s.label} className="relative flex gap-5 md:gap-7">
              <span className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-oxblood font-display text-[16px] text-cream-soft md:h-11 md:w-11 md:text-[18px]">
                {i + 1}
              </span>
              <div className="pt-1">
                <h3 className="font-body text-[13px] uppercase tracking-[0.12em] text-gold-ink">
                  {s.label}
                </h3>
                <p className="mt-2 max-w-xl font-body text-[15px] font-light leading-relaxed text-read md:text-[16px]">
                  {s.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ==================== 5. HOW TO USE (RITUAL) ==================== */
function Ritual() {
  return (
    <section className="bg-surface px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-display text-[1.8rem] font-normal leading-tight text-oxblood md:text-[2.4rem]">
          {RITUAL.title}
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
          {RITUAL.steps.map((s) => (
            <div
              key={s.n}
              className="rounded-3xl border border-hairline bg-paper p-7 text-center md:p-8"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream font-display text-[1.9rem] text-oxblood">
                {s.n}
              </span>
              <p className="mt-5 font-body text-[15px] font-light leading-relaxed text-read">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== 6. BRAND VISION / EXPERT ==================== */
function Expert() {
  return (
    <section className="px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
        <div className="mx-auto w-full max-w-xs md:max-w-none">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-surface">
            <Image
              src={EXPERT.image}
              alt={EXPERT.name}
              fill
              sizes="(max-width: 768px) 80vw, 35vw"
              className="object-cover"
            />
          </div>
        </div>

        <div>
          <h2 className="font-display text-[1.8rem] font-normal leading-tight text-oxblood md:text-[2.3rem]">
            {EXPERT.title}
          </h2>
          <blockquote className="mt-6 font-display text-[1.25rem] font-light italic leading-relaxed text-read md:text-[1.5rem]">
            „{EXPERT.quote}“
          </blockquote>
          <div className="mt-6 border-t border-hairline pt-5">
            <p className="font-body text-[15px] font-normal text-ink">
              {EXPERT.name}
            </p>
            <p className="mt-1.5 max-w-md font-body text-[13px] font-light leading-relaxed text-muted">
              {EXPERT.role}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==================== 7. FAQ ==================== */
function Faq() {
  return (
    <section className="bg-paper px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center font-display text-[1.8rem] font-normal leading-tight text-oxblood md:text-[2.4rem]">
          {FAQ.title}
        </h2>
        <div className="mt-10">
          {FAQ.items.map((item, i) => (
            <FaqItem key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({
  q,
  a,
  defaultOpen = false,
}: {
  q: string;
  a: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-hairline last:border-b">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-body text-[15px] font-normal text-ink md:text-[16px]">
          {q}
        </span>
        <span className="shrink-0 font-display text-2xl leading-none text-gold-ink">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <p className="-mt-1 pb-5 pr-8 font-body text-[14px] font-light leading-relaxed text-read md:text-[15px]">
          {a}
        </p>
      )}
    </div>
  );
}

/* ==================== 8. FINAL CTA BANNER ==================== */
function FinalCta({ href }: { href: string }) {
  return (
    <section className="px-5 pb-24 pt-4 md:px-8 md:pb-28">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-oxblood px-6 py-16 text-center md:px-12 md:py-20">
        <h2 className="mx-auto max-w-2xl font-display text-[1.9rem] font-normal leading-tight text-cream-soft md:text-[2.6rem]">
          {FINAL_CTA.title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl font-body text-[15px] font-light leading-relaxed text-cream-soft/85 md:text-[16px]">
          {FINAL_CTA.subhead}
        </p>
        <Link
          href={href}
          className="mt-9 inline-flex items-center justify-center rounded-full bg-cream-soft px-10 py-4 font-body text-[16px] tracking-wide text-oxblood transition-colors hover:bg-paper md:px-14"
        >
          {FINAL_CTA.cta}
        </Link>
      </div>
    </section>
  );
}
