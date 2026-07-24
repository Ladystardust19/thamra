import { NextRequest, NextResponse } from "next/server";
import { getBogToken, createBogOrder } from "@/lib/bog";
import { getProduct } from "@/lib/products";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

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
      customer?: Customer;
    };

    // Price is derived from the catalog server-side — never trust a client amount.
    const product = getProduct(clean(payload.planId));
    if (!product) {
      return NextResponse.json({ error: "invalid plan" }, { status: 400 });
    }

    const c = payload.customer ?? {};
    const name = clean(c.name);
    const phone = clean(c.phone);
    const email = clean(c.email);
    const city = clean(c.city);
    const address = clean(c.address);

    if (!name || !phone || !city || !address) {
      return NextResponse.json(
        { error: "missing required delivery fields" },
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
      city,
      address,
    });
    if (insertErr) {
      console.error("checkout: order insert failed:", insertErr);
      return NextResponse.json({ error: "could not create order" }, { status: 500 });
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
