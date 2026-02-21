import { Link, createFileRoute } from '@tanstack/react-router'

import { getTechnologyBySlugFn } from '@/actions/technologies'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export const Route = createFileRoute('/_public/technologies/$slug/')({
  loader: async ({ params }) => {
    const { technology, reportBreakdown } = await getTechnologyBySlugFn({
      data: { slug: params.slug },
    })
    return { technology, reportBreakdown }
  },
  component: TechnologyDetailPage,
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading technology...</p>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">Technology not found</p>
        <Link to="/technologies">
          <Button>Back to Technologies</Button>
        </Link>
      </div>
    </div>
  ),
})

function TechnologyDetailPage() {
  const { technology, reportBreakdown } = Route.useLoaderData()

  if (!technology) {
    throw new Error()
  }

  const { organization } = technology

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solved':
        return 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
      case 'partial':
        return 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
      case 'unsolved':
        return 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
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

  const totalReports = reportBreakdown.reduce(
    (sum: number, r: { count: number }) => sum + r.count,
    0,
  )

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ai_model: 'AI Model',
      robot: 'Robot',
      software: 'Software',
      hardware: 'Hardware',
      api: 'API',
    }
    return labels[type] || type
  }

  const formatType = (type: string) => {
    return type
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

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
            <Link to="/technologies" className="hover:text-foreground">
              Technologies
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">
              {technology.name}
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
                    {technology.name}
                  </h1>
                  {organization.verifiedBadge && (
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20"
                    >
                      Verified Sponsor
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  by{' '}
                  <Link
                    to="/organizations/$slug"
                    params={{ slug: organization.slug }}
                    className="text-primary hover:underline"
                  >
                    {organization.name}
                  </Link>
                  {organization.isSponsor && (
                    <span
                      className={`ml-1 ${getSponsorColor(organization.sponsorTier)}`}
                    >
                      ✓
                    </span>
                  )}
                </p>
              </div>
              {technology.image && (
                <img
                  src={technology.image}
                  alt={technology.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="outline">
                Type: {getTypeLabel(technology.type)}
              </Badge>
              <Badge
                variant="outline"
                className={getStageColor(technology.stage)}
              >
                Stage: {formatType(technology.stage)}
              </Badge>
              {technology.releaseDate && (
                <span className="text-sm text-muted-foreground">
                  Released:{' '}
                  {new Date(technology.releaseDate).toLocaleDateString(
                    'en-US',
                    { year: 'numeric', month: 'short' },
                  )}
                </span>
              )}
            </div>

            <p className="text-base text-muted-foreground max-w-3xl">
              {technology.description}
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              {technology.website && (
                <a
                  href={technology.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    🌐 Official Site
                  </Button>
                </a>
              )}
              <Link
                to="/organizations/$slug"
                params={{ slug: organization.slug }}
              >
                <Button variant="outline" size="sm">
                  📚 View Organization
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Capability Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚡ Capability Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {technology.capabilities.length > 0 ? (
                  technology.capabilities.map((cap: any) => (
                    <div key={cap.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{cap.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {cap.performanceScore !== null && (
                            <span className="text-sm text-muted-foreground">
                              {cap.performanceScore}%
                            </span>
                          )}
                          <Badge
                            variant="outline"
                            className={getStatusColor(cap.status)}
                          >
                            {cap.status === 'solved' && '✅ Solved'}
                            {cap.status === 'partial' && '⚠️ Partial'}
                            {cap.status === 'unsolved' && '❌ Unsolved'}
                          </Badge>
                        </div>
                      </div>
                      {cap.performanceScore !== null && (
                        <Progress
                          value={cap.performanceScore}
                          className="h-2"
                        />
                      )}
                      <Link
                        to="/capabilities/$slug"
                        params={{ slug: cap.slug }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-primary"
                        >
                          View capability →
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No capabilities tracked yet.
                  </p>
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
                    Total reports mentioning {technology.name}: {totalReports}
                  </p>
                  <div className="space-y-3">
                    {reportBreakdown.map((rb: any) => {
                      const percentage =
                        totalReports > 0
                          ? Math.round((rb.count / totalReports) * 100)
                          : 0
                      return (
                        <div
                          key={rb.impactType}
                          className="flex items-center gap-3"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="capitalize">
                                {rb.impactType.replace('_', ' ')}
                              </span>
                              <span className="text-muted-foreground">
                                {rb.count} ({percentage}%)
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compare with similar technologies */}
            {technology.similarTechnologies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>🔄 Compare with Similar Technologies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {technology.similarTechnologies.map((similar: any) => (
                      <Link
                        key={similar.id}
                        to="/technologies/$slug"
                        params={{ slug: similar.slug }}
                      >
                        <Card className="transition-all hover:shadow-md hover:border-primary/50 h-full">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              {similar.image && (
                                <img
                                  src={similar.image}
                                  alt={similar.name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">
                                  {similar.name}
                                </h4>
                                <p className="text-xs text-muted-foreground truncate">
                                  {similar.organization.name}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {similar._count.reports} reports
                            </p>
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
            {/* Organization Card */}
            <Card>
              <CardHeader>
                <CardTitle>🏢 Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link
                  to="/organizations/$slug"
                  params={{ slug: organization.slug }}
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors">
                    {organization.logo ? (
                      <img
                        src={organization.logo}
                        alt={organization.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xl">
                        🏢
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {organization.name}
                      </p>
                      <div className="flex items-center gap-2">
                        {organization.isSponsor && (
                          <span
                            className={`text-xs ${getSponsorColor(organization.sponsorTier)}`}
                          >
                            {organization.sponsorTier === 'gold' && '🥇 Gold'}
                            {organization.sponsorTier === 'silver' &&
                              '🥈 Silver'}
                            {organization.sponsorTier === 'bronze' &&
                              '🥉 Bronze'}
                          </span>
                        )}
                        {organization.verifiedBadge && (
                          <span className="text-xs text-green-500">✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="space-y-2 text-sm">
                  {organization.foundedYear && (
                    <p className="text-muted-foreground">
                      Founded: {organization.foundedYear}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {organization.types.map((type: string) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {formatType(type)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>📈 Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Reports</span>
                  <span className="font-medium">
                    {technology._count.reports}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Capabilities
                  </span>
                  <span className="font-medium">
                    {technology.capabilities.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Stage</span>
                  <Badge
                    variant="outline"
                    className={getStageColor(technology.stage)}
                  >
                    {formatType(technology.stage)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contribute CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <p className="font-medium mb-2">🚀 Share Your Experience</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Used {technology.name} in your work? Share your impact story.
                </p>
                <Link to="/reports">
                  <Button size="sm" className="w-full">
                    📝 Share Story
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
