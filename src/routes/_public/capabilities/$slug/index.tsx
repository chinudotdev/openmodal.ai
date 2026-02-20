import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getCapabilityBySlugFn } from '@/actions/capabilities'

export const Route = createFileRoute('/_public/capabilities/$slug/')({
  component: CapabilityPage,
  loader: async ({ params }) => {
    const result = await getCapabilityBySlugFn({ data: { slug: params.slug } })
    if (!result) {
      throw notFound()
    }
    return { data: result }
  },
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading capability...</p>
      </div>
    </div>
  ),
})

function CapabilityPage() {
  const result = Route.useLoaderData()

  const { subtypes, ...capability } = result.data

  // Calculate overall progress from subtypes
  const overallProgress = Math.round(
    subtypes.reduce((sum: number, s: any) => sum + s.progressPercentage, 0) /
      subtypes.length,
  )

  // Determine overall status
  let overallStatus: 'solved' | 'partial' | 'unsolved' = 'unsolved'
  if (overallProgress >= 80) overallStatus = 'solved'
  else if (overallProgress >= 30) overallStatus = 'partial'

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

  const statusTitle =
    overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)

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
              to="/capabilities"
              className="hover:text-foreground transition-colors"
            >
              Capabilities
            </Link>
            <span>/</span>
            <span className="text-foreground">{capability.name}</span>
          </nav>
        </div>
      </div>

      <main className="flex-1">
        {/* Capability Header */}
        <section className="border-b border-border/40 bg-muted/30">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{capability.icon || '🔷'}</span>
                <h1 className="text-3xl md:text-4xl font-semibold">
                  {capability.name}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Overall Progress:
                  </span>
                  <span className="font-semibold">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="w-32 h-2" />
                <Badge
                  variant="outline"
                  className={getStatusColor(overallStatus)}
                >
                  {getStatusIcon(overallStatus)} {statusTitle}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {subtypes.length} domains tracked
                </span>
              </div>

              <p className="text-muted-foreground">{capability.description}</p>
            </div>
          </div>
        </section>

        {/* Subtypes Section */}
        <section className="container mx-auto px-6 py-12">
          <h2 className="text-2xl font-semibold mb-2">
            {capability.name} by Domain
          </h2>
          <p className="text-muted-foreground mb-8">
            Progress varies dramatically across different fields:
          </p>

          <div className="grid grid-cols-1 gap-6 mb-8">
            {subtypes.map((subtype: any) => {
              const subtypeStatus =
                subtype.status.charAt(0).toUpperCase() + subtype.status.slice(1)
              return (
                <Card key={subtype.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold">
                            {subtype.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className={getStatusColor(subtype.status)}
                          >
                            {getStatusIcon(subtype.status)} {subtypeStatus}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            • {subtype.domain}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-sm text-muted-foreground">
                            Progress:
                          </span>
                          <span className="font-semibold">
                            {subtype.progressPercentage}%
                          </span>
                          <Progress
                            value={subtype.progressPercentage}
                            className="w-24 h-2"
                          />
                        </div>

                        {subtype.whatWorks && subtype.whatWorks.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium mb-2">
                              ✅ What works:
                            </p>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                              {subtype.whatWorks
                                .slice(0, 3)
                                .map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ))}
                              {subtype.whatWorks.length > 3 && (
                                <li className="text-xs">
                                  +{subtype.whatWorks.length - 3} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {subtype.whatStruggles.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium mb-2">
                              ⚠️ What struggles:
                            </p>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                              {subtype.whatStruggles
                                .slice(0, 3)
                                .map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ))}
                              {subtype.whatStruggles.length > 3 && (
                                <li className="text-xs">
                                  +{subtype.whatStruggles.length - 3} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>

                      <Link
                        to="/capabilities/$slug/$subslug"
                        params={{
                          slug: capability.slug,
                          subslug: subtype.slug,
                        }}
                      >
                        <Button variant="outline">View full details →</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {subtypes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No subtypes found for this capability yet.
              </p>
            </div>
          )}
        </section>

        {/* Progress Comparison */}
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-semibold mb-4">
              📈 Progress Comparison
            </h2>
            <p className="text-muted-foreground mb-8">
              How {capability.name.toLowerCase()} capabilities compare across
              domains:
            </p>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {subtypes.map((subtype: any) => (
                    <div key={subtype.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {subtype.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {subtype.progressPercentage}%
                        </span>
                      </div>
                      <Progress
                        value={subtype.progressPercentage}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>

                {subtypes.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border/40">
                    <p className="text-sm text-muted-foreground">
                      Average progress: {overallProgress}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-semibold mb-4">🚀 Contribute</h2>
              <p className="text-muted-foreground mb-6">
                See AI {capability.name.toLowerCase()} in action at work? Share
                your experience with the community.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link to="/login">
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
    </>
  )
}
