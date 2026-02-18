import { Link, createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_public/about')({
  component: RouteComponent,
})

function RouteComponent() {
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
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Capabilities
            </Link>
            <Link
              to="/jobs"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Jobs
            </Link>
            <Link
              to="/technologies"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Technologies
            </Link>
            <Link
              to="/reports"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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

      {/* Main Content */}
      <main className="flex-1">
        <section className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-8">
              About OpenModal
            </h1>

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg text-muted-foreground mb-6">
                OpenModal is a community-driven platform that tracks AI's
                real-world impact on jobs and capabilities. Unlike generic AI
                information sites, our value comes from{' '}
                <strong>unique, crowdsourced data</strong> that AI cannot
                replicate.
              </p>

              <h2 className="text-2xl font-semibold mt-12 mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-6">
                We believe that workers deserve accurate, verifiable information
                about how AI is affecting their jobs and careers. Corporate
                press releases and AI speculation don't tell the full story —
                real workers on the ground do.
              </p>

              <h2 className="text-2xl font-semibold mt-12 mb-4">
                What Makes Us Different
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="font-semibold mb-2">Real Worker Stories</h3>
                  <p className="text-sm text-muted-foreground">
                    Firsthand accounts from people actually experiencing AI
                    changes in their workplace
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="font-semibold mb-2">
                    Domain-Specific Tracking
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We track AI progress by industry and domain, not just
                    general capabilities
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="font-semibold mb-2">Community Verified</h3>
                  <p className="text-sm text-muted-foreground">
                    Multiple sources and community voting create trustworthy
                    data
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="font-semibold mb-2">Transparent</h3>
                  <p className="text-sm text-muted-foreground">
                    All sources, evidence, and verification status visible to
                    users
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-semibold mt-12 mb-4">
                Who Is This For?
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    <strong>Workers:</strong> Verified data for career
                    decisions, not just AI opinion
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    <strong>Career Counselors:</strong> Defensible, sourced data
                    for client advice
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    <strong>Journalists:</strong> Real cases, quotes, and
                    verifiable claims
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    <strong>Researchers:</strong> Structured datasets with
                    domain-level insights
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    <strong>Policy Makers:</strong> Evidence-based insights by
                    industry
                  </span>
                </li>
              </ul>

              <h2 className="text-2xl font-semibold mt-12 mb-4">Join Us</h2>
              <p className="text-muted-foreground mb-6">
                We're currently in early access and building our community. Join
                the waitlist to be among the first to access the platform and
                help us build the most comprehensive database of AI's real-world
                impact.
              </p>
              <Link to="/signup">
                <Button size="lg">Join Waitlist</Button>
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
