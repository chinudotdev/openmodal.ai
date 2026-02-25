import { DiscussionCard } from './discussion-card'
import {
  DiscussionFilters
  
} from './discussion-filters'
import type {DiscussionFiltersValues} from './discussion-filters';
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'


// ============================================
// TYPES
// ============================================

export interface DiscussionListProps {
  discussions: Array<{
    id: string
    title: string | null
    body: string
    entityType: string
    entityId: string
    author?: {
      username: string
      name: string | null
      role: string | null
    } | null
    isAnonymous: boolean
    upvotes: number
    downvotes: number
    replyCount: number
    createdAt: Date
    updatedAt: Date
    entityInfo?: {
      name: string
      slug: string | null
    } | null
  }>
  totalCount?: number
  hasMore?: boolean
  isLoading?: boolean
  isFetchingMore?: boolean
  onFilterChange?: (filters: DiscussionFiltersValues) => void
  onLoadMore?: () => void
  showFilters?: boolean
  emptyMessage?: string
}

// ============================================
// COMPONENT
// ============================================

export function DiscussionList({
  discussions,
  totalCount,
  hasMore,
  isLoading,
  isFetchingMore,
  onFilterChange,
  onLoadMore,
  showFilters = true,
  emptyMessage = 'No discussions found. Start a conversation!',
}: DiscussionListProps) {
  return (
    <div className="space-y-8">
      {showFilters && onFilterChange && (
        <div className="bg-card border rounded-lg p-6">
          <DiscussionFilters onSubmit={onFilterChange} isLoading={isLoading} />
        </div>
      )}

      {isLoading && discussions.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : discussions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">{emptyMessage}</p>
        </div>
      ) : (
        <>
          {totalCount !== undefined && (
            <div className="text-sm text-muted-foreground">
              {totalCount} {totalCount === 1 ? 'discussion' : 'discussions'}
            </div>
          )}

          <div className="space-y-4">
            {discussions.map((discussion) => (
              <DiscussionCard key={discussion.id} discussion={discussion} />
            ))}
          </div>

          {hasMore && onLoadMore && (
            <div className="flex justify-center pt-8">
              <Button
                variant="outline"
                onClick={onLoadMore}
                disabled={isFetchingMore}
              >
                {isFetchingMore ? (
                  <>
                    <Spinner /> Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
