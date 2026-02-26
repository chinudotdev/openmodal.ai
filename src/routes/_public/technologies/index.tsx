import { Link, createFileRoute } from '@tanstack/react-router'

import { getAllTechnologiesFn } from '@/actions/technologies'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/_public/technologies/')({
  loader: async () => {
    const { technologies } = await getAllTechnologiesFn({ data: {} })
    return { technologies }
  },
  component: TechnologiesPage,
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading technologies...</p>
      </div>
    </div>
  ),
})

function TechnologiesPage() {
  const { technologies } = Route.useLoaderData()

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'deployed':
        return 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
      case 'pilot':
        return 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
      case 'research':
        return 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20'
      case 'discontinued':
        return 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/20'
      default:
        return ''
    }
  }

  const formatType = (type: string) => {
    return type
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatStage = (stage: string) => {
    return stage
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <>
      {/* Hero Section */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
              AI Technologies
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Explore the AI systems and models powering today's capabilities.
              Track their development and compare their performance.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>{technologies.length} technologies tracked</span>
              <span>•</span>
              <span>Real-world impact reports</span>
              <span>•</span>
              <span>Capability performance data</span>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies List */}
      <section className="container mx-auto px-6 py-12">
        {technologies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-6">No technologies found.</p>
            <Link to="/">
              <Button>Back Home</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech: any) => (
              <Link
                key={tech.id}
                to="/technologies/$slug"
                params={{ slug: tech.slug }}
                className="group"
              >
                <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {tech.image ? (
                          <img
                            src={tech.image}
                            alt={tech.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                            🤖
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                            {tech.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {tech.organization.name}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          getStageColor(tech.stage) + ' flex-shrink-0 ml-2'
                        }
                      >
                        {formatStage(tech.stage)}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {tech.description}
                    </p>

                    <div className="space-y-2">
                      <p className="text-sm">
                        Type:{' '}
                        <span className="font-medium">
                          {formatType(tech.type)}
                        </span>
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                        <span>{tech._count.reports} reports</span>
                        <span>View details →</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Contribute to the Knowledge Base
          </h2>
          <p className="text-muted-foreground mb-6">
            Have experience with AI technologies? Share your insights and help
            build the most comprehensive database of AI tools and their
            capabilities.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/dashboard/suggestions"
              search={{ type: 'technology', mode: 'new', name: '', id: '' }}
            >
              <Button>📝 Contribute</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
