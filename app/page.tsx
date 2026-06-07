import Image from "next/image";
import Reveal from "@/components/Reveal";
import HeroCover from "@/components/HeroCover";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const heroStats = [
  { value: "14", label: "ინგრედიენტი" },
  { value: "5g", label: "კოლაგენი" },
  { value: "90", label: "დღე" },
];

const rootCauses = [
  {
    icon: "hormone",
    title: "ჰორმონები",
    text: "DHT-ს მგრძნობელობა, გამოწვეული გენეტიკით, სტრესით და ჰორმონალური ცვლილებებით.",
  },
  {
    icon: "stress",
    title: "სტრესი",
    text: "ფიზიკური და ემოციური სტრესი, რომელიც თმის ფოლიკულს ძილის რეჟიმში აგზავნის.",
  },
  {
    icon: "leaf",
    title: "ცხოვრების წესი",
    text: "გარემო ფაქტორები, პროდუქტები და კვების ჩვევები, რომლებიც თმის ჯანმრთელობაზე მოქმედებს.",
  },
  {
    icon: "cycle",
    title: "მეტაბოლიზმი",
    text: "გავლენას ახდენს, თუ როგორ იღებს თმის ფოლიკული საკვებ ნივთიერებებს.",
  },
  {
    icon: "apple",
    title: "კვება",
    text: "საკვები ნივთიერებების დეფიციტი, გამოწვეული არასწორი კვებით ან ნაწლავის დარღვევით.",
  },
  {
    icon: "hourglass",
    title: "ასაკი",
    text: "კოლაგენისა და ელასტინის შემცირება, რაც ასუსტებს თმის ფოლიკულის სტრუქტურას.",
  },
];

const benefits = [
  {
    icon: "leaf",
    title: "ჰორმონალური ბალანსი",
    text: "ვუჭერთ მხარს ორგანიზმის ბუნებრივ ჰორმონალურ ბალანსს, რომელიც თმის სიმკვრივეზე პირდაპირ აისახება.",
  },
  {
    icon: "heart",
    title: "ღრმა აღდგენა",
    text: "ამინომჟავები და კოლაგენი თმას აღადგენს ფესვიდან წვერამდე, შიგნიდან აძლიერებს სტრუქტურას.",
  },
  {
    icon: "spark",
    title: "სტრესის მართვა",
    text: "ვამცირებთ კორტიზოლის დონეს და ხელახლა ვააქტიურებთ მიძინებულ ფოლიკულებს.",
  },
];

const ingredients = [
  { name: "Marine Collagen 5,000mg", desc: "თმის სტრუქტურის აღდგენა" },
  { name: "Saw Palmetto 320mg", desc: "DHT-ს ბუნებრივი ბლოკირება" },
  { name: "Ashwagandha KSM-66", desc: "კორტიზოლის შემცირება" },
  { name: "Iron Bisglycinate", desc: "ფერიტინის აღდგენა" },
  { name: "Vitamin D3 + Zinc", desc: "ფოლიკულის მხარდაჭერა" },
];

