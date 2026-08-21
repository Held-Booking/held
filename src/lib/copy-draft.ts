export function firstReplyCopy(input: { name: string; pageUrl: string }) {
  return [
    `If you want the date, book it here. A reply in chat is not a booking.`,
    input.pageUrl,
  ].join("\n");
}

export function holdReminderCopy(input: {
  clientName: string;
  packageName: string;
  when: string;
  professionalName: string;
}) {
  const who = input.clientName.trim() || "there";
  return `Hi ${who}, reminder: ${input.packageName} with ${input.professionalName} is ${input.when}. The deposit already holds the date.`;
}

export function chatToBookCopy(input: { name: string; pageUrl: string }) {
  return [
    `Hi, this is ${input.name}.`,
    `Pick a time on my page and pay the deposit to hold it. Chat cannot keep the date.`,
    input.pageUrl,
  ].join("\n");
}
