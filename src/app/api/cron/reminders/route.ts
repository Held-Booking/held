import { NextRequest, NextResponse } from "next/server";
import { sendUpcomingReminders } from "@/lib/remind";
import { isServiceRoleConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Service role missing." }, { status: 503 });
  }

  try {
    const result = await sendUpcomingReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not send reminders.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
