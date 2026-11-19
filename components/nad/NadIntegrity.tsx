import Image from "next/image";
import { INTEGRITY } from "@/lib/hairCellNad";

// Section 4 — philosophy and daily ritual.
export default function NadIntegrity() {
  return (
    <section aria-labelledby="nad-integrity" className="w-full bg-[#EFE7DC]">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-9 px-5 py-16 sm:px-10 md:py-24 lg:grid-cols-2 lg:gap-14 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <p className="font-display text-[1.375rem] font-normal leading-[1.55] text-[#2A2526] md:text-[1.75rem]">
            {INTEGRITY.body}
          </p>
          <span aria-hidden className="mx-auto mb-8 mt-8 block h-px w-12 bg-[#B89A65] lg:mx-0" />
          <h2 id="nad-integrity" className="font-display text-[1.125rem] font-normal tracking-[0.04em] text-[#5A1A1F] md:text-[1.25rem]">
            {INTEGRITY.slogan}
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] font-body text-[15px] font-light leading-[1.7] text-[#4A3F3C] lg:mx-0">
            {INTEGRITY.sub}
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
      </div>
    </section>
  );
}
