import { createVerify } from "crypto";

// Bank of Georgia (OPAY) e-commerce payment integration.
// Docs: https://api.bog.ge/docs/payments/introduction
//
// Secrets are read from server-only env vars (never NEXT_PUBLIC_*):
//   BOG_CLIENT_ID   — OPAY CLIENT ID  (from the bank)
//   BOG_SECRET_KEY  — OPAY SECRET KEY (from the bank)

const OAUTH_URL =
  "https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token";
const ORDERS_URL = "https://api.bog.ge/payments/v1/ecommerce/orders";

// RSA public key published by BOG for verifying the Callback-Signature header.
export const BOG_CALLBACK_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu4RUyAw3+CdkS3ZNILQh
zHI9Hemo+vKB9U2BSabppkKjzjjkf+0Sm76hSMiu/HFtYhqWOESryoCDJoqffY0Q
1VNt25aTxbj068QNUtnxQ7KQVLA+pG0smf+EBWlS1vBEAFbIas9d8c9b9sSEkTrr
TYQ90WIM8bGB6S/KLVoT1a7SnzabjoLc5Qf/SLDG5fu8dH8zckyeYKdRKSBJKvhx
tcBuHV4f7qsynQT+f2UYbESX/TLHwT5qFWZDHZ0YUOUIvb8n7JujVSGZO9/+ll/g
4ZIWhC1MlJgPObDwRkRd8NFOopgxMcMsDIZIoLbWKhHVq67hdbwpAq9K9WMmEhPn
PwIDAQAB
-----END PUBLIC KEY-----`;

/** Fetch an OAuth2 access token via client_credentials (Basic auth). */
export async function getBogToken(): Promise<string> {
  const clientId = process.env.BOG_CLIENT_ID;
  const secretKey = process.env.BOG_SECRET_KEY;
  if (!clientId || !secretKey) {
    throw new Error("BOG_CLIENT_ID / BOG_SECRET_KEY are not set");
  }

  const basic = Buffer.from(`${clientId}:${secretKey}`).toString("base64");
  const res = await fetch(OAUTH_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`BOG auth failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("BOG auth: no access_token in response");
  return data.access_token;
}

export interface CreateOrderParams {
  token: string;
  /** Absolute site origin, e.g. https://thamra.ge — used for callback + redirects. */
  baseUrl: string;
  /** Our own order identifier, echoed back on the callback. */
  externalOrderId: string;
  /** Amount in GEL. */
  amount: number;
  productId?: string;
}

export interface BogOrderResponse {
  id: string;
  _links?: { redirect?: { href?: string }; details?: { href?: string } };
}

/** Create an e-commerce order and get back the hosted payment-page redirect link. */
export async function createBogOrder(
  p: CreateOrderParams
): Promise<BogOrderResponse> {
  const body = {
    callback_url: `${p.baseUrl}/api/pay/callback`,
    external_order_id: p.externalOrderId,
    purchase_units: {
      currency: "GEL",
      total_amount: p.amount,
      basket: [
        {
          product_id: p.productId ?? "thamra-test",
          quantity: 1,
          unit_price: p.amount,
        },
      ],
    },
    redirect_urls: {
      success: `${p.baseUrl}/pay/success`,
      fail: `${p.baseUrl}/pay/fail`,
    },
  };

  const res = await fetch(ORDERS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${p.token}`,
      "Content-Type": "application/json",
      "Accept-Language": "ka",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`BOG create order failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as BogOrderResponse;
}

/**
 * Verify a callback's `Callback-Signature` (base64, SHA256withRSA) against the
 * RAW request body. Must run on the raw bytes before JSON parsing.
 */
export function verifyBogSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;
  try {
    const verifier = createVerify("RSA-SHA256");
    verifier.update(rawBody);
    verifier.end();
    return verifier.verify(BOG_CALLBACK_PUBLIC_KEY, signature, "base64");
  } catch {
    return false;
  }
}
