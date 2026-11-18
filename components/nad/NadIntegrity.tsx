import { INTEGRITY } from "@/lib/hairCellNad";

// Section 4 — centered philosophy block.
export default function NadIntegrity() {
  return (
    <section aria-labelledby="nad-integrity" className="w-full bg-[#EFE7DC]">
      <div className="mx-auto w-full max-w-[760px] px-5 py-16 text-center sm:px-10 md:py-24 lg:py-32">
        <p className="font-display text-[1.375rem] font-normal leading-[1.55] text-[#2A2526] md:text-[1.75rem]">
          {INTEGRITY.body}
        </p>
        <span aria-hidden className="mx-auto my-10 block h-px w-12 bg-[#B89A65]" />
        <h2 id="nad-integrity" className="font-display text-[1.125rem] font-normal tracking-[0.04em] text-[#5A1A1F] md:text-[1.25rem]">
          {INTEGRITY.slogan}
        </h2>
        <p className="mx-auto mt-4 max-w-[520px] font-body text-[15px] font-light leading-[1.7] text-[#4A3F3C]">
          {INTEGRITY.sub}
        </p>
      </div>
    </section>
  );
}
