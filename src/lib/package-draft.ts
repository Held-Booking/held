export type DraftPackage = {
  name: string;
  note: string;
  durationMin: number;
  price: number;
  depositPercent: number;
};

const MAX_PACKAGES = 3;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function roundPrice(n: number) {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

function durationFromText(text: string) {
  const hour = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i);
  if (hour) return clamp(Math.round(Number(hour[1]) * 60), 15, 24 * 60);
  const min = text.match(/(\d+)\s*(?:minutes?|mins?|min)\b/i);
  if (min) return clamp(Number(min[1]), 15, 24 * 60);
  return 60;
}

function pricesFromText(text: string) {
  const found: number[] = [];
  const re = /(?:₦|NGN|USD|\$|£|GHS|KES|ZAR)?\s*(\d{1,3}(?:[.,]\d{3})+|\d+)(?:\.\d{1,2})?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const raw = m[1].replace(/,/g, "");
    const n = Number(raw);
    if (n >= 500) found.push(n);
  }
  return found;
}

function linesFromText(text: string) {
  return text
    .split(/[\n.;]+/)
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter((line) => line.length >= 3);
}

export function heuristicPackages(input: {
  text: string;
  bio?: string;
  currency?: string;
}): DraftPackage[] {
  const blob = `${input.text} ${input.bio ?? ""}`.trim();
  const prices = pricesFromText(blob);
  const lines = linesFromText(input.text);
  const seeds = (lines.length > 0 ? lines : [input.text || "Session"]).slice(
    0,
    MAX_PACKAGES,
  );

  if (seeds.length === 0) {
    return [
      {
        name: "Session",
        note: "One sitting. Edit the name to how you sell it.",
        durationMin: 60,
        price: prices[0] ?? 0,
        depositPercent: 30,
      },
    ];
  }

  return seeds.map((line, i) => ({
    name: line.slice(0, 80),
    note: "Edit this if the name already says enough.",
    durationMin: durationFromText(line) || (i === 0 ? 45 : i === 1 ? 90 : 120),
    price: roundPrice(prices[i] ?? prices[0] ?? 0),
    depositPercent: 30,
  }));
}

function parseDrafts(raw: unknown): DraftPackage[] {
  if (!raw || typeof raw !== "object") return [];
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { packages?: unknown }).packages)
      ? (raw as { packages: unknown[] }).packages
      : [];
  return list
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = String(row.name ?? "").trim().slice(0, 80);
      if (name.length < 2) return null;
      return {
        name,
        note: String(row.note ?? "").trim().slice(0, 280),
        durationMin: clamp(Number(row.durationMin) || 60, 15, 24 * 60),
        price: roundPrice(Number(row.price) || 0),
        depositPercent: clamp(Number(row.depositPercent) || 30, 1, 100),
      };
    })
    .filter((row): row is DraftPackage => Boolean(row))
    .slice(0, MAX_PACKAGES);
}

export async function draftPackages(input: {
  text: string;
  bio?: string;
  currency?: string;
}): Promise<DraftPackage[]> {
  const fallback = heuristicPackages(input);
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return fallback;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You write booking packages for Held, appointment software. Return JSON {packages:[{name,note,durationMin,price,depositPercent}]}. 2 or 3 packages. durationMin is minutes 15-480. depositPercent 20-50 unless they asked for full pay. price is a number in their currency, 0 if unknown. No marketplace, no commission, no payment-platform language. Short names. Notes under 80 characters.",
          },
          {
            role: "user",
            content: [
              `Currency: ${input.currency || "NGN"}`,
              input.bio ? `About them: ${input.bio.slice(0, 280)}` : "",
              `How they work: ${input.text.slice(0, 800)}`,
            ]
              .filter(Boolean)
              .join("\n"),
          },
        ],
      }),
    });
    clearTimeout(timer);
    if (!res.ok) return fallback;
    const payload = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return fallback;
    const parsed = parseDrafts(JSON.parse(content));
    return parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}
