import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { getDiscussionByEntityFn } from '@/actions/discussions'
import { getJobBySlugFn } from '@/actions/jobs'
import {
  CreateDiscussionForm,
  DiscussionThread,
} from '@/components/discussions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/_public/jobs/$slug/discussion')({
  component: JobDiscussionPage,
  loader: async ({ params }) => {
    const [jobResult, discussionResult] = await Promise.all([
      getJobBySlugFn({ data: { slug: params.slug } }),
      getDiscussionByEntityFn({
        data: {
          entityType: 'job',
          entityId: params.slug,
          includeReplies: true,
        },
      }),
    ])

    if (!jobResult) {
      throw notFound()
    }

    return {
      job: jobResult,
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

function JobDiscussionPage() {
  const { job, discussion, replies, exists } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  const handleCreateDiscussion = (data: { title: string; body: string }) => {
    // TODO: Implement create discussion
    console.log('Create discussion:', data)
  }

  const handleVote = (_id: string, _voteType: 'upvote' | 'downvote') => {
    // TODO: Implement voting
    console.log('Vote:', _id, _voteType)
  }

  const handleReply = (_parentId: string, _body: string) => {
    // TODO: Implement reply
    console.log('Reply:', _parentId, _body)
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
              to="/jobs"
              search={() => ({
                page: 1,
                limit: 20,
                category: '',
                riskLevel: '',
                search: '',
                sortBy: '',
              })}
              className="hover:text-foreground transition-colors"
            >
              Jobs
            </Link>
            <span>/</span>
            <Link
              to="/jobs/$slug"
              params={{ slug: job.slug }}
              className="hover:text-foreground transition-colors"
            >
              {job.name}
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
            <span className="text-4xl">💼</span>
            <div>
              <h1 className="text-3xl font-semibold">{job.name}</h1>
              <p className="text-muted-foreground">
                Discussion about AI&apos;s impact on this job
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/jobs/$slug" params={{ slug: job.slug }}>
              <Button variant="outline">← Back to Job</Button>
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
            onVote={handleVote}
            onReply={handleReply}
          />
        ) : (
          <div className="max-w-3xl">
            <div className="text-center py-12 mb-8">
              <p className="text-lg text-muted-foreground mb-2">
                No discussion has been started for this job yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Be the first to start a conversation about how AI affects{' '}
                {job.name}!
              </p>
            </div>
            <CreateDiscussionForm
              entityType="job"
              entityId={job.id}
              entityName={job.name}
              onSubmit={handleCreateDiscussion}
              onCancel={() =>
                navigate({ to: '/jobs/$slug', params: { slug: job.slug } })
              }
            />
          </div>
        )}
      </div>
    </>
  )
}
