import { NextResponse } from "next/server";
import { googleConnectUrl } from "@/lib/google-calendar";
import { isGoogleConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(new URL("/dashboard/settings", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }
  const url = googleConnectUrl(user.id);
  if (!url) {
    return NextResponse.redirect(new URL("/dashboard/settings", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }
  return NextResponse.redirect(url);
}
