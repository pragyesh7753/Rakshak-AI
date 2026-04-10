import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let browserClient;

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl =
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL ?? "https://example.supabase.co";
  const supabaseAnonKey =
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY ?? "public-anon-key";

  browserClient = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}
