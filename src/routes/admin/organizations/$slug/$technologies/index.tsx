import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { getOrganizationBySlugForAdminFn } from '@/actions/admin/organizations'
import {
  deleteTechnologyFn,
  getTechnologyBySlugForAdminFn,
  getTechnologyCapabilityMappingsFn,
} from '@/actions/admin/technologies'
import { CapabilityMappingModal } from '@/components/capability-mapping-modal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute(
  '/admin/organizations/$slug/$technologies/',
)({
  component: TechnologyDetailPage,
  loader: async ({ params }) => {
    const [orgResult, techResult] = await Promise.all([
      getOrganizationBySlugForAdminFn({ data: { slug: params.slug } }),
      getTechnologyBySlugForAdminFn({ data: { slug: params.technologies } }),
    ])

    if (!orgResult.success) {
      throw new Error(orgResult.error || 'Organization not found')
    }

    if (!techResult.success) {
      throw new Error(techResult.error || 'Technology not found')
    }

    // Fetch capability mappings for this technology
    const mappings = await getTechnologyCapabilityMappingsFn({
      data: { technologyId: techResult.data.id },
    })
    const capabilityMappings = mappings.success ? mappings.data : []

    return {
      organization: orgResult.data,
      technology: techResult.data,
      capabilityMappings,
    }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center py-12">
      <Spinner />
    </div>
  ),
})

function TechnologyDetailPage() {
  const { organization, technology, capabilityMappings } = Route.useLoaderData()
  const router = useRouter()
  const { slug, technologies: techSlug } = Route.useParams()
  const [deleting, setDeleting] = useState(false)
  const [mappingModalOpen, setMappingModalOpen] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const result = await deleteTechnologyFn({ data: { id: technology.id } })
      if (result.success) {
        await router.invalidate()
        await router.navigate({ to: `/admin/organizations/${slug}` })
      }
    } finally {
      setDeleting(false)
    }
  }

  const handleModalSave = async () => {
    await router.invalidate()
    setMappingModalOpen(false)
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
      case 'rejected':
        return 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
      default:
        return ''
    }
  }

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/organizations/$slug" params={{ slug: slug }}>
          <Button variant="ghost" size="sm">
            ← Back to Organization
          </Button>
        </Link>
        <span className="text-4xl">🤖</span>
        <div>
          <h1 className="text-3xl font-semibold">{technology.name}</h1>
          <p className="text-sm text-muted-foreground">
            by {organization.name}
          </p>
        </div>
      </div>

      {/* Technology Card */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <p className="text-sm font-medium mb-1">Description</p>
              <p className="text-sm text-muted-foreground">
                {technology.description}
              </p>
            </div>

            {/* Type, Stage, Status */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                Type: {getTypeLabel(technology.type)}
              </Badge>
              <Badge
                variant="outline"
                className={getStageColor(technology.stage)}
              >
                Stage: {technology.stage}
              </Badge>
              <Badge
                variant="outline"
                className={getStatusColor(technology.status)}
              >
                Status: {technology.status}
              </Badge>
            </div>

            {/* Website */}
            {technology.website && (
              <div>
                <p className="text-sm font-medium mb-1">Website</p>
                <a
                  href={technology.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {technology.website
                    .replace(/^https?:\/\//, '')
                    .replace(/\/$/, '')}
                </a>
              </div>
            )}

            {/* Release Date */}
            {technology.releaseDate && (
              <div>
                <p className="text-sm font-medium mb-1">Release Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(technology.releaseDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Capabilities */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">
                  Capabilities{' '}
                  {technology.capabilities.length > 0 &&
                    `(${technology.capabilities.length})`}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMappingModalOpen(true)}
                >
                  {capabilityMappings.length > 0
                    ? 'Manage Mappings'
                    : 'Add Mappings'}
                </Button>
              </div>
              {technology.capabilities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {technology.capabilities.map((cap: any) => (
                    <Link
                      key={cap.id}
                      to="/capabilities/$slug/$subslug"
                      params={{ slug: cap.capabilitySlug, subslug: cap.slug }}
                      className="group"
                    >
                      <Card className="transition-all hover:shadow-md hover:border-primary/50">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{cap.name}</span>
                            {cap.performanceScore !== null && (
                              <Badge variant="outline">
                                {cap.performanceScore}%
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No capability mappings yet. Click "Add Mappings" to get
                  started.
                </p>
              )}
            </div>

            {/* Capability Mappings Modal */}
            <CapabilityMappingModal
              technologyId={technology.id}
              technologyName={technology.name}
              initialMappings={capabilityMappings}
              open={mappingModalOpen}
              onClose={() => setMappingModalOpen(false)}
              onSave={handleModalSave}
            />

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Link
                to="/admin/organizations/$slug/$technologies/edit"
                params={{ slug, technologies: techSlug }}
              >
                <Button variant="outline">Edit Technology</Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    disabled={deleting}
                  >
                    {deleting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                    {deleting ? 'Deleting...' : 'Delete Technology'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Technology?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{technology.name}". This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📈 Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Reports</span>
              <span className="font-medium">{technology._count.reports}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Capabilities
              </span>
              <span className="font-medium">
                {technology.capabilities.length || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/technologies/$slug" params={{ slug: techSlug }}>
              <Button size="sm" className="w-full" variant="outline">
                View Public Page
              </Button>
            </Link>
            <Link to="/admin/organizations/$slug" params={{ slug }}>
              <Button size="sm" className="w-full" variant="outline">
                Back to Organization
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
