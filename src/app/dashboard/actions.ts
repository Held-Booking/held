"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dbErrorMessage } from "@/lib/supabase/errors";
import { requireVendor } from "@/lib/supabase/vendor";
import { countryMeta, CURRENCIES, PAYSTACK_COUNTRIES } from "@/lib/gateways";
import {
  disablePaystackSubscription,
  heldPlanCodes,
  initializeHeldPlan,
  resolvePaystackAccount,
  upsertPaystackSubaccount,
} from "@/lib/paystack";
import { draftPackages, type DraftPackage } from "@/lib/package-draft";
import { isPlanInterval, planAmountCents } from "@/lib/plan";
import { reviewTableMissing } from "@/lib/reviews";
import { timeToMinutes } from "@/lib/schedule";
import { instantFromZoned } from "@/lib/timezone";

function refresh(slug: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/availability");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/settings");
  revalidatePath(`/book/${slug}`);
}

function packageFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const durationMin = Number(formData.get("durationMin"));
  const price = Number(formData.get("price"));
  const depositPercent = Number(formData.get("depositPercent"));
  const note = String(formData.get("note") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").trim().toUpperCase();

  if (name.length < 2) return { error: "Name the package." };
  if (!durationMin || durationMin < 5 || durationMin > 24 * 60) {
    return { error: "Duration must be between 5 minutes and 24 hours." };
  }
  if (Number.isNaN(price) || price < 0 || price > 10_000_000) {
    return { error: "Add a price. Use 0 if the slot is free." };
  }
  if (depositPercent < 1 || depositPercent > 100) {
    return { error: "Deposit must be between 1 and 100." };
  }
  if (note.length > 280) return { error: "Keep the note under 280 characters." };
  if (location.length > 120) return { error: "Keep the place under 120 characters." };
  if (currency && !CURRENCIES.some((item) => item.id === currency)) {
    return { error: "Pick a currency." };
  }

  return {
    error: null as string | null,
    currency: currency || null,
    row: {
      name,
      duration_min: durationMin,
      price_cents: Math.round(price * 100),
      deposit_percent: depositPercent,
      note: note || null,
      location: location || null,
      active: true,
    },
  };
}

