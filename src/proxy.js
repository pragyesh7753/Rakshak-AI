import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and Next.js internals.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|logo|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
