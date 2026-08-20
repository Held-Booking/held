import { NextRequest, NextResponse } from "next/server";
import { googleConnectUrl } from "@/lib/google-calendar";
import { cookieDomainForApp, originFromRequest } from "@/lib/origin";
import { isGoogleConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";

const COOKIE = "held_google_connect";

export async function GET(request: NextRequest) {
  const origin = originFromRequest(request);
  const settings = new URL("/dashboard/settings", origin);
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(settings);
  }
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const login = new URL("/login", origin);
    login.searchParams.set("next", "/dashboard/settings");
    return NextResponse.redirect(login);
  }
  const url = googleConnectUrl(user.id, origin);
  if (!url) {
    return NextResponse.redirect(settings);
  }
  const res = NextResponse.redirect(url);
  const domain = cookieDomainForApp();
  res.cookies.set(COOKIE, user.id, {
    httpOnly: true,
    secure: origin.startsWith("https"),
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
    ...(domain ? { domain } : {}),
  });
  return res;
}
