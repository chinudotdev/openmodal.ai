import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import {
  getDraftChangeByIdFn,
  getDraftChangesFn,
  updateDraftChangeStatusFn,
} from '@/actions/draft-changes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

// Component for visually rendering JSON data
function JsonViewer({ data }: { data: any }) {
  const entries = Object.entries(data || {})

  return (
    <div className="bg-background border border-border/40 rounded-lg overflow-hidden">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="flex border-b border-border/40 last:border-b-0"
        >
          <div className="w-1/3 bg-muted/30 px-4 py-3 border-r border-border/40 font-medium text-sm">
            {key}
          </div>
          <div className="flex-1 px-4 py-3">{renderValue(value)}</div>
        </div>
      ))}
      {entries.length === 0 && (
        <div className="px-4 py-3 text-muted-foreground italic">No data</div>
      )}
    </div>
  )
}

function renderValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">null</span>
  }
  if (typeof value === 'boolean') {
    return (
      <span
        className={
          value
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }
      >
        {String(value)}
      </span>
    )
  }
  if (typeof value === 'number') {
    return (
      <span className="text-purple-600 dark:text-purple-400 font-mono">
        {String(value)}
      </span>
    )
  }
  if (typeof value === 'string') {
    return <span className="text-foreground">{value}</span>
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground italic">[]</span>
    }
    return (
      <div className="space-y-1">
        {value.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-muted-foreground">[{index}]</span>
            <div className="flex-1 bg-muted/50 p-2 rounded">
              {renderValue(item)}
            </div>
          </div>
        ))}
      </div>
    )
  }
  if (typeof value === 'object') {
    const nestedEntries = Object.entries(value)
    if (nestedEntries.length === 0) {
      return <span className="text-muted-foreground italic">{'{}'}</span>
    }
    return (
      <div className="space-y-1">
        {nestedEntries.map(([k, v]) => (
          <div key={k} className="flex items-start gap-2">
            <span className="text-muted-foreground">{k}:</span>
            <div className="flex-1 bg-muted/50 p-2 rounded">
              {renderValue(v)}
            </div>
          </div>
        ))}
      </div>
    )
  }
  return String(value)
}

