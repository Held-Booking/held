import {
  addCalendarDays,
  instantFromZoned,
  weekdayOfDate,
  zonedParts,
} from "@/lib/timezone";

export const WEEKDAYS = [
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
  { id: 0, label: "Sun" },
] as const;

export function minutesToTime(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeToMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export function timeOptions(step = 15, from = 0, to = 24 * 60) {
  const items: string[] = [];
  for (let t = from; t <= to; t += step) items.push(minutesToTime(t));
  return items;
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h === 1) return "1 hour";
  if (h) return `${h} hours`;
  return `${m} min`;
}

export function upcomingOpenDays(
  weekdays: number[],
  count = 8,
  from = new Date(),
  timeZone = "UTC",
) {
  const open = new Set(weekdays);
  const days: { id: string; label: string }[] = [];
  const today = zonedParts(from, timeZone).dateId;

  for (let i = 0; i < 60 && days.length < count; i += 1) {
    const id = addCalendarDays(today, i);
    const weekday = weekdayOfDate(id, timeZone);
    if (!open.has(weekday)) continue;
    const noon = instantFromZoned(id, 12 * 60, timeZone);
    days.push({
      id,
      label: noon.toLocaleDateString("en-US", {
        timeZone,
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    });
  }

  return days;
}
