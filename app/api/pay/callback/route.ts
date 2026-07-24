import { NextRequest, NextResponse } from "next/server";
import { verifyBogSignature } from "@/lib/bog";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// BOG posts payment status here (server-to-server). We MUST verify the
// Callback-Signature against the raw body, update the matching order, then
// return 200 so BOG stops retrying.
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("callback-signature");
  const valid = verifyBogSignature(raw, signature);

  let parsed: { body?: Record<string, unknown> } | null = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // leave null
  }

  const body = (parsed?.body ?? {}) as {
    order_id?: string;
    external_order_id?: string;
    order_status?: { key?: string; value?: string };
    payment_detail?: { code?: string };
  };
  const externalOrderId = body.external_order_id;
  const statusKey = body.order_status?.key;
  const paymentCode = body.payment_detail?.code;

  console.log(
    `[BOG callback] signatureValid=${valid} order_id=${body.order_id ?? "?"} ` +
      `external=${externalOrderId ?? "?"} status=${statusKey ?? "?"} code=${paymentCode ?? "?"}`
  );

  if (!valid) {
    console.warn("[BOG callback] INVALID signature — ignoring");
    // 200 avoids a retry storm; the log records the reject.
    return NextResponse.json({ ok: false, reason: "invalid signature" }, { status: 200 });
  }

  // Reconcile the matching order row by external_order_id.
  if (externalOrderId) {
    const status =
      statusKey === "completed" && paymentCode === "100"
        ? "completed"
        : statusKey === "completed"
        ? "completed"
        : "failed";
    try {
      const admin = getSupabaseAdmin();
      const { error } = await admin
        .from("orders")
        .update({
          status,
          bog_order_id: body.order_id ?? null,
          payment_detail: body.payment_detail ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("external_order_id", externalOrderId);
      if (error) console.error("[BOG callback] order update failed:", error);
    } catch (e) {
      console.error("[BOG callback] order update threw:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
