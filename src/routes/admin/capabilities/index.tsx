import { Link, createFileRoute } from '@tanstack/react-router'
import { getAllCapabilitiesForAdminFn } from '@/actions/admin/capabilities'
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
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/admin/capabilities/')({
  component: AdminCapabilitiesPage,
  loader: async () => {
    const result = await getAllCapabilitiesForAdminFn()
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch capabilities')
    }
    return { capabilities: result.data }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center py-12">
      <Spinner />
    </div>
  ),
})

function AdminCapabilitiesPage() {
  const { capabilities } = Route.useLoaderData()

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Capabilities</h1>
          <p className="text-muted-foreground">Manage AI capabilities</p>
        </div>
        <Link to="/admin/capabilities/add">
          <Button>Add Capability</Button>
        </Link>
      </div>

      <div className="bg-background border border-border/40 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Subtypes</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {capabilities.map((capability) => (
              <TableRow key={capability.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{capability.icon || '🔷'}</span>
                    {capability.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {capability.slug}
                </TableCell>
                <TableCell>{capability.subtypesCount}</TableCell>
                <TableCell>{capability.progress}%</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      capability.status === 'solved'
                        ? 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
                        : capability.status === 'partial'
                          ? 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
                          : 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
                    }
                  >
                    {capability.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    to="/admin/capabilities/$slug"
                    params={{ slug: capability.slug }}
                  >
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {capabilities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No capabilities found</p>
            <Link to="/admin/capabilities/add">
              <Button>Add your first capability</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
