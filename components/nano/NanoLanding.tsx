"use client";

import { ArrowUp, Check, ChevronDown, Clock3, GlassWater, Orbit, Sparkle, Waypoints, X } from "lucide-react";
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
  EXPERTS,
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
        <Ingredients />
        <Timeline />
        <Compare />
        <Ritual />
        <Experts />
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
const HERO_BENEFIT_ICONS = {
  absorption: Orbit,
  nutrition: Waypoints,
  taste: GlassWater,
};

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
              src="/nano-collagen/hero-berry-drink.webp"
              alt="ქალი კენკრის სასმელს სვამს, წინ კი THAMRA Nano Collagen-ის შეფუთვა დევს"
              fill
              priority
              sizes="(max-width: 487px) calc(100vw - 40px), 448px"
              className="object-cover"
            />
          </div>
        </div>

        {/* Copy + purchase */}
        <div className="order-2 lg:order-1">
          <p className="flex items-center gap-2.5 font-body text-[12px] uppercase tracking-[0.22em] text-gold-ink">
            <Sparkle aria-hidden size={15} strokeWidth={1.4} className="shrink-0" />
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
            {HERO.benefits.map((benefit) => {
              const Icon = HERO_BENEFIT_ICONS[benefit.icon];
              return (
                <li key={benefit.icon} className="flex items-center gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-oxblood to-oxblood-dark text-gold ring-1 ring-inset ring-gold/30">
                    <Icon aria-hidden size={21} strokeWidth={1.45} />
                  </span>
                  <span className="font-body text-[15px] leading-snug">
                    <span className="block font-normal text-ink">{benefit.title}</span>
                    <span className="mt-0.5 block text-[14px] font-light text-read">
                      {benefit.text}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Bundle selector */}
          <fieldset id="nano-bundles" className="mt-8 max-w-lg scroll-mt-4">
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
          <p className="mt-4 flex max-w-md items-start gap-2.5 font-body text-[13px] font-light leading-relaxed text-muted">
            <Clock3 aria-hidden size={15} strokeWidth={1.4} className="mt-0.5 shrink-0 text-gold-ink" />
            <span>
              <strong className="font-semibold text-ink">{HERO.note.label}</strong>
              {" | "}
              {HERO.note.text}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ==================== 4. PRODUCT COMPARISON ==================== */
function Compare() {
  return (
    <section id="nano-comparison" aria-labelledby="nano-comparison-title" className="px-4 py-20 sm:px-5 md:px-8 md:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 id="nano-comparison-title" className="text-balance text-center font-display text-[2rem] leading-tight text-oxblood md:text-[2.75rem]">
          {COMPARE.title}
        </h2>

        <div className="mt-9 hidden overflow-hidden rounded-[1.75rem] border border-hairline bg-paper sm:block">
          <table aria-labelledby="nano-comparison-title" className="w-full table-fixed border-separate border-spacing-0">
            <colgroup>
              <col className="w-[43%]" />
              <col span={COMPARE.columns.length} className="w-[19%]" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="bg-surface/65 px-5 py-5 text-left font-display text-[1.3rem] font-normal leading-snug text-oxblood md:px-8 md:text-[1.5rem]">
                  {COMPARE.featureHeading}
                </th>
                {COMPARE.columns.map(({ id, label, featured }) => (
                  <th
                    key={id}
                    scope="col"
                    className={`break-words px-2 py-5 text-center font-body text-[13px] font-semibold leading-snug md:px-4 md:text-[15px] ${featured ? "bg-oxblood-dark text-cream-soft" : "bg-surface/65 text-ink"}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.rows.map(({ feature, includes }) => (
                <tr key={feature}>
                  <th scope="row" className="border-t border-hairline px-5 py-3.5 text-left font-body text-[15px] font-medium leading-snug text-ink md:px-8 md:py-4 md:text-[16px]">
                    {feature}
                  </th>
                  {COMPARE.columns.map(({ id, featured }) => (
                    <td key={id} className={`border-t border-hairline px-2 py-3.5 text-center md:py-4 ${featured ? "bg-oxblood/[0.06]" : ""}`}>
                      <ComparisonMark included={includes[id]} featured={featured} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 sm:hidden">
          <p className="mb-4 text-center font-body text-[14px] text-read">{COMPARE.featureHeading}</p>
          <ul className="space-y-3">
            {COMPARE.rows.map(({ feature, includes }) => (
              <li key={feature} className="rounded-[1.25rem] border border-hairline bg-paper p-3">
                <h3 className="px-1 font-body text-[15px] font-medium leading-snug text-ink">
                  {feature}
                </h3>
                <dl className="mt-3 grid grid-cols-3 gap-1">
                  {COMPARE.columns.map(({ id, label, featured }) => (
                    <div key={id} className={`grid min-w-0 grid-rows-[1fr_auto] justify-items-center gap-1 rounded-xl px-0.5 py-2 text-center ${featured ? "bg-oxblood/[0.08]" : "bg-cream/60"}`}>
                      <dt className={`self-center break-words font-body text-[11px] font-medium leading-tight min-[375px]:text-[12px] ${featured ? "text-oxblood-dark" : "text-read"}`}>
                        {label}
                      </dt>
                      <dd>
                        <ComparisonMark included={includes[id]} featured={featured} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ComparisonMark({ included, featured }: { included: boolean; featured: boolean }) {
  const Icon = included ? Check : X;
  const markStyle = included
    ? featured ? "bg-oxblood text-cream-soft" : "bg-surface text-oxblood-dark"
    : "text-muted";

  return (
    <span className={`inline-grid h-7 w-7 place-items-center rounded-full align-middle ${markStyle}`}>
      <Icon aria-hidden size={16} strokeWidth={included ? 2 : 1.4} />
      <span className="sr-only">{included ? "კი" : "არა"}</span>
    </span>
  );
}

/* ==================== 2. ACTIVE INGREDIENTS ==================== */
function Ingredients() {
  const [titleStart, titleNumber, titleEnd] = INGREDIENTS.title;

  return (
    <section aria-labelledby="active-ingredients-heading" className="bg-paper px-5 py-20 md:px-8 md:py-28">
      <div id="active-ingredients" className="mx-auto max-w-6xl scroll-mt-4">
        <div className="grid items-center gap-5 overflow-hidden rounded-[2rem] border border-gold/20 bg-gradient-to-br from-burgundy-soft to-burgundy px-5 py-7 text-center sm:gap-8 sm:px-10 sm:py-9 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12 lg:px-16 lg:py-11 lg:text-left">
          <div>
            <h2
              id="active-ingredients-heading"
              className="text-balance font-display text-[1.7rem] font-normal leading-[1.15] text-cream-soft sm:text-[2.65rem] lg:text-[3.15rem]"
            >
              {titleStart} <span className="whitespace-nowrap">{titleNumber}</span>{" "}
              {titleEnd}
            </h2>
            <p className="mx-auto mt-5 max-w-xl font-body text-[15px] leading-relaxed text-cream-soft/85 lg:mx-0">
              {INGREDIENTS.subhead}
            </p>
          </div>

          <div aria-hidden className="relative isolate mx-auto grid aspect-square w-full max-w-[10rem] place-items-center sm:max-w-[16rem] lg:max-w-[17rem]">
            <span className="absolute inset-0 -z-10 rounded-full bg-gold/15 blur-3xl" />
            <span className="absolute inset-0 rounded-full border border-gold/25" />
            <span className="absolute inset-[8%] rounded-full border border-dashed border-gold/35" />
            <span className="absolute right-[14%] top-[14%] h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="absolute bottom-[14%] left-[14%] h-1.5 w-1.5 rounded-full bg-gold" />
            <Image
              src={INGREDIENTS.overview}
              alt=""
              width={640}
              height={640}
              sizes="(min-width: 1024px) 196px, (min-width: 640px) 184px, 115px"
              className="h-auto w-[72%] drop-shadow-xl"
            />
          </div>
        </div>

        <ul className="mt-5 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {INGREDIENTS.items.map((ingredient) => (
            <li
              key={ingredient.name}
              className="grid grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-3 rounded-[1.45rem] border border-hairline bg-gradient-to-br from-paper to-cream/80 p-3.5 sm:gap-4 sm:p-4 xl:grid-cols-[5.5rem_minmax(0,1fr)]"
            >
              <div aria-hidden className="grid aspect-square place-items-center rounded-full border border-gold/30 bg-paper/80">
                {ingredient.image ? (
                  <Image
                    src={ingredient.image}
                    alt=""
                    width={512}
                    height={512}
                    sizes="(min-width: 1280px) 86px, 74px"
                    className="h-auto w-full"
                  />
                ) : (
                  <span className="grid h-[88%] w-[88%] place-items-center rounded-full border border-gold/40 bg-gradient-to-br from-cream via-paper to-gold/30 font-display text-3xl text-gold-ink">
                    {ingredient.symbol}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-body text-[15px] font-medium leading-snug text-ink">
                  {ingredient.name}
                </h3>
                <p className="mt-1.5 font-body text-[14px] leading-relaxed text-read">
                  {ingredient.text}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 text-center">
          <Link
            href="#nano-bundles"
            className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-oxblood px-6 py-3 font-body text-[15px] text-cream-soft transition-colors hover:bg-oxblood-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-oxblood"
          >
            {INGREDIENTS.chooseBundle}
            <ArrowUp aria-hidden size={16} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ==================== 3. 90-DAY TIMELINE ==================== */
// The cards grow with their copy. Each card ends above the highest part of
// the curve in its column, using the same vertical scale as the chart.
const CURVE_NODES = [
  { x: 16, y: 64, cardY: 49, alignment: "text-left" },
  { x: 50, y: 46, cardY: 31, alignment: "text-center" },
  { x: 84, y: 28, cardY: 17, alignment: "text-right" },
];
const CURVE_PATH =
  "M0,72 C6,72 10,66 16,64 C30,60 42,52 50,46 C60,39 76,32 84,28 C91,25 96,24 100,23";
const CURVE_BASELINE = 80; // y% where connectors end / month labels sit

function Timeline() {
  return (
    <section id="nano-timeline" aria-labelledby="nano-timeline-title" className="bg-cream px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 id="nano-timeline-title" className="inline-block max-w-2xl rounded-[1.5rem] bg-surface/70 px-6 py-4 font-display text-[1.95rem] font-normal leading-[1.15] text-oxblood sm:text-[2.2rem] md:text-[2.75rem]">
          {TIMELINE.title}
        </h2>

        <div className="relative mt-6 hidden [--timeline-chart-height:18rem] sm:block">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[var(--timeline-chart-height)]">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
              <defs>
                <linearGradient id="nano-curve" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#C9A96E" />
                  <stop offset="55%" stopColor="#A85A4A" />
                  <stop offset="100%" stopColor="#722530" />
                </linearGradient>
              </defs>
              {CURVE_NODES.map(({ x, y }) => (
                <line
                  key={x}
                  x1={x}
                  y1={y}
                  x2={x}
                  y2={CURVE_BASELINE}
                  stroke="#8B2F3A"
                  strokeOpacity="0.35"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <path
                d={CURVE_PATH}
                fill="none"
                stroke="url(#nano-curve)"
                strokeWidth="2.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {CURVE_NODES.map(({ x, y }) => (
              <span
                key={x}
                className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-oxblood-dark ring-4 ring-cream"
                style={{ left: `${x}%`, top: `${y}%` }}
              />
            ))}
            {CURVE_NODES.map(({ x }, i) => (
              <span
                key={x}
                className="absolute -translate-x-1/2 font-display text-[1.9rem] leading-none text-oxblood md:text-[2.3rem]"
                style={{ left: `${x}%`, top: `${CURVE_BASELINE + 4}%` }}
              >
                {i + 1} თვე
              </span>
            ))}
          </div>

          <ol className="relative grid grid-cols-3 items-end gap-3 md:gap-5">
            {TIMELINE.descriptions.map((description, index) => {
              const { cardY, alignment } = CURVE_NODES[index];
              return (
                <li
                  key={description}
                  className={`min-w-0 break-words rounded-[1.25rem] bg-surface/65 p-3 md:p-4 lg:px-5 ${alignment}`}
                  style={{ marginBottom: `calc(var(--timeline-chart-height) * ${(100 - cardY) / 100})` }}
                >
                  <h3 className="sr-only">{index + 1} თვე</h3>
                  <p className="font-body text-[16px] leading-relaxed text-read lg:text-[18px]">
                    {description}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>

        {/* ---- Vertical version (mobile) ---- */}
        <ol className="relative mt-10 flex flex-col gap-9 sm:hidden before:absolute before:bottom-3 before:left-[11px] before:top-3 before:w-px before:bg-gradient-to-b before:from-gold before:to-oxblood">
          {TIMELINE.descriptions.map((description, index) => (
            <li key={description} className="relative flex gap-5">
              <span aria-hidden className="relative z-10 mt-1 h-[22px] w-[22px] shrink-0 rounded-full bg-oxblood-dark ring-4 ring-cream" />
              <div>
                <h3 className="font-display text-[1.65rem] leading-none text-oxblood">
                  {index + 1} თვე
                </h3>
                <p className="mt-2 font-body text-[17px] leading-relaxed text-read">
                  {description}
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
    <section
      id="morning-ritual"
      aria-labelledby="morning-ritual-title"
      className="scroll-mt-12 bg-surface px-5 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="morning-ritual-title"
          className="text-center font-display text-[1.8rem] font-normal leading-tight text-oxblood md:text-[2.4rem]"
        >
          {RITUAL.title}
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
          {RITUAL.images.map((image) => (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={1440}
              height={600}
              sizes="(min-width: 1088px) 500px, (min-width: 768px) calc(50vw - 44px), calc(100vw - 40px)"
              className="h-auto w-full rounded-3xl"
            />
          ))}
        </div>

        <ol className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
          {RITUAL.steps.map((step) => (
            <li
              key={step.n}
              className="rounded-3xl border border-hairline bg-paper p-7 text-center md:p-8"
            >
              <span aria-hidden className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream font-display text-[1.9rem] text-oxblood">
                {step.n}
              </span>
              <h3 className="mt-5 font-display text-[1.25rem] leading-tight text-oxblood">
                {step.title}
              </h3>
              <p className="mt-2 font-body text-[15px] font-light leading-relaxed text-read">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ==================== 6. EXPERT PERSPECTIVES ==================== */
function Experts() {
  const { title, featured, additional } = EXPERTS;

  return (
    <section id="nano-experts" aria-labelledby="nano-experts-title" className="px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 id="nano-experts-title" className="text-center font-display text-[2rem] leading-tight text-oxblood md:text-[2.65rem]">
          {title}
        </h2>

        <article className="mt-8 grid items-center gap-6 rounded-[2rem] border border-gold/30 bg-gradient-to-br from-paper to-surface/75 p-3.5 sm:p-5 md:grid-cols-[0.7fr_1.3fr] md:gap-8 lg:gap-11 lg:p-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.4rem] bg-surface md:aspect-[5/6]">
            <Image
              src={featured.image}
              alt=""
              fill
              sizes="(min-width: 1216px) 370px, (min-width: 768px) 35vw, (min-width: 640px) calc(100vw - 82px), calc(100vw - 70px)"
              className="object-cover object-[50%_22%]"
            />
          </div>

          <div className="min-w-0 px-2 pb-3 sm:px-3 md:py-4 md:pl-0 md:pr-5 lg:pr-9">
            <h3 className="font-display text-[1.9rem] leading-none text-oxblood md:text-[2.35rem]">
              {featured.name}
            </h3>
            <p className="mt-2.5 font-body text-[14px] italic leading-snug text-muted">
              {featured.role}
            </p>
            <blockquote className="mt-5 border-l border-gold/70 pl-4 font-display text-[1.2rem] leading-relaxed text-read md:mt-6 md:pl-5 lg:text-[1.45rem]">
              <ExpertQuote quote={featured.quote} />
            </blockquote>
          </div>
        </article>

        <ul className="mt-4 grid gap-4 lg:grid-cols-3">
          {additional.map((expert) => (
            <li key={expert.name} className="rounded-[1.5rem] border border-hairline bg-paper p-5 sm:p-6">
              <div className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-3.5 lg:min-h-[6rem]">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface">
                  <Image
                    src={expert.image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                    style={{ objectPosition: expert.imagePosition }}
                  />
                </div>
                <div>
                  <h3 className="font-display text-[1.35rem] leading-tight text-oxblood">
                    {expert.name}
                  </h3>
                  <p className="mt-1 font-body text-[13px] italic leading-snug text-muted">
                    {expert.role}
                  </p>
                </div>
              </div>
              <blockquote className="mt-4 border-t border-hairline pt-4 font-body text-[15px] leading-relaxed text-read">
                <ExpertQuote quote={expert.quote} />
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ExpertQuote({ quote }: { quote: typeof EXPERTS.featured.quote }) {
  return (
    <>
      „{quote.beforeProduct}
      <strong className="font-semibold text-oxblood-dark">{EXPERTS.productName}</strong>
      {quote.afterProduct}“
    </>
  );
}

/* ==================== 7. FAQ ==================== */
function Faq() {
  return (
    <section id="nano-faq" aria-labelledby="nano-faq-title" className="bg-paper px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-3xl">
        <h2 id="nano-faq-title" className="text-center font-display text-[1.8rem] font-normal leading-tight text-oxblood md:text-[2.4rem]">
          {FAQ.title}
        </h2>
        <div className="mt-9 space-y-3">
          {FAQ.items.map(({ question, paragraphs }, index) => (
            <details
              key={question}
              open={index === 0}
              className="group rounded-[1.25rem] border border-hairline bg-paper open:border-oxblood/25 open:bg-cream/60"
            >
              <summary className="grid min-h-16 cursor-pointer list-none grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[1.25rem] px-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-oxblood sm:gap-4 sm:px-5 [&::-webkit-details-marker]:hidden">
                <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full border border-gold/45 bg-paper font-display text-[1.15rem] text-gold-ink">
                  {index + 1}
                </span>
                <span className="font-body text-[15px] font-medium leading-relaxed text-ink group-open:text-oxblood-dark sm:text-[16px]">
                  {question}
                </span>
                <ChevronDown aria-hidden size={18} strokeWidth={1.55} className="text-gold-ink group-open:rotate-180" />
              </summary>
              <div className="mx-4 space-y-3 border-t border-hairline py-5 font-body text-[15px] leading-relaxed text-read sm:ml-[4.25rem] sm:mr-6 sm:text-[16px] [&_em]:text-muted [&_strong]:font-semibold [&_strong]:text-ink">
                {paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>
                    {paragraph.map((part, partIndex) => {
                      if (typeof part === "string") return part;
                      const { emphasis: Emphasis, text } = part;
                      return <Emphasis key={partIndex}>{text}</Emphasis>;
                    })}
                  </p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== 8. FINAL CTA BANNER ==================== */
function FinalCta({ href }: { href: string }) {
  return (
    <section id="nano-final-cta" aria-labelledby="nano-final-cta-title" className="px-5 pb-24 pt-4 md:px-8 md:pb-28">
      <div className="relative isolate mx-auto grid max-w-xl pb-5 lg:max-w-6xl lg:grid-cols-12 lg:items-center lg:pb-8">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-[35%] -z-10 rounded-[2rem] border border-gold/20 bg-gradient-to-br from-surface to-paper/60 lg:left-12" />

        <div className="relative mx-3 aspect-[1.04] overflow-hidden rounded-[3.25rem_1.25rem_3.25rem_1.25rem] bg-surface shadow-[0_14px_36px_rgba(55,18,26,0.1)] sm:mx-6 lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:mx-0 lg:aspect-[1.14] lg:rounded-[5.5rem_1.75rem_5.5rem_1.75rem]">
          <Image
            src="/nano-collagen/closing-ritual-portrait.webp"
            alt="ქალი გრძელი, ტალღოვანი თმით დილის შუქში"
            fill
            sizes="(min-width: 1216px) 672px, (min-width: 1024px) calc(58.33vw - 37px), (min-width: 640px) 528px, (min-width: 616px) 552px, calc(100vw - 64px)"
            className="object-cover object-[50%_32%] lg:object-[50%_37%]"
          />
        </div>

        <div className="relative z-10 mx-5 -mt-10 rounded-[1.75rem] border border-gold/25 bg-paper px-5 py-8 text-center shadow-[0_18px_60px_rgba(55,18,26,0.09)] sm:mx-10 sm:px-10 sm:py-10 lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:ml-0 lg:mr-8 lg:mt-20 lg:px-10 lg:py-12 lg:text-left xl:px-12">
          <span
            aria-hidden
            className="relative mx-auto mb-5 grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-cream text-gold-ink lg:mx-0"
          >
            <span className="absolute inset-[7px] rotate-45 rounded-[5px] border border-gold/60" />
            <Sparkle size={19} strokeWidth={1.4} />
          </span>
          <h2
            id="nano-final-cta-title"
            className="text-balance font-display text-[1.7rem] font-normal leading-tight text-oxblood sm:text-[2.4rem] xl:text-[2.65rem]"
          >
            {FINAL_CTA.title}
          </h2>
          <p className="mx-auto mt-4 max-w-md font-body text-[15px] leading-relaxed text-read md:text-[16px] lg:mx-0">
            {FINAL_CTA.subhead}
          </p>
          <Link
            href={href}
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-oxblood px-4 py-3.5 font-body text-[15px] text-cream-soft transition-colors hover:bg-oxblood-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-oxblood sm:w-auto sm:px-9"
          >
            {FINAL_CTA.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
