import { Link, createFileRoute } from '@tanstack/react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_public/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      {/* Hero */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-muted-foreground text-xs mb-8">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            <span>Currently in Beta</span>
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
            jobs and capabilities. Real insights from workers, not AI
            speculation.
          </p>

          {/* Beta Notice */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <span className="font-semibold">🚧 Beta Release:</span> We're
                actively building this platform. Most capabilities, jobs, and
                technologies are not yet mapped. Help us build the most
                comprehensive database by contributing your knowledge!
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/capabilities" search={() => ({})}>
              <Button size="lg" className="w-full sm:w-auto min-w-[200px]">
                Explore Data
              </Button>
            </Link>
            <a
              href="https://discord.gg/bBsF3MjA9"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto min-w-[200px]"
              >
                Join Discord
              </Button>
            </a>
          </div>

          {/* Stats / Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-border/40">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-semibold mb-2">
                Real Insights
              </div>
              <p className="text-sm text-muted-foreground">
                Worker-reported experiences, not speculation
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-semibold mb-2">
                Domain-Specific
              </div>
              <p className="text-sm text-muted-foreground">
                Track AI progress by industry and capability
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
            <div className="flex items-center justify-center gap-2 mb-4">
              <h2 className="text-2xl md:text-3xl font-semibold text-center">
                What We Track
              </h2>
              <Badge variant="secondary">Growing</Badge>
            </div>
            <p className="text-center text-muted-foreground mb-12">
              Help us build this knowledge base by contributing your experiences
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                to="/reports"
                search={{
                  impactType: undefined,
                  country: undefined,
                  companySize: undefined,
                  search: undefined,
                  sort: 'recent',
                }}
                className="bg-background rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div className="font-semibold mb-2">📊 Impact Reports</div>
                <p className="text-sm text-muted-foreground">
                  Real-world stories from workers about how AI is affecting
                  their jobs
                </p>
              </Link>
              <Link
                to="/capabilities"
                search={() => ({})}
                className="bg-background rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div className="font-semibold mb-2">🏥 Capabilities</div>
                <p className="text-sm text-muted-foreground">
                  Domain-specific tracking of what AI can and can't do
                </p>
              </Link>
              <Link
                to="/jobs"
                search={{
                  page: 1,
                  limit: 12,
                  category: 'all',
                  riskLevel: 'all',
                  search: '',
                  sortBy: 'name',
                }}
                className="bg-background rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div className="font-semibold mb-2">💼 Jobs</div>
                <p className="text-sm text-muted-foreground">
                  Data-driven analysis of automation risk by occupation
                </p>
              </Link>
              <Link
                to="/discussions"
                search={{
                  entityType: undefined,
                  search: undefined,
                  sort: 'recent',
                  timeRange: undefined,
                  page: 1,
                }}
                className="bg-background rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div className="font-semibold mb-2">💬 Discussions</div>
                <p className="text-sm text-muted-foreground">
                  Community conversations on real-world AI deployments
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contribute CTA */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Help Build the Knowledge Base
            </h2>
            <p className="text-muted-foreground mb-8">
              This is a community project. Every contribution helps us better
              understand AI's real-world impact. Share your experience with AI
              in your field.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard/suggestions"
                search={{ type: 'capability', mode: 'new', name: '', id: '' }}
              >
                <Button size="lg" className="min-w-[200px]">
                  📝 Contribute
                </Button>
              </Link>
              <Link to="/technologies" search={() => ({})}>
                <Button size="lg" variant="outline" className="min-w-[200px]">
                  Browse Technologies
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="bg-muted/30 py-20 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Join Our Community
            </h2>
            <p className="text-muted-foreground mb-8">
              Connect with others tracking AI's impact. Share insights, ask
              questions, and help shape the future of this platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://discord.gg/bBsF3MjA9"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="min-w-[200px]">
                  Join Discord Server
                </Button>
              </a>
              <a
                href="https://github.com/chinudotdev/openmodal.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="min-w-[200px]">
                  View on GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
