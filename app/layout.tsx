import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Jost,
  Noto_Serif_Georgian,
  Noto_Sans_Georgian,
} from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

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
      <head>
        {/* eslint-disable-next-line @next/next/no-script-component-in-head */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1993962957923733');fbq('track','PageView');`,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: "none" }} alt=""
            src="https://www.facebook.com/tr?id=1993962957923733&ev=PageView&noscript=1" />
        </noscript>
      </head>
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
        <SiteFooter />
      </body>
    </html>
  );
}
