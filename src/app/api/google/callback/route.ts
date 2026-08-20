import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/google-calendar";
import {
  cookieDomainForApp,
  publicAppUrl,
  publicHost,
  requestHost,
} from "@/lib/origin";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { isServiceRoleConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";

const COOKIE = "held_google_connect";

export async function GET(request: NextRequest) {
  const origin = publicAppUrl();
  if (requestHost(request) !== publicHost()) {
    const bounce = new URL("/api/google/callback", origin);
    bounce.search = request.nextUrl.search;
    return NextResponse.redirect(bounce);
  }

  const denied = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const settings = new URL("/dashboard/settings", origin);
  const cookieId = request.cookies.get(COOKIE)?.value ?? "";

  function done(target: URL) {
    const res = NextResponse.redirect(target);
    res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
    const domain = cookieDomainForApp();
    if (domain) {
      res.cookies.set(COOKIE, "", { path: "/", maxAge: 0, domain });
    }
    return res;
  }

  if (denied) {
    settings.searchParams.set("google", denied);
    const reason = request.nextUrl.searchParams.get("error_description");
    if (reason) settings.searchParams.set("reason", reason.slice(0, 180));
    return done(settings);
  }
  if (!code) {
    settings.searchParams.set("google", "missing_code");
    return done(settings);
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId =
    user?.id ??
    (cookieId && (!state || state === cookieId) ? cookieId : "");

  if (!userId) {
    const login = new URL("/login", origin);
    login.searchParams.set("next", "/dashboard/settings");
    return NextResponse.redirect(login);
  }
  if (state && state !== userId) {
    settings.searchParams.set("google", "state");
    return done(settings);
  }

  try {
    const refresh = await exchangeGoogleCode(code);
    const db = isServiceRoleConfigured()
      ? createAdminSupabase()
      : supabase;
    const { error } = await db
      .from("profiles")
      .update({
        google_refresh_token: refresh,
        google_calendar_id: "primary",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
  } catch (err) {
    settings.searchParams.set("google", "token");
    const reason = err instanceof Error ? err.message : "";
    if (reason) settings.searchParams.set("reason", reason.slice(0, 180));
    return done(settings);
  }
  settings.searchParams.set("google", "ok");
  return done(settings);
}
