import Image from "next/image";
import Reveal from "@/components/Reveal";
import HeroCover from "@/components/HeroCover";
import KeyReasons from "@/components/KeyReasons";
import Transformation from "@/components/Transformation";
import ThamraDivider from "@/components/ThamraDivider";
import QuizCTABanner from "@/components/QuizCTABanner";
import IngredientsAccordion from "@/components/IngredientsAccordion";
import PricingSection from "@/components/PricingSection";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */


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
    text: "ორგანიზმის შიდა ბალანსზე ზრუნვა მენოპაუზის პერიოდში, როდესაც ჰორმონალური ცვლილებები თმის ზრდის ციკლზეც აისახება.",
  },
  {
    icon: "heart",
    title: "თმის შინაგანი ღრმა აღდგენა",
    text: "თამრას შიდა თმის მკვებავი კომპლექსი თმას უბრუნებს სიმკვრივეს, სიცოცხლეს, და ჯანმრთელ იერს, ფესვიდან ღერის ბოლომდე.",
  },
  {
    icon: "spark",
    title: "მენოპაუზის პერიოდში ფოლიკულის მგრძნობელობისა და თმის სიმკვრივეზე ზრუნვა.",
    text: "თმისთვის მნიშვნელოვანი საკვები ნივთიერებებით გააზრებული ყოველდღიური კვება.",
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
    name: "ნატო დ.",
    age: "47",
    city: "თბილისი",
    quote:
      "რამდენიმე კვირაში შევამჩნიე, რომ თმა უფრო მოვლილი და ძლიერი ჩანდა. მესამე თვიდან კი სარკეში უკვე მეტი მოცულობა დავინახე.",
  },
  {
    initial: "მ",
    name: "მარიამ კ.",
    age: "53",
    city: "ბათუმი",
    quote: '„ყველაზე მეტად ის მომწონს, რომ აღარ მიწევს სხვადასხვა დანამატზე ცალ-ცალკე ფიქრი."',
  },
  {
    initial: "ნ",
    name: "ნანა ვ.",
    age: "56",
    city: "თბილისი",
    quote: "მენოპაუზის შემდეგ, თმის გაყოფის ადგილი უფრო შესამჩნევი გახდა და ვარცხნილობასაც ვეღარ ვიკეთებდი ისე, როგორც ადრე. რამდენიმე თვის შემდეგ შევამჩნიე, რომ თმა ვიზუალურად უფრო გაუმჯობესდა და ვარცხნილობაც უკეთ ინარჩუნებდა ფორმას.",
  },
];


const advisors = [
  {
    name: "Maia Sidamonishvili",
    title: "გინეკოლოგი, რადიოლოგი",
    institution: "თამრას მთავარი მრჩეველი",
    quote:
      "ქალებში თმის ცვლილებები მენოპაუზის პერიოდში იშვიათად არის მხოლოდ ერთი მიზეზის შედეგი. THAMRA შეიქმნა სწორედ ამ კომპლექსური პროცესის უფრო ღრმა გაგებით — როგორც ყოველდღიური რიტუალი, რომელიც თმის სიმკვრივეს, ხარისხსა და გრძელვადიან სიჯანსაღეს ერთიანად უჭერს მხარს.",
    photo: "/maia-sidamonidze.webp",
    initial: "მ",
  },
  {
    name: "Lasha Jakeli",
    title: "ექიმი ნევროლოგი",
    institution: "პირველი ქართული გამაჯანსაღებელი პლატფორმა 'მინდორი'-ს დამფუძნებელი",
    quote:
      "THAMRA-ს იდეა მხოლოდ თმაზე ზრუნვა არ არის. ეს არის ქალის ყოველდღიური რესურსის, ნერვული სისტემის ბალანსისა და გრძელვადიანი კეთილდღეობის უფრო გააზრებული მიდგომა — შექმნილი იმ ეტაპისთვის, როდესაც ორგანიზმს მეტი სიზუსტე, სიმშვიდე და თანმიმდევრული ზრუნვა სჭირდება.",
    photo: "/lasha-jakeli.webp",
    initial: "L",
  },
  {
    name: "Andries Van Riezen",
    title: "ბიოქიმიკოსი, ფორმულაციების განვითარების მთავარი მეცნიერი",
    institution: "კვლევისა და განვითარების ხელმძღვანელი, Acenzia Inc. Ontario, Canada",
    quote:
      "THAMRA-ს სიძლიერე ერთ ინგრედიენტში არ არის — ის მთელი ფორმულის ინტელექტუალურ სინერგიაშია. ზუსტად შერჩეული და დაბალანსებული შემადგენლობა მენოპაუზის პერიოდში თმის გათხელების ერთმანეთთან დაკავშირებულ კომპლექსურ ბიოლოგიურ პროცესებზე ერთდროულად მუშაობს, რაც THAMRA-ს თმის მოვლის გამორჩეულ სისტემად აქცევს.",
    photo: "/andries-van-riezen.webp",
    initial: "A",
  },
  {
    name: "Tomoyuki Amano",
    title: "ნეირომეცნიერი, ბიომედიცინის ინჟინერი და მკვლევარი",
    institution: "Georgia Institute of Technology, USA",
    quote:
      "როგორც ნეირომეცნიერი ვადასტურებ, რომ სტრესი, ძილის ხარისხი და ქრონიკულად მომატებული კორტიზოლი პირდაპირ აფერხებს თმის ზრდის აქტიურ ფაზას. THAMRA-ს კომპლექსურ მიდგომას სხეული ბალანსში მოჰყავს — ეს მეცნიერულად დასაბუთებული სტრატეგიაა თმის გრძელვადიანი ჯანმრთელობისთვის.",
    photo: "/tomoyuki-amano.jpg",
    photoPosition: "center 22%",
    initial: "T",
  },
];

