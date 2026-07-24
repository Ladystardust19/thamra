import { NextRequest, NextResponse } from "next/server";
import { getBogToken, createBogOrder } from "@/lib/bog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Creates a small test order (default 1 GEL) and returns the BOG payment-page
// redirect link. Kept intentionally minimal — this is a gateway smoke test.
export async function POST(req: NextRequest) {
  try {
    const host = req.headers.get("host");
    if (!host) {
      return NextResponse.json({ error: "missing host header" }, { status: 400 });
    }
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const baseUrl = `${proto}://${host}`;

    // Optional amount override from the request body; defaults to 1 GEL.
    let amount = 1;
    try {
      const parsed = await req.json();
      if (parsed && typeof parsed.amount === "number" && parsed.amount > 0) {
        amount = parsed.amount;
      }
    } catch {
      // no body — fine, use default
    }

    const externalOrderId = `test-${Date.now()}`;
    const token = await getBogToken();
    const order = await createBogOrder({ token, baseUrl, externalOrderId, amount });

    const redirect = order?._links?.redirect?.href;
    if (!redirect) {
      console.error("pay/create: no redirect link in BOG response", order);
      return NextResponse.json({ error: "no redirect link", order }, { status: 502 });
    }

    console.log(
      `[BOG] order created id=${order.id} external=${externalOrderId} amount=${amount}`
    );
    return NextResponse.json({ redirect, orderId: order.id, externalOrderId });
  } catch (e) {
    console.error("pay/create error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
