import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const user = data.user;
      const meta = user.user_metadata ?? {};

      // Insert org row if not already present (handles email-confirmation flow)
      if (meta.org_name) {
        const admin = createAdminClient();
        const { data: existing } = await admin
          .from("organization")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!existing) {
          await admin.from("organization").insert({
            id: user.id,
            org_name: meta.org_name,
            sector: meta.sector ?? null,
            domain: meta.domain ?? null,
            keywords: null,
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — redirect to login with error hint
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