const trustBadges = [
  { icon: "flask",        text: "ლაბორატორიულად ტესტირებული" },
  { icon: "shield-check", text: "GMP სერტიფიცირებული" },
  { icon: "leaf",         text: "არა-GMO" },
  { icon: "cross",        text: "ექიმის მიერ შექმნილი" },
  { icon: "japan",        text: "წარმოებულია იაპონიაში" },
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

function TrustBadgeIcon({ name }: { name: string }) {
  const base = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "flask")
    return (
      <svg {...base} aria-hidden>
        <path d="M9 2h6" />
        <path d="M10 2v7L5.5 16.5A2 2 0 0 0 7.3 19.5h9.4a2 2 0 0 0 1.8-3L14 9V2" />
        <path d="M7.5 14.5h9" />
      </svg>
    );
  if (name === "shield-check")
    return (
      <svg {...base} aria-hidden>
        <path d="M12 2L4 6v5c0 4.4 3.5 8.5 8 10 4.5-1.5 8-5.6 8-10V6L12 2z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
  if (name === "leaf")
    return (
      <svg {...base} aria-hidden>
        <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" />
        <path d="M5 19C9 14 13 11 18 9" />
      </svg>
    );
  if (name === "cross")
    return (
      <svg {...base} strokeWidth={1.8} aria-hidden>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  return (
    <svg {...base} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7l1.4 3.5L17 11l-2.5 2.5.6 3.5L12 15.5 9 17l.6-3.5L7 11l3.6-.5L12 7z" />
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

const CONTAINER = "mx-auto w-full max-w-[1400px] px-6 sm:px-12";
const LABEL = "font-body text-[14px] font-normal uppercase tracking-[0.22em]";

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
      {/* SCIENTIFIC ADVISORY BOARD                                    */}
      {/* ============================================================ */}
      <section id="science" className="scroll-mt-24 bg-cream">
        <div className={`${CONTAINER} py-20 md:py-[140px]`}>
          <Reveal>
            <span className={`${LABEL} text-gold`}>სამეცნიერო ხედვა</span>
            <p className="mt-5 max-w-2xl font-body text-[18px] font-light leading-[1.8] text-read">
              THAMRA აერთიანებს გინეკოლოგიის, ნევროლოგიის, ნეირომეცნიერებისა და ფორმულაციების განვითარების გამოცდილებას — ქალების თმის სიჯანსაღეზე კომპლექსური ზრუნვისთვის მენოპაუზის გარდამავალ ეტაპზე.
            </p>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {advisors.map((a, i) => (
              <Reveal key={a.name} delay={i * 120}>
                <div
                  className="flex h-full flex-col"
                  style={{
                    borderTop: "2px solid #C9A96E",
                    paddingTop: 32,
                  }}
                >
                  {"photo" in a && (
                    <div style={{ marginBottom: 20 }}>
                      <Image
                        src={a.photo as string}
                        alt={a.name}
                        width={160}
                        height={160}
                        style={{
                          borderRadius: 6,
                          objectFit: "cover",
                          objectPosition: ("photoPosition" in a ? a.photoPosition : "center top") as string,
                          display: "block",
                        }}
                      />
                      <div style={{ width: 40, height: 1.5, backgroundColor: "#C9A96E", marginTop: 10 }} />
                    </div>
                  )}
                  <span
                    className="font-display"
                    style={{
                      fontSize: "clamp(2rem,3.5vw,2.75rem)",
                      lineHeight: 0.8,
                      color: "rgba(201,169,110,0.35)",
                      display: "block",
                    }}
                    aria-hidden
                  >
                    &ldquo;
                  </span>
                  <p
                    className="mt-4 flex-1 font-display font-light italic leading-[1.75] text-ink"
                    style={{ fontSize: 17 }}
                  >
                    {a.quote}
                  </p>
                  <div className="mt-8 flex items-center gap-3">
                    <div>
                      <p
                        className="font-body font-normal leading-tight text-ink"
                        style={{ fontSize: 15 }}
                      >
                        {a.name}
                      </p>
                      <div style={{ width: "100%", height: 1, backgroundColor: "#C9A96E", opacity: 0.4, margin: "6px 0" }} />
                      <p
                        className="font-body font-light text-read"
                        style={{ fontSize: 13 }}
                      >
                        {a.title} · {a.institution}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ThamraDivider />

      {/* ============================================================ */}
      {/* KEY REASONS — interactive arc                              */}
      {/* ============================================================ */}
      <Reveal><KeyReasons /></Reveal>

      {/* ============================================================ */}
      {/* TAGLINE + BENEFITS                                           */}
      {/* ============================================================ */}
      <section className="bg-surface/40">
        <div className={`${CONTAINER} py-20 md:py-[140px]`}>
          <Reveal>
            <p className="mx-auto max-w-3xl text-center font-body text-[16px] sm:text-[20px] font-light leading-[1.8] text-read">
              თამრა ზრუნავს ქალის ორგანიზმზე მიაღწიოს ბუნებრივ ჰორმონალურ ბალანსს, რომელიც თმის სიმკვრივეზე პირდაპირ აისახება.
            </p>
            <p className="mx-auto mt-6 max-w-3xl text-center font-display text-[22px] sm:text-[32px] font-normal italic leading-[1.4] text-oxblood">
              უფრო ძლიერი, სიცოცხლით სავსე თმა — ყოველდღიურად.
            </p>
          </Reveal>

          <div className="mt-24 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 120}>
                <div className="group h-full border-b border-gold/15 p-6 sm:p-8 transition-transform duration-1000 hover:-translate-y-1">
                  <span className="inline-flex text-oxblood">
                    <BenefitIcon name={b.icon} />
                  </span>
                  <h3 className="mt-6 font-display text-[19px] sm:text-[22px] font-normal italic text-ink">
                    {b.title}
                  </h3>
                  <p className="mt-3 font-body text-[16px] sm:text-[20px] font-light leading-[1.8] text-read">
                    {b.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Reveal><IngredientsAccordion /></Reveal>

      {/* ============================================================ */}
      {/* TRANSFORMATION — 5-part section                             */}
      {/* ============================================================ */}
      <Transformation />

      <Reveal><QuizCTABanner /></Reveal>

      <ThamraDivider />

      {/* ============================================================ */}
      {/* 6 — BRAND STORY                                              */}
      {/* ============================================================ */}
      <section id="story" className="scroll-mt-24 bg-surface/40 overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[80vh]">

          {/* Text — left, vertically centered, contained */}
          <Reveal className="flex items-center order-2 lg:order-1">
            <div className="px-8 py-20 md:py-[120px] md:px-14 xl:px-20 w-full">
              <span className={`${LABEL} text-gold`}>ჩვენი ისტორია</span>
              <h2 className="mt-5 font-display text-[2rem] font-normal italic leading-[1.15] md:text-[3.25rem] xl:text-[3.75rem]" style={{ color: "#8B2F3A" }}>
                შთაგონებული შინაგანი სიძლიერით
              </h2>
              <p className="mt-6 font-body text-[17px] sm:text-[20px] font-light leading-[1.8] text-read">
                თამრა დაიბადა მარტივი რწმენით — რომ თმის ჯანმრთელობა სხეულის შიგნიდან იწყება. ჩვენ გავაერთიანეთ თანამედროვე მეცნიერება და ბუნების ძალა ერთ ფორმულაში.
              </p>
              <p className="mt-4 font-body text-[17px] sm:text-[20px] font-light leading-[1.8] text-read">
                ყოველი ინგრედიენტი შერჩეულია კლინიკური კვლევების საფუძველზე, რათა იზრუნოს ქალების თმის სიძლიერესა და ზრდაზე — ნაზად, ბუნებრივად, ყოველდღიურად.
              </p>
            </div>
          </Reveal>

          {/* Image — right, full-bleed, fills entire column */}
          <div className="relative min-h-[420px] lg:min-h-0 order-1 lg:order-2">
            <Image
              src="/natural-accents.webp"
              alt="თამრა — ბრენდის ისტორია"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

        </div>
      </section>


      <ThamraDivider />

      {/* ============================================================ */}
      {/* 7 — TESTIMONIALS                                             */}
      {/* ============================================================ */}
      <section style={{ backgroundColor: "#F2EBE3" }}>
        <div className="flex flex-col lg:flex-row lg:min-h-screen">

          {/* LEFT: title + stacked testimonials */}
          <div className="flex-1 flex flex-col justify-center px-8 py-20 md:px-16 xl:px-24">

            <Reveal>
<h2 className="font-display font-normal italic" style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", color: "#8B2F3A", lineHeight: 1.2, marginBottom: 56 }}>
                ქალები, რომლებმაც{" "}
                <span style={{ color: "#C9A96E", letterSpacing: "0.1em", fontStyle: "italic" }}>THAMRA</span>{" "}
                ყოველდღიური რიტუალის ნაწილად აქციეს
              </h2>
            </Reveal>

            <div className="flex flex-col gap-10">
              {testimonials.map((t, i) => (
                <Reveal key={t.name} delay={i * 120}>
                  <figure style={{ borderTop: "2px solid #C9A96E", paddingTop: 28, margin: 0 }}>
                    <span
                      className="font-display"
                      style={{ fontSize: "clamp(2rem,5vw,3rem)", lineHeight: 0.8, color: "rgba(201,169,110,0.45)", display: "block" }}
                      aria-hidden
                    >
                      &ldquo;
                    </span>
                    <blockquote
                      className="font-display font-light italic"
                      style={{ fontSize: "clamp(1rem,1.5vw,1.25rem)", color: "#3D3335", lineHeight: 1.75, marginTop: 14 }}
                    >
                      {t.quote}
                    </blockquote>
                    <figcaption className="flex items-center gap-3" style={{ marginTop: 20 }}>
                      <span
                        className="font-display text-cream-soft"
                        style={{
                          width: 44, height: 44, borderRadius: "50%",
                          backgroundColor: "#8B2F3A",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 15, flexShrink: 0,
                        }}
                      >
                        {t.initial}
                      </span>
                      <span className="font-body font-light" style={{ fontSize: 15, color: "#6B5F5A" }}>
                        <span style={{ fontWeight: 400, color: "#3D3335" }}>{t.name}</span>
                        {" "}·{" "}{t.age}{" "}·{" "}{t.city}
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>

          </div>

          {/* RIGHT: full-bleed image covering the entire right side */}
          <div className="relative w-full lg:w-1/2 lg:flex-shrink-0 min-h-[400px] lg:min-h-0">
            <Image
              src="/women-wellness.webp"
              alt="Thamra women wellness"
              fill
              style={{ objectFit: "cover", objectPosition: "center" }}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

        </div>
      </section>

      <ThamraDivider />

      {/* ============================================================ */}
      {/* 8 — FINAL CTA                                                */}
      {/* ============================================================ */}
      <PricingSection />

      {/* ============================================================ */}
      {/* 9 — FOOTER                                                   */}
      {/* ============================================================ */}
      <footer id="footer" className="bg-oxblood text-cream-soft">
        <div className={`${CONTAINER} pt-[100px] pb-[60px]`}>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-8">
            {/* nav */}
            <div>
              <h4 className={`${LABEL} text-cream-soft/70`}>ნავიგაცია</h4>
              <ul className="mt-5 space-y-3">
                {[
                  { l: "მთავარი", h: "#" },
                  { l: "ტესტი", h: "/quiz" },
                  { l: "მეცნიერება", h: "#science" },
                  { l: "ჩვენ შესახებ", h: "#story" },
                ].map((x) => (
                  <li key={x.l}>
                    <a
                      href={x.h}
                      className="font-body text-[16px] font-light text-cream-soft/70 transition-colors hover:text-cream-soft"
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
                      className="font-body text-[16px] font-light text-cream-soft/70 transition-colors hover:text-cream-soft"
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
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-soft/25 text-cream-soft/70 transition-colors hover:border-cream-soft hover:text-cream-soft"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M14.5 8.5h2V5.5h-2c-2 0-3.3 1.3-3.3 3.4v1.6H9v3h2.2v7h3v-7h2.1l.4-3h-2.5V9c0-.3.2-.5.6-.5z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-cream-soft/15 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-body text-[13px] font-light tracking-[0.04em] text-cream-soft/70">
              © 2026 THAMRA. ყველა უფლება დაცულია.
            </p>
            <a
              href="/privacy"
              className="font-body text-[13px] font-light tracking-[0.04em] text-cream-soft/70 transition-colors hover:text-cream-soft"
            >
              კონფიდენციალურობის პოლიტიკა
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
