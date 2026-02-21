"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Inserts an organization row using the service role key (bypasses RLS).
 * Called from the register form after a successful signUp on the client.
 */
export async function insertOrganization({ id, org_name, sector, domain }) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("organization").insert({
    id,
    org_name,
    sector,
    domain,
    keywords: null,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Signs the current user out and redirects to the login page.
 */
export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
  redirect("/login");
}
