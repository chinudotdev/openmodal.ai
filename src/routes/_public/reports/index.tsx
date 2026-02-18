import { Link, createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/_public/reports/')({
  component: ReportsPage,
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    </div>
  ),
})

function ReportsPage() {
  // Mock data - TODO: Replace with real data fetching
  const reports = [
    {
      id: '1',
      title: 'AI in Healthcare Diagnostics',
      type: 'Research',
      author: 'Dr. Jane Smith',
      createdAt: '2024-01-15',
      verifications: 24,
      status: 'verified',
    },
    {
      id: '2',
      title: 'Customer Service Automation',
      type: 'Deployment',
      author: 'John Doe',
      createdAt: '2024-01-10',
      verifications: 18,
      status: 'verified',
    },
    {
      id: '3',
      title: 'Legal Document Analysis',
      type: 'Barrier',
      author: 'Sarah Johnson',
      createdAt: '2024-01-05',
      verifications: 12,
      status: 'pending',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
      case 'disputed':
        return 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
      default:
        return ''
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Research':
        return '🔬'
      case 'Deployment':
        return '🚀'
      case 'Barrier':
        return '🚧'
      default:
        return '📄'
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
              to="/reports"
              className="text-sm font-medium hover:text-foreground transition-colors"
            >
              Reports
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
                Community Reports
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Real-world experiences with AI capabilities. Browse verified
                reports from the community and contribute your own insights.
              </p>
              <div className="flex items-center gap-4">
                <Link to="/signup">
                  <Button>📝 Submit Report</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Reports List */}
        <section className="container mx-auto px-6 py-12">
          <div className="space-y-6">
            {reports.map((report) => (
              <Link
                key={report.id}
                to="/reports"
                className="group block"
              >
                <Card className="transition-all hover:shadow-lg hover:border-primary/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl">
                            {getTypeIcon(report.type)}
                          </span>
                          <Badge variant="outline">{report.type}</Badge>
                          <Badge
                            variant="outline"
                            className={getStatusColor(report.status)}
                          >
                            {report.status.charAt(0).toUpperCase() +
                              report.status.slice(1)}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-2">
                          {report.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          By {report.author} •{' '}
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-muted-foreground">
                          {report.verifications} verifications
                        </p>
                        <span className="text-sm text-primary">
                          View →
                        </span>
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
              Share Your Experience
            </h2>
            <p className="text-muted-foreground mb-6">
              Have firsthand experience with AI capabilities? Share your
              insights and help others understand what AI can really do.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/signup">
                <Button>📝 Submit Report</Button>
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
