import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const PIXEL_ID = "1993962957923733";
const API_VERSION = "v25.0";

function sha256(value: string) {
  return createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
}

export async function POST(req: NextRequest) {
  const { name, phone, email, eventId, fbc } = await req.json();

  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("META_CAPI_ACCESS_TOKEN is not set");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const userData: Record<string, string[]> = {};
  if (email) userData.em = [sha256(email)];
  if (phone) userData.ph = [sha256(phone)];

  const nameParts = (name ?? "").trim().split(/\s+/);
  if (nameParts[0]) userData.fn = [sha256(nameParts[0])];
  if (nameParts[1]) userData.ln = [sha256(nameParts.slice(1).join(" "))];
  if (fbc) (userData as Record<string, unknown>).fbc = fbc;

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "system_generated",
        event_id: eventId,
        custom_data: {
          event_source: "crm",
          lead_event_source: "Thamra Quiz",
        },
        user_data: userData,
      },
    ],
  };

  const res = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${accessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const result = await res.json();
  if (!res.ok) {
    console.error("Meta CAPI error:", JSON.stringify(result));
    return NextResponse.json({ error: result }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}
