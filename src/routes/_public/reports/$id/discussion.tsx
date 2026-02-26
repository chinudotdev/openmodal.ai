import {
  Link,
  createFileRoute,
  notFound,
  useRouter,
} from '@tanstack/react-router'

import {
  createDiscussionFn,
  createReplyFn,
  getDiscussionByEntityFn,
} from '@/actions/discussions'
import { getReportByIdFn } from '@/actions/reports'
import {
  CreateDiscussionForm,
  DiscussionThread,
} from '@/components/discussions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/_public/reports/$id/discussion')({
  component: ReportDiscussionPage,
  loader: async ({ params }) => {
    const [reportResult, discussionResult] = await Promise.all([
      getReportByIdFn({ data: { id: params.id } }),
      getDiscussionByEntityFn({
        data: {
          entityType: 'impact_report',
          entityId: params.id,
          includeReplies: true,
        },
      }),
    ])

    if (!reportResult.success) {
      throw notFound()
    }

    return {
      report: reportResult.report,
      discussion: discussionResult.discussion,
      replies: discussionResult.replies || [],
      exists: discussionResult.exists || false,
    }
  },
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading discussion...</p>
      </div>
    </div>
  ),
})

function ReportDiscussionPage() {
  const { report, discussion, replies, exists } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const router = useRouter()

  const reportTitle = report.title || report.jobTitle

  const handleCreateDiscussion = async (data: {
    title: string
    body: string
  }) => {
    const result = await createDiscussionFn({
      data: {
        title: data.title,
        body: data.body,
        entityType: 'impact_report',
        entityId: report.id,
        isAnonymous: false,
      },
    })
    if (result.success) {
      // Invalidate the route to refresh the discussion
      await router.invalidate()
    }
  }

  const handleReply = async (parentId: string, body: string) => {
    await createReplyFn({
      data: { parentId, body, isAnonymous: false },
    })
    // Invalidate to show the new reply
    await router.invalidate()
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border/40">
        <div className="container mx-auto px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              to="/reports"
              search={() => ({
                impactType: undefined,
                country: undefined,
                companySize: undefined,
                search: '',
                sort: 'recent' as 'upvotes' | 'recent' | 'views',
              })}
              className="hover:text-foreground transition-colors"
            >
              Impact Reports
            </Link>
            <span>/</span>
            <Link
              to="/reports/$id"
              params={{ id: report.id }}
              className="hover:text-foreground transition-colors"
            >
              {reportTitle}
            </Link>
            <span>/</span>
            <span className="text-foreground">Discussion</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📊</span>
            <div>
              <h1 className="text-3xl font-semibold">{reportTitle}</h1>
              <p className="text-muted-foreground">
                Discussion about this impact report
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/reports/$id" params={{ id: report.id }}>
              <Button variant="outline">← Back to Report</Button>
            </Link>
            <Badge variant="secondary">
              {exists
                ? `${discussion?.replyCount || 0} replies`
                : 'No discussion yet'}
            </Badge>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Discussion or Create Form */}
        {exists && discussion ? (
          <DiscussionThread
            discussion={discussion}
            replies={replies}
            onReply={handleReply}
          />
        ) : (
          <div className="max-w-3xl">
            <div className="text-center py-12 mb-8">
              <p className="text-lg text-muted-foreground mb-2">
                No discussion has been started for this report yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Be the first to start a conversation about this impact report!
              </p>
            </div>
            <CreateDiscussionForm
              entityType="impact_report"
              entityId={report.id}
              entityName={reportTitle}
              onSubmit={handleCreateDiscussion}
              onCancel={() =>
                navigate({ to: '/reports/$id', params: { id: report.id } })
              }
            />
          </div>
        )}
      </div>
    </>
  )
}
