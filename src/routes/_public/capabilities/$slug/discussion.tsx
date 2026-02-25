import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { getCapabilityBySlugFn } from '@/actions/capabilities'
import { getDiscussionByEntityFn } from '@/actions/discussions'
import {
  CreateDiscussionForm,
  DiscussionThread,
} from '@/components/discussions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/_public/capabilities/$slug/discussion')({
  component: CapabilityDiscussionPage,
  loader: async ({ params }) => {
    const [capabilityResult, discussionResult] = await Promise.all([
      getCapabilityBySlugFn({ data: { slug: params.slug } }),
      getDiscussionByEntityFn({
        data: {
          entityType: 'capability',
          entityId: params.slug,
          includeReplies: true,
        },
      }),
    ])

    if (!capabilityResult) {
      throw notFound()
    }

    return {
      capability: capabilityResult,
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

function CapabilityDiscussionPage() {
  const { capability, discussion, replies, exists } = Route.useLoaderData()
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
              to="/capabilities"
              className="hover:text-foreground transition-colors"
            >
              Capabilities
            </Link>
            <span>/</span>
            <Link
              to="/capabilities/$slug"
              params={{ slug: capability.slug }}
              className="hover:text-foreground transition-colors"
            >
              {capability.name}
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
            <span className="text-4xl">{capability.icon || '🔷'}</span>
            <div>
              <h1 className="text-3xl font-semibold">{capability.name}</h1>
              <p className="text-muted-foreground">
                Discussion about this AI capability
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/capabilities/$slug" params={{ slug: capability.slug }}>
              <Button variant="outline">← Back to Capability</Button>
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
                No discussion has been started for this capability yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Be the first to start a conversation about {capability.name}!
              </p>
            </div>
            <CreateDiscussionForm
              entityType="capability"
              entityId={capability.id}
              entityName={capability.name}
              onSubmit={handleCreateDiscussion}
              onCancel={() =>
                navigate({
                  to: '/capabilities/$slug',
                  params: { slug: capability.slug },
                })
              }
            />
          </div>
        )}
      </div>
    </>
  )
}
