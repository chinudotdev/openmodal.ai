import { Link, createFileRoute } from '@tanstack/react-router'

import { getReportByIdFn } from '@/actions/reports'
import { ReportDetail } from '@/components/reports'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_public/reports/$id/')({
  loader: async ({ params }) => {
    const result = await getReportByIdFn({ data: { id: params.id } })
    return result
  },
  component: ReportDetailPage,
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading report...</p>
      </div>
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Report Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The report you are looking for does not exist.
        </p>
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
          <Button>Browse Reports</Button>
        </Link>
      </div>
    </div>
  ),
})

function ReportDetailPage() {
  const loaderData = Route.useLoaderData()

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!loaderData.success || !loaderData.report) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Report Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
            {loaderData.error ||
              'The report you are looking for does not exist.'}
          </p>
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
            <Button>Browse Reports</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/reports"
          search={{
            impactType: undefined,
            country: undefined,
            companySize: undefined,
            search: undefined,
            sort: 'recent',
          }}
          className="inline-block mb-6"
        >
          <Button variant="ghost" size="sm">
            ← Back to Reports
          </Button>
        </Link>
        <ReportDetail report={loaderData.report} session={undefined} />
      </div>
    </div>
  )
}
