import { sendMail } from "@/lib/mail";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { isResendConfigured } from "@/lib/supabase/config";
import { formatMoney } from "@/lib/utils";
import { formatWhen } from "@/lib/when";
import { whatsappUrl } from "@/lib/whatsapp";

export async function sendUpcomingReminders() {
  if (!isResendConfigured()) {
    return { sent: 0, skipped: "Resend is not configured." };
  }

  const admin = createAdminSupabase();
  const from = new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString();
  const to = new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from("bookings")
    .select(
      "id, vendor_id, customer_name, customer_email, customer_phone, starts_at, deposit_cents, services(name)",
    )
    .eq("status", "confirmed")
    .is("reminder_sent_at", null)
    .gte("starts_at", from)
    .lte("starts_at", to);

  if (error) throw new Error(error.message);

  let sent = 0;
  for (const row of data ?? []) {
    const { data: studio } = await admin
      .from("profiles")
      .select("display_name, timezone, currency, country, whatsapp")
      .eq("id", row.vendor_id)
      .maybeSingle();
    if (!studio) continue;

    const service = row.services as { name?: string } | { name?: string }[] | null;
    const packageName = Array.isArray(service) ? service[0]?.name : service?.name;
    const timezone = (studio.timezone as string) || "Africa/Lagos";
    const when = formatWhen(row.starts_at as string, timezone);
    const amount = formatMoney(
      (row.deposit_cents as number) / 100,
      (studio.currency as string) || "NGN",
    );
    const studioName = (studio.display_name as string) || "them";
    const clientName = (row.customer_name as string) || "there";
    const remind = whatsappUrl(
      row.customer_phone as string | null,
      `Hi ${clientName}, reminder: ${packageName ?? "your booking"} with ${studioName} is ${when}. The deposit already holds the date.`,
      (studio.country as string) || "NG",
    );

    const jobs: Array<Promise<unknown>> = [];
    if (row.customer_email) {
      jobs.push(
        sendMail({
          to: row.customer_email as string,
          subject: `Reminder: ${packageName ?? "your booking"} with ${studioName}`,
          text: [
            `${clientName}, this is your reminder.`,
            "",
            studioName,
            packageName ?? "Package",
            when,
            `Deposit ${amount}`,
            "",
            "The date is already held.",
          ].join("\n"),
        }),
      );
    }

    try {
      const { data: vendorUser } = await admin.auth.admin.getUserById(
        row.vendor_id as string,
      );
      if (vendorUser.user?.email) {
        jobs.push(
          sendMail({
            to: vendorUser.user.email,
            subject: `Reminder due: ${clientName}`,
            text: [
              `${clientName} is booked for ${when}.`,
              packageName ?? "Package",
              remind ? `Send WhatsApp: ${remind}` : "",
            ]
              .filter(Boolean)
              .join("\n"),
          }),
        );
      }
    } catch {
      // Mail to the professional can fail without blocking the client reminder.
    }

    await Promise.allSettled(jobs);
    await admin
      .from("bookings")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", row.id);
    sent += 1;
  }

  return { sent };
}
