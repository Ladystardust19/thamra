import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { generateTemplateSlots } from "@/lib/consultation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns the template slots that are still free: template minus any slot that is
// booked, or held with a hold that hasn't expired. Bookings are RLS-private, so
// this must run server-side with the service-role key.
export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    const { data: taken, error } = await admin
      .from("consultation_bookings")
      .select("slot_start,status,hold_expires_at")
      .in("status", ["held", "booked"]);
    if (error) {
      console.error("[slots] bookings read failed:", error);
      return NextResponse.json({ error: "could not load slots" }, { status: 500 });
    }

    const now = Date.now();
    const takenSet = new Set(
      (taken ?? [])
        .filter(
          (b) =>
            b.status === "booked" ||
            (b.hold_expires_at && new Date(b.hold_expires_at).getTime() > now),
        )
        // Normalise to the same ISO form the template uses so the compare is exact.
        .map((b) => new Date(b.slot_start).toISOString()),
    );

    const slots = generateTemplateSlots().filter((s) => !takenSet.has(s.start));
    return NextResponse.json({ slots });
  } catch (e) {
    console.error("[slots] error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
