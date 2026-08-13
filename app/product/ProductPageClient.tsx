"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import IngredientsDrawer from "@/components/quiz/IngredientsDrawer";
import WhyDifferent from "@/components/sections/WhyDifferent";
import BenefitsTimeline from "@/components/sections/BenefitsTimeline";
import FormulaMap from "@/components/quiz/FormulaMap";
import { FULL_LIST_CTA } from "@/lib/thamraFormula";
import { getProduct } from "@/lib/products";

// 6-month program (Thamra Hair Longevity) — total price + monthly equivalent
// for the bundle card. Sourced from lib/products.ts so it stays in sync.
const LONGEVITY = getProduct("longevity");
const LONGEVITY_PRICE = LONGEVITY?.price ?? 749;
const LONGEVITY_MONTHLY = Math.round(LONGEVITY_PRICE / 6);

// --- Product config -------------------------------------------------------
// Featured program shown on this PDP (Thamra Signature, 90-day). Prices and
// program come from lib/products.ts.
const PLAN_ID = "foundation";
const PRICE = 149;
const SUPPLY_LINE = "30-დღიანი პროგრამა";

const DESCRIPTION =
  "ყოველდღიური თმის დანამატი, რომელიც შექმნილია თმის ცვენის შესამცირებლად, შესამჩნევად სქელი და უფრო სწრაფი თმის ზრდისთვის მენოპაუზის პერიოდში.";

const IMAGES = [
  { src: "/product-main.webp", alt: "Thamra — ყუთი, ბოთლი და ფხვნილი" },
  { src: "/product-drinking.webp", alt: "ქალი სვამს Thamra-ს დილის შუქზე" },
  { src: "/product-bottle.webp", alt: "Thamra-ს ბოთლი ქვაზე, ყვავილებთან" },
];

// Primary outcomes (checkmark bullets).
const OUTCOMES = [
  "თმის ცვენის შემცირება",
  "უფრო სქელი თმა",
  "უფრო სწრაფი თმის ზრდა",
  "ღრმა მოსვენება",
];

// Formula / quality highlights (small trust lines under the outcomes).
const HIGHLIGHTS = [
  "14 ბიოაქტიური ნუტრიენტი",
  "ერთი ყოველდღიური ფორმულა",
  "ლაბორატორიულად შემოწმებული ხარისხზე",
];

// --- Small pieces ---------------------------------------------------------

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-hairline">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="font-body text-[15px] tracking-wide text-ink">{title}</span>
        <span className="font-body text-xl leading-none text-gold">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="pb-5 -mt-1">{children}</div>}
    </div>
  );
}

// --- Page -----------------------------------------------------------------

export default function ProductPageClient() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <>
    <main className="bg-cream px-5 pb-20 pt-28 md:px-8 lg:pt-32">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        {/* ---------------- Gallery (left) ---------------- */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface">
            <Image
              src={IMAGES[0].src}
              alt={IMAGES[0].alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {IMAGES.slice(1).map((img) => (
              <div
                key={img.src}
                className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-surface"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 28vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- Buy panel (right) ---------------- */}
        <div className="lg:pt-2">
          <div className="lg:sticky lg:top-28">
            <h1 className="font-display text-[2rem] font-normal leading-tight text-oxblood md:text-[2.4rem]">
              THAMRA-თმის ჯანმრთელობა მენოპაუზის დროს
            </h1>

            <p className="mt-4 max-w-md font-body text-[15px] font-light leading-relaxed text-read">
              {DESCRIPTION}
            </p>

            <div className="mt-6">
              <div className="font-display text-[2.6rem] font-normal leading-none text-oxblood">
                {PRICE} ₾
              </div>
              <div className="mt-1.5 font-body text-[13px] text-muted">{SUPPLY_LINE}</div>
            </div>

            <Link
              href={`/checkout?plan=${PLAN_ID}`}
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-oxblood px-6 py-4 font-body text-[16px] text-cream-soft transition-colors hover:bg-oxblood-dark"
            >
              დაიწყე ახლა
            </Link>
            <p className="mt-3 text-center font-body text-[12px] font-light text-muted">
              მიწოდება მთელ საქართველოში
            </p>

            <div className="mt-8">
              <Accordion title="უპირატესობები" defaultOpen>
                <ul className="flex flex-col gap-2.5">
                  {OUTCOMES.map((b) => (
                    <li key={b} className="flex gap-2 font-body text-[14px] font-light leading-relaxed text-read">
                      <span className="mt-[2px] text-gold">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-col gap-1.5 border-t border-hairline pt-4">
                  {HIGHLIGHTS.map((h) => (
                    <div key={h} className="flex items-center gap-2 font-body text-[13px] font-light text-muted">
                      <span className="h-1 w-1 rounded-full bg-gold" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </Accordion>

              {/* Ingredients — opens the side drawer instead of expanding inline */}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="flex w-full items-center justify-between border-t border-hairline py-4 text-left"
              >
                <span className="font-body text-[15px] tracking-wide text-ink">
                  {FULL_LIST_CTA}
                </span>
                <span className="font-body text-xl leading-none text-gold">+</span>
              </button>
            </div>

            {/* Bundle / upgrade card */}
            <div className="mt-6 flex items-center gap-4 rounded-xl bg-surface p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
                <Image src="/product-bottle.webp" alt="" fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-body text-[14px] font-normal text-ink">
                  6-თვიანი სრული პროგრამა
                </div>
                <div className="mt-0.5 font-body text-[13px] font-light text-muted">
                  {LONGEVITY_PRICE} ₾ · ≈{LONGEVITY_MONTHLY} ₾ თვეში
                </div>
              </div>
              <Link
                href="/checkout?plan=longevity"
                className="shrink-0 rounded-full border border-oxblood px-4 py-1.5 font-body text-[13px] text-oxblood transition-colors hover:bg-oxblood hover:text-cream-soft"
              >
                დამატება
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-6xl">
        <WhyDifferent />
      </div>

      <div className="mx-auto mt-20 max-w-6xl md:mt-28">
        <BenefitsTimeline />
      </div>

      {/* Formula lead-in — sits just above the 14-ingredient section */}
      <div className="mx-auto mt-20 max-w-3xl px-4 text-center md:mt-28">
        <p className="font-display text-[1.5rem] font-normal leading-snug text-oxblood md:text-[1.9rem]">
          THAMRA აერთიანებს 14 ინგრედიენტს მენოპაუზასთან დაკავშირებული თმის ცვენის მთავარ მიზეზზე ზრუნვისთვის
        </p>
      </div>

      <IngredientsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </main>

    <FormulaMap />
    </>
  );
}
