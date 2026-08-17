export function googleCalendarUrl(input: {
  title: string;
  start: Date;
  end: Date;
  details?: string;
}) {
  const stamp = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${stamp(input.start)}/${stamp(input.end)}`,
  });
  if (input.details) params.set("details", input.details);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
