import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import {
  deleteCapabilitySubtypeFn,
  getAllSubtypesForAdminFn,
} from '@/actions/admin/capabilities'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
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
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/admin/subtypes/')({
  component: AdminSubtypesPage,
  loader: async () => {
    const result = await getAllSubtypesForAdminFn()
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch subtypes')
    }
    return { subtypes: result.data }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center py-12">
      <Spinner />
    </div>
  ),
})

function AdminSubtypesPage() {
  const { subtypes } = Route.useLoaderData()
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Capability Subtypes</h1>
          <p className="text-muted-foreground">Manage AI capability subtypes</p>
        </div>
        <Link to="/admin/subtypes/add">
          <Button>Add Subtype</Button>
        </Link>
      </div>

      <div className="bg-background border border-border/40 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Capability</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subtypes.map((subtype) => (
              <TableRow key={subtype.id}>
                <TableCell className="font-medium">{subtype.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {subtype.capability?.name || 'Unknown'}
                </TableCell>
                <TableCell>{subtype.domain}</TableCell>
                <TableCell>{subtype.progressPercentage}%</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(subtype.status)}>
                    {subtype.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to="/admin/subtypes/$id/edit"
                      params={{ id: subtype.id }}
                    >
                      <Button variant="ghost" size="sm">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {subtypes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No subtypes found</p>
            <Link to="/admin/subtypes/add">
              <Button>Add your first subtype</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
