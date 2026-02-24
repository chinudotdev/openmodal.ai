import { Link, createFileRoute } from '@tanstack/react-router'

import { SubmitReportForm } from '@/components/reports'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authed/dashboard/reports/submit/')({
  component: SubmitReportPage,
})

function SubmitReportPage() {
  return (
    <>
      {/* Header */}
      <div className="border-b border-border/40 bg-muted/30">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight mb-1">
                Submit an Impact Report
              </h1>
              <p className="text-muted-foreground">
                Share your experience with AI&apos;s impact on jobs and
                capabilities
              </p>
            </div>
            <Link to="/dashboard/reports">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border rounded-lg p-6 md:p-8">
            <div className="mb-6 pb-6 border-b">
              <h2 className="text-lg font-semibold mb-2">What to Include</h2>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • <strong>Job title</strong> - What position was affected?
                </li>
                <li>
                  • <strong>Impact type</strong> - layoffs, reduced hours, new
                  tools, etc.
                </li>
                <li>
                  • <strong>Your story</strong> - detailed description (min. 100
                  characters)
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                All other fields are optional. The more detail you provide, the
                more valuable your report is to the community.
              </p>
            </div>
            <SubmitReportForm />
          </div>
        </div>
      </div>
    </>
  )
}
