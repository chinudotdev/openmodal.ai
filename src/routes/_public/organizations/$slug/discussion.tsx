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
import { getOrganizationBySlugFn } from '@/actions/organizations'
import {
  CreateDiscussionForm,
  DiscussionThread,
} from '@/components/discussions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/_public/organizations/$slug/discussion')(
  {
    component: OrganizationDiscussionPage,
    loader: async ({ params }) => {
      // First fetch the organization to get its ID
      const organizationResult = await getOrganizationBySlugFn({
        data: { slug: params.slug },
      })

      if (!organizationResult.organization) {
        throw notFound()
      }

      // Then fetch discussions using the actual organization ID
      const discussionResult = await getDiscussionByEntityFn({
        data: {
          entityType: 'organization',
          entityId: organizationResult.organization.id,
          includeReplies: true,
        },
      })

      return {
        organization: organizationResult.organization,
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
  },
)

function OrganizationDiscussionPage() {
  const { organization, discussion, replies, exists } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const router = useRouter()

  const handleCreateDiscussion = async (data: {
    title: string
    body: string
  }) => {
    const result = await createDiscussionFn({
      data: {
        title: data.title,
        body: data.body,
        entityType: 'organization',
        entityId: organization.id,
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
              to="/organizations"
              className="hover:text-foreground transition-colors"
            >
              Organizations
            </Link>
            <span>/</span>
            <Link
              to="/organizations/$slug"
              params={{ slug: organization.slug }}
              className="hover:text-foreground transition-colors"
            >
              {organization.name}
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
            <span className="text-4xl">🏢</span>
            <div>
              <h1 className="text-3xl font-semibold">{organization.name}</h1>
              <p className="text-muted-foreground">
                Discussion about this organization
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/organizations/$slug"
              params={{ slug: organization.slug }}
            >
              <Button variant="outline">← Back to Organization</Button>
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
                No discussion has been started for this organization yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Be the first to start a conversation about {organization.name}!
              </p>
            </div>
            <CreateDiscussionForm
              entityType="organization"
              entityId={organization.id}
              entityName={organization.name}
              onSubmit={handleCreateDiscussion}
              onCancel={() =>
                navigate({
                  to: '/organizations/$slug',
                  params: { slug: organization.slug },
                })
              }
            />
          </div>
        )}
      </div>
    </>
  )
}
