import { minutesToTime } from "@/lib/schedule";
import { zonedParts } from "@/lib/timezone";

export type TimeSlot = {
  start: string;
  end: string;
  label: string;
};

export type BusyWindow = {
  startMin: number;
  endMin: number;
};

export function formatClock(min: number) {
  const hour = Math.floor(min / 60);
  const minute = min % 60;
  const am = hour < 12;
  const hour12 = hour % 12 || 12;
  const suffix = am ? "AM" : "PM";
  if (minute === 0) return `${hour12} ${suffix}`;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function generateSlots({
  startMin,
  endMin,
  durationMin,
  busy = [],
  nowMin,
  step = 30,
  leadMin = 30,
  bufferMin = 0,
}: {
  startMin: number;
  endMin: number;
  durationMin: number;
  busy?: BusyWindow[];
  nowMin?: number;
  step?: number;
  leadMin?: number;
  bufferMin?: number;
}): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const lead = nowMin == null ? startMin : nowMin + Math.max(0, leadMin);
  const blocked = busy.map((block) => ({
    startMin: block.startMin,
    endMin: block.endMin + Math.max(0, bufferMin),
  }));

  for (let t = startMin; t + durationMin <= endMin; t += step) {
    if (t < lead) continue;
    const end = t + durationMin;
    const taken = blocked.some(
      (block) => t < block.endMin && end > block.startMin,
    );
    if (taken) continue;
    slots.push({
      start: minutesToTime(t),
      end: minutesToTime(end),
      label: formatClock(t),
    });
  }

  return slots;
}

export function busyOnDate(
  windows: Array<{ startsAt: string; endsAt: string }>,
  dateId: string,
  timeZone: string,
): BusyWindow[] {
  const dayStart = 0;
  const dayEnd = 24 * 60;
  const items: BusyWindow[] = [];

  for (const window of windows) {
    const start = zonedParts(new Date(window.startsAt), timeZone);
    const end = zonedParts(new Date(window.endsAt), timeZone);
    if (start.dateId !== dateId && end.dateId !== dateId) continue;
    const startMin = start.dateId === dateId ? start.minutes : dayStart;
    const endMin = end.dateId === dateId ? end.minutes : dayEnd;
    if (endMin > startMin) items.push({ startMin, endMin });
  }

  return items;
}
