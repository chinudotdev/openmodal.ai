import { Link, createFileRoute } from '@tanstack/react-router'

import { getAllJobsForAdminFn } from '@/actions/admin/jobs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/admin/jobs/')({
  component: AdminJobsPage,
  loader: async () => {
    const result = await getAllJobsForAdminFn()
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch jobs')
    }
    return { jobs: result.data }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center py-12">
      <Spinner />
    </div>
  ),
})

function AdminJobsPage() {
  const { jobs } = Route.useLoaderData()

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
      case 'low':
        return 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
      default:
        return ''
    }
  }

  const categoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Jobs</h1>
          <p className="text-muted-foreground">Manage job listings</p>
        </div>
        <Link to="/admin/jobs/add">
          <Button>Add Job</Button>
        </Link>
      </div>

      <div className="bg-background border border-border/40 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tasks</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job: any) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{job.icon || '💼'}</span>
                    {job.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {job.slug}
                </TableCell>
                <TableCell>{categoryLabel(job.category)}</TableCell>
                <TableCell>{job.tasksCount}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16">
                      <Progress
                        value={job.automationRiskPercentage}
                        className="h-2"
                      />
                    </div>
                    <Badge
                      variant="outline"
                      className={getRiskColor(job.riskLevel)}
                    >
                      {job.riskLevel}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Link to="/admin/jobs/$slug" params={{ slug: job.slug }}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {jobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No jobs found</p>
            <Link to="/admin/jobs/add">
              <Button>Add your first job</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
