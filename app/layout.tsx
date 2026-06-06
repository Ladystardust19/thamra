import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Jost,
  Noto_Serif_Georgian,
  Noto_Sans_Georgian,
} from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

/*
 * Mixed-script type system. Latin glyphs render in Cormorant/Jost; Georgian
 * glyphs (which those faces lack) fall through to the matching Noto Georgian
 * face. Stacks are wired in tailwind.config.ts:
 *   display (headings) → Cormorant Garamond → Noto Serif Georgian
 *   body / labels      → Jost              → Noto Sans Georgian
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
  variable: "--font-jost",
});

const notoSerifGeorgian = Noto_Serif_Georgian({
  subsets: ["georgian"],
  display: "swap",
  variable: "--font-ge-serif",
});

const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian"],
  display: "swap",
  variable: "--font-ge-sans",
});

const fontVars = `${cormorant.variable} ${jost.variable} ${notoSerifGeorgian.variable} ${notoSansGeorgian.variable}`;

export const metadata: Metadata = {
  title: "თამრა — თმის ჯანმრთელობა იწყება შიგნიდან",
  description:
    "14 კლინიკურად შესწავლილი ინგრედიენტი. ერთი კოვზი დღეში. შედეგი 90 დღეში. თმის ფორმულა 45+ ქალებისთვის.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ka" className={fontVars}>
      <body className="bg-cream font-body text-ink antialiased">
        {/* Mark JS as available before paint so scroll-reveal can hide
            elements; without JS, content stays fully visible. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js');",
          }}
        />

        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
