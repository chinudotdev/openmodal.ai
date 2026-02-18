import { Link, createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/_public/technologies/')({
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
  // Mock data - TODO: Replace with real data fetching
  const technologies = [
    {
      id: '1',
      slug: 'gpt-4',
      name: 'GPT-4',
      type: 'Language Model',
      organization: 'OpenAI',
      stage: 'Production',
      icon: '🤖',
    },
    {
      id: '2',
      slug: 'claude',
      name: 'Claude',
      type: 'Language Model',
      organization: 'Anthropic',
      stage: 'Production',
      icon: '🧠',
    },
    {
      id: '3',
      slug: 'dall-e',
      name: 'DALL-E',
      type: 'Image Generation',
      organization: 'OpenAI',
      stage: 'Production',
      icon: '🎨',
    },
  ]

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Production':
        return 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
      case 'Beta':
        return 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
      case 'Research':
        return 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20'
      default:
        return ''
    }
  }

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
              to="/technologies"
              className="text-sm font-medium hover:text-foreground transition-colors"
            >
              Technologies
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
                AI Technologies
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Explore the AI systems and models powering today's capabilities.
                Track their development and compare their performance.
              </p>
            </div>
          </div>
        </section>

        {/* Technologies List */}
        <section className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech) => (
              <Link key={tech.id} to="/technologies" className="group">
                <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{tech.icon}</span>
                        <div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {tech.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {tech.organization}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={getStageColor(tech.stage)}
                      >
                        {tech.stage}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Type: {tech.type}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                        <span>View details →</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Track AI Development
            </h2>
            <p className="text-muted-foreground mb-6">
              Stay updated on the latest AI technologies and their capabilities.
              Compare performance and find the right tools for your needs.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/signup">
                <Button>📝 Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline">🔍 Explore</Button>
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
