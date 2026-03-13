import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

type Tab = 'question' | 'problem' | 'track' | 'who' | 'matters'

export const Route = createFileRoute('/_public/about')({
  head: () => ({
    meta: [
      {
        title: 'About OpenModal - An Observatory for AI\'s Real-World Impact',
      },
      {
        name: 'description',
        content:
          'OpenModal is a community-driven observatory tracking AI\'s real-world impact on humans. Learn what we track, who it\'s for, and why it matters.',
      },
      // Open Graph
      {
        property: 'og:title',
        content: 'About OpenModal - An Observatory for AI\'s Real-World Impact',
      },
      {
        property: 'og:description',
        content:
          'OpenModal is a community-driven observatory tracking AI\'s real-world impact on humans.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://openmodal.ai/about' },
      { property: 'og:site_name', content: 'OpenModal' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      {
        name: 'twitter:title',
        content: 'About OpenModal - An Observatory for AI\'s Real-World Impact',
      },
      {
        name: 'twitter:description',
        content:
          'OpenModal is a community-driven observatory tracking AI\'s real-world impact on humans.',
      },
    ],
  }),
  component: RouteComponent,
})

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'question', label: 'The Question' },
  { id: 'problem', label: 'The Problem' },
  { id: 'track', label: 'What We Track' },
  { id: 'who', label: "Who It's For" },
  { id: 'matters', label: 'Why It Matters' },
]

function RouteComponent() {
  const [activeTab, setActiveTab] = useState<Tab>('question')

  return (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-medium tracking-widest uppercase text-primary mb-5">
            About OpenModal
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight mb-6">
            An observatory for AI's
            <span className="italic text-muted-foreground">
              {' '}
              real-world impact
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            Community-driven. Evidence-based. Built for the people who need to
            understand what AI is actually doing — not what everyone is
            predicting.
          </p>
        </div>
      </section>

      {/* Tabbed Content Section */}
      <section className="container mx-auto px-6 pb-6 md:pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-12">
            {/* Sidebar */}
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    text-left px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                    ${
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Panel */}
            <div className="min-h-[320px]">
              {activeTab === 'question' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-2xl font-semibold mb-6">The Question</h2>
                  <p className="text-xl md:text-2xl leading-relaxed text-foreground mb-4">
                    What is AI actually capable of doing right now — what is it
                    doing to people — and what might it be capable of soon?
                  </p>
                  <p className="text-muted-foreground">
                    Not predictions. Not benchmarks. Not speculation. Real
                    evidence, from the people living through it.
                  </p>
                </div>
              )}

              {activeTab === 'problem' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-2xl font-semibold mb-6">The Problem</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      We are approaching one of the most consequential
                      transitions in human history. Researchers debate
                      definitions. Labs publish benchmarks. Policymakers write
                      frameworks.
                    </p>
                    <p>
                      But almost nobody is systematically documenting what AI is{' '}
                      <em className="text-foreground">actually</em> doing to
                      real people, real jobs, and real institutions — right now.
                    </p>
                    <p className="text-primary font-medium">
                      That evidence doesn't exist anywhere. OpenModal builds it.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'track' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-2xl font-semibold mb-6">What We Track</h2>
                  <div className="space-y-6">
                    {[
                      {
                        title: 'Capabilities',
                        desc: 'What AI can genuinely do today — and where it still fails',
                      },
                      {
                        title: 'Deployments',
                        desc: 'Where and how AI is being used in real organizations',
                      },
                      {
                        title: 'Human Impact',
                        desc: "What it's doing to workers, roles, and industries",
                      },
                      {
                        title: 'Advancement',
                        desc: 'How capabilities are progressing, domain by domain',
                      },
                    ].map((item) => (
                      <div key={item.title} className="flex gap-4">
                        <div className="size-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                        <div>
                          <div className="font-medium text-foreground">
                            {item.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'who' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-2xl font-semibold mb-6">Who It's For</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        title: 'Workers',
                        desc: 'Navigating uncertainty about their roles and futures',
                      },
                      {
                        title: 'Students',
                        desc: 'Choosing careers in a rapidly shifting landscape',
                      },
                      {
                        title: 'Researchers',
                        desc: 'Who need ground truth, not speculation',
                      },
                      {
                        title: 'Policymakers',
                        desc: 'Who need evidence to act, not predictions to debate',
                      },
                      {
                        title: 'Educators',
                        desc: "Preparing people for what's actually coming",
                      },
                      {
                        title: 'Everyone',
                        desc: "Trying to understand what's really happening",
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="bg-muted/50 border border-border rounded-lg p-4 hover:border-border transition-colors"
                      >
                        <div className="text-primary font-medium text-sm mb-1">
                          {item.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'matters' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-2xl font-semibold mb-6">
                    Why It Matters
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      The questions downstream of AI — how economies adapt, how
                      education changes, how cultures evolve, who has access and
                      who doesn't — cannot be answered well without an honest,
                      evidence-based picture of where we are right now.
                    </p>
                    <p>
                      The window to build this baseline is narrow. If OpenModal
                      doesn't exist when the transition accelerates, the data
                      simply won't exist. You can't reconstruct it
                      retroactively.
                    </p>
                  </div>
                  <div className="mt-8 pl-5 border-l-2 border-primary">
                    <p className="text-lg italic text-foreground">
                      OpenModal is that foundation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="border-t border-border/50">
        <div className="container mx-auto px-6 pt-8 pb-12 md:pt-10 md:pb-16">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm text-muted-foreground mb-4">
              The platform will evolve. Revenue models will shift. Features will
              change.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              But the question that drives everything never does:
            </p>
            <p className="text-xl italic text-muted-foreground">
              What is AI actually doing — and to whom?
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
