import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { getSubtypeBySlugFn } from '@/actions/capabilities'
import { getDiscussionByEntityFn } from '@/actions/discussions'
import {
  CreateDiscussionForm,
  DiscussionThread,
} from '@/components/discussions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute(
  '/_public/capabilities/$slug/$subslug/discussion',
)({
  component: CapabilitySubtypeDiscussionPage,
  loader: async ({ params }) => {
    const [subtypeResult, discussionResult] = await Promise.all([
      getSubtypeBySlugFn({ data: { slug: params.subslug } }),
      getDiscussionByEntityFn({
        data: {
          entityType: 'capability_subtype',
          entityId: params.subslug,
          includeReplies: true,
        },
      }),
    ])

    if (!subtypeResult) {
      throw notFound()
    }

    return {
      subtype: subtypeResult,
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

function CapabilitySubtypeDiscussionPage() {
  const { subtype, discussion, replies, exists } = Route.useLoaderData()
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solved':
      case 'Solved':
        return 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
      case 'partial':
      case 'Partial':
        return 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
      case 'unsolved':
      case 'Unsolved':
        return 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
      default:
        return ''
    }
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
              to="/capabilities"
              className="hover:text-foreground transition-colors"
            >
              Capabilities
            </Link>
            <span>/</span>
            <Link
              to="/capabilities/$slug/$subslug"
              params={{
                slug: subtype.parentCapability?.slug ?? '',
                subslug: subtype.slug,
              }}
              className="hover:text-foreground transition-colors"
            >
              {subtype.name}
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
            <span className="text-4xl">📋</span>
            <div>
              <h1 className="text-3xl font-semibold">{subtype.name}</h1>
              <p className="text-muted-foreground">
                Discussion about this AI capability in {subtype.domain}
              </p>
            </div>
            <Badge variant="outline" className={getStatusColor(subtype.status)}>
              {subtype.status.charAt(0).toUpperCase() + subtype.status.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/capabilities/$slug/$subslug"
              params={{
                slug: subtype.parentCapability?.slug ?? '',
                subslug: subtype.slug,
              }}
            >
              <Button variant="outline">← Back to Capability</Button>
            </Link>
            <Badge variant="secondary">
              Progress: {subtype.progressPercentage}%
            </Badge>
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
                No discussion has been started for this capability yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Be the first to start a conversation about {subtype.name} in{' '}
                {subtype.domain}!
              </p>
            </div>
            <CreateDiscussionForm
              entityType="capability_subtype"
              entityId={subtype.id}
              entityName={`${subtype.name} (${subtype.domain})`}
              onSubmit={handleCreateDiscussion}
              onCancel={() =>
                navigate({
                  to: '/capabilities/$slug/$subslug',
                  params: {
                    slug: subtype.parentCapability?.slug ?? '',
                    subslug: subtype.slug,
                  },
                })
              }
            />
          </div>
        )}
      </div>
    </>
  )
}
