import { Link, createFileRoute } from '@tanstack/react-router'

import { getMyReportsFn } from '@/actions/reports'
import { ReportList } from '@/components/reports'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authed/dashboard/reports/')({
  loader: async () => {
    const result = await getMyReportsFn({ data: {} })
    return result
  },
  component: MyReportsPage,
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your reports...</p>
      </div>
    </div>
  ),
})

function MyReportsPage() {
  const loaderData = Route.useLoaderData()

  const reportsList = loaderData.reports

  return (
    <>
      {/* Header */}
      <div className="border-b border-border/40 bg-muted/30">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight mb-1">
                My Impact Reports
              </h1>
              <p className="text-muted-foreground">
                View and manage the reports you&apos;ve submitted
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/reports"
                search={{
                  impactType: undefined,
                  country: undefined,
                  companySize: undefined,
                  search: undefined,
                  sort: 'recent',
                }}
              >
                <Button variant="outline">Browse All Reports</Button>
              </Link>
              <Link to="/dashboard/reports/submit">
                <Button>Submit New Report</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="container mx-auto px-6 py-12">
        <ReportList
          reports={reportsList}
          totalCount={reportsList.length}
          hasMore={false}
          isLoading={false}
          isFetchingMore={false}
          showFilters={false}
          emptyMessage="You haven't submitted any reports yet. Share your experience with the community!"
        />
      </div>
    </>
  )
}
