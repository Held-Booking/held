import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { originFromHeaders } from "@/lib/origin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";

const OTP_TYPES = new Set<string>([
  "recovery",
  "signup",
  "invite",
  "magiclink",
  "email",
  "email_change",
]);

function safeNext(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

function nextForType(type: string | null, requested: string | null, fallback: string) {
  if (type === "recovery") return "/auth/update-password";
  return safeNext(requested, fallback);
}

export async function finishAuthCallback(
  request: Request,
  fallbackNext = "/onboarding",
) {
  const url = new URL(request.url);
  const origin = originFromHeaders(request.headers, url.origin);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = nextForType(type, url.searchParams.get("next"), fallbackNext);

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createServerSupabase();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const fail =
        type === "recovery" || next === "/auth/update-password"
          ? "/forgot-password"
          : "/login";
      return NextResponse.redirect(`${origin}${fail}`);
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  if (tokenHash && type && OTP_TYPES.has(type)) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });
    if (error) {
      const fail = type === "recovery" ? "/forgot-password" : "/login";
      return NextResponse.redirect(`${origin}${fail}`);
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login`);
}
