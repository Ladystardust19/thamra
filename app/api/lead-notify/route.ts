import { NextRequest, NextResponse } from "next/server";

// Telegram alert for a new quiz lead.
//
// Trigger: a Supabase Database Webhook on INSERT into public.quiz_leads
// (Dashboard → Database → Webhooks). Point it at POST /api/lead-notify and add
// a custom header `x-webhook-secret: <SUPABASE_WEBHOOK_SECRET>`.
//
// Env required (Vercel project settings):
//   TELEGRAM_BOT_TOKEN     — from @BotFather
//   TELEGRAM_CHAT_ID       — your user/group id (the bot must be able to message it)
//   SUPABASE_WEBHOOK_SECRET— shared secret matching the webhook's custom header
//
// Doing this server-side (not from the browser) keeps the bot token private and
// fires reliably regardless of what the client does after submitting.

export const runtime = "nodejs";

type TriageStatus = "refer_out" | "needs_labs" | "qualified";

const STATUS_LABEL: Record<TriageStatus, string> = {
  refer_out: "🔴 REFER OUT — ექიმთან (არ არის გაყიდვის ზარი)",
  needs_labs: "🟡 NEEDS LABS — ჯერ ანალიზები",
  qualified: "🟢 QUALIFIED — დაურეკე",
};

export async function POST(req: NextRequest) {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (!secret || req.headers.get("x-webhook-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    console.error("Telegram env not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID)");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  // Supabase webhook payload: { type, table, record, old_record, schema }
  const body = await req.json().catch(() => null);
  // Only alert on new leads — guard against an accidentally UPDATE/DELETE-scoped
  // webhook (e.g. the admin toggling `called`) spamming the channel.
  if (body?.type && body.type !== "INSERT") {
    return NextResponse.json({ ok: true, skipped: body.type });
  }

  const record = body?.record;
  if (!record) {
    return NextResponse.json({ error: "no record" }, { status: 400 });
  }

  // Consultation requests come through the same table, tagged in `answers`.
  // They carry no quiz answers, so give them their own header + call-me line.
  const isConsult = record?.answers?.source === "consultation_request";

  const status = (record.triage_status ?? "qualified") as TriageStatus;
  const statusLine = isConsult
    ? "🟢 კონსულტაცია — დაურეკე"
    : STATUS_LABEL[status] ?? String(status);

  // Plain text (no parse_mode) — an ops alert doesn't need formatting, and it
  // avoids Telegram's MarkdownV2 parse errors on names/labels containing
  // reserved characters like ( ) - . which would otherwise drop the message.
  const lines = [
    isConsult ? "ახალი კონსულტაციის მოთხოვნა — 150₾" : "ახალი ლიდი — THAMRA ქვიზი",
    statusLine,
    "",
    `👤 ${record.name ?? ""}`,
    `📞 ${record.phone ?? ""}`,
    record.email ? `✉️ ${record.email}` : null,
  ].filter(Boolean);

  const text = lines.join("\n");

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Telegram sendMessage failed:", res.status, detail);
    return NextResponse.json({ error: "telegram failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
