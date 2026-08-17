import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/google-calendar";
import { createServerSupabase } from "@/lib/supabase/server";

function origin() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const settings = new URL("/dashboard/settings", origin());
  if (!code) return NextResponse.redirect(settings);

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin()));
  if (state && state !== user.id) return NextResponse.redirect(settings);

  try {
    const refresh = await exchangeGoogleCode(code);
    await supabase
      .from("profiles")
      .update({
        google_refresh_token: refresh,
        google_calendar_id: "primary",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  } catch {
    // Settings still loads. Connect again if Google refused.
  }
  return NextResponse.redirect(settings);
}
