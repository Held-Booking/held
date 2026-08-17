import type { Metadata } from "next";
import { BookingsBoard, type BookingRow } from "@/components/dashboard/BookingsBoard";
import { requireVendor } from "@/lib/supabase/vendor";
import { formatMoney } from "@/lib/utils";
import { formatWhen } from "@/lib/when";
import { whatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Bookings" };
export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const { supabase, user, profile } = await requireVendor();
  const timezone = (profile.timezone as string) || "UTC";
  const currency = (profile.currency as string) || "NGN";
  const country = (profile.country as string) || "NG";
  const { data } = await supabase
    .from("bookings")
    .select(
      "id, customer_name, customer_email, customer_phone, starts_at, deposit_cents, status, services(name)",
    )
    .eq("vendor_id", user.id)
    .order("starts_at", { ascending: true });

  const now = Date.now();
  const upcoming: BookingRow[] = [];
  const pending: BookingRow[] = [];
  const past: BookingRow[] = [];

  for (const row of data ?? []) {
    const service = row.services as { name?: string } | { name?: string }[] | null;
    const serviceName = Array.isArray(service)
      ? service[0]?.name
      : service?.name;
    const when = formatWhen(row.starts_at as string, timezone);
    const mapped: BookingRow = {
      id: row.id as string,
      name: row.customer_name as string,
      email: (row.customer_email as string) || "",
      phone: (row.customer_phone as string) || "",
      when,
      startsAt: row.starts_at as string,
      packageName: serviceName ?? "Package",
      deposit: formatMoney(
        (row.deposit_cents as number) / 100,
        currency,
      ),
      status: row.status as string,
      chatUrl: whatsappUrl(
        row.customer_phone as string | null,
        `Hi ${row.customer_name as string}, your ${serviceName ?? "session"} is booked for ${when}. The deposit is in.`,
        country,
      ),
      remindUrl: whatsappUrl(
        row.customer_phone as string | null,
        `Hi ${row.customer_name as string}, reminder: ${serviceName ?? "your booking"} with ${profile.display_name} is ${when}. The deposit already holds the date.`,
        country,
      ),
    };

    const start = new Date(row.starts_at as string).getTime();
    const status = row.status as string;
    if (status === "pending") pending.push(mapped);
    else if (
      status === "confirmed" &&
      start >= now
    ) {
      upcoming.push(mapped);
    } else {
      past.push(mapped);
    }
  }

  past.reverse();

  return (
    <BookingsBoard
      upcoming={upcoming}
      pending={pending}
      past={past}
      timezone={timezone}
      currency={currency}
    />
  );
}
