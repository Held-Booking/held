"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { dbErrorMessage } from "@/lib/supabase/errors";
import { publicAppUrl } from "@/lib/origin";
import { isValidSlug, slugify } from "@/lib/slug";

type AuthResult = { error: string | null; confirm?: boolean };

function authErrorMessage(message: string) {
  const text = message.toLowerCase();
  if (text.includes("already registered")) {
    return "That email already has a page. Log in instead.";
  }
  if (text.includes("invalid login")) {
    return "Email or password is wrong.";
  }
  if (text.includes("session") || text.includes("not authenticated")) {
    return "This reset link expired. Request a new one.";
  }
  if (text.includes("rate limit") || text.includes("email rate")) {
    return "Too many signup emails from this project. Wait about an hour, or log in with the account you already have.";
  }
  return message;
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Add your Supabase keys in .env.local first." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || password.length < 8) {
    return { error: "Use a real email and at least 8 characters." };
  }

  const supabase = await createServerSupabase();
  const origin = publicAppUrl();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) return { error: authErrorMessage(error.message) };

  if (!data.session) {
    return { error: null, confirm: true };
  }

  redirect("/onboarding");
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Add your Supabase keys in .env.local first." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: authErrorMessage(error.message) };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("slug")
    .eq("id", user.id)
    .maybeSingle();

  redirect(profile?.slug ? "/dashboard" : "/onboarding");
}

export async function requestPasswordReset(formData: FormData): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Add your Supabase keys in .env.local first." };
  }

  const email = String(formData.get("email") ?? "").trim();
  if (!email.includes("@")) {
    return { error: "Enter the email on your page." };
  }

  const supabase = await createServerSupabase();
  const origin = publicAppUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset`,
  });

  if (error) {
    const text = error.message.toLowerCase();
    if (text.includes("rate limit") || text.includes("email rate")) {
      return { error: "Too many reset emails. Wait a bit, then try again." };
    }
  }

  const jar = await cookies();
  jar.set("held_password_reset", "1", {
    httpOnly: false,
    maxAge: 60 * 60,
    path: "/",
    sameSite: "lax",
  });

  return { error: null, confirm: true };
}

export async function updatePassword(formData: FormData): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { error: "Add your Supabase keys in .env.local first." };
  }

  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { error: "Use at least 8 characters." };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "This reset link expired. Request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: authErrorMessage(error.message) };

  const stay = String(formData.get("stay") ?? "") === "1";
  if (!stay) await supabase.auth.signOut();
  return { error: null, confirm: true };
}

export async function signOut() {
  if (!isSupabaseConfigured()) redirect("/");
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/");
}

export async function completeOnboarding(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return { error: "Add your Supabase keys in .env.local first." };
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? displayName));

  if (displayName.length < 2) {
    return { error: "Give the page a name." };
  }
  if (!isValidSlug(slug)) {
    return { error: "Pick a short link with letters and numbers only." };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("slug", slug)
    .neq("id", user.id)
    .maybeSingle();

  if (taken) return { error: "That link is taken." };

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: displayName,
    slug,
    country: "NG",
    currency: "NGN",
    timezone: "Africa/Lagos",
    plan_status: "trialing",
    plan_expires_at: new Date(Date.now() + 14 * 86_400_000).toISOString(),
    onboarded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: dbErrorMessage(error.message) };

  const seed = String(formData.get("seedStarter") ?? "") === "1";
  if (seed) {
    await supabase.from("services").insert({
      vendor_id: user.id,
      name: "Session",
      duration_min: 60,
      price_cents: 1_500_000,
      deposit_percent: 30,
      active: true,
    });
    await supabase.from("availability").insert(
      [1, 2, 3, 4, 5].map((weekday) => ({
        vendor_id: user.id,
        weekday,
        start_min: 9 * 60,
        end_min: 18 * 60,
      })),
    );
  }

  redirect("/dashboard");
}
