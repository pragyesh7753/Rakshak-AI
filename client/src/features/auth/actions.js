import { createClient } from "@/lib/supabase/client";

/**
 * Inserts an organization row for the current user.
 * Uses upsert to avoid duplicate-key errors on retries.
 */
export async function insertOrganization({ id, org_name, sector, domain }) {
  const supabase = createClient();

  const { error } = await supabase
    .from("organizations")
    .upsert(
      {
        id,
        org_name,
        sector,
        domain,
        keywords: null,
      },
      { onConflict: "id" },
    );

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
