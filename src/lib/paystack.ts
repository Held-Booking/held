import { createHmac } from "node:crypto";
import { PLAN_CURRENCY, planAmountCents, type PlanInterval } from "@/lib/plan";
import { isPaystackConfigured } from "@/lib/supabase/config";

const API = "https://api.paystack.co";

function secret() {
  const key = process.env.PAYSTACK_SECRET_KEY ?? "";
  if (!isPaystackConfigured()) throw new Error("Paystack is not configured.");
  return key;
}

async function paystack<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const json = (await res.json()) as T & { status?: boolean; message?: string };
  if (!res.ok || json.status === false) {
    throw new Error(json.message ?? "Paystack request failed.");
  }
  return json;
}

async function initializeOnce(body: Record<string, unknown>) {
  const result = await paystack<{
    data: { authorization_url: string; reference: string };
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return result.data;
}

export async function initializePaystack(input: {
  email: string;
  amount: number;
  currency: string;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
  subaccount?: string | null;
}) {
  const body: Record<string, unknown> = {
    email: input.email,
    amount: input.amount,
    currency: input.currency,
    reference: input.reference,
    callback_url: input.callbackUrl,
    metadata: input.metadata,
  };

  if (!input.subaccount) {
    return initializeOnce(body);
  }

  try {
    return await initializeOnce({
      ...body,
      subaccount: input.subaccount,
      bearer: "subaccount",
    });
  } catch {
    return initializeOnce({ ...body, subaccount: input.subaccount });
  }
}

export async function listPaystackBanks(currency = "NGN") {
  const result = await paystack<{
    data: Array<{ name: string; code: string; active: boolean }>;
  }>(`/bank?currency=${encodeURIComponent(currency)}&perPage=100`);
  const seen = new Set<string>();
  return (result.data ?? [])
    .filter((bank) => bank.active && bank.code)
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((bank) => {
      if (seen.has(bank.code)) return false;
      seen.add(bank.code);
      return true;
    })
    .map((bank) => ({ name: bank.name, code: bank.code }));
}

export async function resolvePaystackAccount(
  accountNumber: string,
  bankCode: string,
) {
  const result = await paystack<{
    data: { account_name: string; account_number: string };
  }>(
    `/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
  );
  return result.data;
}

export async function upsertPaystackSubaccount(input: {
  code?: string | null;
  businessName: string;
  bankCode: string;
  accountNumber: string;
}) {
  const body = {
    business_name: input.businessName,
    settlement_bank: input.bankCode,
    bank_code: input.bankCode,
    account_number: input.accountNumber,
    percentage_charge: 0,
  };

  if (input.code) {
    const result = await paystack<{ data: { subaccount_code?: string } }>(
      `/subaccount/${encodeURIComponent(input.code)}`,
      { method: "PUT", body: JSON.stringify(body) },
    );
    return result.data.subaccount_code || input.code;
  }

  const result = await paystack<{ data: { subaccount_code: string } }>(
    "/subaccount",
    { method: "POST", body: JSON.stringify(body) },
  );
  return result.data.subaccount_code;
}

export async function initializeHeldPlan(input: {
  email: string;
  planCode: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}) {
  return initializeOnce({
    email: input.email,
    amount: input.amount,
    currency: PLAN_CURRENCY,
    plan: input.planCode,
    reference: input.reference,
    callback_url: input.callbackUrl,
    metadata: input.metadata,
  });
}

type PaystackPlan = {
  name: string;
  interval: string;
  amount: number;
  currency: string;
  plan_code: string;
  is_deleted?: boolean;
};

let heldPlans: { monthly: string; yearly: string } | null = null;

export async function heldPlanCodes() {
  const monthly = process.env.PAYSTACK_PLAN_MONTHLY;
  const yearly = process.env.PAYSTACK_PLAN_YEARLY;
  if (monthly && yearly) return { monthly, yearly };
  if (heldPlans) return heldPlans;

  const listed = await paystack<{ data: PaystackPlan[] }>("/plan?perPage=100");
  const plans = listed.data ?? [];
  const monthlyCode =
    findHeldPlan(plans, "monthly", planAmountCents("monthly")) ??
    (await createHeldPlan("monthly"));
  const yearlyCode =
    findHeldPlan(plans, "annually", planAmountCents("yearly")) ??
    (await createHeldPlan("yearly"));

  heldPlans = { monthly: monthlyCode, yearly: yearlyCode };
  return heldPlans;
}

function findHeldPlan(
  plans: PaystackPlan[],
  interval: string,
  amount: number,
) {
  return plans.find(
    (plan) =>
      !plan.is_deleted &&
      plan.interval === interval &&
      plan.amount === amount &&
      plan.currency.toUpperCase() === PLAN_CURRENCY,
  )?.plan_code;
}

async function createHeldPlan(interval: PlanInterval) {
  const paystackInterval = interval === "yearly" ? "annually" : "monthly";
  try {
    const result = await paystack<{ data: { plan_code: string } }>("/plan", {
      method: "POST",
      body: JSON.stringify({
        name: interval === "yearly" ? "Held yearly" : "Held monthly",
        interval: paystackInterval,
        amount: planAmountCents(interval),
        currency: PLAN_CURRENCY,
        description: "Held booking page. No cut of the job.",
      }),
    });
    return result.data.plan_code;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create a Held plan.";
    if (/currency/i.test(message)) {
      throw new Error(
        "Paystack needs USD turned on for the $12 plan. Open Paystack, then Settings, then Preferences, and enable USD. Do not open Stripe.",
      );
    }
    throw error;
  }
}

export async function findPaystackSubscription(customerCode: string) {
  const result = await paystack<{
    data: Array<{
      subscription_code: string;
      email_token: string;
      status: string;
      next_payment_date?: string;
    }>;
  }>(`/subscription?customer=${encodeURIComponent(customerCode)}`);
  const rows = result.data ?? [];
  return rows.find((row) => row.status === "active") ?? rows[0] ?? null;
}

export async function disablePaystackSubscription(code: string, token: string) {
  await paystack("/subscription/disable", {
    method: "POST",
    body: JSON.stringify({ code, token }),
  });
}

export async function verifyPaystack(reference: string) {
  const result = await paystack<{
    data: {
      status: string;
      amount: number;
      currency: string;
      reference: string;
      metadata?: {
        booking_id?: string;
        kind?: string;
        vendor_id?: string;
        interval?: string;
      };
      customer?: { customer_code?: string; email?: string };
    };
  }>(`/transaction/verify/${encodeURIComponent(reference)}`);
  return result.data;
}

export function paystackSignatureOk(raw: string, signature: string | null) {
  if (!signature) return false;
  const hash = createHmac("sha512", secret()).update(raw).digest("hex");
  return hash === signature;
}
