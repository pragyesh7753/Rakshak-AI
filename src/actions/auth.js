"use server";

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
 * Deletes a Supabase Auth user by ID using the service role key.
 * Used to roll back a sign-up when the subsequent organization insert fails.
 */
export async function deleteAuthUser(userId) {
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    return { error: error.message };
  }
  return { success: true };
}
