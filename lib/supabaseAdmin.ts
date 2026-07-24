import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client using the SERVICE ROLE key. Bypasses RLS, so it
// must NEVER be imported into client components. Used for writing/reading the
// private `orders` table from API routes only.
//
// Requires env var SUPABASE_SERVICE_ROLE_KEY (server-only, not NEXT_PUBLIC).

const url = "https://zxwkjlcklbypaawlfdno.supabase.co";

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  if (!cached) {
    cached = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
