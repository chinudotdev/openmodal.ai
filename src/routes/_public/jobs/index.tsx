import { Link, createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export const Route = createFileRoute('/_public/jobs/')({
  component: JobsPage,
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading jobs...</p>
      </div>
    </div>
  ),
})

function JobsPage() {
  // Mock data - TODO: Replace with real data fetching
  const jobs = [
    {
      id: '1',
      slug: 'software-developer',
      name: 'Software Developer',
      category: 'Technology',
      automationRiskPercentage: 45,
      riskLevel: 'medium',
      icon: '💻',
    },
    {
      id: '2',
      slug: 'data-scientist',
      name: 'Data Scientist',
      category: 'Technology',
      automationRiskPercentage: 35,
      riskLevel: 'low',
      icon: '📊',
    },
    {
      id: '3',
      slug: 'content-writer',
      name: 'Content Writer',
      category: 'Creative',
      automationRiskPercentage: 65,
      riskLevel: 'high',
      icon: '✍️',
    },
  ]

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-red-500'
    if (risk >= 40) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getRiskLabel = (risk: number) => {
    if (risk >= 70) return 'High Risk'
    if (risk >= 40) return 'Medium Risk'
    return 'Low Risk'
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
              to="/jobs"
              className="text-sm font-medium hover:text-foreground transition-colors"
            >
              Jobs
            </Link>
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link to="/login">
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
                Jobs at Risk of Automation
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Understand which jobs are most affected by AI capabilities and
                automation. Track how the job market is evolving.
              </p>
            </div>
          </div>
        </section>

        {/* Jobs List */}
        <section className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Link key={job.id} to="/jobs" className="group">
                <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{job.icon}</span>
                        <div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {job.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {job.category}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={getRiskColor(job.automationRiskPercentage)}
                      >
                        {getRiskLabel(job.automationRiskPercentage)}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">
                            Automation Risk
                          </span>
                          <span
                            className={`text-xs font-medium ${getRiskColor(job.automationRiskPercentage)}`}
                          >
                            {job.automationRiskPercentage}%
                          </span>
                        </div>
                        <Progress
                          value={job.automationRiskPercentage}
                          className="h-2"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                        <span>View analysis →</span>
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
              Track Your Job's Future
            </h2>
            <p className="text-muted-foreground mb-6">
              Stay informed about how AI is affecting your profession. Get
              personalized insights and recommendations.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/login">
                <Button>📝 Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline">💼 Sign In</Button>
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
