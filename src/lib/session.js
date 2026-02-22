import { createClient } from "@/lib/supabase/server";

export async function getSession() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;
    
    return user;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}
