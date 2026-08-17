import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/google-calendar";
import { originFromRequest } from "@/lib/origin";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const origin = originFromRequest(request);
  const denied = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const settings = new URL("/dashboard/settings", origin);

  if (denied) {
    settings.searchParams.set("google", denied);
    return NextResponse.redirect(settings);
  }
  if (!code) {
    settings.searchParams.set("google", "missing_code");
    return NextResponse.redirect(settings);
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin));
  if (state && state !== user.id) {
    settings.searchParams.set("google", "state");
    return NextResponse.redirect(settings);
  }

  try {
    const refresh = await exchangeGoogleCode(origin, code);
    await supabase
      .from("profiles")
      .update({
        google_refresh_token: refresh,
        google_calendar_id: "primary",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  } catch {
    settings.searchParams.set("google", "token");
    return NextResponse.redirect(settings);
  }
  return NextResponse.redirect(settings);
}
