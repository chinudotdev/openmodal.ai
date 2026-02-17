import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

const EmailVerification = ({ url }: { url: string }) => {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[40px]">
            <Section>
              <Text className="text-[24px] font-bold text-gray-900 mb-[16px] text-center">
                Verify Your Email Address
              </Text>

              <Text className="text-[16px] text-gray-700 mb-[24px] leading-[24px]">
                Hi there! Thanks for signing up. To complete your registration
                and secure your account, please verify your email address by
                clicking the button below.
              </Text>

              <Section className="text-center mb-[32px]">
                <Button
                  href={url}
                  className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border"
                >
                  Verify Email Address
                </Button>
              </Section>

              <Text className="text-[14px] text-gray-600 mb-[24px] leading-[20px]">
                This verification link will expire in 24 hours. If you didn't
                create an account, you can safely ignore this email.
              </Text>

              <Hr className="border-gray-200 my-[24px]" />

              <Text className="text-[12px] text-gray-500 leading-[16px] m-0">
                If you're having trouble clicking the button, copy and paste
                this URL into your browser:
                <br />
                {url}
              </Text>
            </Section>

            <Hr className="border-gray-200 my-[32px]" />

            <Section className="text-center">
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0">
                © 2025 OpenModal. All rights reserved.
                <a href={url} className="text-gray-500 underline">
                  Unsubscribe
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default EmailVerification