export async function addPackage(formData: FormData) {
  const { supabase, user, profile } = await requireVendor();
  const parsed = packageFields(formData);
  if (parsed.error || !parsed.row) return { error: parsed.error };

  const { error } = await supabase.from("services").insert({
    vendor_id: user.id,
    ...parsed.row,
  });

  if (error) return { error: dbErrorMessage(error.message) };
  if (parsed.currency) {
    await supabase
      .from("profiles")
      .update({
        currency: parsed.currency,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  }
  refresh(profile.slug);
  return { error: null };
}

export async function updatePackage(formData: FormData) {
  const { supabase, user, profile } = await requireVendor();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing package." };
  const parsed = packageFields(formData);
  if (parsed.error || !parsed.row) return { error: parsed.error };

  const { error } = await supabase
    .from("services")
    .update(parsed.row)
    .eq("id", id)
    .eq("vendor_id", user.id);

  if (error) return { error: dbErrorMessage(error.message) };
  if (parsed.currency) {
    await supabase
      .from("profiles")
      .update({
        currency: parsed.currency,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  }
  refresh(profile.slug);
  return { error: null };
}

export async function removePackage(formData: FormData) {
  const { supabase, user, profile } = await requireVendor();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing package." };

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id)
    .eq("vendor_id", user.id);

  if (error) return { error: dbErrorMessage(error.message) };
  refresh(profile.slug);
  return { error: null };
}

export async function saveHours(formData: FormData) {
  const { supabase, user, profile } = await requireVendor();
  const raw = String(formData.get("hours") ?? "[]");

  let rows: Array<{ weekday: number; open: boolean; start: string; end: string }>;
  try {
    rows = JSON.parse(raw);
  } catch {
    return { error: "Could not read hours." };
  }

  const openRows = rows.filter((row) => row.open);
  for (const row of openRows) {
    if (timeToMinutes(row.end) <= timeToMinutes(row.start)) {
      return { error: "End time must be after start." };
    }
  }

  const inserts = openRows.map((row) => ({
    vendor_id: user.id,
    weekday: row.weekday,
    start_min: timeToMinutes(row.start),
    end_min: timeToMinutes(row.end),
  }));

  const { error: clearError } = await supabase
    .from("availability")
    .delete()
    .eq("vendor_id", user.id);

  if (clearError) return { error: dbErrorMessage(clearError.message) };

  if (inserts.length) {
    const { error } = await supabase.from("availability").insert(inserts);
    if (error) return { error: dbErrorMessage(error.message) };
  }

  refresh(profile.slug);
  return { error: null };
}

export async function savePayout(formData: FormData) {
  const { supabase, user, profile } = await requireVendor();
  const country = String(formData.get("country") ?? "NG");
  const meta = countryMeta(country);

  const { error } = await supabase
    .from("profiles")
    .update({
      country: meta.id,
      currency: meta.currency,
      timezone: meta.timezone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: dbErrorMessage(error.message) };
  refresh(profile.slug);
  revalidatePath("/dashboard/settings");
  return { error: null };
}

export async function saveWhatsapp(formData: FormData) {
  const { supabase, user, profile } = await requireVendor();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const { error } = await supabase
    .from("profiles")
    .update({
      whatsapp: whatsapp || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: dbErrorMessage(error.message) };
  refresh(profile.slug);
  revalidatePath("/dashboard/settings");
  return { error: null };
}

export async function saveDisplayName(formData: FormData) {
  const { supabase, user, profile } = await requireVendor();
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (displayName.length < 2) return { error: "Give the page a name." };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: dbErrorMessage(error.message) };
  refresh(profile.slug);
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function saveBio(formData: FormData) {
  const { supabase, user, profile } = await requireVendor();
  const bio = String(formData.get("bio") ?? "").trim();
  if (bio.length > 280) return { error: "Keep the intro under 280 characters." };

  const { error } = await supabase
    .from("profiles")
    .update({
      bio: bio || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: dbErrorMessage(error.message) };
  refresh(profile.slug);
  revalidatePath("/dashboard/settings");
  return { error: null };
}

export async function resolveBank(formData: FormData) {
  const { profile } = await requireVendor();
  const country = ((profile.country as string) || "NG").toUpperCase();
  if (!PAYSTACK_COUNTRIES.has(country)) {
    return { error: "Bank payouts for this country come next.", name: null };
  }

  const bankCode = String(formData.get("bankCode") ?? "").trim();
  const accountNumber = String(formData.get("accountNumber") ?? "").trim();
  if (!bankCode || accountNumber.length < 8) {
    return { error: "Pick a bank and enter the account number.", name: null };
  }

  try {
    const resolved = await resolvePaystackAccount(accountNumber, bankCode);
    return { error: null, name: resolved.account_name };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not verify that account.",
      name: null,
    };
  }
}

export async function saveBank(formData: FormData) {
  const { supabase, user, profile } = await requireVendor();
  const country = ((profile.country as string) || "NG").toUpperCase();
  if (!PAYSTACK_COUNTRIES.has(country)) {
    return { error: "Bank payouts for this country come next." };
  }

  const bankCode = String(formData.get("bankCode") ?? "").trim();
  const accountNumber = String(formData.get("accountNumber") ?? "").trim();
  if (!bankCode || accountNumber.length < 8) {
    return { error: "Pick a bank and enter the account number." };
  }

  try {
    const resolved = await resolvePaystackAccount(accountNumber, bankCode);
    const code = await upsertPaystackSubaccount({
      code: profile.paystack_subaccount,
      businessName: profile.display_name || "Held page",
      bankCode,
      accountNumber,
    });

    const { error } = await supabase.from("payout_accounts").upsert({
      vendor_id: user.id,
      bank_code: bankCode,
      account_number: accountNumber,
      account_name: resolved.account_name,
      paystack_subaccount: code,
      updated_at: new Date().toISOString(),
    });

    if (error) return { error: dbErrorMessage(error.message) };
    refresh(profile.slug);
    revalidatePath("/dashboard/settings");
    return { error: null, name: resolved.account_name };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save the bank.",
    };
  }
}

export async function startPlan(formData: FormData) {
  const { user } = await requireVendor();
  const intervalRaw = String(formData.get("interval") ?? "monthly");
  if (!isPlanInterval(intervalRaw)) return { error: "Pick monthly or yearly." };
  if (!user.email) return { error: "Your account has no email." };

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const reference = `hp_${user.id.replace(/-/g, "").slice(0, 12)}_${intervalRaw}_${Date.now()}`;

  let url: string;
  try {
    const plans = await heldPlanCodes();
    const session = await initializeHeldPlan({
      email: user.email,
      planCode: intervalRaw === "yearly" ? plans.yearly : plans.monthly,
      amount: planAmountCents(intervalRaw),
      reference,
      callbackUrl: `${origin}/dashboard/billing/success?reference=${reference}`,
      metadata: {
        kind: "held_plan",
        vendor_id: user.id,
        interval: intervalRaw,
      },
    });
    url = session.authorization_url;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not start Held.",
    };
  }

  redirect(url);
}

export async function cancelPlan() {
  const { supabase, user, profile } = await requireVendor();
  if (!profile.paystack_subscription_code || !profile.paystack_email_token) {
    return { error: "No Paystack plan to cancel." };
  }

  try {
    await disablePaystackSubscription(
      profile.paystack_subscription_code,
      profile.paystack_email_token,
    );
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not cancel Held.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      plan_status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: dbErrorMessage(error.message) };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/billing");
  return { error: null };
}

export async function saveRules(formData: FormData) {
  const { supabase, user, profile } = await requireVendor();
  const bufferMin = Number(formData.get("bufferMin"));
  const leadMin = Number(formData.get("leadMin"));
  if (Number.isNaN(bufferMin) || bufferMin < 0 || bufferMin > 180) {
    return { error: "Gap must be between 0 and 180 minutes." };
  }
  if (Number.isNaN(leadMin) || leadMin < 0 || leadMin > 1440) {
    return { error: "Notice must be between 0 and 1440 minutes." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      buffer_min: bufferMin,
      lead_min: leadMin,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: dbErrorMessage(error.message) };
  refresh(profile.slug);
  return { error: null };
}

export async function addBlock(formData: FormData) {
  const { supabase, user, profile } = await requireVendor();
  const dateId = String(formData.get("date") ?? "").trim();
  const start = String(formData.get("start") ?? "00:00");
  const end = String(formData.get("end") ?? "23:59");
  const reason = String(formData.get("reason") ?? "").trim();
  const timezone = (profile.timezone as string) || "Africa/Lagos";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateId)) {
    return { error: "Pick a day to close." };
  }
  if (timeToMinutes(end) <= timeToMinutes(start)) {
    return { error: "End time must be after start." };
  }

  const { error } = await supabase.from("time_blocks").insert({
    vendor_id: user.id,
    starts_at: instantFromZoned(dateId, timeToMinutes(start), timezone).toISOString(),
    ends_at: instantFromZoned(dateId, timeToMinutes(end), timezone).toISOString(),
    reason: reason || null,
  });

  if (error) return { error: dbErrorMessage(error.message) };
  refresh(profile.slug);
  return { error: null };
}

export async function removeBlock(formData: FormData) {
  const { supabase, user, profile } = await requireVendor();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing block." };

  const { error } = await supabase
    .from("time_blocks")
    .delete()
    .eq("id", id)
    .eq("vendor_id", user.id);

  if (error) return { error: dbErrorMessage(error.message) };
  refresh(profile.slug);
  return { error: null };
}

export async function setBookingStatus(formData: FormData) {
  const { supabase, user, profile } = await requireVendor();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id) return { error: "Missing booking." };
  if (status !== "completed" && status !== "no_show") {
    return { error: "Pick complete or did not show." };
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .eq("vendor_id", user.id)
    .eq("status", "confirmed");

  if (error) return { error: dbErrorMessage(error.message) };
  refresh(profile.slug);
  return { error: null };
}

export async function disconnectGoogle() {
  const { supabase, user, profile } = await requireVendor();
  const { error } = await supabase
    .from("profiles")
    .update({
      google_refresh_token: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) return { error: dbErrorMessage(error.message) };
  refresh(profile.slug);
  revalidatePath("/dashboard/settings");
  return { error: null };
}

export async function savePhoto(formData: FormData) {
  const { supabase, user, profile } = await requireVendor();
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size < 1) {
    return { error: "Pick a photo." };
  }
  if (file.size > 1_500_000) return { error: "Keep the photo under 1.5 MB." };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { error: "Use a JPG, PNG, or WebP photo." };
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  try {
    const { createAdminSupabase } = await import("@/lib/supabase/admin");
    const admin = createAdminSupabase();
    const path = `${user.id}/page.${ext}`;
    const { error: uploadError } = await admin.storage
      .from("page-photos")
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
    if (uploadError) return { error: dbErrorMessage(uploadError.message) };
    const { data } = admin.storage.from("page-photos").getPublicUrl(path);
    const { error } = await supabase
      .from("profiles")
      .update({
        logo_url: `${data.publicUrl}?v=${Date.now()}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (error) return { error: dbErrorMessage(error.message) };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? dbErrorMessage(error.message)
          : "Could not save the photo.",
    };
  }

  refresh(profile.slug);
  return { error: null };
}

export async function draftHeldPackages(formData: FormData): Promise<{
  error: string | null;
  packages: DraftPackage[];
}> {
  const { profile } = await requireVendor();
  const text = String(formData.get("text") ?? "").trim();
  if (text.length < 8) {
    return { error: "Write a bit more about how you work.", packages: [] };
  }
  const packages = await draftPackages({
    text,
    bio: String(formData.get("bio") ?? profile.bio ?? ""),
    currency: String(formData.get("currency") ?? profile.currency ?? "NGN"),
  });
  if (packages.length === 0) {
    return { error: "Could not draft packages. Add one by hand.", packages: [] };
  }
  return { error: null, packages };
}

export async function saveHeldReview(formData: FormData) {
  const { supabase, user, profile } = await requireVendor();
  const body = String(formData.get("body") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const trade = String(formData.get("trade") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 5);
  const publish = String(formData.get("publish") ?? "") === "yes";

  if (body.length < 8 || body.length > 280) {
    return { error: "Keep it between 8 and 280 characters." };
  }
  if (displayName.length < 2) return { error: "Add the name to show." };
  if (rating < 3 || rating > 5) return { error: "Pick 3 to 5 stars." };

  const { error } = await supabase.from("held_reviews").upsert(
    {
      vendor_id: user.id,
      body,
      display_name: displayName,
      trade: trade || null,
      city: city || null,
      rating,
      publish,
      source: "in_app",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "vendor_id" },
  );
  if (error) {
    if (reviewTableMissing(error.message)) {
      return {
        error:
          "Review table is missing. Run supabase/migrations/011_reviews.sql in the Supabase SQL Editor.",
      };
    }
    return { error: dbErrorMessage(error.message) };
  }
  refresh(profile.slug);
  revalidatePath("/");
  return { error: null };
}

export async function hideReviewPrompt() {
  const { supabase, user, profile } = await requireVendor();
  const { error } = await supabase
    .from("profiles")
    .update({
      review_prompt_hidden_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error && !reviewTableMissing(error.message)) {
    return { error: dbErrorMessage(error.message) };
  }
  refresh(profile.slug);
  return { error: null };
}
