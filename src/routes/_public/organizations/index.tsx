import { Link, createFileRoute } from '@tanstack/react-router'

import {
  getAllOrganizationsFn,
  getAllSponsorsFn,
} from '@/actions/organizations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/_public/organizations/')({
  loader: async () => {
    const [{ organizations }, { sponsors }] = await Promise.all([
      getAllOrganizationsFn({ data: {} }),
      getAllSponsorsFn(),
    ])
    return { organizations, sponsors }
  },
  component: OrganizationsPage,
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading organizations...</p>
      </div>
    </div>
  ),
})

function OrganizationsPage() {
  const { organizations, sponsors } = Route.useLoaderData()

  const formatType = (type: string) => {
    return type
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getSponsorColor = (tier: string) => {
    switch (tier) {
      case 'gold':
        return 'border-yellow-500/50 bg-yellow-500/10'
      case 'silver':
        return 'border-slate-400/50 bg-slate-400/10'
      case 'bronze':
        return 'border-orange-600/50 bg-orange-600/10'
      default:
        return ''
    }
  }

  const getSponsorTextColor = (tier: string) => {
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

  const totalSponsors =
    sponsors.gold.length + sponsors.silver.length + sponsors.bronze.length
  const totalTechnologies = organizations.reduce(
    (sum: number, org: { _count: { technologies: number } }) =>
      sum + org._count.technologies,
    0,
  )

  return (
    <>
      {/* Hero Section */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
              Organizations
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Companies and labs building AI that impacts jobs. Track their
              technologies and see real-world impact reports.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>{organizations.length} organizations tracked</span>
              <span>•</span>
              <span>{totalSponsors} sponsors</span>
              <span>•</span>
              <span>{totalTechnologies} technologies</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      {totalSponsors > 0 && (
        <section className="container mx-auto px-6 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">⭐ Sponsors</h2>
            <p className="text-muted-foreground">
              These organizations support OpenModal's mission
            </p>
          </div>

          <div className="space-y-8">
            {/* Gold Sponsors */}
            {sponsors.gold.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🥇</span>
                  <h3 className="font-semibold">Gold Sponsors</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {sponsors.gold.map((org: any) => (
                    <Link
                      key={org.id}
                      to="/organizations/$slug"
                      params={{ slug: org.slug }}
                      className="group"
                    >
                      <Card
                        className={`transition-all hover:shadow-lg ${getSponsorColor('gold')}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            {org.logo ? (
                              <img
                                src={org.logo}
                                alt={org.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl">
                                🏢
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate group-hover:text-primary transition-colors">
                                {org.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {org._count.technologies} technologies
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Silver Sponsors */}
            {sponsors.silver.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🥈</span>
                  <h3 className="font-semibold">Silver Sponsors</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {sponsors.silver.map((org: any) => (
                    <Link
                      key={org.id}
                      to="/organizations/$slug"
                      params={{ slug: org.slug }}
                      className="group"
                    >
                      <Card
                        className={`transition-all hover:shadow-lg ${getSponsorColor('silver')}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            {org.logo ? (
                              <img
                                src={org.logo}
                                alt={org.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl">
                                🏢
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate group-hover:text-primary transition-colors">
                                {org.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {org._count.technologies} technologies
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Bronze Sponsors */}
            {sponsors.bronze.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🥉</span>
                  <h3 className="font-semibold">Bronze Sponsors</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {sponsors.bronze.map((org: any) => (
                    <Link
                      key={org.id}
                      to="/organizations/$slug"
                      params={{ slug: org.slug }}
                      className="group"
                    >
                      <Card
                        className={`transition-all hover:shadow-lg ${getSponsorColor('bronze')}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            {org.logo ? (
                              <img
                                src={org.logo}
                                alt={org.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl">
                                🏢
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate group-hover:text-primary transition-colors">
                                {org.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {org._count.technologies} technologies
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center">
              <Button variant="outline">Become a Sponsor →</Button>
            </div>
          </div>
        </section>
      )}

      {/* All Organizations */}
      <section className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">
            All Organizations ({organizations.length})
          </h2>
        </div>

        {organizations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-6">
              No organizations found.
            </p>
            <Link to="/">
              <Button>Back Home</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org: any) => (
              <Link
                key={org.id}
                to="/organizations/$slug"
                params={{ slug: org.slug }}
                className="group"
              >
                <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {org.logo ? (
                        <img
                          src={org.logo}
                          alt={org.name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                          🏢
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                            {org.name}
                          </h3>
                          {org.isSponsor && (
                            <span
                              className={getSponsorTextColor(org.sponsorTier)}
                            >
                              ✓
                            </span>
                          )}
                        </div>
                        {org.isSponsor && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {org.sponsorTier === 'gold' && '🥇 Gold'}
                            {org.sponsorTier === 'silver' && '🥈 Silver'}
                            {org.sponsorTier === 'bronze' && '🥉 Bronze'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {org.types.slice(0, 2).map((type: string) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {formatType(type)}
                        </Badge>
                      ))}
                      {org.types.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{org.types.length - 2}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {org.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                      <span>{org._count.technologies} technologies</span>
                      <span>{org._count.reports} reports</span>
                      <span>View details →</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Track AI Organizations
          </h2>
          <p className="text-muted-foreground mb-6">
            Stay updated on the companies building AI technologies. See their
            impact on jobs and capabilities.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/login">
              <Button>📝 Get Started</Button>
            </Link>
            <Link to="/">
              <Button variant="outline">🔍 Explore</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
