// Content for the landing-page formula selector (FormulaSelector) and the
// /formulas/[slug] detail views. Copy is supplied verbatim — do not edit.

export interface Formula {
  slug: string;
  tab: string;
  name: string;
  paragraphs: [string, string];
  // Where "აღმოაჩინე ფორმულა →" leads. Points at a real product page when one
  // exists, otherwise at the formula's own detail view.
  href: string;
}

export const FORMULA_HEADLINE =
  "თმის ჯანმრთელობაზე ზრუნვა შენი ცხოვრების ყველა ეტაპზე";

export const FORMULA_CTA = "აღმოაჩინე ფორმულა →";

export const FORMULAS: Formula[] = [
  {
    slug: "nano-collagen",
    tab: "NANO COLLAGEN",
    name: "THAMRA NANO COLLAGEN HAIR ACTIVE Da-1",
    paragraphs: [
      "სტრესი, არაბალანსირებული კვება და ძილის ნაკლებობა პირდაპირ აისახება შენს თმაზე. THAMRA NANO COLLAGEN HAIR ACTIVE Da-1 ინოვაციური ფორმულა შექმნილია ახალი თმის ზრდის, მაქსიმალური სიმკვრივისა და შესამჩნევი სისავსისთვის.",
      "ააქტიურებს თმის ბუნებრივი ზრდის ფაზას ულტრა-დაბალი მოლეკულური წონის ნანო-კოლაგენის პეპტიდებისა და აქტიური ნუტრიენტების უნიკალური სინერგიით.",
    ],
    href: "/product/nano-collagen",
  },
  {
    slug: "venice",
    tab: "VENICE",
    name: "THAMRA VENICE HAIR ELIXIR",
    paragraphs: [
      "სპეციალიზებული ბიოაქტიური ფორმულა, რომელიც შექმნილია მენოპაუზის პერიოდში თმის მოცულობისა და სისავსის აღდგენისთვის.",
      "მიზანმიმართულად აუმჯობესებს თმის ზრდას გათხელების მთავარი გამომწვევი მიზეზების, ჰორმონალური გარდაქმნებისა და ასაკობრივი ცვლილებების მართვით.",
    ],
    href: "/formulas/venice",
  },
  {
    slug: "hair-cell-nad",
    tab: "HAIR CELL NAD+",
    name: "THAMRA HAIR CELL NAD+",
    paragraphs: [
      "თმის ანტი-ასაკობრივი უჯრედული აქტივატორი, სპეციალურად შექმნილი ქალებისთვის თმის ხარისხის, ელასტიურობისა და პირვანდელი სიცოცხლისუნარიანობის დასაბრუნებლად.",
      "მოლეკულური ელიქსირი აღადგენს თმის ფოლიკულების ენერგეტიკულ ბალანსს, მუხტავს მათ NAD+ აქტივატორით და უზრუნველყოფს მძლავრ ანტიოქსიდანტურ ფარს, რათა დაიცვას თმის სტრუქტურა ნაადრევი დაბერებისა და ქრონიკული გამოფიტვისგან.",
    ],
    href: "/formulas/hair-cell-nad",
  },
];

export function getFormula(slug: string): Formula | undefined {
  return FORMULAS.find((f) => f.slug === slug);
}
