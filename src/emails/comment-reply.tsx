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

interface CommentReplyEmailProps {
  userName: string;
  replierName: string;
  reportTitle: string;
  commentPreview: string;
  reportUrl: string;
}

export const CommentReplyEmail = ({
  userName,
  replierName,
  reportTitle,
  commentPreview,
  reportUrl,
}: CommentReplyEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[40px]">
            <Section>
              <Text className="text-[24px] font-bold text-gray-900 mb-[16px] text-center">
                💬 New reply to your comment
              </Text>

              <Text className="text-[16px] text-gray-700 mb-[24px] leading-[24px]">
                Hi {userName},
              </Text>

              <Text className="text-[16px] text-gray-700 mb-[24px] leading-[24px]">
                <strong>{replierName}</strong> replied to your comment on:
              </Text>

              <Section className="bg-gray-50 rounded-[8px] p-[16px] mb-[24px] border border-gray-200">
                <Text className="text-[16px] font-semibold text-gray-900 mb-[8px]">
                  {reportTitle}
                </Text>
              </Section>

              <Section className="bg-blue-50 rounded-[8px] p-[16px] mb-[24px] border border-blue-200">
                <Text className="text-[14px] font-semibold text-blue-900 mb-[8px]">
                  {replierName} said:
                </Text>
                <Text className="text-[14px] text-blue-800 leading-[20px]">
                  "{commentPreview}"
                </Text>
              </Section>

              <Section className="text-center mb-[32px]">
                <Button
                  href={reportUrl}
                  className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border"
                >
                  View Comment
                </Button>
              </Section>

              <Hr className="border-gray-200 my-[24px]" />

              <Text className="text-[12px] text-gray-500 leading-[16px] m-0">
                Keep the conversation going!
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

export default CommentReplyEmail;
