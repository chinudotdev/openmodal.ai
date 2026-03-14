import { createFileRoute, Link } from '@tanstack/react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_public/')({
  head: () => ({
    meta: [
      {
        title: "OpenModal | Track AI's Real-World Impact",
      },
      {
        name: 'description',
        content:
          "OpenModal tracks AI's real-world capabilities and human impact — through verified evidence, not analyst predictions",
      },
      // Open Graph
      {
        property: 'og:title',
        content: "OpenModal | Track AI's Real-World Impact",
      },
      {
        property: 'og:description',
        content:
          "OpenModal tracks AI's real-world capabilities and human impact — through verified evidence, not analyst predictions",
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://openmodal.ai' },
      { property: 'og:site_name', content: 'OpenModal' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      {
        name: 'twitter:title',
        content: "OpenModal | Track AI's Real-World Impact",
      },
      {
        name: 'twitter:description',
        content:
          "OpenModal tracks AI's real-world capabilities and human impact — through verified evidence, not analyst predictions",
      },
    ],
  }),
  component: RouteComponent,
})

// Dummy data - will be replaced with actual data
const DUMMY_REPORTS = [
  {
    id: 1,
    impact: 'replaced',
    industry: 'Customer Service · Telecom',
    title:
      'Our entire tier-1 support team of 40 was let go over three months. AI now handles 91% of calls without escalation.',
    excerpt:
      'The rollout started quietly in Q2. First they said it was just a "pilot." Then our team lead stopped being included in planning meetings. By August we were training system on our own call transcripts.',
    job: 'Former Tier-1 Support Agent',
    time: '3 days ago',
    featured: true,
  },
  {
    id: 2,
    impact: 'augmented',
    industry: 'Legal · Law Firm',
    title:
      'Contract review that took 6 hours now takes 45 minutes. My job changed completely, but it still exists.',
    excerpt: '',
    job: 'Paralegal, Mid-size Firm',
    time: '5 days ago',
    featured: false,
  },
  {
    id: 3,
    impact: 'failed',
    industry: 'Healthcare · Diagnostics',
    title:
      'Hospital rolled back AI radiology assistant after 4 months. False positive rate was too high for clinical use.',
    excerpt: '',
    job: 'Radiologist, Regional Hospital',
    time: '1 week ago',
    featured: false,
  },
  {
    id: 4,
    impact: 'evolved',
    industry: 'Finance · Investment Bank',
    title:
      "Junior analyst roles aren't being cut — they're being redefined around AI oversight and exception handling.",
    excerpt: '',
    job: 'Senior Analyst, Equity Research',
    time: '9 days ago',
    featured: false,
  },
  {
    id: 5,
    impact: 'replaced',
    industry: 'Media · Publishing',
    title:
      'Our SEO content team went from 12 writers to 2 editors overseeing AI output in under a year.',
    excerpt: '',
    job: 'Former Content Strategist',
    time: '2 weeks ago',
    featured: false,
  },
]

const DUMMY_CAPABILITIES = [
  {
    domain: 'Language',
    name: 'Legal Reasoning',
    progress: 72,
    status: 'Advancing',
  },
  {
    domain: 'Vision',
    name: 'Medical Imaging',
    progress: 61,
    status: 'Capable',
  },
  {
    domain: 'Reasoning',
    name: 'Financial Analysis',
    progress: 68,
    status: 'Advancing',
  },
  {
    domain: 'Physical',
    name: 'Dexterous Manipulation',
    progress: 24,
    status: 'Limited',
  },
  {
    domain: 'Language',
    name: 'Code Generation',
    progress: 88,
    status: 'Capable',
  },
  {
    domain: 'Social',
    name: 'Emotional Intelligence',
    progress: 38,
    status: 'Emerging',
  },
  {
    domain: 'Vision',
    name: 'Document Understanding',
    progress: 81,
    status: 'Capable',
  },
  {
    domain: 'Reasoning',
    name: 'Strategic Planning',
    progress: 44,
    status: 'Emerging',
  },
]

const DUMMY_INDUSTRIES = [
  { name: 'Customer Service', exposure: 87, reports: 342, trend: 'up' },
  { name: 'Software Development', exposure: 79, reports: 289, trend: 'up' },
  { name: 'Legal Services', exposure: 65, reports: 178, trend: 'up' },
  { name: 'Financial Analysis', exposure: 71, reports: 203, trend: 'stable' },
  { name: 'Content & Media', exposure: 83, reports: 156, trend: 'up' },
  { name: 'Healthcare', exposure: 48, reports: 94, trend: 'stable' },
  { name: 'Education', exposure: 41, reports: 71, trend: 'down' },
  { name: 'Manufacturing', exposure: 35, reports: 47, trend: 'down' },
]

function getImpactBadge(impact: string) {
  switch (impact) {
    case 'replaced':
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
          Replaced
        </Badge>
      )
    case 'augmented':
      return (
        <Badge className="bg-primary/10 text-primary border-primary/20">
          Augmented
        </Badge>
      )
    case 'evolved':
      return (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
          Role Evolved
        </Badge>
      )
    case 'failed':
      return (
        <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">
          Failed
        </Badge>
      )
    default:
      return <Badge>{impact}</Badge>
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'Capable':
      return (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
          Capable
        </Badge>
      )
    case 'Advancing':
      return (
        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-xs">
          Advancing
        </Badge>
      )
    case 'Emerging':
      return (
        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
          Emerging
        </Badge>
      )
    case 'Limited':
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
          Limited
        </Badge>
      )
    default:
      return <Badge>{status}</Badge>
  }
}

