import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/_public/methodology')({
  component: RouteComponent,
})

const SECTIONS = [
  { id: 'overview', label: 'Overview', num: '01' },
  { id: 'reports', label: 'Impact Reports', num: '02' },
  { id: 'impact-types', label: 'Impact Types', num: '03' },
  { id: 'quality', label: 'Quality Control', num: '04' },
  { id: 'capabilities', label: 'Capability Scoring', num: '05' },
  { id: 'limitations', label: 'Known Limitations', num: '06' },
  { id: 'citing', label: 'Citing OpenModal', num: '07' },
]

function RouteComponent() {
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12 lg:gap-16 items-start">
          {/* Sidebar TOC */}
          <aside className="hidden lg:flex sticky top-24 flex-col gap-0.5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 pb-2 border-b border-border">
              On this page
            </div>

            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document
                    .getElementById(section.id)
                    ?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-all ${
                  activeSection === section.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span
                  className={`text-[10px] min-w-4 tabular-nums ${activeSection === section.id ? 'text-primary/60' : 'text-muted-foreground/60'}`}
                >
                  {section.num}
                </span>
                {section.label}
              </a>
            ))}

            <div className="h-px bg-border my-2" />

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2.5 leading-relaxed">
                Questions about our methodology?
              </p>
              <a
                href="https://discord.gg/bBsF3MjA9"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:opacity-80"
              >
                Contact us →
              </a>
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0">
            {/* Page Header */}
            <div className="mb-14">
              <div className="text-xs uppercase tracking-widest text-primary mb-4">
                Methodology
              </div>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
                How OpenModal
                <br />
                works — and why
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-lg mb-5">
                A transparent account of how we collect, verify, and present
                data about AI's real-world impact. Including what our data can
                tell you, and what it can't.
              </p>
              <div className="flex flex-wrap gap-5 pt-5 border-t border-border text-xs text-muted-foreground">
                <span>
                  <strong className="text-foreground font-medium">
                    Version
                  </strong>{' '}
                  3.0
                </span>
                <span>
                  <strong className="text-foreground font-medium">
                    Last updated
                  </strong>{' '}
                  March 2026
                </span>
                <span>
                  <strong className="text-foreground font-medium">
                    Status
                  </strong>{' '}
                  Living document
                </span>
              </div>
            </div>

            {/* 01 OVERVIEW */}
            <section className="method-section" id="overview">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                01 — Overview
              </div>
              <h2 className="text-2xl font-medium mb-5">The core principle</h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Most AI impact data comes from one of two sources:{' '}
                  <strong className="text-foreground font-medium">
                    analyst predictions
                  </strong>{' '}
                  (what experts think will happen) or{' '}
                  <strong className="text-foreground font-medium">
                    corporate announcements
                  </strong>{' '}
                  (what companies want you to believe is happening). OpenModal
                  is built on a third source —{' '}
                  <strong className="text-foreground font-medium">
                    crowdsourced, verified reports from workers and observers in
                    the field.
                  </strong>
                </p>
                <p>
                  This approach has real strengths and real limitations. We
                  document both honestly here, because the value of this data
                  depends entirely on people understanding where it comes from
                  and how to interpret it correctly.
                </p>
              </div>

              <div className="mt-5 rounded-xl p-5 border border-primary/20 bg-primary/5">
                <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                  What makes this data different
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  OpenModal doesn't predict or model AI impact. We document it.
                  Every impact report is a real account of something that
                  happened, submitted by someone with direct knowledge. The
                  platform's job is to make that evidence searchable,
                  structured, and trustworthy.
                </p>
              </div>

              <div className="mt-5 text-sm text-muted-foreground leading-relaxed">
                <p>
                  The platform tracks three interconnected things:{' '}
                  <strong className="text-foreground font-medium">
                    what AI can do
                  </strong>{' '}
                  (capability progress),{' '}
                  <strong className="text-foreground font-medium">
                    where it's being deployed
                  </strong>{' '}
                  (technology adoption), and{' '}
                  <strong className="text-foreground font-medium">
                    what it's doing to people
                  </strong>{' '}
                  (impact reports). The connection between all three is what
                  creates insight no single source can provide alone.
                </p>
              </div>
            </section>

            {/* 02 IMPACT REPORTS */}
            <section className="method-section" id="reports">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                02 — Impact Reports
              </div>
              <h2 className="text-2xl font-medium mb-5">
                How reports are submitted
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed mb-5">
                <p>
                  Impact Reports are the core of OpenModal. They are
                  first-person or observed accounts of AI affecting real work —
                  submitted by workers, managers, researchers, or anyone with
                  direct knowledge of a deployment.
                </p>
              </div>

              <div className="space-y-0">
                {[
                  {
                    num: '1',
                    title: 'Minimum required fields',
                    desc: 'Every report requires: a description of what happened, impact type, and job role affected. Everything else is optional — this keeps friction low and protects anonymity.',
                  },
                  {
                    num: '2',
                    title: 'Organization is always optional',
                    desc: 'We deliberately do not require company names. Workers should not have to choose between contributing valuable evidence and protecting their employment. Reports can be fully anonymous.',
                  },
                  {
                    num: '3',
                    title: 'Instant publish, no approval queue',
                    desc: "Reports go live immediately. We don't believe in moderator bottlenecks that slow contribution and create single points of failure. Community enrichment and flagging handle quality post-publication.",
                  },
                  {
                    num: '4',
                    title: 'Community enrichment',
                    desc: 'After a report is published, contributors with 50+ reputation points can add structured data — linking it to specific technologies, jobs, or capabilities. These enrichments are voted on by community before becoming part of the primary record.',
                  },
                  {
                    num: '5',
                    title: 'Reporter relationship',
                    desc: 'Submitters indicate their relationship to the event: directly affected, observed firsthand, read in a verified source, or other. This context is shown on every report so readers can weigh it accordingly.',
                  },
                ].map((step) => (
                  <div
                    key={step.num}
                    className="flex gap-4 py-4 border-b border-border last:border-0"
                  >
                    <div className="size-7 shrink-0 rounded-full bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center">
                      {step.num}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground mb-1">
                        {step.title}
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {step.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 03 IMPACT TYPES */}
            <section className="method-section" id="impact-types">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                03 — Impact Types
              </div>
              <h2 className="text-2xl font-medium mb-5">
                What we mean by "impact"
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed mb-5">
                <p>
                  AI's effect on work is not binary.{' '}
                  <strong className="text-foreground font-medium">
                    Replacement is one outcome among many
                  </strong>{' '}
                  — and often not the most common one. We track five distinct
                  impact types, because collapsing them into a single
                  "automation risk" score would misrepresent reality.
                </p>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  {
                    color: 'bg-red-500',
                    term: 'Replaced',
                    desc: 'AI has taken over tasks or roles that were previously performed by humans, resulting in headcount reduction or role elimination. The work still exists — humans no longer do it.',
                  },
                  {
                    color: 'bg-primary',
                    term: 'Augmented',
                    desc: 'AI assists humans in performing their work, increasing output or quality without eliminating the human role. The job still exists and may be more productive, but the nature of the work has changed.',
                  },
                  {
                    color: 'bg-blue-500',
                    term: 'Role Evolved',
                    desc: 'The job has been substantially redefined around AI — humans now focus on oversight, exception handling, or higher-order tasks. Headcount may be unchanged but the role is fundamentally different.',
                  },
                  {
                    color: 'bg-green-500',
                    term: 'New Role Created',
                    desc: "AI deployment has created new human roles that didn't previously exist — prompt engineers, AI trainers, output reviewers, and similar positions that emerged directly from AI adoption.",
                  },
                  {
                    color: 'bg-slate-500',
                    term: 'Failed Deployment',
                    desc: "An AI deployment was attempted and rolled back, abandoned, or deemed unsuccessful. These reports are as valuable as success stories — failure patterns reveal where AI genuinely can't yet perform.",
                  },
                ].map((item) => (
                  <div
                    key={item.term}
                    className="bg-muted/50 border border-border rounded-lg p-4 grid grid-cols-[140px_1fr] gap-4 items-start"
                  >
                    <div className="text-sm font-medium flex items-center gap-2">
                      <div
                        className={`size-1.5 rounded-full shrink-0 ${item.color}`}
                      />
                      {item.term}
                    </div>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl p-5 border border-blue-500/20 bg-blue-500/5">
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-500 mb-2">
                  Why failed deployments matter
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Most AI coverage focuses on what's working. But failed
                  deployments tell us something benchmarks can't — where
                  real-world conditions (regulatory constraints, edge cases,
                  user trust, cost) prevent AI from functioning as advertised.
                  We treat failure reports as first-class data.
                </p>
              </div>
            </section>

            {/* 04 QUALITY CONTROL */}
            <section className="method-section" id="quality">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                04 — Quality Control
              </div>
              <h2 className="text-2xl font-medium mb-5">
                How we maintain data quality
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed mb-5">
                <p>
                  Instant publish without a moderator approval queue is a
                  deliberate choice — but it requires a different quality model.
                  We use a layered community-based system rather than a
                  centralized gatekeeping approach.
                </p>
              </div>

              <div className="space-y-0">
                {[
                  {
                    num: '1',
                    title: 'Reputation-weighted contributions',
                    desc: "New accounts can submit reports but cannot add enrichments until they've earned 50 reputation points. This creates a baseline of contribution history before granting enrichment privileges.",
                  },
                  {
                    num: '2',
                    title: 'Community flagging',
                    desc: "Any user can flag a report for: spam, fabricated content, duplicate, inappropriate, or other. Flags trigger moderator review — they don't automatically remove content. A report with multiple flags is surfaced to moderators, not hidden from users.",
                  },
                  {
                    num: '3',
                    title: 'Enrichment voting',
                    desc: 'When community members add structured data to a report (linking it to a technology or capability), other contributors vote on accuracy. Enrichments with net negative votes are marked as disputed and excluded from aggregate data.',
                  },
                  {
                    num: '4',
                    title: 'Confidence signals on every report',
                    desc: "Each report displays the reporter's stated relationship to the event, their contribution history, and how many community members have corroborated or disputed it. Readers can weigh all of this themselves.",
                  },
                  {
                    num: '5',
                    title: 'Moderator review for escalations',
                    desc: 'A small team of verified moderators handles flagged content, disputed enrichments, and edge cases. Moderators cannot approve or block reports unilaterally — their role is to resolve disputes, not gatekeep publication.',
                  },
                ].map((step) => (
                  <div
                    key={step.num}
                    className="flex gap-4 py-4 border-b border-border last:border-0"
                  >
                    <div className="size-7 shrink-0 rounded-full bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center">
                      {step.num}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground mb-1">
                        {step.title}
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {step.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl p-5 border border-green-500/20 bg-green-500/5">
                <div className="text-xs font-semibold uppercase tracking-wider text-green-500 mb-2">
                  Precedent for this model
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Wikipedia, Stack Overflow, and OpenStreetMap all operate on
                  variations of instant publish with community quality control.
                  The model works — with sufficient contributor volume,
                  community verification produces surprisingly accurate data.
                  Our quality approach is modeled on these precedents.
                </p>
              </div>
            </section>

            {/* 05 CAPABILITY SCORING */}
            <section className="method-section" id="capabilities">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                05 — Capability Scoring
              </div>
              <h2 className="text-2xl font-medium mb-5">
                How capability progress is measured
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed mb-5">
                <p>
                  Capability scores represent our best current estimate of how
                  well AI systems can perform a specific type of task in
                  real-world conditions — not benchmark performance in
                  controlled settings.{' '}
                  <strong className="text-foreground font-medium">
                    These are editorial assessments, not algorithmic outputs.
                  </strong>
                </p>
                <p>
                  We track capabilities at the domain-specific subtype level
                  rather than broad categories, because "reasoning" or "language
                  understanding" as a single number is nearly meaningless.
                  Medical reasoning and legal reasoning advance at different
                  rates, face different constraints, and affect different
                  people.
                </p>
              </div>

              <div className="space-y-0">
                {[
                  {
                    num: '1',
                    title: 'Scoring inputs',
                    desc: 'Scores draw on: published academic benchmarks, independent evaluations, deployment reports in our database, public technical documentation, and moderator assessment. No single source determines a score.',
                  },
                  {
                    num: '2',
                    title: 'What percentage means',
                    desc: 'A score of 70% does not mean AI can do 70% of tasks in a domain. It means our assessment panel believes the capability is roughly 70% of the way toward consistent, reliable, real-world deployment at a professional level. It is a directional signal, not a precise measurement.',
                  },
                  {
                    num: '3',
                    title: 'Review cadence',
                    desc: 'Capability scores are reviewed quarterly or when a significant development (major model release, large-scale deployment, published evaluation) warrants an update. All score changes are logged with rationale.',
                  },
                  {
                    num: '4',
                    title: 'Status labels',
                    desc: 'Each capability carries a status: Limited (under 40%), Emerging (40–59%), Advancing (60–74%), or Capable (75%+). These labels are shorthand only — the underlying score and rationale should always be consulted for important decisions.',
                  },
                ].map((step) => (
                  <div
                    key={step.num}
                    className="flex gap-4 py-4 border-b border-border last:border-0"
                  >
                    <div className="size-7 shrink-0 rounded-full bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center">
                      {step.num}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground mb-1">
                        {step.title}
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {step.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 06 LIMITATIONS */}
            <section className="method-section" id="limitations">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                06 — Known Limitations
              </div>
              <h2 className="text-2xl font-medium mb-5">
                What our data can't tell you
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed mb-5">
                <p>
                  We believe being explicit about limitations increases trust
                  rather than eroding it. Anyone using OpenModal data for
                  research, journalism, or policy should understand these
                  constraints.
                </p>
              </div>

              <div className="space-y-2.5 mb-5">
                {[
                  {
                    label: 'Self-selection bias',
                    desc: 'People who experienced dramatic displacement are more likely to submit reports than those whose work was quietly augmented. Our data may overrepresent extreme outcomes early on.',
                    badge: 'Known',
                    badgeClass: 'bg-primary/10 text-primary border-primary/20',
                  },
                  {
                    label: 'Geographic skew',
                    desc: 'Contributors are currently concentrated in English-speaking markets. AI deployment patterns in other regions are underrepresented. We flag this on individual reports where relevant.',
                    badge: 'Ongoing',
                    badgeClass:
                      'bg-blue-500/10 text-blue-500 border-blue-500/20',
                  },
                  {
                    label: 'Unverified claims',
                    desc: 'We cannot independently verify most reports. We show confidence signals to help readers assess credibility, but reports should be treated as claimed accounts, not confirmed facts.',
                    badge: 'Mitigated',
                    badgeClass:
                      'bg-green-500/10 text-green-500 border-green-500/20',
                  },
                  {
                    label: 'Survivorship reporting',
                    desc: 'Workers who were replaced may not return to submit reports. We may undercount displacement in industries where affected workers disengage from professional platforms.',
                    badge: 'Known',
                    badgeClass: 'bg-primary/10 text-primary border-primary/20',
                  },
                  {
                    label: 'Capability score subjectivity',
                    desc: 'Progress percentages are editorial judgments, not measurements. Two reasonable analysts could score the same capability differently. We publish our rationale to allow scrutiny.',
                    badge: 'Mitigated',
                    badgeClass:
                      'bg-green-500/10 text-green-500 border-green-500/20',
                  },
                  {
                    label: 'Early data volume',
                    desc: 'Aggregate trends from small sample sizes (under ~50 reports per industry) should be treated with caution. We display report counts prominently so readers can assess statistical weight.',
                    badge: 'Ongoing',
                    badgeClass:
                      'bg-blue-500/10 text-blue-500 border-blue-500/20',
                  },
                ].map((limit) => (
                  <div
                    key={limit.label}
                    className="bg-muted/50 border border-border rounded-lg p-3.5 grid grid-cols-[200px_1fr_auto] gap-4 items-start"
                  >
                    <div className="text-sm font-medium text-foreground">
                      {limit.label}
                    </div>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      {limit.desc}
                    </div>
                    <Badge
                      className={`text-[10px] font-medium uppercase tracking-wider whitespace-nowrap ${limit.badgeClass}`}
                    >
                      {limit.badge}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-5 text-sm text-muted-foreground leading-relaxed">
                <p>
                  If you're using OpenModal data in research or journalism, we
                  recommend treating it as a{' '}
                  <strong className="text-foreground font-medium">
                    leading indicator and hypothesis generator
                  </strong>{' '}
                  rather than a definitive statistical source. Corroborate
                  significant findings with other data sources where possible.
                </p>
              </div>
            </section>

            {/* 07 CITING */}
            <section className="method-section" id="citing">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                07 — Citing OpenModal
              </div>
              <h2 className="text-2xl font-medium mb-5">
                How to reference this data
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed mb-5">
                <p>
                  OpenModal data is open and freely citable. All reports are
                  timestamped and versioned. We ask that citations include
                  access date, as data is updated continuously.
                </p>
              </div>

              <div className="bg-muted/50 border border-border rounded-lg p-5 mb-4">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2.5">
                  Academic citation format
                </div>
                <div className="text-sm text-muted-foreground/90 leading-relaxed bg-background border border-border rounded-md p-3.5 font-mono">
                  OpenModal Community. (2026).{' '}
                  <em className="text-muted-foreground">
                    OpenModal AI Impact Database
                  </em>{' '}
                  [Data set].
                  <br />
                  Retrieved [Month Day, Year], from https://openmodal.ai.
                  <br />
                  Report ID: [report-id] / Capability: [capability-slug]
                </div>
              </div>

              <div className="bg-muted/50 border border-border rounded-lg p-5 mb-4">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2.5">
                  Journalism / general reference
                </div>
                <div className="text-sm text-muted-foreground/90 leading-relaxed bg-background border border-border rounded-md p-3.5 font-mono">
                  According to OpenModal, a community-verified platform tracking
                  <br />
                  AI's real-world impact on work (openmodal.ai, accessed
                  [date])...
                </div>
              </div>

              <div className="mt-4 mb-6 text-sm text-muted-foreground leading-relaxed">
                <p>
                  For bulk data access, API access for researchers, or press
                  enquiries,{' '}
                  <a
                    href="https://discord.gg/bBsF3MjA9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:opacity-80"
                  >
                    contact us
                  </a>
                  . We aim to support serious research and journalism with
                  whatever access is needed.
                </p>
              </div>

              <div className="mt-5 rounded-xl p-5 border border-primary/20 bg-primary/5">
                <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                  Open source
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  OpenModal is MIT licensed and open source. The platform,
                  schema, and methodology are all open for scrutiny,
                  contribution, and forking. If you see something wrong in our
                  methodology, open an issue or submit a pull request.
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  )
}
