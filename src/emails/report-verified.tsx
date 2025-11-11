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
} from "@react-email/components";

interface ReportVerifiedEmailProps {
  userName: string;
  reportTitle: string;
  verifierName: string;
  reportUrl: string;
  pointsAwarded: number;
  totalPoints: number;
}

export const ReportVerifiedEmail = ({
  userName,
  reportTitle,
  verifierName,
  reportUrl,
  pointsAwarded,
  totalPoints,
}: ReportVerifiedEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[40px]">
            <Section>
              <Text className="text-[24px] font-bold text-gray-900 mb-[16px] text-center">
                ✅ Your report was verified!
              </Text>

              <Text className="text-[16px] text-gray-700 mb-[24px] leading-[24px]">
                Hi {userName},
              </Text>

              <Text className="text-[16px] text-gray-700 mb-[24px] leading-[24px]">
                Great news! <strong>{verifierName}</strong> just verified your
                report:
              </Text>

              <Section className="bg-gray-50 rounded-[8px] p-[16px] mb-[24px] border border-gray-200">
                <Text className="text-[16px] font-semibold text-gray-900 mb-[8px]">
                  "{reportTitle}"
                </Text>
              </Section>

              <Text className="text-[16px] text-gray-700 mb-[24px] leading-[24px]">
                This verification helps build trust in your contribution.
              </Text>

              <Section className="bg-green-50 rounded-[8px] p-[16px] mb-[24px] border border-green-200">
                <Text className="text-[16px] font-semibold text-green-900 mb-[8px]">
                  🎁 You earned +{pointsAwarded} reputation points!
                </Text>
                <Text className="text-[14px] text-green-800">
                  ⭐ Total reputation: {totalPoints} points
                </Text>
              </Section>

              <Section className="text-center mb-[32px]">
                <Button
                  href={reportUrl}
                  className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border"
                >
                  View Your Report
                </Button>
              </Section>

              <Hr className="border-gray-200 my-[24px]" />

              <Text className="text-[12px] text-gray-500 leading-[16px] m-0">
                Keep contributing!
                <br />
                The OpenModal Team
              </Text>
            </Section>

            <Hr className="border-gray-200 my-[32px]" />

            <Section className="text-center">
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0">
                <a
                  href={`${reportUrl}?manage=preferences`}
                  className="text-gray-500 underline"
                >
                  Manage email preferences
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ReportVerifiedEmail;
