const WEEKDAY_FROM_SHORT: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number;
  dateId: string;
  minutes: number;
};

export function zonedParts(date: Date, timeZone: string): ZonedParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  });
  const bag: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== "literal") bag[part.type] = part.value;
  }
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour: Number(bag.hour),
    minute: Number(bag.minute),
    weekday: WEEKDAY_FROM_SHORT[bag.weekday] ?? 0,
    dateId: `${bag.year}-${bag.month}-${bag.day}`,
    minutes: Number(bag.hour) * 60 + Number(bag.minute),
  };
}

export function addCalendarDays(dateId: string, days: number) {
  const [year, month, day] = dateId.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return [
    next.getUTCFullYear(),
    String(next.getUTCMonth() + 1).padStart(2, "0"),
    String(next.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function instantFromZoned(
  dateId: string,
  minutes: number,
  timeZone: string,
) {
  const [year, month, day] = dateId.split("-").map(Number);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const got = zonedParts(new Date(guess), timeZone);
  const gotUtc = Date.UTC(got.year, got.month - 1, got.day, got.hour, got.minute, 0);
  const intended = Date.UTC(year, month - 1, day, hour, minute, 0);
  return new Date(guess + (intended - gotUtc));
}

export function weekdayOfDate(dateId: string, timeZone: string) {
  return zonedParts(instantFromZoned(dateId, 12 * 60, timeZone), timeZone)
    .weekday;
}
