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
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:gap-9 xl:gap-12">
          <Image
            src="/hair-cell-nad/ingredients-packaging.webp"
            alt="THAMRA HAIR CELL NAD+ — ყუთი და ინდივიდუალური პაკეტები"
            width={1200}
            height={800}
            sizes="(min-width: 1280px) 414px, (min-width: 1024px) calc(37.5vw - 61.5px), (min-width: 680px) 600px, (min-width: 640px) calc(100vw - 80px), calc(100vw - 40px)"
            className="mx-auto h-auto w-full max-w-[600px] rounded-[1.5rem] lg:max-w-none"
          />
          <div className="grid gap-8 md:grid-cols-3 lg:gap-4 xl:gap-6">
            {MATRIX.map((col, ci) => (
              <div key={col.title} className="min-w-0">
                <div className="flex items-baseline gap-2 border-b border-[#5A1A1F] pb-4">
                  <span className="font-display text-[15px] text-[#B89A65]">0{ci + 1}</span>
                  <h3 className="min-w-0 break-words font-display text-[1.375rem] font-normal leading-snug text-[#5A1A1F] lg:text-[1.125rem] xl:text-[1.25rem]">
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
        className="flex min-h-[56px] w-full items-center justify-between gap-2 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A1A1F]"
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
          <span className="block pb-4">{desc}</span>
        </p>
      </div>
    </li>
  );
}
