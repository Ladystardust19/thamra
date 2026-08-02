import { NextRequest, NextResponse } from "next/server";
import { getBogToken, createBogOrder } from "@/lib/bog";
import { getProduct } from "@/lib/products";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isValidTemplateSlot } from "@/lib/consultation";

// How long a slot stays held after checkout starts, before an unpaid hold frees.
const HOLD_MINUTES = 20;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Customer {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
}

function clean(s: unknown): string {
  return typeof s === "string" ? s.trim() : "";
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The orders.session_id column is uuid — only forward a well-formed id, else null,
// so a malformed value can't fail the insert.
function cleanSessionId(s: unknown): string | null {
  return typeof s === "string" && UUID_RE.test(s.trim()) ? s.trim() : null;
}

// Accept a consultation slot only if it matches a currently-offered template
// instant (so an arbitrary time can't be forced). Returns the canonical ISO.
function cleanSlot(s: unknown): string | null {
  if (typeof s !== "string") return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  const iso = d.toISOString();
  return isValidTemplateSlot(iso) ? iso : null;
}

export async function POST(req: NextRequest) {
  try {
    const host = req.headers.get("host");
    if (!host) {
      return NextResponse.json({ error: "missing host header" }, { status: 400 });
    }
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const baseUrl = `${proto}://${host}`;

    const payload = (await req.json().catch(() => ({}))) as {
      planId?: string;
      sessionId?: string;
      slot?: string;
      customer?: Customer;
    };

    // Price is derived from the catalog server-side — never trust a client amount.
    const product = getProduct(clean(payload.planId));
    if (!product) {
      return NextResponse.json({ error: "invalid plan" }, { status: 400 });
    }

    const sessionId = cleanSessionId(payload.sessionId);

    // Consultation carries a chosen time slot. If a slot was sent it must be a
    // valid template instant; a consultation with no slot is rejected so the
    // paid flow always ends up on the calendar.
    const slot = cleanSlot(payload.slot);
    if (product.id === "consultation" && !slot) {
      return NextResponse.json({ error: "invalid or missing slot" }, { status: 400 });
    }

    const c = payload.customer ?? {};
    const name = clean(c.name);
    const phone = clean(c.phone);
    const email = clean(c.email);
    const city = clean(c.city);
    const address = clean(c.address);

    // Physical programs need a delivery address; a service (consultation) does not.
    if (!name || !phone || (!product.service && (!city || !address))) {
      return NextResponse.json(
        { error: "missing required fields" },
        { status: 400 }
      );
    }

    const externalOrderId = `ord-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const admin = getSupabaseAdmin();

    // Record the intended order BEFORE redirecting, so the callback can match it.
    const { error: insertErr } = await admin.from("orders").insert({
      external_order_id: externalOrderId,
      program_id: product.id,
      program_name: product.name,
      amount: product.price,
      currency: "GEL",
      status: "pending",
      customer_name: name,
      customer_phone: phone,
      customer_email: email || null,
      city: city || null,
      address: address || null,
      session_id: sessionId,
    });
    if (insertErr) {
      console.error("checkout: order insert failed:", insertErr);
      return NextResponse.json({ error: "could not create order" }, { status: 500 });
    }

    // Hold the consultation slot. The partial unique index rejects a second
    // active hold on the same slot, so a race resolves to "slot_taken" here.
    if (slot) {
      const nowIso = new Date().toISOString();
      // Free any expired hold on this slot first — its row is still status='held'
      // and would otherwise trip the unique index even though the slot is free.
      await admin
        .from("consultation_bookings")
        .update({ status: "released", updated_at: nowIso })
        .eq("slot_start", slot)
        .eq("status", "held")
        .lt("hold_expires_at", nowIso);

      const holdExpiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString();
      const { error: bookErr } = await admin.from("consultation_bookings").insert({
        slot_start: slot,
        status: "held",
        external_order_id: externalOrderId,
        session_id: sessionId,
        customer_name: name,
        customer_phone: phone,
        hold_expires_at: holdExpiresAt,
      });
      if (bookErr) {
        console.error("checkout: slot hold failed (likely taken):", bookErr.message);
        await admin
          .from("orders")
          .update({ status: "failed" })
          .eq("external_order_id", externalOrderId);
        return NextResponse.json({ error: "slot_taken" }, { status: 409 });
      }
    }

    const token = await getBogToken();
    const order = await createBogOrder({
      token,
      baseUrl,
      externalOrderId,
      amount: product.price,
      productId: product.id,
    });

    const redirect = order?._links?.redirect?.href;
    if (!redirect) {
      console.error("checkout: no redirect link from BOG", order);
      await admin
        .from("orders")
        .update({ status: "failed" })
        .eq("external_order_id", externalOrderId);
      // Payment never started — free the slot we just held.
      if (slot) {
        await admin
          .from("consultation_bookings")
          .update({ status: "released", updated_at: new Date().toISOString() })
          .eq("external_order_id", externalOrderId);
      }
      return NextResponse.json({ error: "payment init failed" }, { status: 502 });
    }

    // Save BOG's order id for reconciliation.
    await admin
      .from("orders")
      .update({ bog_order_id: order.id })
      .eq("external_order_id", externalOrderId);

    console.log(
      `[checkout] order ${externalOrderId} plan=${product.id} amount=${product.price} bog=${order.id}`
    );
    return NextResponse.json({ redirect, externalOrderId });
  } catch (e) {
    console.error("checkout error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
