import { Resend } from "resend";
import { isResendConfigured } from "@/lib/supabase/config";

function fromAddress() {
  return process.env.RESEND_FROM?.trim() || "Held <onboarding@resend.dev>";
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
    text: input.text,
  });
  if (error) throw new Error(error.message);
  return true;
}
