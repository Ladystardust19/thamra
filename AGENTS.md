# AGENTS.md — Thamra

Context for AI coding agents working in this repo. Read this before making changes.

## What this is

Thamra is a Georgian hair-wellness brand. This repo is the **Next.js 14 (App Router)** site:
a landing page, a diagnostic **quiz funnel**, product landing pages, a checkout/payment
flow, and an internal **admin/analytics dashboard**. It is live at **thamra.ge**, deployed
on **Vercel**.

- Framework: Next.js 14 (App Router), React 18, TypeScript
- Styling: Tailwind CSS (custom brand tokens — see `tailwind.config.ts`)
- Animation: Framer Motion + GSAP
- Data: Supabase (`@supabase/supabase-js`)
- Payments: Bank of Georgia (BOG / OPAY) e-commerce gateway
- Email/alerts: Resend + Telegram
- Tests: Vitest
- Scheduling UI: Cal.com embed

## Commands

```bash
npm run dev        # next dev  — see note below about the port
npm run build      # next build
npm run start      # next start
npm run lint       # next lint
npm run test       # vitest run
npm run typecheck  # tsc --noEmit
```

Run `npm run typecheck` and `npm run test` before considering a change done.

**Dev-server port gotcha:** Chrome on this machine caches a stale unrelated app on
`localhost:3000`. Start the dev server on a fresh port (e.g. `next dev -p 3005`) to avoid
confusing cached results.

## Project layout

```
app/                     App Router routes
  page.tsx               Home / landing
  quiz/                  Diagnostic quiz funnel
  product/
    nano-collagen/       Nano-collagen product landing (8-section)
    hair-cell-nad/       HAIR CELL NAD+ product page
  checkout/  pay/        Checkout + BOG payment result pages (success/fail)
  consultation/          Consultation opt-in flow
  admin/  cabinet/       Internal dashboard + login
  about/ privacy/ terms/ delivery-returns/ programs/   Merchant/legal pages
  api/
    checkout/route.ts    Creates BOG order, returns payment redirect
    lead-notify/route.ts Lead alert pipeline
    meta-lead/route.ts   Meta (Facebook) lead events
components/
  nano/                  Nano-collagen landing sections (NanoLanding.tsx = main)
  nad/                   HAIR CELL NAD+ sections
  quiz/                  Quiz UI
  sections/  admin/      Landing sections + admin UI
  (shared: HeroCover, FormulaSelector, SiteHeader/Footer, PricingSection, ...)
lib/
  supabase.ts / supabaseAdmin.ts   DB clients (admin uses service role — server only)
  bog.ts                 BOG payment gateway integration
  scoring.ts / legacyScoring.ts    Quiz scoring (3-score model; legacy adapter kept)
  leadDiagnosis.ts       Lead → diagnosis mapping
  resultContent*.ts / resultNarrative.ts / resultPolicy.ts   Quiz result content
  formulas.ts / thamraFormula.ts / products.ts / nanoCollagen.ts / hairCellNad.ts
  analytics.ts           Funnel analytics
  email.ts / consultation.ts
```

## Georgian copy rules — IMPORTANT

All user-facing copy is Georgian. When writing or editing copy:

- **Always use the informal "შენ" form, never the formal "თქვენ".** This is a firm brand
  voice rule — apply it everywhere, including buttons, form labels, and error messages.
- Don't add boilerplate/filler text. Keep copy tight; the brand voice is minimal.
- The currency symbol ₾ uses a specific webfont — don't replace it with "GEL" or "lari".

## Quiz funnel — current behavior

The funnel was restructured and the standalone result page was **removed**. Current flow:

1. User answers the quiz questions.
2. After the last question: a **კი / არა** (yes/no) consultation opt-in.
   - **კი** → contact form → "we'll call you" confirmation message (flow ends here).
   - **არა** → "thank you" message (flow ends here).
3. Legacy result/`ResultScreen` components still exist in the tree but are **unreachable**
   from the live funnel. Don't wire them back in without being asked.

Quiz leads **do persist** to Supabase (`quiz_leads` table) — this is not console-only.
There is a `triage_status` column (distinct from `status`) plus a Telegram alert pipeline
for new leads.

## Payments

The BOG / OPAY gateway is **fully live** (the earlier 100-GEL test cap has been lifted).
Real checkout is verified end-to-end: card → signed callback → `orders` table. Treat
payment code (`lib/bog.ts`, `app/api/checkout`, `app/pay/*`) as production-critical — be
careful and don't add test/debug scaffolding to it.

## Supabase

Thamra's Supabase project is a **separate account** from other Mindor projects. Secrets
live in `.env.local` (not committed). `supabaseAdmin.ts` uses the service-role key and must
only ever run server-side (route handlers / server components) — never import it into a
client component.

## Conventions

- Match the style of surrounding code: Tailwind utility classes inline, brand color tokens
  (`oxblood`, `cream`, `gold`, `gold-ink`, `read`, `surface`, ...) from `tailwind.config.ts`
  rather than raw hex where a token exists.
- Components are section-scoped under `components/<area>/`. Keep new product-page sections in
  the matching folder.
- Don't commit secrets. Don't commit `.next/`, `node_modules/`, or build artifacts.
- Keep diffs focused; verify with `typecheck` + `test` before finishing.
