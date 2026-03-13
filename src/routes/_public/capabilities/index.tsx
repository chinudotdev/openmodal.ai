import { Link, createFileRoute } from '@tanstack/react-router'

import { getAllCapabilitiesFn } from '@/actions/capabilities'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export const Route = createFileRoute('/_public/capabilities/')({
  component: CapabilitiesPage,
  loader: async () => {
    const capabilities = await getAllCapabilitiesFn()

    return {
      capabilities,
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
  const { capabilities } = Route.useLoaderData()

  // Transform data for display
  const capabilitiesList = capabilities.map((cap) => ({
    ...cap,
    status: cap.status.charAt(0).toUpperCase() + cap.status.slice(1),
  }))

  return (
    <>
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
        <div className="border border-border/40 rounded-md overflow-hidden">
          {/* Header */}
          <div className="bg-muted/50 flex items-center">
            <div className="flex-1 px-4 py-3">
              <p className="text-sm font-medium">Name</p>
            </div>
            <div className="flex items-center gap-4 px-4 py-3">
              <p className="text-sm font-medium whitespace-nowrap">Progress</p>
              <p className="text-sm font-medium whitespace-nowrap">Subtypes</p>
              <p className="text-sm font-medium whitespace-nowrap w-8"></p>
            </div>
          </div>

          {/* Rows */}
          <div>
            {capabilitiesList.map((capability, index) => (
              <Link
                key={capability.slug}
                to="/capabilities/$slug"
                params={{ slug: capability.slug }}
                className="group block"
              >
                <div className={cn(
                  'flex items-center hover:bg-muted/30 transition-colors',
                  index === capabilitiesList.length - 1 ? '' : 'border-b border-border/40'
                )}>
                  <div className="flex-1 px-4 py-3 min-w-0">
                    <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                      {capability.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {capability.progress}%
                      </span>
                      <Progress
                        value={capability.progress}
                        className="h-1.5 w-16 sm:w-32 md:w-60 lg:w-80"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {capability.subtypesCount} subtypes
                    </span>
                    <span className="text-muted-foreground group-hover:text-primary transition-colors whitespace-nowrap w-8">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Contribute to the Knowledge Base
          </h2>
          <p className="text-muted-foreground mb-6">
            Have firsthand experience with AI capabilities? Share your insights
            and help build the most comprehensive database of AI's real-world
            impact.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/dashboard/suggestions"
              search={{ type: 'capability', mode: 'new', name: '', id: '' }}
            >
              <Button>📝 Contribute</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
