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

interface ReputationMilestoneEmailProps {
  userName: string
  newTier: string
  totalPoints: number
  dashboardUrl: string
  benefits: Array<string>
}

const tierLabels: Record<string, string> = {
  observer: 'Observer',
  contributor: 'Contributor',
  trusted: 'Trusted',
  expert: 'Expert',
}

export const ReputationMilestoneEmail = ({
  userName,
  newTier,
  totalPoints,
  dashboardUrl,
  benefits,
}: ReputationMilestoneEmailProps) => {
  const tierLabel = tierLabels[newTier] || newTier

  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[40px]">
            <Section>
              <Text className="text-[24px] font-bold text-gray-900 mb-[16px] text-center">
                🏆 Reputation milestone reached!
              </Text>

              <Text className="text-[16px] text-gray-700 mb-[24px] leading-[24px]">
                Hi {userName},
              </Text>

              <Text className="text-[16px] text-gray-700 mb-[24px] leading-[24px]">
                Congratulations! You've reached the <strong>{tierLabel}</strong>{' '}
                tier with <strong>{totalPoints} reputation points</strong>.
              </Text>

              <Section className="bg-purple-50 rounded-[8px] p-[16px] mb-[24px] border border-purple-200">
                <Text className="text-[16px] font-semibold text-purple-900 mb-[12px]">
                  New abilities unlocked:
                </Text>
                <ul className="list-none m-0 p-0">
                  {benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="text-[14px] text-purple-800 mb-[8px]"
                    >
                      • {benefit}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section className="text-center mb-[32px]">
                <Button
                  href={dashboardUrl}
                  className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border"
                >
                  View Your Dashboard
                </Button>
              </Section>

              <Hr className="border-gray-200 my-[24px]" />

              <Text className="text-[12px] text-gray-500 leading-[16px] m-0">
                Keep contributing to unlock even more benefits!
                <br />
                The OpenModal Team
              </Text>
            </Section>

            <Hr className="border-gray-200 my-[32px]" />

            <Section className="text-center">
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0">
                <a
                  href={`${dashboardUrl}?manage=preferences`}
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

export default ReputationMilestoneEmail
