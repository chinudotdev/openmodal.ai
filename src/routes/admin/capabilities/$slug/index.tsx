import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  deleteCapabilityFn,
  deleteCapabilitySubtypeFn,
  getCapabilityBySlugForAdminFn,
} from '@/actions/admin/capabilities'
import { Spinner } from '@/components/ui/spinner'
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

export const Route = createFileRoute('/admin/capabilities/$slug/')({
  component: CapabilityDetailPage,
  loader: async ({ params }) => {
    const result = await getCapabilityBySlugForAdminFn({
      data: { slug: params.slug },
    })

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch capability')
    }

    return result
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center py-12">
      <Spinner />
    </div>
  ),
})

function CapabilityDetailPage() {
  const { data } = Route.useLoaderData()
  const router = useRouter()
  const { slug } = Route.useParams()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingCapability, setDeletingCapability] = useState(false)

  const { subtypes, ...capability } = data

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const result = await deleteCapabilitySubtypeFn({ data: { id } })
      if (result.success) {
        await router.invalidate()
      }
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteCapability = async () => {
    setDeletingCapability(true)
    try {
      const result = await deleteCapabilityFn({ data: { id: capability.id } })
      if (result.success) {
        await router.navigate({ to: '/admin/capabilities' })
      }
    } finally {
      setDeletingCapability(false)
    }
  }

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

  // Calculate overall progress from subtypes
  const overallProgress =
    subtypes.length > 0
      ? Math.round(
          subtypes.reduce((sum, s) => sum + s.progressPercentage, 0) /
            subtypes.length,
        )
      : 0

  // Determine overall status
  let overallStatus: 'solved' | 'partial' | 'unsolved' = 'unsolved'
  if (overallProgress >= 80) overallStatus = 'solved'
  else if (overallProgress >= 30) overallStatus = 'partial'

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/capabilities">
          <Button variant="ghost" size="sm">
            ← Back to Capabilities
          </Button>
        </Link>
        <span className="text-4xl">{capability.icon || '🔷'}</span>
        <div>
          <h1 className="text-3xl font-semibold">{capability.name}</h1>
          <p className="text-muted-foreground text-sm">{capability.slug}</p>
        </div>
      </div>

      {/* Capability Card */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <span className="text-muted-foreground text-sm">Description</span>
              <p className="mt-1">{capability.description}</p>
            </div>

            {/* Progress Section */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    Overall Progress
                  </span>
                  <Badge
                    variant="outline"
                    className={getStatusColor(overallStatus)}
                  >
                    {overallStatus.charAt(0).toUpperCase() +
                      overallStatus.slice(1)}
                  </Badge>
                </div>
                <span className="font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {subtypes.length} subtype{subtypes.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Subtype Progress Bars */}
            {subtypes.length > 0 && (
              <div className="space-y-3">
                {subtypes.map((subtype) => (
                  <div key={subtype.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground truncate max-w-50">
                        {subtype.name}
                      </span>
                      <span className="font-medium">
                        {subtype.progressPercentage}%
                      </span>
                    </div>
                    <Progress
                      value={subtype.progressPercentage}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Link to="/admin/capabilities/$slug/edit" params={{ slug }}>
                <Button variant="outline">Edit Capability</Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    disabled={deletingCapability}
                  >
                    {deletingCapability ? (
                      <Spinner className="mr-2 h-4 w-4" />
                    ) : null}
                    {deletingCapability ? 'Deleting...' : 'Delete Capability'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Capability?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{capability.name}" and all
                      its {subtypes.length} subtype(s). This action cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteCapability}
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

      {/* Subtypes List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Subtypes</h2>
          <Link to="/admin/capabilities/$slug/add" params={{ slug }}>
            <Button>Add Subtype</Button>
          </Link>
        </div>

        {subtypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subtypes.map((subtype) => (
              <Card key={subtype.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{subtype.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {subtype.domain}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(subtype.status)}
                    >
                      {subtype.status}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {subtype.progressPercentage}%
                      </span>
                    </div>
                    <Progress
                      value={subtype.progressPercentage}
                      className="h-2"
                    />
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {subtype.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <Link
                      to="/admin/capabilities/$slug/$subslug/edit"
                      params={{ slug, subslug: subtype.slug }}
                    >
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={deletingId === subtype.id}
                        >
                          {deletingId === subtype.id ? (
                            <Spinner className="h-4 w-4" />
                          ) : (
                            'Delete'
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Subtype?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{subtype.name}". This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(subtype.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No subtypes found for this capability
              </p>
              <Link to="/admin/capabilities/$slug/add" params={{ slug }}>
                <Button>Add your first subtype</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
