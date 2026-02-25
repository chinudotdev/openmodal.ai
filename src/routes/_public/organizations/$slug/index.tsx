import { Link, createFileRoute } from '@tanstack/react-router'

import { getOrganizationBySlugFn } from '@/actions/organizations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export const Route = createFileRoute('/_public/organizations/$slug/')({
  loader: async ({ params }) => {
    const { organization, reportBreakdown } = await getOrganizationBySlugFn({
      data: { slug: params.slug },
    })
    return { organization, reportBreakdown }
  },
  component: OrganizationDetailPage,
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading organization...</p>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">Organization not found</p>
        <Link to="/organizations">
          <Button>Back to Organizations</Button>
        </Link>
      </div>
    </div>
  ),
})

function OrganizationDetailPage() {
  const { organization, reportBreakdown } = Route.useLoaderData()

  if (!organization) {
    throw new Error()
  }

  const formatType = (type: string) => {
    return type
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getSponsorColor = (tier: string) => {
    switch (tier) {
      case 'gold':
        return 'text-yellow-500'
      case 'silver':
        return 'text-slate-400'
      case 'bronze':
        return 'text-orange-600'
      default:
        return 'text-muted-foreground'
    }
  }

  const getSponsorBorder = (tier: string) => {
    switch (tier) {
      case 'gold':
        return 'border-yellow-500/50'
      case 'silver':
        return 'border-slate-400/50'
      case 'bronze':
        return 'border-orange-600/50'
      default:
        return ''
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'deployed':
        return 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
      case 'pilot':
        return 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
      case 'research':
        return 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20'
      case 'discontinued':
        return 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/20'
      default:
        return ''
    }
  }

  const formatStage = (stage: string) => {
    return stage
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const totalReports = reportBreakdown.reduce(
    (sum: number, r: { count: number }) => sum + r.count,
    0,
  )

  return (
    <>
      {/* Breadcrumb */}
      <nav className="border-b border-border/40 bg-muted/30">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link to="/organizations" className="hover:text-foreground">
              Organizations
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">
              {organization.name}
            </span>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                    {organization.name}
                  </h1>
                  {organization.isSponsor && (
                    <Badge
                      variant="outline"
                      className={getSponsorBorder(organization.sponsorTier)}
                    >
                      <span
                        className={getSponsorColor(organization.sponsorTier)}
                      >
                        {organization.sponsorTier === 'gold' && '🥇 Gold'}
                        {organization.sponsorTier === 'silver' && '🥈 Silver'}
                        {organization.sponsorTier === 'bronze' && '🥉 Bronze'}
                      </span>
                    </Badge>
                  )}
                  {organization.verifiedBadge && (
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20"
                    >
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {organization.types.map((type: string) => (
                    <span key={type} className="capitalize">
                      {formatType(type)}
                    </span>
                  ))}
                  {organization.foundedYear && (
                    <>
                      <span>•</span>
                      <span>Founded {organization.foundedYear}</span>
                    </>
                  )}
                  {organization.website && (
                    <>
                      <span>•</span>
                      <a
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {organization.website
                          .replace(/^https?:\/\//, '')
                          .replace(/\/$/, '')}
                      </a>
                    </>
                  )}
                </div>
              </div>
              {organization.logo && (
                <img
                  src={organization.logo}
                  alt={organization.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
            </div>

            <p className="text-base text-muted-foreground max-w-3xl mb-6">
              {organization.description}
            </p>

            {!organization.isClaimed && (
              <Card className="inline-block bg-yellow-500/10 border-yellow-500/20">
                <CardContent className="p-4">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    ⚠️ <strong>Unclaimed Page:</strong> This page was created
                    from community data. {organization.name} has not claimed or
                    verified this information.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Technologies */}
            <Card>
              <CardHeader>
                <CardTitle>
                  🤖 Technologies ({organization.technologies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {organization.technologies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No technologies tracked yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {organization.technologies.map((tech: any) => (
                      <Link
                        key={tech.id}
                        to="/technologies/$slug"
                        params={{ slug: tech.slug }}
                      >
                        <Card className="transition-all hover:shadow-md hover:border-primary/50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{tech.name}</h4>
                              <Badge
                                variant="outline"
                                className={getStageColor(tech.stage)}
                              >
                                {formatStage(tech.stage)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground capitalize mb-2">
                              {formatType(tech.type)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tech._count.reports} reports
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Report Breakdown */}
            {totalReports > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>📊 Report Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Total reports mentioning {organization.name} technologies:{' '}
                    {totalReports}
                  </p>
                  <div className="space-y-3">
                    {reportBreakdown.map((rb: any) => (
                      <div key={rb.impactType} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize">
                            {rb.impactType.replace('_', ' ')}
                          </span>
                          <span className="text-muted-foreground">
                            {rb.count} ({rb.percentage}%)
                          </span>
                        </div>
                        <Progress value={rb.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Capabilities */}
            {organization.capabilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    ⚡ Capabilities Being Developed (
                    {organization.capabilities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Derived from their technologies
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {organization.capabilities.map((cap: any) => (
                      <Link
                        key={cap.id}
                        to="/capabilities/$slug"
                        params={{ slug: cap.slug }}
                      >
                        <Card className="transition-all hover:shadow-md hover:border-primary/50">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                              {cap.icon && <span>{cap.icon}</span>}
                              <span className="font-medium">{cap.name}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>📈 Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Technologies
                  </span>
                  <span className="font-medium">
                    {organization._count.technologies}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Reports</span>
                  <span className="font-medium">
                    {organization._count.reports}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Capabilities
                  </span>
                  <span className="font-medium">
                    {organization.capabilities.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Sponsor Info */}
            {organization.isSponsor && (
              <Card className={getSponsorBorder(organization.sponsorTier)}>
                <CardHeader>
                  <CardTitle
                    className={`flex items-center gap-2 ${getSponsorColor(organization.sponsorTier)}`}
                  >
                    {organization.sponsorTier === 'gold' && '🥇'}
                    {organization.sponsorTier === 'silver' && '🥈'}
                    {organization.sponsorTier === 'bronze' && '🥉'}
                    Sponsor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {organization.name} supports OpenModal's mission to track
                    AI's impact on jobs.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Claim CTA */}
            {!organization.isClaimed && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <p className="font-medium mb-2">
                    ⚠️ Is this your organization?
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Claim this page to add official information and respond to
                    community reports.
                  </p>
                  <Button size="sm" className="w-full">
                    Claim This Page
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Contribute CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center space-y-3">
                <p className="font-medium mb-2">🚀 Share Your Experience</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Work with {organization.name} technologies? Share your impact
                  story.
                </p>
                <Link to="/dashboard">
                  <Button size="sm" className="w-full">
                    📝 Share Story
                  </Button>
                </Link>
                <Link
                  to="/organizations/$slug/discussion"
                  params={{ slug: organization.slug }}
                >
                  <Button size="sm" variant="outline" className="w-full">
                    💬 Discussion
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
