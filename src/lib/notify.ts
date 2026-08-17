import { sendMail } from "@/lib/mail";
import { formatMoney } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { isResendConfigured } from "@/lib/supabase/config";
import { formatWhen } from "@/lib/when";

export async function notifyBooking(bookingId: string) {
  const admin = createAdminSupabase();
  const selectWithToken =
    "id, vendor_id, customer_name, customer_email, customer_phone, starts_at, deposit_cents, manage_token, services(name)";
  const selectBase =
    "id, vendor_id, customer_name, customer_email, customer_phone, starts_at, deposit_cents, services(name)";

  let claimed: Record<string, unknown> | null = null;
  const first = await admin
    .from("bookings")
    .update({ notified_at: new Date().toISOString() })
    .eq("id", bookingId)
    .is("notified_at", null)
    .select(selectWithToken)
    .maybeSingle();

  if (first.error) {
    const retry = await admin
      .from("bookings")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", bookingId)
      .is("notified_at", null)
      .select(selectBase)
      .maybeSingle();
    claimed = retry.data as Record<string, unknown> | null;
  } else {
    claimed = first.data as Record<string, unknown> | null;
  }

  if (!claimed) return;

  const { data: studio } = await admin
    .from("profiles")
    .select("id, display_name, slug, timezone, currency, country, whatsapp")
    .eq("id", claimed.vendor_id)
    .maybeSingle();

  if (!studio) return;

  const service = claimed.services as { name?: string } | { name?: string }[] | null;
  const packageName = Array.isArray(service)
    ? service[0]?.name
    : service?.name;
  const timezone = (studio.timezone as string) || "Africa/Lagos";
  const currency = (studio.currency as string) || "NGN";
  const country = (studio.country as string) || "NG";
  const when = formatWhen(claimed.starts_at as string, timezone);
  const amount = formatMoney((claimed.deposit_cents as number) / 100, currency);
  const studioName = (studio.display_name as string) || "them";
  const clientName = (claimed.customer_name as string) || "there";
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const pageUrl = `${origin}/book/${studio.slug}`;
  const token = claimed.manage_token as string | null | undefined;
  const manageUrl = token
    ? `${origin}/book/${studio.slug}/manage/${token}`
    : pageUrl;

  const studioChat = whatsappUrl(
    studio.whatsapp as string | null,
    `Hi ${studioName}, I just booked ${packageName ?? "a slot"} for ${when}.`,
    country,
  );
  const clientChat = whatsappUrl(
    claimed.customer_phone as string | null,
    `Hi ${clientName}, your ${packageName ?? "booking"} is held for ${when}. The deposit is in.`,
    country,
  );

  if (!isResendConfigured()) return;

  let vendorEmail: string | undefined;
  try {
    const { data: vendorUser } = await admin.auth.admin.getUserById(
      claimed.vendor_id as string,
    );
    vendorEmail = vendorUser.user?.email;
  } catch {
    vendorEmail = undefined;
  }

  const jobs: Array<Promise<unknown>> = [];

  if (claimed.customer_email) {
    jobs.push(
      sendMail({
        to: claimed.customer_email as string,
        subject: `You're booked with ${studioName}`,
        text: [
          `${clientName}, the deposit holds the slot.`,
          "",
          studioName,
          packageName ?? "Package",
          when,
          `Deposit ${amount}`,
          "",
          `Change or cancel: ${manageUrl}`,
          studioChat ? `Chat on WhatsApp: ${studioChat}` : `Page: ${pageUrl}`,
        ].join("\n"),
      }),
    );
  }

  if (vendorEmail) {
    jobs.push(
      sendMail({
        to: vendorEmail,
        subject: `New booking: ${clientName}`,
        text: [
          `${clientName} paid a deposit.`,
          "",
          packageName ?? "Package",
          when,
          `Deposit ${amount}`,
          claimed.customer_email ? `Email ${claimed.customer_email}` : "",
          claimed.customer_phone ? `Phone ${claimed.customer_phone}` : "",
          clientChat ? `Chat on WhatsApp: ${clientChat}` : "",
          "",
          `${origin}/dashboard/bookings`,
        ]
          .filter(Boolean)
          .join("\n"),
      }),
    );
  }

  await Promise.allSettled(jobs);
}