function getProgressColor(progress: number) {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 50) return 'bg-primary'
  if (progress >= 30) return 'bg-primary/70'
  return 'bg-red-500'
}

function getTrendBadge(trend: string) {
  switch (trend) {
    case 'up':
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
          ↑ High activity
        </Badge>
      )
    case 'stable':
      return (
        <Badge className="bg-muted text-muted-foreground border-border text-xs">
          → Stable
        </Badge>
      )
    case 'down':
      return (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
          ↓ Early stage
        </Badge>
      )
    default:
      return <Badge>{trend}</Badge>
  }
}

function RouteComponent() {
  return (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16 items-start">
          {/* Hero Content */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Live — updated by community
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight">
              AI is advancing fast.
              <br />
              <span className="italic text-muted-foreground">
                What is it doing to people?
              </span>
            </h1>
            <p className="text-base text-muted-foreground max-w-lg leading-relaxed">
              OpenModal tracks AI's real-world capabilities and human impact —
              through verified evidence from workers, not predictions from
              analysts.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/reports"
                search={{
                  impactType: undefined,
                  country: undefined,
                  companySize: undefined,
                  search: undefined,
                  sort: 'recent',
                }}
              >
                <Button size="lg">Explore Reports</Button>
              </Link>
              <Link to="/capabilities" search={() => ({})}>
                <Button size="lg" variant="outline">
                  Browse Capabilities →
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Card */}
          <div className="hidden lg:block bg-muted/50 border border-border rounded-xl p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground pb-3 border-b border-border mb-4">
              Platform at a glance
            </div>
            <div className="space-y-0">
              {[
                {
                  label: 'Impact Reports',
                  value: '1,247',
                  delta: '+38 this week',
                },
                { label: 'Jobs Tracked', value: '84' },
                { label: 'Capabilities Mapped', value: '32' },
                { label: 'Technologies', value: '61' },
                { label: 'Contributors', value: '3,812', highlight: true },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex justify-between items-center py-3 border-b border-border last:border-0 last:pb-0"
                >
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xl font-semibold font-mono ${stat.highlight ? 'text-green-500' : stat.label === 'Impact Reports' ? 'text-primary' : ''}`}
                    >
                      {stat.value}
                    </span>
                    {stat.delta && (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
                        {stat.delta}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Impact Reports */}
      <section className="container mx-auto px-6 pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Recent Impact Reports
            </span>
            <Link
              to="/reports"
              search={{
                impactType: undefined,
                country: undefined,
                companySize: undefined,
                search: undefined,
                sort: 'recent',
              }}
            >
              <span className="text-xs text-primary hover:opacity-80">
                View all reports →
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {DUMMY_REPORTS.map((report) => (
              <Link
                key={report.id}
                to="/reports"
                search={{
                  impactType: undefined,
                  country: undefined,
                  companySize: undefined,
                  search: undefined,
                  sort: 'recent',
                }}
                className={`bg-muted/50 border border-border rounded-xl p-5 hover:border-border transition-all hover:-translate-y-0.5 ${report.featured ? 'md:col-span-2 bg-linear-to-br from-muted/50 to-muted/30 border-border' : ''}`}
              >
                <div className="flex flex-col gap-3.5 h-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getImpactBadge(report.impact)}
                    <span className="text-xs text-muted-foreground">
                      {report.industry}
                    </span>
                  </div>
                  <h3
                    className={`font-medium leading-snug ${report.featured ? 'text-xl' : 'text-base'}`}
                  >
                    {report.title}
                  </h3>
                  {report.excerpt && report.featured && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {report.excerpt}
                    </p>
                  )}
                  <div className="mt-auto pt-2 flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{report.job}</span>
                    <span className="text-muted-foreground/60">
                      {report.time}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-border/50 mx-auto max-w-6xl mb-16 md:mb-20" />

      {/* Capability Progress */}
      <section className="container mx-auto px-6 pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Capability Progress
            </span>
            <Link to="/capabilities" search={() => ({})}>
              <span className="text-xs text-primary hover:opacity-80">
                View all capabilities →
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DUMMY_CAPABILITIES.map((cap) => (
              <div
                key={cap.name}
                className="bg-muted/50 border border-border rounded-xl p-4.5 hover:border-border transition-colors cursor-pointer"
              >
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                  {cap.domain}
                </div>
                <div className="text-sm font-medium mb-3.5">{cap.name}</div>
                <div className="h-1 bg-muted rounded-full mb-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(cap.progress)}`}
                    style={{ width: `${cap.progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">{cap.progress}%</span>
                  {getStatusBadge(cap.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-border/50 mx-auto max-w-6xl mb-16 md:mb-20" />

      {/* Industry Pulse */}
      <section className="container mx-auto px-6 pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Industry Pulse
            </span>
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
            >
              <span className="text-xs text-primary hover:opacity-80">
                Explore industries →
              </span>
            </Link>
          </div>

          <div className="space-y-0.5">
            {/* Header Row */}
            <div className="hidden md:grid grid-cols-[180px_1fr_90px_120px] gap-6 px-4.5 py-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Industry
              </span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                AI Exposure
              </span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                Reports
              </span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground text-right">
                Activity
              </span>
            </div>

            {/* Industry Rows */}
            {DUMMY_INDUSTRIES.map((industry) => (
              <Link
                key={industry.name}
                to="/jobs"
                search={{
                  page: 1,
                  limit: 12,
                  category: 'all',
                  riskLevel: 'all',
                  search: '',
                  sortBy: 'name',
                }}
                className="grid grid-cols-[180px_1fr] md:grid-cols-[180px_1fr_90px_120px] gap-4 md:gap-6 px-4.5 py-3.5 rounded-lg hover:bg-muted/50 transition-colors items-center"
              >
                <span className="text-sm">{industry.name}</span>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${industry.exposure}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground text-right hidden md:block">
                  {industry.reports} reports
                </span>
                <div className="hidden md:flex justify-end">
                  {getTrendBadge(industry.trend)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto bg-muted/50 border border-border rounded-2xl p-8 md:p-14 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-10 items-center relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="text-xs uppercase tracking-widest text-primary mb-3">
              Contribute
            </div>
            <h2 className="text-3xl md:text-4xl font-medium mb-3">
              You've seen what AI
              <br />
              is doing firsthand.
            </h2>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              The most valuable data comes from workers, not analysts. Your
              report — whether AI replaced, augmented, or failed at your job —
              becomes evidence that helps others navigate what's coming.
            </p>
          </div>
          <div className="flex flex-row lg:flex-col gap-3 relative">
            <Link to="/dashboard">
              <Button size="lg" className="whitespace-nowrap">
                Submit a Report
              </Button>
            </Link>
            <Link to="/methodology">
              <Button size="lg" variant="outline" className="whitespace-nowrap">
                Read methodology
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
