import "server-only";

import { Resend } from "resend";
import EmailVerification from "@/emails/email-verification";

export const sendEmail = async ({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactNode;
}) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: "chinu <chinu@noreply.chinu.dev>",
    to,
    subject,
    react,
  });
};
