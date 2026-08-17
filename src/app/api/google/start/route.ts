import { NextRequest, NextResponse } from "next/server";
import { googleConnectUrl } from "@/lib/google-calendar";
import { originFromRequest } from "@/lib/origin";
import { isGoogleConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";

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
    return NextResponse.redirect(new URL("/login", origin));
  }
  const url = googleConnectUrl(origin, user.id);
  if (!url) {
    return NextResponse.redirect(settings);
  }
  return NextResponse.redirect(url);
}
