import { Link, createFileRoute } from '@tanstack/react-router'

import { getOrganizationBySlugForAdminFn } from '@/actions/admin/organizations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/admin/organizations/$slug/')({
  loader: async ({ params }) => {
    const result = await getOrganizationBySlugForAdminFn({
      data: { slug: params.slug },
    })
    if (!result.success) {
      throw new Error('Organization not found')
    }
    return { organization: result.data }
  },
  component: AdminOrganizationDetailPage,
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading organization...</p>
      </div>
    </div>
  ),
})

function AdminOrganizationDetailPage() {
  const { organization } = Route.useLoaderData()

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

  return (
    <>
      {/* Header */}
      <header className="border-b border-border/40 bg-muted/30">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin/organizations">
                <Button variant="ghost" size="sm">
                  ← Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold flex items-center gap-3">
                  <span>{organization.name}</span>
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
                </h1>
                <p className="text-sm text-muted-foreground">
                  /{organization.slug}
                </p>
              </div>
            </div>
            <Link
              to="/admin/organizations/$slug/edit"
              params={{ slug: organization.slug }}
            >
              <Button>Edit Organization</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Description</p>
                  <p className="text-sm text-muted-foreground">
                    {organization.description}
                  </p>
                </div>

                {organization.website && (
                  <div>
                    <p className="text-sm font-medium mb-1">Website</p>
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {organization.website
                        .replace(/^https?:\/\//, '')
                        .replace(/\/$/, '')}
                    </a>
                  </div>
                )}

                {organization.foundedYear && (
                  <div>
                    <p className="text-sm font-medium mb-1">Founded</p>
                    <p className="text-sm text-muted-foreground">
                      {organization.foundedYear}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium mb-1">Types</p>
                  <div className="flex flex-wrap gap-2">
                    {organization.types.map((type: string) => (
                      <Badge key={type} variant="outline">
                        {formatType(type)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technologies Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    🤖 Technologies ({organization._count.technologies})
                  </CardTitle>
                  <Link
                    to="/admin/organizations/$slug/add"
                    params={{ slug: organization.slug }}
                  >
                    <Button size="sm">Add Technology</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {organization.technologies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No technologies yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {organization.technologies.map((tech: any) => (
                      <Link
                        key={tech.id}
                        to="/admin/organizations/$slug/$technologies"
                        params={{
                          slug: organization.slug,
                          technologies: tech.slug,
                        }}
                        className="group"
                      >
                        <Card className="transition-all hover:shadow-md hover:border-primary/50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{tech.name}</h4>
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20"
                              >
                                Deployed
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

            {/* Capabilities Card */}
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

            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>🏷️ Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sponsor</span>
                  <span className="font-medium">
                    {organization.isSponsor ? (
                      <span
                        className={getSponsorColor(organization.sponsorTier)}
                      >
                        {organization.sponsorTier}
                      </span>
                    ) : (
                      'No'
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Claimed</span>
                  <span className="font-medium">
                    {organization.isClaimed ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Verified
                  </span>
                  <span className="font-medium">
                    {organization.verifiedBadge ? 'Yes' : 'No'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  to="/admin/organizations/$slug/edit"
                  params={{ slug: organization.slug }}
                >
                  <Button size="sm" className="w-full">
                    Edit Organization
                  </Button>
                </Link>
                <Link
                  to="/organizations/$slug"
                  params={{ slug: organization.slug }}
                >
                  <Button size="sm" variant="outline" className="w-full">
                    View Public Page
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
