import { sendEmail } from "@/lib/email";
import EmailVerification from "./email-verification";

export const sendEmailVerification = async ({
  to,
  url,
}: {
  to: string;
  url: string;
}) => {
  await sendEmail({
    to,
    subject: "Verify your email address",
    react: <EmailVerification url={url} />,
  });
};
