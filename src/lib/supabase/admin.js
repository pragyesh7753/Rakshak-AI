import { createClient } from "@supabase/supabase-js";

/**
 * Admin client using service role key.
 * Bypasses RLS — NEVER import this in client components or expose to browser.
 * Safe to use only in Server Actions, Route Handlers, and Server Components.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
