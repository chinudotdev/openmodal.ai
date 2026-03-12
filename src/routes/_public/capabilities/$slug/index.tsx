import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { getCapabilityBySlugFn } from '@/actions/capabilities'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

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
              <h1 className="text-3xl md:text-4xl font-semibold mb-4">
                {capability.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Overall Progress:
                  </span>
                  <span className="font-semibold">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="w-32 h-2" />
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

          <div className="border border-border/40 rounded-md overflow-hidden mb-8">
            {/* Header */}
            <div className="bg-muted/50 flex items-center">
              <div className="flex-1 px-4 py-3">
                <p className="text-sm font-medium">Name</p>
              </div>
              <div className="flex items-center gap-4 px-4 py-3">
                <p className="text-sm font-medium whitespace-nowrap">Progress</p>
                <p className="text-sm font-medium whitespace-nowrap">Status</p>
              </div>
            </div>

            {/* Rows */}
            <div>
              {subtypes.map((subtype: any, index) => {
                const subtypeStatus =
                  subtype.status.charAt(0).toUpperCase() + subtype.status.slice(1)
                return (
                  <Link
                    key={subtype.id}
                    to="/capabilities/$slug/$subslug"
                    params={{
                      slug: capability.slug,
                      subslug: subtype.slug,
                    }}
                    className="group block"
                  >
                    <div className={cn(
                      'flex items-center border-t border-border/40 hover:bg-muted/30 transition-colors',
                      index === subtypes.length - 1 ? '' : 'border-b'
                    )}>
                      <div className="flex-1 px-4 py-3 min-w-0">
                        <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                          {subtype.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {subtype.domain}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {subtype.progressPercentage}%
                          </span>
                          <Progress
                            value={subtype.progressPercentage}
                            className="h-1.5 w-16 sm:w-32 md:w-40 lg:w-60"
                          />
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(subtype.status)} min-w-[100px] justify-center`}
                        >
                          {getStatusIcon(subtype.status)} {subtypeStatus}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {subtypes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No subtypes found for this capability yet.
              </p>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-semibold mb-4">
                Contribute to the Knowledge Base
              </h2>
              <p className="text-muted-foreground mb-6">
                See AI {capability.name.toLowerCase()} in action at work? Share
                your experience with the community.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  to="/dashboard/suggestions"
                  search={{
                    type: 'capability',
                    mode: 'existing',
                    name: capability.name,
                    id: capability.id,
                  }}
                >
                  <Button>📝 Contribute</Button>
                </Link>
                <Link
                  to="/capabilities/$slug/discussion"
                  params={{ slug: capability.slug }}
                >
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
