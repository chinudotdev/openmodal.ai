import { Link, createFileRoute } from '@tanstack/react-router'

import { getDiscussionByIdFn } from '@/actions/discussions'
import { DiscussionThread } from '@/components/discussions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/_public/discussions/$id/')({
  loader: async ({ params }) => {
    const result = await getDiscussionByIdFn({
      data: { id: params.id, includeReplies: true },
    })

    if (!result.success) {
      throw new Error('Discussion not found')
    }

    return {
      discussion: result.discussion,
      replies: result.replies,
      entityInfo: result.entityInfo,
    }
  },
  component: DiscussionDetailPage,
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading discussion...</p>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'Discussion not found'}
        </p>
        <Link
          to="/discussions"
          search={{
            entityType: undefined,
            search: undefined,
            sort: 'recent',
            timeRange: undefined,
          }}
        >
          <Button>Back to Discussions</Button>
        </Link>
      </div>
    </div>
  ),
})

function DiscussionDetailPage() {
  const { discussion, replies, entityInfo } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  const handleVote = (_id: string, _voteType: 'upvote' | 'downvote') => {
    // TODO: Implement voting
    console.log('Vote:', _id, _voteType)
  }

  const handleReply = (_parentId: string, _body: string) => {
    // TODO: Implement reply
    console.log('Reply:', _parentId, _body)
  }

  // Get entity info for display
  const entityInfoDisplay = getEntityDisplay(discussion.entityType)
  const score = discussion.upvotes - discussion.downvotes

  // Calculate stats
  const uniqueUsers = new Set([discussion.userId]).size
  const expertCount = 0 // TODO: Count from replies
  const avgDepth = '2.3' // TODO: Calculate from replies
  const mostUpvoted = replies[0] ?? undefined // TODO: Find actual most upvoted

  return (
    <>
      {/* Breadcrumb */}
      <nav className="border-b border-border/40 bg-muted/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" search={() => ({})} className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link
              to="/discussions"
              search={{
                entityType: undefined,
                search: undefined,
                sort: 'recent',
                timeRange: undefined,
              }}
              className="hover:text-primary"
            >
              Discussions
            </Link>
            {entityInfo && (
              <>
                <span>/</span>
                <span className="text-foreground">{entityInfo.name}</span>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Discussion Header */}
            {entityInfo && (
              <div className="mb-6 flex items-center gap-3">
                <Badge variant="secondary" className="text-sm">
                  {entityInfoDisplay.icon} {entityInfoDisplay.label}
                </Badge>
                <button
                  onClick={() => {
                    const route = getEntityRoute(discussion.entityType)
                    const slug = entityInfo.slug || discussion.entityId
                    void navigate({
                      to: `/${route}/${slug}` as any,
                      search: () => ({}),
                    })
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  View {entityInfoDisplay.label} →
                </button>
              </div>
            )}

            <DiscussionThread
              discussion={discussion}
              replies={replies}
              onVote={handleVote}
              onReply={handleReply}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Discussion Stats */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">📊 Discussion Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Replies</span>
                  <span className="font-medium">{discussion.replyCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Score</span>
                  <span className="font-medium">
                    {score > 0 ? '+' : ''}
                    {score}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unique users</span>
                  <span className="font-medium">{uniqueUsers}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experts</span>
                  <span className="font-medium">{expertCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg depth</span>
                  <span className="font-medium">{avgDepth} levels</span>
                </div>
                {replies.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <div>
                      <p className="text-muted-foreground mb-1">Most upvoted</p>
                      <p className="font-medium">
                        @{mostUpvoted.author?.username} ({mostUpvoted.upvotes}{' '}
                        ⬆️)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Related Discussions */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">🔗 Related Discussions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Other discussions about{' '}
                {entityInfo?.name || entityInfoDisplay.label}:
              </p>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground italic">
                  Loading related discussions...
                </p>
                {/* TODO: Load related discussions */}
              </div>
              <Link
                to="/discussions"
                search={{
                  entityType: discussion.entityType as
                    | 'capability'
                    | 'capability_subtype'
                    | 'impact_report'
                    | 'job'
                    | 'organization'
                    | 'technology'
                    | undefined,
                  search: undefined,
                  sort: 'recent',
                  timeRange: undefined,
                }}
                className="text-sm text-primary hover:underline mt-4 inline-block"
              >
                View all discussions on{' '}
                {entityInfo?.name || entityInfoDisplay.label} →
              </Link>
            </div>

            {/* Share */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">📤 Share</h3>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                }}
              >
                Copy Link
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

// ============================================
// HELPERS
// ============================================

function getEntityDisplay(entityType: string): {
  icon: string
  label: string
  route: string
} {
  switch (entityType) {
    case 'organization':
      return { icon: '🏢', label: 'Organization', route: 'organizations' }
    case 'technology':
      return { icon: '🤖', label: 'Technology', route: 'technologies' }
    case 'capability':
      return { icon: '🏥', label: 'Capability', route: 'capabilities' }
    case 'capability_subtype':
      return { icon: '📋', label: 'Sub-capability', route: 'capabilities' }
    case 'job':
      return { icon: '💼', label: 'Job', route: 'jobs' }
    case 'impact_report':
      return { icon: '📊', label: 'Impact Report', route: 'reports' }
    default:
      return { icon: '💬', label: 'Discussion', route: 'discussions' }
  }
}

function getEntityRoute(entityType: string): string {
  return getEntityDisplay(entityType).route
}