export const Route = createFileRoute('/admin/drafts/technologies/')({
  component: AdminTechnologiesDraftsPage,
  loader: async () => {
    const result = (await getDraftChangesFn({
      data: {
        entityType: 'technology',
        status: 'pending',
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

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
] as const

const OPERATION_OPTIONS = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
] as const

function AdminTechnologiesDraftsPage() {
  const { drafts: initialDrafts } = Route.useLoaderData()
  const [selectedDraft, setSelectedDraft] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [drafts, setDrafts] = useState(initialDrafts)
  const [response, setResponse] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('pending')
  const [filterOperation, setFilterOperation] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchDrafts = async () => {
    setIsLoading(true)
    try {
      const result = (await getDraftChangesFn({
        data: {
          entityType: 'technology',
          status:
            filterStatus && filterStatus !== 'all'
              ? (filterStatus as any)
              : undefined,
          operation:
            filterOperation && filterOperation !== 'all'
              ? (filterOperation as any)
              : undefined,
          search: searchQuery || undefined,
          sortBy: 'recent',
          limit: 50,
        },
      })) as { draftChanges: Array<any>; total: number }
      setDrafts(result.draftChanges)
      console.log('[technologies page] Received drafts:', result.draftChanges)
      console.log(
        '[technologies page] First draft entity type:',
        result.draftChanges[0]?.entityType,
      )
    } catch (error) {
      console.error('Failed to fetch drafts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDraft = async (draft: any) => {
    setIsLoading(true)
    try {
      const result = (await getDraftChangeByIdFn({
        data: { id: draft.id },
      })) as any
      setSelectedDraft(result)
      setResponse(result?.response || '')
      setIsDialogOpen(true)
    } catch (error) {
      console.error('Failed to fetch draft details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedDraft(null)
    setResponse('')
  }

  const handleUpdateStatus = async (newStatus: 'approved' | 'rejected') => {
    if (!selectedDraft) return

    setIsLoading(true)
    try {
      const result = await updateDraftChangeStatusFn({
        data: {
          id: selectedDraft.id,
          status: newStatus,
          response: response || undefined,
        },
      })

      if (result.success) {
        await fetchDrafts()
        handleCloseDialog()
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Failed to update draft:', error)
      alert('Failed to update draft')
    } finally {
      setIsLoading(false)
    }
  }

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
        <h1 className="text-3xl font-semibold mb-2">Technology Drafts</h1>
        <p className="text-muted-foreground">
          Review and manage draft changes to technologies
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search drafts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchDrafts()
              }
            }}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterOperation} onValueChange={setFilterOperation}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Operation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Operations</SelectItem>
            {OPERATION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={fetchDrafts} disabled={isLoading}>
          {isLoading ? <Spinner className="w-4 h-4" /> : 'Apply Filters'}
        </Button>
      </div>

      {/* Drafts Table */}
      <div className="bg-background border border-border/40 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operation</TableHead>
              <TableHead>Technology</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDraft(draft)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {drafts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No draft changes found</p>
          </div>
        )}

        {isLoading && drafts.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        )}
      </div>

      {/* View/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          {selectedDraft && (
            <>
              <DialogHeader>
                <DialogTitle>Draft Change Details</DialogTitle>
                <DialogDescription>
                  Review and respond to the proposed change
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Operation and Status */}
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={getOperationColor(selectedDraft.operation)}
                  >
                    {selectedDraft.operation.charAt(0).toUpperCase() +
                      selectedDraft.operation.slice(1)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getStatusColor(selectedDraft.status)}
                  >
                    {selectedDraft.status.charAt(0).toUpperCase() +
                      selectedDraft.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Submitted on {formatDate(selectedDraft.createdAt)}
                  </span>
                </div>

                {/* Submitter Info */}
                <div>
                  <Label>Submitted By</Label>
                  <p className="text-sm">
                    {selectedDraft.submittedBy
                      ? `${selectedDraft.submittedBy.name} (${selectedDraft.submittedBy.email})`
                      : 'Unknown'}
                  </p>
                </div>

                {/* Entity ID (for updates/deletes) */}
                {selectedDraft.entityId && (
                  <div>
                    <Label>Entity ID</Label>
                    <p className="font-mono text-sm bg-muted p-2 rounded">
                      {selectedDraft.entityId}
                    </p>
                  </div>
                )}

                {/* Proposed Data */}
                <div>
                  <Label>Proposed Data</Label>
                  <div className="mt-2">
                    <JsonViewer data={selectedDraft.data} />
                  </div>
                </div>

                {/* Reason */}
                {selectedDraft.reason && (
                  <div>
                    <Label>Reason</Label>
                    <p className="text-sm whitespace-pre-wrap bg-muted/50 dark:bg-muted/30 p-3 rounded-md">
                      {selectedDraft.reason}
                    </p>
                  </div>
                )}

                {/* Response (for approved/rejected) */}
                {selectedDraft.status !== 'pending' &&
                  selectedDraft.response && (
                    <div>
                      <Label>Your Response</Label>
                      <p className="text-sm whitespace-pre-wrap bg-muted/50 dark:bg-muted/30 p-3 rounded-md">
                        {selectedDraft.response}
                      </p>
                      {selectedDraft.reviewedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Responded on {formatDate(selectedDraft.reviewedAt)}
                        </p>
                      )}
                    </div>
                  )}

                {/* Response Input (for pending drafts) */}
                {selectedDraft.status === 'pending' && (
                  <FieldGroup>
                    <FieldLabel htmlFor="response">
                      Response to Submitter (optional)
                    </FieldLabel>
                    <Textarea
                      id="response"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Add a response to the submitter..."
                      rows={3}
                    />
                  </FieldGroup>
                )}
              </div>

              <DialogFooter>
                {selectedDraft.status === 'pending' ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus('rejected')}
                      disabled={isLoading}
                    >
                      {isLoading ? <Spinner className="w-4 h-4" /> : 'Reject'}
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus('approved')}
                      disabled={isLoading}
                    >
                      {isLoading ? <Spinner className="w-4 h-4" /> : 'Approve'}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Close
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
