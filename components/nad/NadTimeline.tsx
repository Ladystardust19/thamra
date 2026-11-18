import Image from "next/image";
import { TIMELINE } from "@/lib/hairCellNad";

// Section 2. The portrait is an illustrative image, not a documented customer
// result, so it is captioned as such and not split into "before/after" tabs.
export default function NadTimeline() {
  return (
    <section aria-labelledby="nad-timeline" className="w-full bg-[#E9DFD1]">
      <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-5 py-14 sm:px-10 md:py-20 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-16 lg:px-16 lg:py-28">
        <figure>
          <Image
            src="/hair-cell-nad/portrait.webp"
            alt="ქალი ხელით ეხება თმას — ორი პორტრეტი გვერდიგვერდ"
            width={1536}
            height={1024}
            sizes="(min-width: 1024px) 720px, 100vw"
            className="h-auto w-full"
          />
          <figcaption className="mt-3 font-body text-[13px] font-light text-[#6B5F5A]">
            ილუსტრაციული გამოსახულება
          </figcaption>
        </figure>
        <div>
          <h2
            id="nad-timeline"
            className="font-display font-normal text-[#5A1A1F]"
            style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)", lineHeight: 1.2 }}
          >
            {TIMELINE.heading}
          </h2>
          <p className="mt-5 max-w-[460px] font-body text-[16px] font-light leading-[1.75] text-[#2A2526] sm:text-[17px]">
            {TIMELINE.body}
          </p>
        </div>
      </div>
    </section>
  );
}
