
import CommentReplyEmail from './comment-reply'
import EmailVerification from './email-verification'
import ReportStatusEmail from './report-status'
import ReportVerifiedEmail from './report-verified'
import ReputationMilestoneEmail from './reputation-milestone'
import { sendEmail } from '@/lib/email'

export const sendEmailVerification = async ({
  to,
  url,
}: {
  to: string
  url: string
}) => {
  await sendEmail({
    to,
    subject: 'Verify your email address',
    react: <EmailVerification url={url} />,
  })
}

export const sendReportVerifiedEmail = async ({
  to,
  userName,
  reportTitle,
  verifierName,
  reportUrl,
  pointsAwarded,
  totalPoints,
}: {
  to: string
  userName: string
  reportTitle: string
  verifierName: string
  reportUrl: string
  pointsAwarded: number
  totalPoints: number
}) => {
  await sendEmail({
    to,
    subject: '✅ Your report was verified!',
    react: (
      <ReportVerifiedEmail
        userName={userName}
        reportTitle={reportTitle}
        verifierName={verifierName}
        reportUrl={reportUrl}
        pointsAwarded={pointsAwarded}
        totalPoints={totalPoints}
      />
    ),
  })
}

export const sendCommentReplyEmail = async ({
  to,
  userName,
  replierName,
  reportTitle,
  commentPreview,
  reportUrl,
}: {
  to: string
  userName: string
  replierName: string
  reportTitle: string
  commentPreview: string
  reportUrl: string
}) => {
  await sendEmail({
    to,
    subject: `💬 ${replierName} replied to your comment`,
    react: (
      <CommentReplyEmail
        userName={userName}
        replierName={replierName}
        reportTitle={reportTitle}
        commentPreview={commentPreview}
        reportUrl={reportUrl}
      />
    ),
  })
}

export const sendReputationMilestoneEmail = async ({
  to,
  userName,
  newTier,
  totalPoints,
  dashboardUrl,
  benefits,
}: {
  to: string
  userName: string
  newTier: string
  totalPoints: number
  dashboardUrl: string
  benefits: Array<string>
}) => {
  await sendEmail({
    to,
    subject: '🏆 Reputation milestone reached!',
    react: (
      <ReputationMilestoneEmail
        userName={userName}
        newTier={newTier}
        totalPoints={totalPoints}
        dashboardUrl={dashboardUrl}
        benefits={benefits}
      />
    ),
  })
}

export const sendReportStatusEmail = async ({
  to,
  userName,
  reportTitle,
  status,
  reportUrl,
  moderationReason,
  pointsAwarded,
  totalPoints,
}: {
  to: string
  userName: string
  reportTitle: string
  status: 'approved' | 'rejected' | 'changes_requested'
  reportUrl: string
  moderationReason?: string
  pointsAwarded?: number
  totalPoints?: number
}) => {
  const config = {
    approved: '✅ Report Approved!',
    rejected: '❌ Report Rejected',
    changes_requested: '✏️ Changes Requested',
  }

  await sendEmail({
    to,
    subject: config[status],
    react: (
      <ReportStatusEmail
        userName={userName}
        reportTitle={reportTitle}
        status={status}
        reportUrl={reportUrl}
        moderationReason={moderationReason}
        pointsAwarded={pointsAwarded}
        totalPoints={totalPoints}
      />
    ),
  })
}
