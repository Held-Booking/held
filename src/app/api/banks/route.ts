import { NextRequest, NextResponse } from "next/server";
import { listPaystackBanks } from "@/lib/paystack";
import { PAYSTACK_COUNTRIES } from "@/lib/gateways";
import { isPaystackConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in first.", banks: [] }, { status: 401 });
  }

  if (!isPaystackConfigured()) {
    return NextResponse.json({
      banks: [],
      error: "Paystack is not connected on this server yet.",
    });
  }

  const country = (request.nextUrl.searchParams.get("country") ?? "NG").toUpperCase();
  if (!PAYSTACK_COUNTRIES.has(country)) {
    return NextResponse.json({
      banks: [],
      error: "Payout banks are available for Paystack countries.",
    });
  }

  try {
    const banks = await listPaystackBanks(country);
    if (banks.length === 0) {
      return NextResponse.json({
        banks: [],
        error: "Paystack returned no banks for this country. Try again in a moment.",
      });
    }
    return NextResponse.json({ banks });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Paystack could not load banks.";
    return NextResponse.json({ banks: [], error: message }, { status: 502 });
  }
}
