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

interface ReportStatusEmailProps {
  userName: string
  reportTitle: string
  status: 'approved' | 'rejected' | 'changes_requested'
  reportUrl: string
  moderationReason?: string
  pointsAwarded?: number
  totalPoints?: number
}

const statusConfig: Record<
  string,
  {
    title: string
    emoji: string
    bgColor: string
    borderColor: string
    textColor: string
  }
> = {
  approved: {
    title: 'Report Approved!',
    emoji: '✅',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-900',
  },
  rejected: {
    title: 'Report Rejected',
    emoji: '❌',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-900',
  },
  changes_requested: {
    title: 'Changes Requested',
    emoji: '✏️',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-900',
  },
}

export const ReportStatusEmail = ({
  userName,
  reportTitle,
  status,
  reportUrl,
  moderationReason,
  pointsAwarded,
  totalPoints,
}: ReportStatusEmailProps) => {
  const config = statusConfig[status]

  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[40px]">
            <Section>
              <Text className="text-[24px] font-bold text-gray-900 mb-[16px] text-center">
                {config.emoji} {config.title}
              </Text>

              <Text className="text-[16px] text-gray-700 mb-[24px] leading-[24px]">
                Hi {userName},
              </Text>

              <Text className="text-[16px] text-gray-700 mb-[24px] leading-[24px]">
                Your report has been reviewed:
              </Text>

              <Section className="bg-gray-50 rounded-[8px] p-[16px] mb-[24px] border border-gray-200">
                <Text className="text-[16px] font-semibold text-gray-900 mb-[8px]">
                  "{reportTitle}"
                </Text>
              </Section>

              {status === 'approved' && pointsAwarded && totalPoints && (
                <Section className="bg-green-50 rounded-[8px] p-[16px] mb-[24px] border border-green-200">
                  <Text className="text-[16px] font-semibold text-green-900 mb-[8px]">
                    🎁 You earned +{pointsAwarded} reputation points!
                  </Text>
                  <Text className="text-[14px] text-green-800">
                    ⭐ Total reputation: {totalPoints} points
                  </Text>
                </Section>
              )}

              {moderationReason && (
                <Section
                  className={`${config.bgColor} rounded-[8px] p-[16px] mb-[24px] border ${config.borderColor}`}
                >
                  <Text
                    className={`text-[14px] font-semibold ${config.textColor} mb-[8px]`}
                  >
                    {status === 'changes_requested'
                      ? 'Moderator notes:'
                      : 'Reason:'}
                  </Text>
                  <Text
                    className={`text-[14px] ${config.textColor} leading-[20px]`}
                  >
                    {moderationReason}
                  </Text>
                </Section>
              )}

              <Section className="text-center mb-[32px]">
                <Button
                  href={reportUrl}
                  className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border"
                >
                  {status === 'changes_requested'
                    ? 'Edit Report'
                    : 'View Report'}
                </Button>
              </Section>

              <Hr className="border-gray-200 my-[24px]" />

              <Text className="text-[12px] text-gray-500 leading-[16px] m-0">
                {status === 'approved'
                  ? 'Thank you for your contribution!'
                  : status === 'changes_requested'
                    ? 'We look forward to your updated submission.'
                    : 'If you have questions, please contact support.'}
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
  )
}

export default ReportStatusEmail
