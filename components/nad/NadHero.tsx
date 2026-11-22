import Link from "next/link";
import NadGallery from "@/components/nad/NadGallery";
import { NAD } from "@/lib/hairCellNad";

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
  return (
    <>
      <section aria-labelledby="nad-title" className="w-full" style={{ backgroundColor: IVORY }}>
        <div className="mx-auto grid w-full max-w-[1280px] lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-12 lg:py-16">
          <NadGallery />

          {/* Copy + purchase */}
          <div className="flex flex-col px-5 pb-12 pt-8 sm:px-10 lg:px-0 lg:py-0">
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

            <div className="mt-7 max-w-[480px] rounded-2xl border border-hairline bg-paper p-5 sm:p-6">
              <h2 className="text-balance font-display text-[1.4rem] font-medium leading-snug text-burgundy sm:text-[1.55rem]">
                {NAD.purchaseTitle}
              </h2>
              <p className="mt-2 font-body text-[15px] font-normal text-read">
                {NAD.purchaseDetails}
              </p>
              {price !== null && (
                <p className="mt-4 font-display text-[2rem] font-semibold leading-none text-burgundy lg:text-[2.25rem]">
                  {price} ₾
                </p>
              )}
              <Cta href={checkoutHref} className="mt-5 min-h-[52px] w-full text-[16px] font-medium" />
              <p className="mt-3 text-center font-body text-sm font-normal text-read">{NAD.deliveryNote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* The order link stays available while visitors browse the page. */}
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
            href={checkoutHref}
            className="min-h-[44px] shrink-0 px-3.5 text-[13px] min-[400px]:px-5 min-[400px]:text-[14px]"
          />
        </div>
      </div>
    </>
  );
}

function Cta({
  href,
  className,
}: {
  href: string | null;
  className: string;
}) {
  const base = `inline-flex items-center justify-center border font-body tracking-[0.02em] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none ${className}`;
  const style = { borderColor: BURGUNDY, outlineColor: BURGUNDY };
  if (!href) {
    return (
      <button type="button" disabled className={`${base} cursor-not-allowed opacity-50`} style={{ ...style, color: BURGUNDY }}>
        {NAD.orderCta}
      </button>
    );
  }
  return (
    <Link
      href={href}
      className={`${base} bg-[#5A1A1F] text-[#F7F3EC] hover:bg-transparent hover:text-[#5A1A1F]`}
      style={style}
    >
      {NAD.orderCta}
    </Link>
  );
}
