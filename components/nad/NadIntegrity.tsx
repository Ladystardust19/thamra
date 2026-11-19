import Image from "next/image";
import { INTEGRITY, NAD } from "@/lib/hairCellNad";

// Section 4 — philosophy and daily ritual.
export default function NadIntegrity() {
  return (
    <section aria-labelledby="nad-integrity" className="w-full bg-[#EFE7DC]">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-9 px-5 py-16 sm:px-10 md:py-24 lg:grid-cols-2 lg:gap-x-14 lg:gap-y-12 lg:px-12 lg:py-28">
        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <h2 id="nad-integrity" className="font-display text-[clamp(1.875rem,4vw,3rem)] font-normal leading-[1.2] text-burgundy">
            <span className="block text-balance">{INTEGRITY.heading}</span>{" "}
            <span className="mt-3 block text-balance text-[0.64em] leading-[1.45] text-oxblood-dark">
              {INTEGRITY.headingAccent}
            </span>
          </h2>
          <p className="mt-6 max-w-[44ch] text-pretty font-body text-base font-normal leading-[1.75] text-read md:mt-8 md:text-lg">
            {INTEGRITY.body}
          </p>
          <p className="mt-6 max-w-[36ch] border-l-2 border-gold pl-4 font-display text-lg font-medium leading-[1.5] text-burgundy md:mt-8 md:text-xl">
            {INTEGRITY.ritual}
          </p>
        </div>
        <Image
          src="/hair-cell-nad/transformation-ritual.webp"
          alt="ქალი კენკრის სასმელს სვამს THAMRA HAIR CELL NAD+-ის შეფუთვის გვერდით"
          width={1080}
          height={1350}
          sizes="(min-width: 1152px) 500px, (min-width: 1024px) calc(50vw - 76px), (min-width: 488px) 448px, calc(100vw - 40px)"
          className="mx-auto h-auto w-full max-w-md rounded-[1.75rem] lg:max-w-none"
        />
        <div className="mx-auto grid w-full max-w-md gap-3 border-t border-hairline pt-6 lg:col-span-2 lg:max-w-none lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="font-body text-xs font-medium tracking-[0.08em] text-oxblood-dark">{NAD.name}</p>
            <p className="mt-2 font-display text-lg font-medium leading-normal text-burgundy">
              {INTEGRITY.slogan}
            </p>
          </div>
          <p className="text-pretty font-body text-sm font-normal leading-relaxed text-read">
            {INTEGRITY.sub}
          </p>
        </div>
      </div>
    </section>
  );
}
