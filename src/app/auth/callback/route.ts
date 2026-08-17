import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { originFromHeaders } from "@/lib/origin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = originFromHeaders(request.headers, url.origin);
  const next = url.searchParams.get("next") ?? "/onboarding";
  const code = url.searchParams.get("code");

  if (!isSupabaseConfigured() || !code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createServerSupabase();
  await supabase.auth.exchangeCodeForSession(code);

  const path = next.startsWith("/") ? next : "/onboarding";
  return NextResponse.redirect(`${origin}${path}`);
}
