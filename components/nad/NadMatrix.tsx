"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { MATRIX } from "@/lib/hairCellNad";

// Section 3. Three ingredient groups; each ingredient is a disclosure whose
// name is always visible and whose description opens on tap. The first item
// of each group starts open so the pattern is obvious.
export default function NadMatrix() {
  return (
    <section aria-labelledby="nad-matrix" className="w-full bg-[#F7F3EC]">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-14 sm:px-10 md:py-20 lg:px-16 lg:py-28">
        <h2 id="nad-matrix" className="text-center font-display text-[1.8rem] leading-tight text-[#5A1A1F] md:text-[2.4rem]">
          შემადგენლობა
        </h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-9 xl:gap-12">
          <div className="relative mx-auto aspect-[2/3] w-full max-w-md overflow-hidden rounded-[1.5rem] lg:aspect-auto lg:max-w-none">
            <Image
              src="/hair-cell-nad/ingredients-frosted-berries.webp"
              alt="THAMRA HAIR CELL NAD+-ის პაკეტი ყურძენთან და მაყვალთან ყინულზე"
              fill
              quality={90}
              sizes="(min-width: 1280px) 552px, (min-width: 1024px) calc(50vw - 82px), (min-width: 488px) 448px, calc(100vw - 40px)"
              className="object-cover object-[58%_40%]"
            />
          </div>
          <div className="grid min-w-0 gap-8 md:grid-cols-3 lg:grid-cols-1 lg:gap-5">
            {MATRIX.map((col, ci) => (
              <div key={col.title} className="min-w-0">
                <div className="flex items-baseline gap-2 border-b border-[#5A1A1F] pb-3">
                  <span className="font-display text-[15px] text-[#B89A65]">0{ci + 1}</span>
                  <h3 className="min-w-0 break-words font-display text-[1.375rem] font-normal leading-snug text-[#5A1A1F]">
                    {col.title}
                  </h3>
                </div>
                <ul>
                  {col.items.map((it, i) => (
                    <Ingredient key={it.name} name={it.name} desc={it.desc} defaultOpen={i === 0} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Ingredient({ name, desc, defaultOpen }: { name: string; desc: string; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <li className="border-b border-[rgba(42,37,38,0.12)]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[56px] w-full items-center justify-between gap-2 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A1A1F] lg:min-h-12 lg:py-2.5"
      >
        <span className="min-w-0 break-words font-body text-[16px] text-[#2A2526]">{name}</span>
        {/* plus / minus */}
        <span aria-hidden className="relative h-3 w-3 shrink-0">
          <span className="absolute left-0 top-1/2 h-px w-3 bg-[#5A1A1F]" />
          <span
            className="absolute left-1/2 top-0 h-3 w-px bg-[#5A1A1F] transition-transform duration-200 motion-reduce:transition-none"
            style={{ transform: open ? "scaleY(0)" : "scaleY(1)" }}
          />
        </span>
      </button>
      <div
        id={id}
        aria-hidden={!open}
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${open ? "" : "invisible"}`}
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <p className="overflow-hidden font-body text-[15px] font-light leading-[1.65] text-[#4A3F3C]">
          <span className="block pb-4 lg:pb-3">{desc}</span>
        </p>
      </div>
    </li>
  );
}
