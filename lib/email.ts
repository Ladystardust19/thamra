// Order-confirmation email — sent from the BOG pay callback once an order is
// marked `completed`. Uses Resend (HTTP API, serverless-friendly).
//
// Env (all server-only):
//   RESEND_API_KEY        required to actually send; if unset we log + no-op
//                         so a missing key can never break the payment callback.
//   ORDER_EMAIL_FROM      optional, defaults to "Thamra <orders@thamra.ge>"
//                         (the domain must be verified in Resend to send).
//   ORDER_EMAIL_BUSINESS  optional, defaults to "infothamra@gmail.com".
import { Resend } from "resend";

const FROM = process.env.ORDER_EMAIL_FROM || "Thamra <orders@thamra.ge>";
const BUSINESS = process.env.ORDER_EMAIL_BUSINESS || "infothamra@gmail.com";
const REPLY_TO = "infothamra@gmail.com";

// Pre-order dispatch date shown to the buyer (matches /delivery-returns).
const SHIP_DATE = "10 სექტემბერი, 2026";

export interface OrderEmailData {
  external_order_id: string;
  program_name: string;
  amount: number | string;
  currency?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  city?: string | null;
  address?: string | null;
}

const BURGUNDY = "#8B2F3A";
const GOLD = "#C9A96E";
const CREAM = "#F2EBE3";
const INK = "#3D3335";
const MUTE = "#6B5F5A";

function esc(s: unknown): string {
  return String(s ?? "").replace(/[<>&]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;"
  );
}

function money(o: OrderEmailData): string {
  return `${o.amount} ${o.currency || "GEL"}`;
}

// A compact order-detail table shared by both emails.
function detailRows(o: OrderEmailData): string {
  const rows: [string, string][] = [
    ["პროგრამა", esc(o.program_name)],
    ["თანხა", esc(money(o))],
    ["შეკვეთის ნომერი", esc(o.external_order_id)],
    ["სახელი", esc(o.customer_name)],
    ["ტელეფონი", esc(o.customer_phone)],
    ["ქალაქი", esc(o.city)],
    ["მისამართი", esc(o.address)],
  ];
  if (o.customer_email) rows.push(["ელ. ფოსტა", esc(o.customer_email)]);
  return rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr>
          <td style="padding:8px 0;color:${MUTE};font-size:13px;width:150px;vertical-align:top;">${k}</td>
          <td style="padding:8px 0;color:${INK};font-size:14px;font-weight:500;">${v}</td>
        </tr>`
    )
    .join("");
}

function shell(inner: string): string {
  return `<!doctype html><html lang="ka"><body style="margin:0;background:${CREAM};padding:32px 16px;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#FDFBF8;border:1px solid rgba(201,169,110,0.35);border-radius:12px;overflow:hidden;">
      <div style="background:${BURGUNDY};padding:24px 28px;">
        <div style="color:#fff;font-size:22px;letter-spacing:0.18em;font-weight:600;">THAMRA</div>
      </div>
      <div style="padding:28px;">${inner}</div>
      <div style="padding:18px 28px;border-top:1px solid rgba(201,169,110,0.3);color:${MUTE};font-size:12px;line-height:1.6;">
        THAMRA · <a href="mailto:${REPLY_TO}" style="color:${GOLD};text-decoration:none;">${REPLY_TO}</a>
      </div>
    </div>
  </body></html>`;
}

function buyerHtml(o: OrderEmailData): string {
  const hi = o.customer_name ? `${esc(o.customer_name)}, ` : "";
  return shell(`
    <h1 style="font-size:22px;color:${BURGUNDY};margin:0 0 8px;">გმადლობთ შეკვეთისთვის ✓</h1>
    <p style="font-size:15px;color:${INK};line-height:1.6;margin:0 0 20px;">
      ${hi}შენი Thamra შეკვეთა მიღებულია და გადახდა დადასტურდა. ქვემოთ ნახავ დეტალებს.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 20px;">${detailRows(o)}</table>
    <div style="background:${CREAM};border-radius:8px;padding:16px 18px;font-size:14px;color:${INK};line-height:1.6;">
      📦 ეს არის წინასწარი შეკვეთა. მიწოდება დაიწყება <strong>${SHIP_DATE}</strong>-დან.
      მიწოდებამდე დაგიკავშირდებით მითითებულ ნომერზე.
    </div>
    <p style="font-size:13px;color:${MUTE};line-height:1.6;margin:20px 0 0;">
      კითხვის შემთხვევაში მოგვწერე <a href="mailto:${REPLY_TO}" style="color:${BURGUNDY};">${REPLY_TO}</a>.
    </p>
  `);
}

function businessHtml(o: OrderEmailData): string {
  return shell(`
    <h1 style="font-size:20px;color:${BURGUNDY};margin:0 0 6px;">ახალი შეკვეთა 🎉</h1>
    <p style="font-size:14px;color:${MUTE};margin:0 0 20px;">გადახდა დადასტურებულია (BOG).</p>
    <table style="width:100%;border-collapse:collapse;">${detailRows(o)}</table>
  `);
}

function buyerText(o: OrderEmailData): string {
  return [
    `გმადლობთ შეკვეთისთვის.`,
    ``,
    `პროგრამა: ${o.program_name}`,
    `თანხა: ${money(o)}`,
    `შეკვეთის ნომერი: ${o.external_order_id}`,
    ``,
    `ეს არის წინასწარი შეკვეთა. მიწოდება დაიწყება ${SHIP_DATE}-დან.`,
    `კითხვის შემთხვევაში: ${REPLY_TO}`,
  ].join("\n");
}

function businessText(o: OrderEmailData): string {
  return [
    `ახალი შეკვეთა (გადახდა დადასტურებულია)`,
    `პროგრამა: ${o.program_name}`,
    `თანხა: ${money(o)}`,
    `შეკვეთა: ${o.external_order_id}`,
    `სახელი: ${o.customer_name ?? ""}`,
    `ტელეფონი: ${o.customer_phone ?? ""}`,
    `ქალაქი: ${o.city ?? ""}`,
    `მისამართი: ${o.address ?? ""}`,
    `ელ. ფოსტა: ${o.customer_email ?? "—"}`,
  ].join("\n");
}

// Sends buyer confirmation (if an email was provided) + business notification.
// Never throws — email failures must not break the payment callback.
export async function sendOrderEmails(o: OrderEmailData): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(
      `[email] RESEND_API_KEY unset — skipping order emails for ${o.external_order_id}`
    );
    return;
  }
  const resend = new Resend(key);

  // Business notification: always send (order always exists).
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: BUSINESS,
      replyTo: REPLY_TO,
      subject: `ახალი შეკვეთა — ${o.program_name} — ${money(o)}`,
      html: businessHtml(o),
      text: businessText(o),
    });
    if (error) console.error("[email] business send failed:", error);
  } catch (e) {
    console.error("[email] business send threw:", e);
  }

  // Buyer confirmation: only if they gave an email (it's optional at checkout).
  const buyer = (o.customer_email || "").trim();
  if (buyer) {
    try {
      const { error } = await resend.emails.send({
        from: FROM,
        to: buyer,
        replyTo: REPLY_TO,
        subject: "შენი Thamra შეკვეთა მიღებულია",
        html: buyerHtml(o),
        text: buyerText(o),
      });
      if (error) console.error("[email] buyer send failed:", error);
    } catch (e) {
      console.error("[email] buyer send threw:", e);
    }
  }
}
