// import "server-only";

import { Resend } from 'resend'
import { env } from 'cloudflare:workers'

export const sendEmail = async ({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: React.ReactNode
}) => {
  const resend = new Resend(env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'chinu <chinu@noreply.chinu.dev>',
    to,
    subject,
    react,
  })
}
