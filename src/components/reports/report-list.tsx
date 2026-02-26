import type {ReportFiltersValues} from '@/components/reports/report-filters';
import { ReportCard } from '@/components/reports/report-card'
import {
  ReportFilters
  
} from '@/components/reports/report-filters'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

// ============================================
// TYPES
// ============================================

export interface ReportListProps {
  reports: Array<{
    id: string
    jobTitle: string
    description: string
    impactType: string
    title: string | null
    location: string | null
    country: string | null
    companyName: string | null
    companySize: string | null
    technologyDescription: string | null
    workersAffectedCount: number | null
    eventDate: Date | null
    sourceUrl: string | null
    technologyId: string | null
    submittedBy: string
    isAnonymous: boolean
    reporterRelationship: string | null
    status: string
    upvotes: number
    viewCount: number
    isFeatured: boolean
    createdAt: Date
    updatedAt: Date
    submitter?: {
      id: string
      name: string | null
      username: string
      email: string | null
    } | null
    technology?: {
      id: string
      name: string
      slug: string
      type: string
    } | null
    _enrichmentCount?: number
    _flagCount?: number
  }>
  totalCount?: number
  hasMore?: boolean
  isLoading?: boolean
  isFetchingMore?: boolean
  onFilterChange?: (filters: ReportFiltersValues) => void
  onLoadMore?: () => void
  showFilters?: boolean
  emptyMessage?: string
}

// ============================================
// COMPONENT
// ============================================

export function ReportList({
  reports,
  totalCount,
  hasMore,
  isLoading,
  isFetchingMore,
  onFilterChange,
  onLoadMore,
  showFilters = true,
  emptyMessage = 'No reports found. Be the first to share your story!',
}: ReportListProps) {
  return (
    <div className="space-y-8">
      {showFilters && onFilterChange && (
        <div className="bg-card border rounded-lg p-6">
          <ReportFilters onSubmit={onFilterChange} isLoading={isLoading} />
        </div>
      )}

      {isLoading && reports.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">{emptyMessage}</p>
        </div>
      ) : (
        <>
          {totalCount !== undefined && (
            <div className="text-sm text-muted-foreground">
              {totalCount} {totalCount === 1 ? 'report' : 'reports'} found
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
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
