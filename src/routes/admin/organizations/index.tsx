import { Link, createFileRoute } from '@tanstack/react-router'

import { getAllOrganizationsForAdminFn } from '@/actions/admin/organizations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/admin/organizations/')({
  loader: async () => {
    const result = await getAllOrganizationsForAdminFn()
    return { organizations: result.success ? result.data : [] }
  },
  component: AdminOrganizationsPage,
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading organizations...</p>
      </div>
    </div>
  ),
})

function AdminOrganizationsPage() {
  const { organizations } = Route.useLoaderData()

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

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Organizations</h1>
          <p className="text-muted-foreground">
            Manage AI organizations and companies
          </p>
        </div>
        <Link to="/admin/organizations/add">
          <Button>Add Organization</Button>
        </Link>
      </div>

      {organizations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-6">
              No organizations found.
            </p>
            <Link to="/admin/organizations/add">
              <Button>Create your first organization</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org: any) => (
            <Link
              key={org.id}
              to="/admin/organizations/$slug"
              params={{ slug: org.slug }}
              className="group"
            >
              <Card
                className={`h-full transition-all hover:shadow-lg hover:border-primary/50 ${
                  org.isSponsor ? getSponsorColor(org.sponsorTier) : ''
                }`}
              >
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
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                          {org.name}
                        </h3>
                        {org.isSponsor && (
                          <Badge variant="outline" className="text-xs">
                            {org.sponsorTier === 'gold' && '🥇 Gold'}
                            {org.sponsorTier === 'silver' && '🥈 Silver'}
                            {org.sponsorTier === 'bronze' && '🥉 Bronze'}
                          </Badge>
                        )}
                        {org.verifiedBadge && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20"
                          >
                            ✓
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        /{org.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {org.types.slice(0, 2).map((type: string) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type.replace(/_/g, ' ')}
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
                    <Link
                      to="/admin/organizations/$slug/edit"
                      params={{ slug: org.slug }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
