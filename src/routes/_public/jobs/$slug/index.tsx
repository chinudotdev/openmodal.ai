import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { getJobBySlugFn } from '@/actions/jobs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export const Route = createFileRoute('/_public/jobs/$slug/')({
  component: JobPage,
  loader: async ({ params }) => {
    const result = await getJobBySlugFn({ data: { slug: params.slug } })
    if (!result) {
      throw notFound()
    }
    return { data: result }
  },
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading job details...</p>
      </div>
    </div>
  ),
})

function JobPage() {
  const result = Route.useLoaderData()

  const { tasks, ...job } = result.data

  // Get risk level details
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

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return '🔴'
      case 'medium':
        return '⚠️'
      case 'low':
        return '🟢'
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
        return 'Automatable (Partial)'
      case 'no':
        return 'Safe'
      default:
        return ''
    }
  }

  const getCapabilityProgressColor = (progress: number) => {
    if (progress >= 70) return 'text-red-500'
    if (progress >= 40) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getCapabilityProgressIcon = (progress: number) => {
    if (progress >= 70) return '✅'
    if (progress >= 40) return '⚠️'
    return '❌'
  }

  // Capitalize first letter
  const categoryLabel =
    job.category.charAt(0).toUpperCase() + job.category.slice(1)
  const riskLevelLabel =
    job.riskLevel.charAt(0).toUpperCase() + job.riskLevel.slice(1)
  const confidenceLabel =
    job.confidence.charAt(0).toUpperCase() + job.confidence.slice(1)

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border/40">
        <div className="container mx-auto px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              to="/jobs"
              search={() => ({
                page: 1,
                limit: 12,
                category: 'all',
                riskLevel: 'all',
                search: '',
                sortBy: 'name',
              })}
              className="hover:text-foreground transition-colors"
            >
              Jobs
            </Link>
            <span>/</span>
            <span className="text-foreground">{categoryLabel}</span>
            <span>/</span>
            <span className="text-foreground">{job.name}</span>
          </nav>
        </div>
      </div>

      <main className="flex-1">
        {/* Job Header */}
        <section className="border-b border-border/40 bg-muted/30">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{job.icon || '💼'}</span>
                <h1 className="text-3xl md:text-4xl font-semibold">
                  {job.name}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Automation Risk:
                  </span>
                  <span className="font-semibold">
                    {job.automationRiskPercentage}%
                  </span>
                </div>
                <Progress
                  value={job.automationRiskPercentage}
                  className="w-32 h-2"
                />
                <Badge
                  variant="outline"
                  className={getRiskColor(job.riskLevel)}
                >
                  {getRiskIcon(job.riskLevel)} Risk Level: {riskLevelLabel}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Timeline: {job.timelineEstimate || 'Unknown'}
                </span>
                <span className="text-sm text-muted-foreground">
                  Confidence: {confidenceLabel}
                </span>
              </div>

              <p className="text-muted-foreground">{job.description}</p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Task Breakdown */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-2">
                  📊 Task Breakdown
                </h2>
                <p className="text-muted-foreground mb-6">
                  What makes up this job?
                </p>

                <div className="space-y-4">
                  {tasks.map((task: any) => (
                    <Card key={task.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">
                                {task.name}
                              </h3>
                              <Badge
                                variant="outline"
                                className={
                                  task.automatable === 'no'
                                    ? 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
                                    : 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
                                }
                              >
                                {getAutomatableIcon(task.automatable)}{' '}
                                {getAutomatableLabel(task.automatable)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {task.percentageOfJob}% of job
                              </span>
                            </div>

                            {task.reason && (
                              <p className="text-sm text-muted-foreground mb-4">
                                Why{' '}
                                {task.automatable === 'no'
                                  ? 'safe'
                                  : 'partially automatable'}
                                : {task.reason}
                              </p>
                            )}

                            {/* Capability Requirements */}
                            {task.capabilityRequirements &&
                              task.capabilityRequirements.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-sm font-medium mb-2">
                                    Required capabilities:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {task.capabilityRequirements.map(
                                      (req: any) => (
                                        <Badge
                                          key={req.id}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          <Link
                                            to="/capabilities/$slug/$subslug"
                                            params={{
                                              slug:
                                                req.capability?.slug ||
                                                'medical-reasoning',
                                              subslug:
                                                req.capabilitySubtype?.slug ||
                                                'diagnosis',
                                            }}
                                            className="hover:text-foreground transition-colors"
                                          >
                                            {req.capabilitySubtype?.name ||
                                              req.capability?.name}{' '}
                                            {req.capabilitySubtype
                                              ?.progressPercentage !==
                                              undefined && (
                                              <span
                                                className={getCapabilityProgressColor(
                                                  req.capabilitySubtype
                                                    .progressPercentage,
                                                )}
                                              >
                                                {getCapabilityProgressIcon(
                                                  req.capabilitySubtype
                                                    .progressPercentage,
                                                )}{' '}
                                                {
                                                  req.capabilitySubtype
                                                    .progressPercentage
                                                }
                                                %
                                              </span>
                                            )}
                                          </Link>
                                        </Badge>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {tasks.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No tasks defined for this job yet.
                    </p>
                  </div>
                )}

                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>How is risk calculated?</strong> Risk = (Task % ×
                    Capability %) summed across all tasks
                  </p>
                  <Link
                    to="/"
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    View methodology →
                  </Link>
                </div>
              </section>

              {/* Community Discussion */}
              <section>
                <h2 className="text-2xl font-semibold mb-2">
                  💬 Community Discussion
                </h2>
                <p className="text-muted-foreground mb-6">
                  Share your experience and learn from others
                </p>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Join the conversation about {job.name}!
                      </p>
                      <Link
                        to="/jobs/$slug/discussion"
                        params={{ slug: job.slug }}
                      >
                        <Button variant="outline">💬 Join Discussion</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Recent Impact Reports */}
              <section>
                <h2 className="text-xl font-semibold mb-4">
                  🔥 Recent Impact Reports
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Real stories from the field
                </p>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground mb-4">
                        No reports yet. Share your experience!
                      </p>
                      <Link to="/login">
                        <Button size="sm" variant="outline">
                          📝 Share Your Story
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Technologies Mentioned */}
              <section>
                <h2 className="text-xl font-semibold mb-4">
                  🤖 Technologies Mentioned
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  From community reports
                </p>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        No technologies tagged yet
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* What Protects This Job */}
              <section>
                <h2 className="text-xl font-semibold mb-4">
                  🛡️ What Protects This Job
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  These unsolved capabilities keep this job safe
                </p>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Get unique unsolved capabilities from all tasks */}
                      {Array.from(
                        new Set(
                          tasks.flatMap((t: any) =>
                            t.capabilityRequirements
                              .filter(
                                (r: any) =>
                                  r.capabilitySubtype?.progressPercentage < 70,
                              )
                              .map((r: any) => r.capabilitySubtype),
                          ),
                        ),
                      ).map((subtype: any, idx: number) => (
                        <div
                          key={idx}
                          className="pb-3 border-b border-border/40 last:border-0"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Link
                              to="/capabilities/$slug/$subslug"
                              params={{
                                slug:
                                  subtype?.capability?.slug ||
                                  'medical-reasoning',
                                subslug: subtype?.slug || 'diagnosis',
                              }}
                              className="text-sm font-medium hover:text-primary transition-colors"
                            >
                              {subtype?.name || 'Unknown Capability'}
                            </Link>
                            <span
                              className={`text-xs ${getCapabilityProgressColor(subtype?.progressPercentage || 0)}`}
                            >
                              {subtype?.progressPercentage || 0}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Required by this job
                          </p>
                          <Link
                            to="/capabilities/$slug/$subslug"
                            params={{
                              slug:
                                subtype?.capability?.slug ||
                                'medical-reasoning',
                              subslug: subtype?.slug || 'diagnosis',
                            }}
                            className="text-xs text-primary hover:underline mt-1 inline-block"
                          >
                            Learn why AI struggles →
                          </Link>
                        </div>
                      ))}

                      {tasks.every(
                        (t: any) =>
                          !t.capabilityRequirements?.some(
                            (r: any) =>
                              r.capabilitySubtype?.progressPercentage < 70,
                          ),
                      ) && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          All capabilities for this job are relatively solved
                          (70%+ progress)
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </div>

        {/* CTA */}
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-semibold mb-4">
                🚀 Contribute Your Experience
              </h2>
              <p className="text-muted-foreground mb-6">
                Work in {job.name.toLowerCase()}? Share what you're seeing with
                the community.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link to="/login">
                  <Button>📝 Share Your Story</Button>
                </Link>
                <Link to="/jobs/$slug/discussion" params={{ slug: job.slug }}>
                  <Button variant="outline">💬 Join Discussion</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
