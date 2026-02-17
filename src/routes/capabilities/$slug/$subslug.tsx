import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getSubtypeBySlugFn } from '@/actions/capabilities'

export const Route = createFileRoute('/capabilities/$slug/$subslug')({
  component: CapabilitySubtypePage,
  loader: async ({ params }) => {
    const result = await getSubtypeBySlugFn({ data: { slug: params.subslug } })
    if (!result.success || !result.data) {
      throw notFound()
    }
    return result
  },
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading subtype...</p>
      </div>
    </div>
  ),
})

function CapabilitySubtypePage() {
  const result = Route.useLoaderData()

  const subtype = result.data
  const parentCapability = subtype.parentCapability

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solved':
      case 'Solved':
        return 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
      case 'partial':
      case 'Partial':
        return 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
      case 'unsolved':
      case 'Unsolved':
        return 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
      default:
        return ''
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'solved':
      case 'Solved':
        return '✅'
      case 'partial':
      case 'Partial':
        return '⚠️'
      case 'unsolved':
      case 'Unsolved':
        return '❌'
      default:
        return ''
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-red-500'
    if (risk >= 40) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getRiskIcon = (risk: number) => {
    if (risk >= 70) return '🔴'
    if (risk >= 40) return '⚠️'
    return '🟢'
  }

  const statusTitle =
    subtype.status.charAt(0).toUpperCase() + subtype.status.slice(1)

  return (
    <div className="min-h-svh flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                OM
              </span>
            </div>
            <span className="font-semibold text-lg">OpenModal</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              to="/capabilities"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Capabilities
            </Link>
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link to="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border/40">
        <div className="container mx-auto px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              to="/capabilities"
              className="hover:text-foreground transition-colors"
            >
              Capabilities
            </Link>
            {parentCapability && (
              <>
                <span>/</span>
                <Link
                  to="/capabilities/$slug"
                  params={{ slug: parentCapability.slug }}
                  className="hover:text-foreground transition-colors"
                >
                  {parentCapability.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground">{subtype.name}</span>
          </nav>
        </div>
      </div>

      <main className="flex-1">
        {/* Subtype Header */}
        <section className="border-b border-border/40 bg-muted/30">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-3xl">
              {parentCapability && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span>Part of:</span>
                  <Link
                    to="/capabilities/$slug"
                    params={{ slug: parentCapability.slug }}
                    className="text-primary hover:underline"
                  >
                    {parentCapability.name} (
                    {parentCapability.category.charAt(0).toUpperCase() +
                      parentCapability.category.slice(1)}
                    )
                  </Link>
                </div>
              )}

              <h1 className="text-3xl md:text-4xl font-semibold mb-4">
                {subtype.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Progress:
                  </span>
                  <span className="font-semibold">
                    {subtype.progressPercentage}%
                  </span>
                </div>
                <Progress
                  value={subtype.progressPercentage}
                  className="w-32 h-2"
                />
                <Badge
                  variant="outline"
                  className={getStatusColor(subtype.status)}
                >
                  {getStatusIcon(subtype.status)} {statusTitle}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  • {subtype.domain}
                </span>
              </div>

              <p className="text-muted-foreground">{subtype.description}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {new Date(subtype.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </section>

        {/* Current State */}
        <section className="container mx-auto px-6 py-12">
          <h2 className="text-2xl font-semibold mb-8">📊 Current State</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subtype.whatWorks.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">✅ What AI Can Do Well</h3>
                  <ul className="space-y-2">
                    {subtype.whatWorks.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {subtype.whatStruggles.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">
                    ⚠️ What AI Struggles With
                  </h3>
                  <ul className="space-y-2">
                    {subtype.whatStruggles.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {subtype.whatDoesntWork.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">
                    ❌ What AI Cannot Do Yet
                  </h3>
                  <ul className="space-y-2">
                    {subtype.whatDoesntWork.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Technologies and Jobs */}
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Technologies */}
              <div>
                <h2 className="text-xl font-semibold mb-4">🤖 Technologies</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  With this capability:
                </p>

                {subtype.technologies.length > 0 ? (
                  <>
                    <div className="space-y-3 mb-6">
                      {subtype.technologies.map((tech: any) => (
                        <Card key={tech.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{tech.name}</h3>
                                {tech.performanceScore && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-muted-foreground">
                                      Score: {tech.performanceScore}%
                                    </span>
                                    <Progress
                                      value={tech.performanceScore}
                                      className="w-16 h-1.5"
                                    />
                                  </div>
                                )}
                              </div>
                              <Button variant="outline" size="sm">
                                View →
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <Link
                      to="/login"
                      className="text-sm text-primary hover:underline"
                    >
                      View all technologies →
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No technologies found for this subtype yet.
                  </p>
                )}
              </div>

              {/* Jobs */}
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  💼 Jobs Requiring This
                </h2>

                {subtype.jobs.length > 0 ? (
                  <>
                    <div className="space-y-3 mb-6">
                      {subtype.jobs.map((job: any) => (
                        <Card key={job.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{job.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {job.importance.charAt(0).toUpperCase() +
                                    job.importance.slice(1)}{' '}
                                  requirement
                                </p>
                              </div>
                              {job.automationRiskPercentage && (
                                <div className="flex items-center gap-2">
                                  <span
                                    className={getRiskColor(
                                      job.automationRiskPercentage,
                                    )}
                                  >
                                    {getRiskIcon(job.automationRiskPercentage)}{' '}
                                    {job.automationRiskPercentage}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <Link
                      to="/login"
                      className="text-sm text-primary hover:underline"
                    >
                      View all jobs →
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No jobs found for this subtype yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Organizations */}
        <section className="container mx-auto px-6 py-12">
          <h2 className="text-2xl font-semibold mb-4">
            🏢 Organizations Working on This
          </h2>

          {subtype.organizations.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {subtype.organizations.map((org: any) => (
                  <Card key={org.id}>
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold mb-2">{org.name}</h3>
                      {org.productName && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {org.productName}
                        </p>
                      )}
                      <Button variant="outline" size="sm">
                        View →
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Link
                to="/login"
                className="text-sm text-primary hover:underline"
              >
                View all organizations →
              </Link>
            </>
          ) : (
            <p className="text-muted-foreground">
              No organizations found for this subtype yet.
            </p>
          )}
        </section>

        {/* CTA */}
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-semibold mb-4">🚀 Contribute</h2>
              <p className="text-muted-foreground mb-6">
                See AI {subtype.name.toLowerCase()} in action at work? Share
                your experience with the community.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link to="/signup">
                  <Button>📝 Share Your Story</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline">💬 Join Discussion</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">
                  OM
                </span>
              </div>
              <span className="text-sm text-muted-foreground">OpenModal</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
