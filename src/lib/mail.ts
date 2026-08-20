import { Resend } from "resend";
import { CONTACT } from "@/lib/constants";
import { isResendConfigured } from "@/lib/supabase/config";

function fromAddress() {
  return process.env.RESEND_FROM?.trim() || "Held <onboarding@resend.dev>";
}

function mailFooter() {
  return [
    "",
    "—",
    CONTACT.legalName,
    CONTACT.address,
    CONTACT.email,
    "https://bookheld.app",
  ].join("\n");
}

export async function sendMail(input: {
  to: string;
  subject: string;
  text: string;
}) {
  if (!isResendConfigured() || !input.to.includes("@")) return false;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: input.to,
    subject: input.subject,
    text: `${input.text}${mailFooter()}`,
  });
  if (error) throw new Error(error.message);
  return true;
}
