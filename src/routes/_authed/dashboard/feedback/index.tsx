import { createFileRoute } from '@tanstack/react-router'

import { FeedbackForm } from '@/components/feedback-form'

export const Route = createFileRoute('/_authed/dashboard/feedback/')({
  component: FeedbackPage,
})

function FeedbackPage() {
  return <FeedbackForm className="min-h-svh" />
}
