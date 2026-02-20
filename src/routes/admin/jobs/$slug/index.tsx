import {
  Link,
  createFileRoute,
  notFound,
  useRouter,
} from '@tanstack/react-router'

import { deleteJobFn, getJobBySlugForAdminFn } from '@/actions/admin/jobs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/admin/jobs/$slug/')({
  component: AdminJobDetailPage,
  loader: async ({ params }) => {
    const result = await getJobBySlugForAdminFn({
      data: { slug: params.slug },
    })
    if (!result.success) {
      throw notFound()
    }
    return { job: result.data }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center py-12">
      <Spinner />
    </div>
  ),
})

function AdminJobDetailPage() {
  const { job } = Route.useLoaderData()
  const router = useRouter()

  const { tasks, ...jobData } = job

  const handleDelete = async () => {
    const result = await deleteJobFn({
      data: { id: job.id },
    })
    if (result.success) {
      await router.invalidate()
      await router.navigate({ to: '/admin/jobs' })
    } else {
      console.error('Failed to delete job:', result.error)
    }
  }

  const getAutomatableColor = (automatable: string) => {
    switch (automatable) {
      case 'yes':
        return 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
      case 'partial':
        return 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
      case 'no':
        return 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
      default:
        return ''
    }
  }

  const getAutomatableIcon = (automatable: string) => {
    switch (automatable) {
      case 'yes':
        return '⚠️'
      case 'partial':
        return '⚠️'
      case 'no':
        return '✅'
      default:
        return ''
    }
  }

  const getAutomatableLabel = (automatable: string) => {
    switch (automatable) {
      case 'yes':
        return 'Automatable'
      case 'partial':
        return 'Partially Automatable'
      case 'no':
        return 'Safe'
      default:
        return ''
    }
  }

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
        <div className="flex items-center gap-4">
          <Link to="/admin/jobs">
            <Button variant="ghost" size="sm">
              ← Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold flex items-center gap-3">
              <span>{jobData.icon || '💼'}</span>
              {jobData.name}
            </h1>
            <p className="text-muted-foreground mt-1">{jobData.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/jobs/$slug/edit" params={{ slug: jobData.slug }}>
            <Button variant="outline">Edit Job</Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Job</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Job</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{jobData.name}"? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Job Details */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Description
              </h3>
              <p>{jobData.description}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <span>{categoryLabel(jobData.category)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Automation Risk
                </span>
                <div className="flex items-center gap-2">
                  <Progress
                    value={jobData.automationRiskPercentage}
                    className="w-24 h-2"
                  />
                  <span className="font-medium">
                    {jobData.automationRiskPercentage}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Risk Level
                </span>
                <Badge
                  variant="outline"
                  className={getRiskColor(jobData.riskLevel)}
                >
                  {jobData.riskLevel}
                </Badge>
              </div>
              {jobData.timelineEstimate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Timeline
                  </span>
                  <span>{jobData.timelineEstimate}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Confidence
                </span>
                <span>
                  {jobData.confidence.charAt(0).toUpperCase() +
                    jobData.confidence.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Tasks ({tasks.length})</h2>
          {/* TODO: Add task creation form/modal */}
        </div>

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No tasks defined for this job yet
              </p>
              {/* <Button>Add Task</Button> */}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task: any) => (
              <Card key={task.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{task.name}</h3>
                        <Badge
                          variant="outline"
                          className={getAutomatableColor(task.automatable)}
                        >
                          {getAutomatableIcon(task.automatable)}{' '}
                          {getAutomatableLabel(task.automatable)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {task.percentageOfJob}% of job
                        </span>
                      </div>
                      {task.reason && (
                        <p className="text-sm text-muted-foreground">
                          {task.reason}
                        </p>
                      )}
                      {task.capabilityRequirements &&
                        task.capabilityRequirements.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {task.capabilityRequirements.map((req: any) => (
                              <Badge
                                key={req.id}
                                variant="secondary"
                                className="text-xs"
                              >
                                {req.capability?.name ||
                                  req.capabilitySubtype?.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                    </div>
                    {/* TODO: Add edit/delete buttons for tasks */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
