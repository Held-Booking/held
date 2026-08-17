import { NextRequest, NextResponse } from "next/server";
import { listPaystackBanks } from "@/lib/paystack";
import { isPaystackConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  if (!isPaystackConfigured()) {
    return NextResponse.json({ banks: [] });
  }

  const currency = request.nextUrl.searchParams.get("currency") ?? "NGN";
  try {
    const banks = await listPaystackBanks(currency);
    return NextResponse.json({ banks });
  } catch {
    return NextResponse.json({ banks: [] }, { status: 502 });
  }
}
