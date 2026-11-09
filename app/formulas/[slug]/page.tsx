import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FORMULAS, getFormula } from "@/lib/formulas";

// Detail view for formulas without a dedicated product page. Shows only the
// supplied selector copy for that formula.

export function generateStaticParams() {
  return FORMULAS.filter((f) => f.href === `/formulas/${f.slug}`).map((f) => ({ slug: f.slug }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const f = getFormula(params.slug);
  return f ? { title: f.name, description: f.paragraphs[0] } : {};
}

export default function FormulaPage({ params }: { params: { slug: string } }) {
  const f = getFormula(params.slug);
  if (!f) notFound();

  return (
    <main className="w-full" style={{ backgroundColor: "#F7F3EC" }}>
      <article className="mx-auto w-full max-w-[720px] px-5 pb-24 pt-32 sm:px-10 md:pt-40">
        <h1
          className="font-display font-normal"
          style={{ color: "#5A1A1F", fontSize: "clamp(1.75rem, 3.4vw, 2.5rem)", lineHeight: 1.3 }}
        >
          {f.name}
        </h1>
        <span aria-hidden className="mt-6 block h-px w-12" style={{ backgroundColor: "#B89A65" }} />
        {f.paragraphs.map((p) => (
          <p key={p} className="mt-7 font-body text-[17px] font-light leading-[1.75] text-read">
            {p}
          </p>
        ))}
      </article>
    </main>
  );
}
