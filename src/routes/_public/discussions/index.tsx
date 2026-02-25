import { Link, createFileRoute } from '@tanstack/react-router'

import type {DiscussionFiltersValues} from '@/components/discussions';
import { getDiscussionsFn, getTrendingTopicsFn } from '@/actions/discussions'
import {
  
  DiscussionList
} from '@/components/discussions'
import { Button } from '@/components/ui/button'

// Search params schema for the discussions page
const discussionsSearchSchema = {
  entityType: undefined as string | undefined,
  search: undefined as string | undefined,
  sort: 'recent' as 'recent' | 'upvotes' | 'hot',
  timeRange: undefined as 'today' | 'week' | 'month' | 'all' | undefined,
}

export const Route = createFileRoute('/_public/discussions/')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      entityType:
        (search.entityType as string | undefined) ||
        discussionsSearchSchema.entityType,
      search:
        (search.search as string | undefined) || discussionsSearchSchema.search,
      sort: ((search.sort as string) || discussionsSearchSchema.sort) as
        | 'recent'
        | 'upvotes'
        | 'hot',
      timeRange:
        (search.timeRange as 'today' | 'week' | 'month' | 'all' | undefined) ||
        discussionsSearchSchema.timeRange,
    }
  },
  loaderDeps: ({ search }) => ({
    entityType: search.entityType,
    searchTerm: search.search,
    sort: search.sort,
    timeRange: search.timeRange,
  }),
  loader: async ({ deps }) => {
    const [discussionsResult, trendingResult] = await Promise.all([
      getDiscussionsFn({
        data: {
          entityType: deps.entityType as any,
          searchTerm: deps.searchTerm,
          sort: deps.sort,
          timeRange: deps.timeRange,
          limit: 20,
          offset: 0,
        },
      }),
      getTrendingTopicsFn({ data: { limit: 5 } }),
    ])

    // Ensure discussions is always an array, even if result is malformed
    const discussions = Array.isArray(discussionsResult.discussions)
      ? discussionsResult.discussions
      : []
    const { totalCount, hasMore } = discussionsResult

    return {
      discussions,
      totalCount,
      hasMore,
      trendingTopics: trendingResult.topics,
    }
  },
  component: DiscussionsPage,
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading discussions...</p>
      </div>
    </div>
  ),
})

function DiscussionsPage() {
  const navigate = Route.useNavigate()
  const { discussions, totalCount, hasMore, trendingTopics } =
    Route.useLoaderData()

  // Ensure discussions is always an array

  const discussionsList = discussions
  const discussionCount = totalCount
  const hasMoreDiscussions = hasMore

  const handleFilterChange = async (newFilters: DiscussionFiltersValues) => {
    // Update URL search params
    const params: Record<string, string> = {}
    if (newFilters.entityType) params.entityType = newFilters.entityType
    if (newFilters.searchTerm) params.search = newFilters.searchTerm
    params.sort = newFilters.sort
    if (newFilters.timeRange) params.timeRange = newFilters.timeRange

    await navigate({
      to: '/discussions',
      search: (prev) => ({ ...prev, ...params }),
    })
  }

  const handleLoadMore = async () => {
    // In a real implementation, this would fetch the next page
    // For now, just a placeholder
  }

  return (
    <>
      {/* Hero Section */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
              Community Discussions
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Join conversations about AI&apos;s impact on jobs, capabilities,
              and technologies. Share insights, ask questions, and learn from
              the community.
            </p>
            <div className="flex items-center gap-4">
              <Button>Start a Discussion</Button>
              <Link to="/about">
                <Button variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <DiscussionList
              discussions={discussionsList}
              totalCount={discussionCount}
              hasMore={hasMoreDiscussions}
              isLoading={false}
              isFetchingMore={false}
              onFilterChange={handleFilterChange}
              onLoadMore={handleLoadMore}
              showFilters
              emptyMessage="No discussions found. Start a conversation with the community!"
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Trending Topics */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                🔥 Trending Topics
              </h3>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <TrendingTopicLink
                    key={topic.entityId}
                    topic={topic}
                    index={index}
                  />
                ))}
              </div>
              <Link
                to="/discussions"
                search={() => ({
                  entityType: undefined,
                  search: undefined,
                  sort: 'recent' as const,
                  timeRange: undefined,
                })}
                className="text-sm text-primary hover:underline mt-4 inline-block"
              >
                View all trending →
              </Link>
            </div>

            {/* Quick Filters */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Quick Filters</h3>
              <div className="space-y-2">
                <FilterLink label="All Discussions" value="all" />
                <FilterLink label="Questions" value="all" />
                <FilterLink label="Insights" value="all" />
                <FilterLink label="Debates" value="all" />
              </div>
            </div>

            {/* Stats */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">📊 Discussion Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total threads</span>
                  <span className="font-medium">{discussionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Active this week
                  </span>
                  <span className="font-medium">
                    {trendingTopics.reduce((acc, t) => acc + t.commentCount, 0)}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* CTA */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Have Something to Share?
          </h2>
          <p className="text-muted-foreground mb-6">
            Start a discussion about AI&apos;s impact on jobs, capabilities, or
            technologies. Your insights could help others understand the real
            effects of AI.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button>Start a Discussion</Button>
          </div>
        </div>
      </section>
    </>
  )
}

// ============================================
// HELPERS
// ============================================

interface TrendingTopic {
  entityType: string
  entityId: string
  entityName: string
  entitySlug: string | null | undefined
  commentCount: number
}

function TrendingTopicLink({
  topic,
  index,
}: {
  topic: TrendingTopic
  index: number
}) {
  return (
    <div className="p-3 rounded-lg hover:bg-muted transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-lg font-bold text-muted-foreground">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium line-clamp-2">{topic.entityName}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {getEntityLabel(topic.entityType)} • {topic.commentCount} comments
          </p>
        </div>
      </div>
    </div>
  )
}

function FilterLink({ label, value }: { label: string; value: string }) {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  return (
    <button
      onClick={() =>
        navigate({
          to: '/discussions',
          search: (prev) => ({
            ...prev,
            entityType: value === 'all' ? undefined : value,
          }),
        })
      }
      className={`
        w-full text-left px-3 py-2 rounded-lg transition-colors
        ${
          (value === 'all' && !search.entityType) || search.entityType === value
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted'
        }
      `}
    >
      {label}
    </button>
  )
}

function getEntityLabel(entityType: string): string {
  switch (entityType) {
    case 'organization':
      return 'Organization'
    case 'technology':
      return 'Technology'
    case 'capability':
      return 'Capability'
    case 'capability_subtype':
      return 'Sub-capability'
    case 'job':
      return 'Job'
    case 'impact_report':
      return 'Report'
    default:
      return 'Entity'
  }
}
