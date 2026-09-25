import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProduct } from "@/lib/products";

const PRODUCT = getProduct("nano-collagen")!;
const CHECKOUT_HREF = `/checkout?plan=${PRODUCT.id}`;
const CTA_LABEL = "შეუკვეთე ახლა";

export const metadata: Metadata = {
  title: "THAMRA NANO COLLAGEN HAIR — თმის ფორმულა",
  description:
    "ნანო კოლაგენი, კერატინი, ბიოტინი, ჰიალურონის მჟავა და L-თიანინი. ერთი პაკეტი დღეში — უფრო სქელი და ჯანსაღი თმისთვის. ერთთვიანი პროგრამა.",
};

// The 5 product photos already carry all the Georgian copy (stats, before/after,
// ingredient table, tagline), so the page is a clean vertical stack of them
// around the title + buy CTA. Files live in /public/nano-collagen.
const SHOTS = [
  { src: "/nano-collagen/hero.webp", alt: "THAMRA Nano Collagen Hair — შეფუთვა, სასმელი და სთიკი", w: 1080, h: 1350, priority: true },
  { src: "/nano-collagen/clinical-stats.webp", alt: "კლინიკური შედეგები — 93% უფრო სქელი თმა, 42% ნაკლები ცვენა", w: 1024, h: 1536 },
  { src: "/nano-collagen/before-after.webp", alt: "ნამდვილი ქალები, ნამდვილი შედეგები — თამრამდე და თამრას შემდეგ", w: 1080, h: 1350 },
  { src: "/nano-collagen/ingredients.webp", alt: "მთავარი ინგრედიენტები და მათი ბენეფიტები", w: 1080, h: 1350 },
  { src: "/nano-collagen/sachet-tagline.webp", alt: "ერთი პაკეტი დღეში — უფრო სქელი, ჯანსაღი თმისთვის", w: 1080, h: 1350 },
];

export default function NanoCollagenPage() {
  return (
    <>
      <main className="bg-cream px-5 pb-28 pt-24 md:px-8 md:pb-24 lg:pt-32">
        <div className="mx-auto max-w-2xl">
          {/* ---------------- Title + buy ---------------- */}
          <div className="text-center">
            <p className="font-body text-[12px] uppercase tracking-[0.22em] text-muted">
              THAMRA · Women&apos;s Hair Longevity
            </p>
            <h1 className="mt-3 font-display text-[2rem] font-normal leading-tight text-oxblood md:text-[2.6rem]">
              THAMRA NANO COLLAGEN HAIR
            </h1>
            <p className="mx-auto mt-4 max-w-md font-body text-[15px] font-light leading-relaxed text-read">
              ნანო კოლაგენი, კერატინი, ბიოტინი, ჰიალურონის მჟავა და L-თიანინი —
              ერთი პაკეტი დღეში, უფრო სქელი და ჯანსაღი თმისთვის.
            </p>

            <div className="mt-6">
              <div className="font-display text-[2.6rem] font-normal leading-none text-oxblood">
                {PRODUCT.price} ₾
              </div>
              <div className="mt-1.5 font-body text-[13px] text-muted">
                {PRODUCT.duration}
              </div>
            </div>

            <Link
              href={CHECKOUT_HREF}
              className="mt-6 inline-flex w-full max-w-sm items-center justify-center rounded-lg bg-oxblood px-6 py-4 font-body text-[16px] text-cream-soft transition-colors hover:bg-oxblood-dark"
            >
              {CTA_LABEL}
            </Link>
            <p className="mt-3 font-body text-[12px] font-light text-muted">
              მიწოდება მთელ საქართველოში · გადახდა საქართველოს ბანკის დაცულ გვერდზე
            </p>
          </div>

          {/* ---------------- Image stack ---------------- */}
          <div className="mt-12 flex flex-col gap-5 md:mt-16 md:gap-7">
            {SHOTS.map((s) => (
              <div
                key={s.src}
                className="overflow-hidden rounded-2xl bg-surface"
              >
                <Image
                  src={s.src}
                  alt={s.alt}
                  width={s.w}
                  height={s.h}
                  priority={s.priority}
                  sizes="(max-width: 768px) 100vw, 672px"
                  className="h-auto w-full"
                />
              </div>
            ))}
          </div>

          {/* ---------------- Closing buy ---------------- */}
          <div className="mt-14 text-center">
            <div className="font-display text-[2.2rem] font-normal leading-none text-oxblood">
              {PRODUCT.price} ₾
            </div>
            <div className="mt-1.5 font-body text-[13px] text-muted">
              {PRODUCT.duration}
            </div>
            <Link
              href={CHECKOUT_HREF}
              className="mt-5 inline-flex w-full max-w-sm items-center justify-center rounded-lg bg-oxblood px-6 py-4 font-body text-[16px] text-cream-soft transition-colors hover:bg-oxblood-dark"
            >
              {CTA_LABEL}
            </Link>
          </div>
        </div>
      </main>

      {/* Sticky buy bar — mobile only, keeps the price + CTA in reach while
          scrolling the tall image stack. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-cream/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="shrink-0">
            <div className="font-display text-[1.4rem] font-normal leading-none text-oxblood">
              {PRODUCT.price} ₾
            </div>
            <div className="font-body text-[11px] text-muted">{PRODUCT.duration}</div>
          </div>
          <Link
            href={CHECKOUT_HREF}
            className="flex flex-1 items-center justify-center rounded-lg bg-oxblood px-5 py-3 font-body text-[15px] text-cream-soft transition-colors hover:bg-oxblood-dark"
          >
            {CTA_LABEL}
          </Link>
        </div>
      </div>
    </>
  );
}
