function stamp(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function icsEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function googleCalendarUrl(input: {
  title: string;
  start: Date;
  end: Date;
  details?: string;
}) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${stamp(input.start)}/${stamp(input.end)}`,
  });
  if (input.details) params.set("details", input.details);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function icsHref(input: {
  title: string;
  start: Date;
  end: Date;
  details?: string;
}) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Held//Booking//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${stamp(input.start)}-held@held`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(input.start)}`,
    `DTEND:${stamp(input.end)}`,
    `SUMMARY:${icsEscape(input.title)}`,
  ];
  if (input.details) lines.push(`DESCRIPTION:${icsEscape(input.details)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}
