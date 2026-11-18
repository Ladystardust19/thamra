"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { NAD, PURCHASE_OPTIONS, type PurchaseOptionId } from "@/lib/hairCellNad";

/*
 * Section 1 (split hero + purchase choice) and Section 5 (sticky bar).
 * The sticky bar is the page's only purchase button, so it is always shown
 * and shares the selected purchase option with the hero.
 *
 * `checkoutHref` is null until the product has a price in lib/products.ts;
 * the button then renders disabled instead of linking somewhere wrong.
 */

const BURGUNDY = "#5A1A1F";
const IVORY = "#F7F3EC";
const CHARCOAL = "#2A2526";

export default function NadHero({
  checkoutHref,
  price,
}: {
  checkoutHref: string | null;
  price: number | null;
}) {
  const [option, setOption] = useState<PurchaseOptionId>("once");
  const href = checkoutHref ? `${checkoutHref}&purchase=${option}` : null;

  return (
    <>
      <section aria-labelledby="nad-title" className="w-full" style={{ backgroundColor: IVORY }}>
        <div className="mx-auto grid w-full max-w-[1280px] lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-12 lg:py-16">
          {/* Packaging — full image, never cropped */}
          <div className="lg:order-1">
            <Image
              src="/hair-cell-nad/box.webp"
              alt="THAMRA HAIR CELL NAD+ — ყუთი და პაკეტები"
              width={1536}
              height={1024}
              priority
              sizes="(min-width: 1024px) 640px, 100vw"
              className="h-auto w-full"
            />
          </div>

          {/* Copy + purchase */}
          <div className="flex flex-col justify-center px-5 pb-12 pt-8 sm:px-10 lg:order-2 lg:px-0 lg:py-0">
            <h1
              id="nad-title"
              className="font-display font-normal tracking-[0.04em]"
              style={{ color: BURGUNDY, fontSize: "clamp(1.875rem, 4.2vw, 3.25rem)", lineHeight: 1.1 }}
            >
              {NAD.name}
            </h1>
            <p
              className="mt-4 font-display text-[1.25rem] leading-snug lg:text-[1.5rem]"
              style={{ color: CHARCOAL }}
            >
              {NAD.subhead}
            </p>
            <p className="mt-5 max-w-[480px] font-body text-[16px] font-light leading-[1.7]" style={{ color: "#4A3F3C" }}>
              {NAD.micro}
            </p>

            {price !== null && (
              <p className="mt-7 font-display text-[2rem] leading-none lg:text-[2.25rem]" style={{ color: BURGUNDY }}>
                {price} ₾
              </p>
            )}

            <fieldset className="mt-6 max-w-[480px]">
              <legend className="sr-only">შეძენის ტიპი</legend>
              <div className="flex flex-col gap-2.5">
                {PURCHASE_OPTIONS.map((o) => {
                  const checked = option === o.id;
                  return (
                    <label
                      key={o.id}
                      className="flex min-h-[56px] cursor-pointer items-center gap-4 px-4 transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 motion-reduce:transition-none"
                      style={{
                        border: `1px solid ${checked ? BURGUNDY : "rgba(42,37,38,0.18)"}`,
                        backgroundColor: checked ? "#FFFDF9" : "transparent",
                        outlineColor: BURGUNDY,
                      }}
                    >
                      <input
                        type="radio"
                        name="nad-purchase"
                        value={o.id}
                        checked={checked}
                        onChange={() => setOption(o.id)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden
                        className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                        style={{ border: `1px solid ${checked ? BURGUNDY : "rgba(42,37,38,0.35)"}` }}
                      >
                        <span
                          className="h-2 w-2 rounded-full transition-transform duration-200 motion-reduce:transition-none"
                          style={{ backgroundColor: BURGUNDY, transform: checked ? "scale(1)" : "scale(0)" }}
                        />
                      </span>
                      <span className="font-body text-[16px]" style={{ color: CHARCOAL }}>
                        {o.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

          </div>
        </div>
      </section>

      {/* Sticky bar — the page's purchase button, always on screen */}
      <div
        className="fixed inset-x-0 bottom-0 z-40"
        style={{
          backgroundColor: IVORY,
          borderTop: "1px solid rgba(90,26,31,0.14)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-2.5 px-4 sm:px-10 lg:px-16">
          <span className="min-w-0 flex-1">
            <span
              className="line-clamp-2 font-display text-[14px] leading-tight tracking-[0.01em] min-[400px]:text-[15px] min-[400px]:tracking-[0.04em] sm:text-[17px]"
              style={{ color: BURGUNDY }}
            >
              {NAD.name}
            </span>
            {price !== null && (
              <span className="mt-0.5 block font-body text-[14px] leading-tight" style={{ color: CHARCOAL }}>
                {price} ₾
              </span>
            )}
          </span>
          <Cta
            href={href}
            label={NAD.stickyCta}
            className="min-h-[44px] shrink-0 px-3.5 text-[13px] min-[400px]:px-5 min-[400px]:text-[14px]"
          />
        </div>
      </div>
    </>
  );
}

function Cta({
  href,
  label,
  className,
  tabIndex,
}: {
  href: string | null;
  label: string;
  className: string;
  tabIndex?: number;
}) {
  const base = `inline-flex items-center justify-center border px-6 font-body tracking-[0.02em] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none ${className}`;
  const style = { borderColor: BURGUNDY, outlineColor: BURGUNDY };
  if (!href) {
    return (
      <button type="button" disabled tabIndex={tabIndex} className={`${base} cursor-not-allowed opacity-50`} style={{ ...style, color: BURGUNDY }}>
        {label}
      </button>
    );
  }
  return (
    <Link
      href={href}
      tabIndex={tabIndex}
      className={`${base} bg-[#5A1A1F] text-[#F7F3EC] hover:bg-transparent hover:text-[#5A1A1F]`}
      style={style}
    >
      {label}
    </Link>
  );
}
