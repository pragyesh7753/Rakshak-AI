import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export default async function AuthLayout({ children }) {
  // Server Actions POST to the current route — skip the redirect so the action
  // can complete without the layout issuing a 307 that breaks the response.
  const headersList = await headers();
  const isServerAction = headersList.has("next-action");
  if (isServerAction) {
    return children;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    redirect("/dashboard");
  }
  
  return children;
}
