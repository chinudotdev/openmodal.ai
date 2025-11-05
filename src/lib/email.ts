import "server-only";

import { Resend } from "resend";

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
  await resend.emails.send({
    from: "chinu <chinu@noreply.chinu.dev>",
    to,
    subject,
    react,
  });
};