const testimonials = [
  {
    initial: "ნ",
    name: "ნატო მ.",
    age: "47",
    city: "თბილისი",
    quote:
      "პირველ თვეში ცვენა შემცირდა. მესამეში — სარკეში სხვა ადამიანს ვხედავ.",
  },
  {
    initial: "მ",
    name: "მარიამ კ.",
    age: "53",
    city: "ბათუმი",
    quote: "ექიმმა მითხრა ვერაფერს იზამო. თამრამ დამიმტკიცა, რომ ეშლებოდა.",
  },
  {
    initial: "თ",
    name: "თეა ბ.",
    age: "58",
    city: "ქუთაისი",
    quote: "6 წელია ვებრძოდი. თამრა იყო ერთადერთი, რამაც შიგნიდან იმუშავა.",
  },
];

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const ico = {
  stroke: "currentColor",
  fill: "none" as const,
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function BenefitIcon({ name }: { name: string }) {
  const common = { width: 28, height: 28, viewBox: "0 0 24 24", ...ico };
  if (name === "leaf")
    return (
      <svg {...common} aria-hidden>
        <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" />
        <path d="M5 19C9 14 13 11 18 9" />
      </svg>
    );
  if (name === "heart")
    return (
      <svg {...common} aria-hidden>
        <path d="M12 20s-7-4.6-9.2-9.1C1.3 8 2.6 4.8 5.7 4.3 8 4 9.6 5.4 12 8c2.4-2.6 4-4 6.3-3.7 3.1.5 4.4 3.7 2.9 6.6C19 15.4 12 20 12 20z" />
      </svg>
    );
  return (
    <svg {...common} aria-hidden>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
    </svg>
  );
}

function RootCauseIcon({ name }: { name: string }) {
  const common = { width: 28, height: 28, viewBox: "0 0 24 24", ...ico };
  if (name === "hormone")
    return (
      <svg {...common} aria-hidden>
        <circle cx="12" cy="13" r="6" />
        <path d="M12 7V2M12 2l-2.5 2M12 2l2.5 2" />
      </svg>
    );
  if (name === "stress")
    return (
      <svg {...common} aria-hidden>
        <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
      </svg>
    );
  if (name === "leaf")
    return (
      <svg {...common} aria-hidden>
        <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" />
        <path d="M5 19C9 14 13 11 18 9" />
      </svg>
    );
  if (name === "cycle")
    return (
      <svg {...common} aria-hidden>
        <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8" />
        <path d="M20 4v4h-4" />
        <path d="M20 12a8 8 0 0 1-13.7 5.6L4 16" />
        <path d="M4 20v-4h4" />
      </svg>
    );
  if (name === "apple")
    return (
      <svg {...common} aria-hidden>
        <path d="M12 8c-1.5-2-5-2-6 1-1.2 3.6 1.5 11 3.5 11 1 0 1.5-.6 2.5-.6s1.5.6 2.5.6c2 0 4.7-7.4 3.5-11-1-3-4.5-3-6-1z" />
        <path d="M12 8c0-2 1-3.5 3-4" />
      </svg>
    );
  return (
    <svg {...common} aria-hidden>
      <path d="M6 3h12M6 21h12" />
      <path d="M7 3c0 5 4 6.5 5 9 1-2.5 5-4 5-9" />
      <path d="M7 21c0-5 4-6.5 5-9 1 2.5 5 4 5 9" />
    </svg>
  );
}

function Check() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      {...ico}
      strokeWidth={1.6}
      className="mt-0.5 shrink-0 text-gold"
      aria-hidden
    >
      <path d="M4 12.5l5 5 11-12" />
    </svg>
  );
}

function Star() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 20.5l1.4-6.8L2.2 9l6.9-.7L12 2z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const CONTAINER = "mx-auto w-full max-w-[1280px] px-6 sm:px-10";
const LABEL = "font-body text-[12px] font-normal uppercase tracking-[0.22em]";

