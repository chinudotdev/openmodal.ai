import { Link, createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_public/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-svh flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                OM
              </span>
            </div>
            <span className="font-semibold text-lg">OpenModal</span>
          </div>
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

      {/* Hero */}
      <main className="flex-1">
        <section className="container mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-muted-foreground text-xs mb-8">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span>Currently in Early Access</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
              Track AI's Real
              <br />
              <span className="text-primary">Impact on Work</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A community-driven platform tracking how AI is actually affecting
              jobs and capabilities. Real stories from workers, not AI
              speculation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto min-w-[200px]">
                  Join Waitlist
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Stats / Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-border/40">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-semibold mb-2">
                  Real Stories
                </div>
                <p className="text-sm text-muted-foreground">
                  Worker-reported impact stories, not speculation
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-semibold mb-2">
                  Domain-Specific
                </div>
                <p className="text-sm text-muted-foreground">
                  Track AI progress by industry and domain
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-semibold mb-2">
                  Community Driven
                </div>
                <p className="text-sm text-muted-foreground">
                  Crowdsourced data AI cannot replicate
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Track */}
        <section className="bg-muted/30 py-20 md:py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">
                What We Track
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-background rounded-xl p-6 border border-border/50">
                  <div className="font-semibold mb-2">Impact Reports</div>
                  <p className="text-sm text-muted-foreground">
                    Real-world stories from workers about how AI is affecting
                    their jobs
                  </p>
                </div>
                <div className="bg-background rounded-xl p-6 border border-border/50">
                  <div className="font-semibold mb-2">Capabilities</div>
                  <p className="text-sm text-muted-foreground">
                    Domain-specific tracking of what AI can and can't do
                  </p>
                </div>
                <div className="bg-background rounded-xl p-6 border border-border/50">
                  <div className="font-semibold mb-2">Jobs at Risk</div>
                  <p className="text-sm text-muted-foreground">
                    Data-driven analysis of automation risk by occupation
                  </p>
                </div>
                <div className="bg-background rounded-xl p-6 border border-border/50">
                  <div className="font-semibold mb-2">Discussions</div>
                  <p className="text-sm text-muted-foreground">
                    Community conversations on real-world AI deployments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                Join the Waitlist
              </h2>
              <p className="text-muted-foreground mb-8">
                Be among the first to access our platform. Help us build the
                most comprehensive database of AI's real-world impact.
              </p>
              <Link to="/signup">
                <Button size="lg" className="min-w-[200px]">
                  Get Early Access
                </Button>
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
