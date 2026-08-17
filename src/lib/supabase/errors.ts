export function isMissingSchema(message?: string | null) {
  const text = (message ?? "").toLowerCase();
  return (
    text.includes("schema cache") ||
    text.includes("could not find the table") ||
    (text.includes("relation") && text.includes("does not exist"))
  );
}

export function dbErrorMessage(message?: string | null) {
  if (!message) return null;
  if ((message ?? "").toLowerCase().includes("payout_accounts")) {
    return "Bank table is missing. Run supabase/migrations/005_payout_bank.sql in the Supabase SQL Editor.";
  }
  if ((message ?? "").toLowerCase().includes("plan_expires_at")) {
    return "Plan columns are missing. Run supabase/migrations/006_plan.sql in the Supabase SQL Editor.";
  }
  if ((message ?? "").toLowerCase().includes("notified_at")) {
    return "Notify column is missing. Run supabase/migrations/007_notify.sql in the Supabase SQL Editor.";
  }
  if (
    (message ?? "").toLowerCase().includes("services.note") ||
    ((message ?? "").toLowerCase().includes("column") &&
      (message ?? "").toLowerCase().includes("note"))
  ) {
    return "Package notes need supabase/migrations/008_open_packages.sql in the Supabase SQL Editor.";
  }
  if (
    (message ?? "").toLowerCase().includes("buffer_min") ||
    (message ?? "").toLowerCase().includes("lead_min") ||
    (message ?? "").toLowerCase().includes("reminder_sent_at") ||
    (message ?? "").toLowerCase().includes("page-photos")
  ) {
    return "Run supabase/migrations/009_ops.sql in the Supabase SQL Editor.";
  }
  if (isMissingSchema(message)) {
    return "Database tables are missing. Run supabase/migrations/001_init.sql in the Supabase SQL Editor, not sqliteonline.";
  }
  return message;
}
