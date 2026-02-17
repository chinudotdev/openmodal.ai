import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  getAllCapabilitiesFn,
  getOverallProgressFn,
} from '@/actions/capabilities'

export const Route = createFileRoute('/capabilities/')({
  component: CapabilitiesPage,
  loader: async () => {
    const [capabilitiesResult, progressResult] = await Promise.all([
      getAllCapabilitiesFn(),
      getOverallProgressFn(),
    ])

    if (!capabilitiesResult.success) {
      throw redirect({
        to: '/',
      })
    }

    return {
      capabilities: capabilitiesResult.data,
      overallProgress: progressResult.data,
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

  const categories = ['Cognitive', 'Physical', 'Social', 'Meta']

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
    <div className="min-h-svh flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
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
              className="text-sm font-medium hover:text-foreground transition-colors"
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

      <main className="flex-1">
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

              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Filter by:
                </span>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      // TODO: Implement filtering
                    }}
                  >
                    {category}
                  </Button>
                ))}
              </div>
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
                          <p className="text-xs text-muted-foreground capitalize">
                            {capability.category}
                          </p>
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
                      AI is making steady progress, but significant gaps remain
                      in physical, social, and domain-specific reasoning.
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
              Have firsthand experience with AI capabilities in your field?
              Share your story and help build the most comprehensive database of
              AI's real-world impact.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/signup">
                <Button>📝 Share Your Story</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline">📄 View Reports</Button>
              </Link>
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
