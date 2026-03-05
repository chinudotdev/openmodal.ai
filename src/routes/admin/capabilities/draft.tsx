import { createFileRoute } from '@tanstack/react-router'

import { getDraftChangesFn } from '@/actions/draft-changes'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/admin/capabilities/draft')({
  component: AdminCapabilitiesDraftPage,
  loader: async () => {
    const result = (await getDraftChangesFn({
      data: {
        entityType: 'capability',
        sortBy: 'recent',
        limit: 50,
      },
    })) as { draftChanges: Array<any>; total: number }
    return { drafts: result.draftChanges, total: result.total }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center py-12">
      <Spinner />
    </div>
  ),
})

function AdminCapabilitiesDraftPage() {
  const { drafts } = Route.useLoaderData()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
      case 'rejected':
        return 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
      case 'pending':
      default:
        return 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
    }
  }

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'create':
        return 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20'
      case 'update':
        return 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20'
      case 'delete':
        return 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
      default:
        return ''
    }
  }

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getEntityName = (draft: any) => {
    if (draft.data?.name) return draft.data.name
    if (draft.data?.slug) return draft.data.slug
    return 'Unknown'
  }

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Capability Drafts</h1>
        <p className="text-muted-foreground">
          View all draft changes to AI capabilities
        </p>
      </div>

      <div className="bg-background border border-border/40 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operation</TableHead>
              <TableHead>Capability</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drafts.map((draft: any) => (
              <TableRow key={draft.id}>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getOperationColor(draft.operation)}
                  >
                    {draft.operation.charAt(0).toUpperCase() +
                      draft.operation.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {getEntityName(draft)}
                </TableCell>
                <TableCell>
                  {draft.submittedBy ? draft.submittedBy.name : 'Unknown'}
                </TableCell>
                <TableCell>{formatDate(draft.createdAt)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusColor(draft.status)}
                  >
                    {draft.status.charAt(0).toUpperCase() +
                      draft.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {drafts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No draft changes found</p>
          </div>
        )}
      </div>
    </main>
  )
}
