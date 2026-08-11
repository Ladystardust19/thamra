"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { RefreshCw, Shield, Moon, Sprout, Droplets } from "lucide-react";

const TILES = [
  {
    Icon: RefreshCw,
    title: "თმის ზრდა",
    body: "ეხმარება ორგანიზმს ჰორმონულ ცვლილებებთან ადაპტაციაში, რათა თმა ზრდის ფაზაში მეტ ხანს დარჩეს.",
  },
  {
    Icon: Shield,
    title: "ძლიერი თმა",
    body: "იცავს თმის ფესვს ჰორმონული გავლენისგან და ხელს უწყობს უფრო სქელი თმის ზრდას.",
  },
  {
    Icon: Moon,
    title: "სიმშვიდე და ძილი",
    body: "ხელს უწყობს ღრმა ძილს და ამცირებს სტრესის რეაქციას, რომელიც თმის ზრდას აფერხებს.",
  },
  {
    Icon: Sprout,
    title: "თმის უჯრედული კვება",
    body: "აწვდის თმას იმ საშენ მასალას, რომელიც მენოპაუზის დროს ნაკლებად აღწევს.",
  },
  {
    Icon: Droplets,
    title: "სკალპის გარემო",
    body: "ინარჩუნებს იმ პირობებს სკალპზე, რომლებიც ჯანსაღ თმას სჭირდება.",
  },
];

export default function WhyDifferent() {
  const reduce = useReducedMotion();

  return (
    // Rounded, contained banner (matches Seed) — aligns with the page content
    // width supplied by the parent; not full-bleed.
    <section className="relative flex min-h-[500px] flex-col justify-between overflow-hidden rounded-3xl p-4 md:min-h-[620px] md:p-5">
      {/* Background photo */}
      <Image
        src="/why-different.png"
        alt=""
        fill
        sizes="(max-width: 1152px) 100vw, 1152px"
        className="object-cover object-center"
      />
      {/* Thamra-color treatment: light oxblood wash that keeps the photo clear,
          plus a soft left darken for headline legibility. */}
      <div className="absolute inset-0 bg-oxblood mix-blend-multiply opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-r from-oxblood/45 via-transparent to-transparent" />

      {/* Headline — upper-left. Light-weight Noto Serif Georgian for a more
          delicate, high-contrast look that echoes the Latin Cormorant. */}
      <h2 className="relative z-10 max-w-2xl px-4 pt-8 font-display text-[2.1rem] font-light leading-[1.15] tracking-[0.004em] text-white md:px-6 md:pt-14 md:text-[3rem]">
        იგრძენი მართლა ჯანსაღი თმის განსხვავება
      </h2>

      {/* Frosted glass card — anchored lower */}
      <div className="relative z-10 rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-md md:p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 xl:grid-cols-5">
          {TILES.map((t, i) => (
            <motion.div
              key={t.title}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{
                duration: 0.6,
                delay: reduce ? 0 : i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <t.Icon size={36} strokeWidth={1.25} className="text-white" aria-hidden />
              <h3 className="mt-4 font-body text-[15px] font-medium text-white">
                {t.title}
              </h3>
              <p className="mt-2 text-sm font-light leading-snug text-white/80">
                {t.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
