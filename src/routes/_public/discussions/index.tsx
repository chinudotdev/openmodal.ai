import { Link, createFileRoute } from '@tanstack/react-router'

import type {DiscussionFiltersValues} from '@/components/discussions';
import { getDiscussionsFn } from '@/actions/discussions'
import {
  
  StartDiscussionDialog
} from '@/components/discussions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Search params schema for the discussions page
const discussionsSearchSchema = {
  entityType: undefined as string | undefined,
  search: undefined as string | undefined,
  sort: 'recent' as 'recent' | 'hot',
  timeRange: undefined as 'today' | 'week' | 'month' | 'all' | undefined,
  page: 1 as number,
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
        | 'hot',
      timeRange:
        (search.timeRange as 'today' | 'week' | 'month' | 'all' | undefined) ||
        discussionsSearchSchema.timeRange,
      page: (search.page as number) || discussionsSearchSchema.page,
    }
  },
  loaderDeps: ({ search }) => ({
    entityType: search.entityType,
    searchTerm: search.search,
    sort: search.sort,
    timeRange: search.timeRange,
    page: search.page,
  }),
  loader: async ({ deps }) => {
    const page = deps.page || 1
    const limit = 20
    const offset = (page - 1) * limit

    const discussionsResult = await getDiscussionsFn({
      data: {
        entityType: deps.entityType as any,
        searchTerm: deps.searchTerm,
        sort: deps.sort,
        timeRange: deps.timeRange,
        limit,
        offset,
      },
    })

    // Ensure discussions is always an array, even if result is malformed
    const discussions = Array.isArray(discussionsResult.discussions)
      ? discussionsResult.discussions
      : []
    const { totalCount, hasMore } = discussionsResult

    return {
      discussions,
      totalCount,
      hasMore,
      currentPage: page,
      totalPages: Math.ceil((totalCount || 0) / limit),
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
  const search = Route.useSearch()
  const { discussions, totalCount, currentPage, totalPages } =
    Route.useLoaderData()

  const handleFilterChange = async (
    newFilters: DiscussionFiltersValues & { page?: number },
  ) => {
    // Update URL search params
    const params: Record<string, string | undefined> = {}
    params.entityType = newFilters.entityType
    if (newFilters.searchTerm) params.search = newFilters.searchTerm
    params.sort = newFilters.sort
    if (newFilters.timeRange) params.timeRange = newFilters.timeRange
    // Reset to page 1 when filters change
    params.page = newFilters.page?.toString() || '1'

    await navigate({
      to: '/discussions',
      search: (prev) => ({ ...prev, ...params }),
    })
  }

  const handleSearchChange = (value: string) => {
    handleFilterChange({
      entityType: search.entityType,
      searchTerm: value || undefined,
      sort: search.sort,
      timeRange: search.timeRange,
      page: 1,
    })
  }

  const handleSortChange = (value: 'recent' | 'hot') => {
    handleFilterChange({
      entityType: search.entityType,
      searchTerm: search.search,
      sort: value,
      timeRange: search.timeRange,
      page: 1,
    })
  }

  const handleEntityTypeClick = (entityType: string | undefined) => {
    handleFilterChange({
      entityType,
      searchTerm: search.search,
      sort: search.sort,
      timeRange: search.timeRange,
      page: 1,
    })
  }

  const handlePageChange = (page: number) => {
    handleFilterChange({
      entityType: search.entityType,
      searchTerm: search.search,
      sort: search.sort,
      timeRange: search.timeRange,
      page,
    })
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1)
    }
  }

  // Entity type filters for the sidebar
  const entityTypes = [
    { value: undefined, label: 'All', icon: '💬' },
    { value: 'capability', label: 'Capabilities', icon: '🏥' },
    { value: 'capability_subtype', label: 'Sub-capabilities', icon: '📋' },
    { value: 'job', label: 'Jobs', icon: '💼' },
    { value: 'technology', label: 'Technologies', icon: '🤖' },
    { value: 'organization', label: 'Organizations', icon: '🏢' },
    { value: 'impact_report', label: 'Impact Reports', icon: '📊' },
  ]

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header Section with Search/Sort */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          Community Discussions
        </h1>
        <p className="text-muted-foreground mb-6">
          Join conversations about AI&apos;s impact on jobs, capabilities, and
          technologies.
        </p>

        {/* Search and Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search discussions..."
              value={search.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="sm:w-48">
            <Select value={search.sort} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Entity Type Categories */}
        <aside className="lg:col-span-1 order-first">
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Categories</h3>
            <div className="space-y-1">
              {entityTypes.map((type) => (
                <button
                  key={type.value || 'all'}
                  onClick={() => handleEntityTypeClick(type.value)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2
                    ${
                      (type.value === undefined && !search.entityType) ||
                      search.entityType === type.value
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }
                  `}
                >
                  <span className="text-base">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Discussion List */}
        <div className="lg:col-span-3">
          {/* Results count */}
          <div className="text-sm text-muted-foreground mb-4">
            {totalCount} {totalCount === 1 ? 'discussion' : 'discussions'}
          </div>

          {/* Discussions */}
          {discussions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">
                No discussions found. Start a conversation with the community!
              </p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {discussions.map((discussion) => (
                <Link
                  key={discussion.id}
                  to="/discussions/$id"
                  params={{ id: discussion.id }}
                  className="block"
                >
                  <div className="bg-card border rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base hover:text-primary transition-colors line-clamp-2">
                          {discussion.title || 'Discussion'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <span title={discussion.entityType}>
                            {getEntityIcon(discussion.entityType)}
                          </span>
                          <span>•</span>
                          <span>{getTimeAgo(discussion.createdAt)}</span>
                          <span>•</span>
                          <span>💬 {discussion.replyCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number

                  if (totalPages <= 7) {
                    pageNum = i + 1
                  } else if (currentPage <= 4) {
                    pageNum = i + 1
                    if (i === 5) pageNum = -1
                    else if (i === 6) pageNum = totalPages
                  } else if (currentPage >= totalPages - 3) {
                    if (i === 0) pageNum = 1
                    else if (i === 1) pageNum = -1
                    else pageNum = totalPages - 6 + i
                  } else {
                    if (i === 0) pageNum = 1
                    else if (i === 1) pageNum = -1
                    else if (i === 5) pageNum = -1
                    else if (i === 6) pageNum = totalPages
                    else pageNum = currentPage - 3 + i
                  }

                  if (pageNum === -1) {
                    return (
                      <span key={i} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    )
                  }

                  return (
                    <Button
                      key={i}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="min-w-[2.5rem]"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <section className="mt-12">
        <div className="max-w-2xl mx-auto text-center py-12 border-t">
          <h2 className="text-2xl font-semibold mb-4">
            Have Something to Share?
          </h2>
          <p className="text-muted-foreground mb-6">
            Start a discussion about AI&apos;s impact on jobs, capabilities, or
            technologies. Your insights could help others understand the real
            effects of AI.
          </p>
          <div className="flex items-center justify-center gap-4">
            <StartDiscussionDialog />
          </div>
        </div>
      </section>
    </div>
  )
}

// ============================================
// HELPERS
// ============================================

function getEntityIcon(entityType: string): string {
  switch (entityType) {
    case 'organization':
      return '🏢'
    case 'technology':
      return '🤖'
    case 'capability':
      return '🏥'
    case 'capability_subtype':
      return '📋'
    case 'job':
      return '💼'
    case 'impact_report':
      return '📊'
    default:
      return '💬'
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `${diffMins}m ago`
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`
  }
  return new Date(date).toLocaleDateString()
}
