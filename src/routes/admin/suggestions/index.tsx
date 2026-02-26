import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import {
  getSuggestionsFn,
  updateSuggestionStatusFn,
} from '@/actions/suggestions'
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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
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

export const Route = createFileRoute('/admin/suggestions/')({
  component: AdminSuggestionsPage,
  loader: async () => {
    const result = await getSuggestionsFn({
      data: {
        status: ['pending'],
        sortBy: 'recent',
        limit: 50,
      },
    })
    return { suggestions: result.suggestions, total: result.total }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center py-12">
      <Spinner />
    </div>
  ),
})

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
] as const

const TYPE_OPTIONS = [
  { value: 'job', label: 'Jobs' },
  { value: 'capability', label: 'Capabilities' },
  { value: 'capability_subtype', label: 'Capability Subtypes' },
  { value: 'task', label: 'Tasks' },
  { value: 'organization', label: 'Organizations' },
] as const

function AdminSuggestionsPage() {
  const { suggestions: initialSuggestions } = Route.useLoaderData()
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState(initialSuggestions)
  const [response, setResponse] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('pending')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchSuggestions = async () => {
    setIsLoading(true)
    try {
      const result = await getSuggestionsFn({
        data: {
          status:
            filterStatus && filterStatus !== 'all'
              ? [filterStatus as any]
              : undefined,
          type:
            filterType && filterType !== 'all'
              ? [filterType as any]
              : undefined,
          search: searchQuery || undefined,
          sortBy: 'recent',
          limit: 50,
        },
      })
      setSuggestions(result.suggestions)
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewSuggestion = (suggestion: any) => {
    setSelectedSuggestion(suggestion)
    setResponse(suggestion.response || '')
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedSuggestion(null)
    setResponse('')
  }

  const handleUpdateStatus = async (newStatus: 'accepted' | 'rejected') => {
    if (!selectedSuggestion) return

    setIsLoading(true)
    try {
      const result = await updateSuggestionStatusFn({
        data: {
          id: selectedSuggestion.id,
          status: newStatus,
          response: response || undefined,
        },
      })

      if (result.success) {
        await fetchSuggestions()
        handleCloseDialog()
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Failed to update suggestion:', error)
      alert('Failed to update suggestion')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
      case 'rejected':
        return 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
      case 'pending':
      default:
        return 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
    }
  }

  const getTypeLabel = (type: string) => {
    return (
      TYPE_OPTIONS.find((t) => t.value === type)?.label ||
      type.charAt(0).toUpperCase() + type.slice(1)
    )
  }

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Suggestions</h1>
        <p className="text-muted-foreground">
          Review and manage user-submitted suggestions
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search suggestions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchSuggestions()
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
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={fetchSuggestions} disabled={isLoading}>
          {isLoading ? <Spinner className="w-4 h-4" /> : 'Apply Filters'}
        </Button>
      </div>

      {/* Suggestions Table */}
      <div className="bg-background border border-border/40 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Suggested Name</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suggestions.map((suggestion: any) => (
              <TableRow key={suggestion.id}>
                <TableCell>
                  <Badge variant="outline">
                    {getTypeLabel(suggestion.type)}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {suggestion.suggestedName}
                </TableCell>
                <TableCell>
                  {suggestion.user
                    ? suggestion.user.name
                    : suggestion.email || 'Anonymous'}
                </TableCell>
                <TableCell>{formatDate(suggestion.createdAt)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusColor(suggestion.status)}
                  >
                    {suggestion.status.charAt(0).toUpperCase() +
                      suggestion.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewSuggestion(suggestion)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {suggestions.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No suggestions found</p>
          </div>
        )}

        {isLoading && suggestions.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        )}
      </div>

      {/* View/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedSuggestion && (
            <>
              <DialogHeader>
                <DialogTitle>Suggestion Details</DialogTitle>
                <DialogDescription>
                  Review the suggestion and respond to the submitter
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Type and Status */}
                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    {getTypeLabel(selectedSuggestion.type)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getStatusColor(selectedSuggestion.status)}
                  >
                    {selectedSuggestion.status.charAt(0).toUpperCase() +
                      selectedSuggestion.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Submitted on {formatDate(selectedSuggestion.createdAt)}
                  </span>
                </div>

                {/* Submitter Info */}
                <div>
                  <Label>Submitted By</Label>
                  <p className="text-sm">
                    {selectedSuggestion.user
                      ? `${selectedSuggestion.user.name} (${selectedSuggestion.user.email})`
                      : selectedSuggestion.email || 'Anonymous'}
                  </p>
                </div>

                {/* Suggested Name */}
                <div>
                  <Label>Suggested Name</Label>
                  <p className="font-medium">
                    {selectedSuggestion.suggestedName}
                  </p>
                </div>

                {/* Reason */}
                <div>
                  <Label>Reason</Label>
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedSuggestion.reason}
                  </p>
                </div>

                {/* Additional Info */}
                {selectedSuggestion.additionalInfo && (
                  <div>
                    <Label>Additional Information</Label>
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedSuggestion.additionalInfo}
                    </p>
                  </div>
                )}

                {/* Response (for accepted/rejected) */}
                {selectedSuggestion.status !== 'pending' &&
                  selectedSuggestion.response && (
                    <div>
                      <Label>Your Response</Label>
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedSuggestion.response}
                      </p>
                      {selectedSuggestion.reviewedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Responded on{' '}
                          {formatDate(selectedSuggestion.reviewedAt)}
                        </p>
                      )}
                    </div>
                  )}

                {/* Response Input (for pending suggestions) */}
                {selectedSuggestion.status === 'pending' && (
                  <FieldGroup>
                    <Field>
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
                    </Field>
                  </FieldGroup>
                )}
              </div>

              <DialogFooter>
                {selectedSuggestion.status === 'pending' ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus('rejected')}
                      disabled={isLoading}
                    >
                      {isLoading ? <Spinner className="w-4 h-4" /> : 'Reject'}
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus('accepted')}
                      disabled={isLoading}
                    >
                      {isLoading ? <Spinner className="w-4 h-4" /> : 'Accept'}
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
