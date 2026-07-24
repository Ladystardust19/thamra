import { NextRequest, NextResponse } from "next/server";
import { verifyBogSignature } from "@/lib/bog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// BOG posts payment status here (server-to-server). We MUST verify the
// Callback-Signature against the raw body, then return 200 so BOG stops retrying.
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("callback-signature");
  const valid = verifyBogSignature(raw, signature);

  let body: unknown = null;
  try {
    body = JSON.parse(raw);
  } catch {
    // leave body null
  }

  const inner = (body as { body?: Record<string, unknown> } | null)?.body ?? {};
  const orderId = (inner as { order_id?: string }).order_id;

  console.log(
    `[BOG callback] signatureValid=${valid} order_id=${orderId ?? "?"} payload=${
      raw.length > 2000 ? raw.slice(0, 2000) + "…" : raw
    }`
  );

  if (!valid) {
    console.warn("[BOG callback] INVALID signature");
    // Return 200 to avoid a retry storm during testing; the log records the reject.
    return NextResponse.json({ ok: false, reason: "invalid signature" }, { status: 200 });
  }

  // Smoke test: no persistence yet. Real order-status handling comes later.
  return NextResponse.json({ ok: true });
}