function Stars() {
  return (
    <div className="flex gap-1 text-gold">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <main className="w-full overflow-x-hidden">
      {/* ============================================================ */}
      {/* COVER HERO — full-screen background image                    */}
      {/* ============================================================ */}
      <HeroCover />

      {/* ============================================================ */}
      {/* 3 — HERO                                                     */}
      {/* ============================================================ */}
      <section>
        <div
          className={`${CONTAINER} grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[45fr_55fr] lg:gap-16`}
        >
          <Reveal className="order-1">
            <h1 className="font-display text-[2rem] font-light leading-[1.1] text-oxblood sm:text-[2.6rem] lg:text-[3rem]">
              <span className="block italic tracking-[0.2em]">THAMRA</span>
              <span className="block text-read">თმის სილამაზე შიგნიდან</span>
            </h1>
            <p className="mt-6 max-w-md font-body text-[17px] font-light leading-[1.8] text-read">
              უნიკალური ფორმულა{" "}
              <span className="italic text-oxblood">Advanced Hair Biomatrix™</span>{" "}
              ქალებისთვის შექმნილი თმის ზრდის, ბუნებრივი მოცულობისა და
              ბრწყინვალების ხანგრძლივი მხარდაჭერისთვის ასაკობრივი და
              ჰორმონალური ცვლილებების პერიოდში.
            </p>
            <a
              href="#shop"
              className="mt-9 inline-flex items-center gap-3 rounded-[4px] bg-oxblood px-9 py-4 font-body text-[13px] font-normal uppercase tracking-[0.14em] text-cream-soft transition-colors duration-300 hover:bg-oxblood-dark"
            >
              შეიძინე Thamra
              <span aria-hidden>→</span>
            </a>

            {/* stats row */}
            <div className="mt-10 flex items-center gap-6">
              {heroStats.map((s, i) => (
                <div key={s.label} className="flex items-center gap-6">
                  {i > 0 && (
                    <span className="h-8 w-px bg-gold/40" aria-hidden />
                  )}
                  <div>
                    <div className="font-display text-[1.6rem] font-light leading-none text-oxblood">
                      {s.value}
                    </div>
                    <div className="mt-1.5 font-body text-[12px] font-light uppercase tracking-[0.14em] text-muted">
                      {s.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="order-2" delay={150}>
            <div className="relative mx-auto w-full max-w-[620px]">
              <Image
                src="/product-hero.png"
                alt="თამრა — ქალის თმის გრძელვადიანი ფორმულა"
                width={1402}
                height={1122}
                priority
                sizes="(min-width: 1024px) 620px, 100vw"
                className="w-full"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4 — TAGLINE + BENEFITS                                       */}
      {/* ============================================================ */}
      <section className="bg-surface/40">
        <div className={`${CONTAINER} py-20 md:py-[140px]`}>
          <Reveal>
            <p className="mx-auto max-w-3xl text-center font-display text-[24px] font-normal italic leading-[1.4] text-oxblood">
              უფრო ძლიერი, სიცოცხლით სავსე თმა — ყოველდღიურად.
            </p>
          </Reveal>

          <div className="mt-24 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 120}>
                <div className="group h-full border-b border-gold/15 p-8 transition-transform duration-1000 hover:-translate-y-1">
                  <span className="inline-flex text-oxblood">
                    <BenefitIcon name={b.icon} />
                  </span>
                  <h3 className="mt-6 font-display text-[18px] font-normal text-ink">
                    {b.title}
                  </h3>
                  <p className="mt-3 font-body text-[17px] font-light leading-[1.8] text-read">
                    {b.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4.5 — ROOT CAUSES                                            */}
      {/* ============================================================ */}
      <section>
        <div className={`${CONTAINER} py-20 md:py-[140px]`}>
          <Reveal>
            <div className="text-center">
              <h2 className="font-display text-[36px] font-normal leading-[1.15] text-oxblood">
                თმის ცვენის 6 ძირითადი მიზეზი
              </h2>
              <p className="mt-4 font-body text-[17px] font-light leading-[1.8] text-muted">
                გაიგე, რა დგას შენი თმის ცვენის უკან
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {rootCauses.map((c, i) => (
              <Reveal key={c.title} delay={(i % 3) * 120}>
                <div className="group h-full rounded-[4px] border border-black/[0.06] bg-paper p-8 transition-all duration-1000 hover:-translate-y-1 hover:shadow-[inset_2px_0_0_0_#8B2F3A,0_24px_50px_-24px_rgba(61,51,53,0.3)]">
                  <span className="inline-flex text-oxblood">
                    <RootCauseIcon name={c.icon} />
                  </span>
                  <h3 className="mt-6 font-display text-[18px] font-normal text-oxblood">
                    {c.title}
                  </h3>
                  <p className="mt-3 font-body text-[17px] font-light leading-[1.8] text-read">
                    {c.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5 — SCIENCE / INGREDIENTS                                    */}
      {/* ============================================================ */}
      <section id="science" className="scroll-mt-24">
        <div
          className={`${CONTAINER} grid items-center gap-14 py-20 md:py-[140px] lg:grid-cols-2 lg:gap-20`}
        >
          <Reveal className="order-2 lg:order-1">
            <span className={`${LABEL} text-gold`}>მეცნიერება</span>
            <h2 className="mt-5 font-display text-[2rem] font-normal leading-[1.15] text-ink md:text-[2.25rem]">
              ბუნებისა და მეცნიერების ძალა
            </h2>
            <p className="mt-5 max-w-md font-body text-[17px] font-light leading-[1.8] text-read">
              ყოველი კოვზი აერთიანებს ძლიერ ინგრედიენტებს, რომლებიც თმის
              ჯანმრთელობას შიგნიდან უჭერს მხარს.
            </p>

            <ul className="mt-9 space-y-5">
              {ingredients.map((ing) => (
                <li key={ing.name} className="flex gap-3.5">
                  <Check />
                  <span className="font-body text-[17px] font-light leading-[1.8] text-read">
                    <span className="font-normal">{ing.name}</span>
                    <span className="text-muted"> — {ing.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="order-1 lg:order-2" delay={120}>
            <div className="relative mx-auto w-full max-w-[560px]">
              {/* soft background shape */}
              <div
                className="absolute inset-0 -m-6 rounded-[36px] bg-surface"
                aria-hidden
              />
              <Image
                src="/product-hero.png"
                alt="თამრა — ინგრედიენტები"
                width={1402}
                height={1122}
                sizes="(min-width: 1024px) 560px, 100vw"
                className="relative w-full"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6 — BRAND STORY                                              */}
      {/* ============================================================ */}
      <section id="story" className="scroll-mt-24 bg-surface/40">
        <div
          className={`${CONTAINER} grid items-center gap-14 py-20 md:py-[140px] lg:grid-cols-2 lg:gap-20`}
        >
          <Reveal className="order-2 lg:order-1">
            <span className={`${LABEL} text-gold`}>ჩვენი ისტორია</span>
            <h2 className="mt-5 font-display text-[1.9rem] font-normal leading-[1.15] text-ink md:text-[2rem]">
              შთაგონებული ბუნებრივი სიძლიერით
            </h2>
            <p className="mt-6 font-body text-[17px] font-light leading-[1.8] text-read">
              თამრა დაიბადა მარტივი რწმენით — რომ თმის ჯანმრთელობა სხეულის
              შიგნით იწყება. ჩვენ გავაერთიანეთ თანამედროვე მეცნიერება და ბუნების
              ძალა ერთ ფორმულაში.
            </p>
            <p className="mt-4 font-body text-[17px] font-light leading-[1.8] text-read">
              ყოველი ინგრედიენტი შერჩეულია კლინიკური კვლევების საფუძველზე, რათა
              მხარი დაუჭიროს ქალების თმის სიძლიერესა და ზრდას — ნაზად,
              ბუნებრივად, ყოველდღიურად.
            </p>
            <a
              href="#science"
              className="mt-9 inline-flex items-center gap-3 rounded-[4px] border border-oxblood px-8 py-3.5 font-body text-[13px] font-normal uppercase tracking-[0.14em] text-oxblood transition-colors duration-300 hover:bg-oxblood hover:text-cream-soft"
            >
              გაიგე მეტი
            </a>
          </Reveal>

          <Reveal className="order-1 lg:order-2" delay={120}>
            <div className="relative mx-auto w-full max-w-[560px]">
              <Image
                src="/product-hero.png"
                alt="თამრა — ბრენდის ისტორია"
                width={1402}
                height={1122}
                sizes="(min-width: 1024px) 560px, 100vw"
                className="w-full"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7 — TESTIMONIALS                                             */}
      {/* ============================================================ */}
      <section>
        <div className={`${CONTAINER} py-20 md:py-[140px]`}>
          <Reveal>
            <div className="text-center">
              <h2 className="font-display text-[2rem] font-normal leading-[1.15] text-ink md:text-[2rem]">
                ნდობით არჩეული
              </h2>
              <p className="mt-4 font-body text-[17px] font-light leading-[1.8] text-muted">
                ქალები, რომლებმაც თამრა აირჩიეს
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 120}>
                <figure className="flex h-full flex-col rounded-[4px] border border-black/[0.06] bg-paper p-8 transition-all duration-1000 hover:shadow-[inset_2px_0_0_0_#8B2F3A]">
                  <span
                    className="font-display text-[40px] leading-[0.6] text-gold"
                    aria-hidden
                  >
                    &ldquo;
                  </span>
                  <div className="mt-5">
                    <Stars />
                  </div>
                  <blockquote className="mt-5 grow font-body text-[17px] font-light leading-[1.8] text-read">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-7 flex items-center gap-3 border-t border-black/[0.06] pt-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-oxblood font-display text-[15px] text-cream-soft">
                      {t.initial}
                    </span>
                    <span className="font-body text-[13px] font-light text-muted">
                      <span className="font-normal text-ink">{t.name}</span> ·{" "}
                      {t.age} · {t.city}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8 — FINAL CTA                                                */}
      {/* ============================================================ */}
      <section id="shop" className="scroll-mt-24 bg-surface">
        <div
          className={`${CONTAINER} grid items-center gap-14 py-20 md:py-[140px] lg:grid-cols-2 lg:gap-20`}
        >
          <Reveal className="order-2 lg:order-1">
            <div className="relative mx-auto w-full max-w-[520px]">
              <Image
                src="/product-hero.png"
                alt="თამრა — შეიძინე"
                width={1402}
                height={1122}
                sizes="(min-width: 1024px) 520px, 100vw"
                className="w-full"
              />
            </div>
          </Reveal>

          <Reveal className="order-1 lg:order-2" delay={120}>
            <h2 className="font-display text-[2rem] font-normal leading-[1.15] text-ink md:text-[2.4rem]">
              შენი ახალი თავი იწყება დღეს
            </h2>

            <div className="mt-8 flex items-end gap-4">
              <span className="font-body text-[18px] font-light text-muted line-through">
                89₾
              </span>
              <span className="font-display text-[48px] font-normal leading-none text-oxblood">
                69₾
              </span>
              <span className="mb-1 font-body text-[13px] font-light text-muted">
                / 1 თვის მარაგი
              </span>
            </div>
            <p className="mt-4 font-body text-[15px] font-normal text-ink">
              3 თვე — 159₾ <span className="text-oxblood">დაზოგე 48₾</span>
            </p>

            {/* gold divider */}
            <div className="mt-8 h-px w-full max-w-[280px] bg-gold/40" aria-hidden />

            <a
              href="#"
              className="mt-8 inline-flex min-w-[280px] items-center justify-center rounded-[4px] bg-oxblood px-12 py-4 font-body text-[13px] font-normal uppercase tracking-[0.14em] text-cream-soft transition-colors duration-300 hover:bg-oxblood-dark"
            >
              შეიძინე ახლა
            </a>

            <p className="mt-5 font-body text-[12px] font-light tracking-[0.08em] text-muted">
              15 დღიანი გარანტია
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9 — FOOTER                                                   */}
      {/* ============================================================ */}
      <footer id="footer" className="bg-oxblood text-cream-soft">
        <div className={`${CONTAINER} pt-[100px] pb-[60px]`}>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-8">
            {/* brand */}
            <div className="col-span-2 md:col-span-1">
              <span className="font-display text-xl tracking-[0.3em]">
                THAMRA
              </span>
              <p className="mt-4 max-w-[16rem] font-body text-[13px] font-light leading-[1.7] text-cream-soft/70">
                პრემიუმ ფორმულა ქალის თმის ჯანმრთელი ზრდისთვის — შიგნიდან.
              </p>
            </div>

            {/* nav */}
            <div>
              <h4 className={`${LABEL} text-cream-soft/70`}>ნავიგაცია</h4>
              <ul className="mt-5 space-y-3">
                {[
                  { l: "მთავარი", h: "#" },
                  { l: "შეიძინე", h: "#shop" },
                  { l: "მეცნიერება", h: "#science" },
                  { l: "ჩვენ შესახებ", h: "#story" },
                ].map((x) => (
                  <li key={x.l}>
                    <a
                      href={x.h}
                      className="font-body text-[13px] font-light text-cream-soft/70 transition-colors hover:text-cream-soft"
                    >
                      {x.l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* help */}
            <div>
              <h4 className={`${LABEL} text-cream-soft/70`}>დახმარება</h4>
              <ul className="mt-5 space-y-3">
                {["კონტაქტი", "მიწოდება", "დაბრუნება", "FAQ"].map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="font-body text-[13px] font-light text-cream-soft/70 transition-colors hover:text-cream-soft"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* social */}
            <div>
              <h4 className={`${LABEL} text-cream-soft/70`}>გამოგვყევი</h4>
              <div className="mt-5 flex gap-3">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-soft/25 text-cream-soft/70 transition-colors hover:border-cream-soft hover:text-cream-soft"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M14.5 8.5h2V5.5h-2c-2 0-3.3 1.3-3.3 3.4v1.6H9v3h2.2v7h3v-7h2.1l.4-3h-2.5V9c0-.3.2-.5.6-.5z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-soft/25 text-cream-soft/70 transition-colors hover:border-cream-soft hover:text-cream-soft"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                    <circle cx="12" cy="12" r="3.6" />
                    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-cream-soft/15 pt-6">
            <p className="font-body text-[12px] font-light tracking-[0.04em] text-cream-soft/70">
              © 2026 Thamra. ყველა უფლება დაცულია.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
