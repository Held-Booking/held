import { createClient } from "@supabase/supabase-js";
import {
  isServiceRoleConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

export function createAdminSupabase() {
  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) {
    throw new Error("Supabase service role is not configured.");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
