import { Link, createFileRoute } from '@tanstack/react-router'

import type {ReportFiltersValues} from '@/components/reports';
import { getReportsFn } from '@/actions/reports'
import {  ReportList } from '@/components/reports'
import { Button } from '@/components/ui/button'

// Search params schema for the reports page
const reportsSearchSchema = {
  impactType: undefined as string | undefined,
  country: undefined as string | undefined,
  companySize: undefined as string | undefined,
  search: undefined as string | undefined,
  sort: 'recent' as 'recent' | 'upvotes' | 'views',
}

export const Route = createFileRoute('/_public/reports/')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      impactType:
        (search.impactType as string | undefined) ||
        reportsSearchSchema.impactType,
      country:
        (search.country as string | undefined) || reportsSearchSchema.country,
      companySize:
        (search.companySize as string | undefined) ||
        reportsSearchSchema.companySize,
      search:
        (search.search as string | undefined) || reportsSearchSchema.search,
      sort: ((search.sort as string) || reportsSearchSchema.sort) as
        | 'recent'
        | 'upvotes'
        | 'views',
    }
  },
  loaderDeps: ({ search }) => ({
    impactType: search.impactType,
    country: search.country,
    companySize: search.companySize,
    searchTerm: search.search,
    sort: search.sort,
  }),
  loader: async ({ deps }) => {
    const result = await getReportsFn({
      data: {
        impactType: deps.impactType as any,
        country: deps.country,
        companySize: deps.companySize as any,
        searchTerm: deps.searchTerm,
        sort: deps.sort,
        limit: 20,
        offset: 0,
      },
    })

    // Ensure reports is always an array, even if result is malformed
    const reports = Array.isArray(result.reports) ? result.reports : []
    const totalCount = result.totalCount
    const hasMore = result.hasMore

    return {
      reports,
      totalCount,
      hasMore,
    }
  },
  component: ReportsPage,
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    </div>
  ),
})

function ReportsPage() {
  const navigate = Route.useNavigate()
  const { reports, totalCount, hasMore } = Route.useLoaderData()

  // Ensure reports is always an array
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const reportsList = reports || []

  const reportCount = totalCount || 0

  const hasMoreReports = hasMore || false

  const handleFilterChange = async (newFilters: ReportFiltersValues) => {
    // Update URL search params
    const params: Record<string, string> = {}
    if (newFilters.impactType) params.impactType = newFilters.impactType
    if (newFilters.country) params.country = newFilters.country
    if (newFilters.companySize) params.companySize = newFilters.companySize
    if (newFilters.searchTerm) params.search = newFilters.searchTerm
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (newFilters.sort) params.sort = newFilters.sort

    await navigate({
      to: '/reports',
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
              Impact Reports
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Real-world accounts of AI&apos;s impact on professional life — from workers, managers, and founders. Browse what others are experiencing and share your own.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/dashboard/reports/submit">
                <Button>Share Your Story</Button>
              </Link>
              <Link to="/about">
                <Button variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reports List */}
      <section className="container mx-auto px-6 py-12">
        <ReportList
          reports={reportsList}
          totalCount={reportCount}
          hasMore={hasMoreReports}
          isLoading={false}
          isFetchingMore={false}
          onFilterChange={handleFilterChange}
          onLoadMore={handleLoadMore}
          showFilters
          emptyMessage="No reports found. Be the first to share your story with the community!"
        />
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Share Your Experience</h2>
          <p className="text-muted-foreground mb-6">
            Have firsthand experience with AI&apos;s impact on jobs? Share your
            insights and help others understand what AI can really do.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/dashboard/reports/submit">
              <Button>Share Your Story</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
