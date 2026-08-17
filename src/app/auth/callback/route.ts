import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  const next = url.searchParams.get("next") ?? "/onboarding";
  const code = url.searchParams.get("code");

  if (!isSupabaseConfigured() || !code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createServerSupabase();
  await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(`${origin}${next}`);
}
