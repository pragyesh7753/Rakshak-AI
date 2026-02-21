import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Fetch the organization record for this user
  const { data: org } = await supabase
    .from("organization")
    .select("org_name, sector, domain, keywords")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">🛡️ Rakshak AI — Threat Dashboard</h1>
      {org && (
        <div className="text-center text-muted-foreground space-y-1">
          <p className="text-lg font-medium">{org.org_name}</p>
          <p>{org.sector} · {org.domain}</p>
        </div>
      )}
      <p className="text-sm text-muted-foreground">Logged in as {user.email}</p>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="text-sm underline text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
