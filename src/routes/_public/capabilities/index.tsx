import { Link, createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  getAllCapabilitiesFn,
  getOverallProgressFn,
} from '@/actions/capabilities'

export const Route = createFileRoute('/_public/capabilities/')({
  component: CapabilitiesPage,
  loader: async () => {
    const [capabilities, overallProgress] = await Promise.all([
      getAllCapabilitiesFn(),
      getOverallProgressFn(),
    ])

    return {
      capabilities,
      overallProgress,
    }
  },
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading capabilities...</p>
      </div>
    </div>
  ),
})

function CapabilitiesPage() {
  const { capabilities, overallProgress } = Route.useLoaderData()

  // Transform data for display
  const capabilitiesList = capabilities.map((cap) => ({
    ...cap,
    status: cap.status.charAt(0).toUpperCase() + cap.status.slice(1),
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Solved':
        return 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
      case 'Partial':
        return 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
      case 'Unsolved':
        return 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
      default:
        return ''
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Solved':
        return '✅'
      case 'Partial':
        return '⚠️'
      case 'Unsolved':
        return '❌'
      default:
        return ''
    }
  }

  return (
    <>
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
              AI Capabilities
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Track what AI can and can't do across different domains. See how
              capabilities are progressing and which jobs they affect.
            </p>
          </div>
        </div>
      </section>

      {/* Capabilities List */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilitiesList.map((capability) => (
            <Link
              key={capability.slug}
              to="/capabilities/$slug"
              params={{ slug: capability.slug }}
              className="group"
            >
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {capability.icon || '🔷'}
                      </span>
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {capability.name}
                        </h3>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(capability.status)}
                    >
                      {getStatusIcon(capability.status)} {capability.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {capability.description}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          Overall Progress
                        </span>
                        <span className="text-xs font-medium">
                          {capability.progress}%
                        </span>
                      </div>
                      <Progress value={capability.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                      <span>{capability.subtypesCount} subtypes</span>
                      <span>View details →</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Overall Progress */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">
              Overall AGI Progress
            </h2>
            <p className="text-muted-foreground mb-8">
              Average progress across all capability domains
            </p>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {capabilitiesList.map((cap) => (
                    <div key={cap.slug}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {cap.icon || '🔷'} {cap.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {cap.progress}%
                        </span>
                      </div>
                      <Progress value={cap.progress} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-border/40 text-center">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Average Progress: {overallProgress.overall}%
                    </span>
                    <br />
                    AI is making steady progress, but significant gaps remain in
                    domain-specific reasoning and real-world applications.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Contribute Your Knowledge
          </h2>
          <p className="text-muted-foreground mb-6">
            Have firsthand experience with AI capabilities in your field? Share
            your story and help build the most comprehensive database of AI's
            real-world impact.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/login">
              <Button>📝 Share Your Story</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">📄 View Reports</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
