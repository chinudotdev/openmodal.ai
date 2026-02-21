import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { getFeedbacksFn, markFeedbackReviewedFn } from '@/actions/feedback'
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

export const Route = createFileRoute('/admin/feedback/')({
  component: AdminFeedbackPage,
  loader: async () => {
    const result = await getFeedbacksFn({
      data: {
        reviewed: 'false',
        sortBy: 'recent',
        limit: 50,
      },
    })
    return { feedbacks: result.feedbacks, total: result.total }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center py-12">
      <Spinner />
    </div>
  ),
})

const REVIEWED_OPTIONS = [
  { value: 'false', label: 'Unreviewed' },
  { value: 'true', label: 'Reviewed' },
] as const

const TYPE_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'improvement', label: 'Improvement' },
] as const

function AdminFeedbackPage() {
  const { feedbacks: initialFeedbacks } = Route.useLoaderData()
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks)
  const [adminNotes, setAdminNotes] = useState('')
  const [filterReviewed, setFilterReviewed] = useState<string>('false')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchFeedbacks = async () => {
    setIsLoading(true)
    try {
      const result = await getFeedbacksFn({
        data: {
          reviewed:
            filterReviewed && filterReviewed !== 'all'
              ? (filterReviewed as 'true' | 'false')
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
      setFeedbacks(result.feedbacks)
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewFeedback = (feedbackItem: any) => {
    setSelectedFeedback(feedbackItem)
    setAdminNotes(feedbackItem.adminNotes || '')
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedFeedback(null)
    setAdminNotes('')
  }

  const handleMarkReviewed = async () => {
    if (!selectedFeedback) return

    setIsLoading(true)
    try {
      const result = await markFeedbackReviewedFn({
        data: {
          id: selectedFeedback.id,
          notes: adminNotes || undefined,
        },
      })

      if (result.success) {
        await fetchFeedbacks()
        handleCloseDialog()
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Failed to update feedback:', error)
      alert('Failed to update feedback')
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug':
        return 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
      case 'feature':
        return 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20'
      case 'improvement':
        return 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20'
      case 'general':
      default:
        return 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/20'
    }
  }

  const getTypeLabel = (type: string) => {
    return (
      TYPE_OPTIONS.find((t) => t.value === type)?.label ||
      type.charAt(0).toUpperCase() + type.slice(1)
    )
  }

  const getReviewedColor = (reviewed: string) => {
    return reviewed === 'true'
      ? 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
      : 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
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
        <h1 className="text-3xl font-semibold mb-2">Feedback</h1>
        <p className="text-muted-foreground">
          Review and manage user feedback and bug reports
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchFeedbacks()
              }
            }}
          />
        </div>
        <Select value={filterReviewed} onValueChange={setFilterReviewed}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {REVIEWED_OPTIONS.map((option) => (
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
        <Button onClick={fetchFeedbacks} disabled={isLoading}>
          {isLoading ? <Spinner className="w-4 h-4" /> : 'Apply Filters'}
        </Button>
      </div>

      {/* Feedback Table */}
      <div className="bg-background border border-border/40 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>From</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks.map((feedbackItem: any) => (
              <TableRow key={feedbackItem.id}>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getTypeColor(feedbackItem.type)}
                  >
                    {getTypeLabel(feedbackItem.type)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md">
                  <p className="truncate text-sm">{feedbackItem.content}</p>
                </TableCell>
                <TableCell>
                  {feedbackItem.user
                    ? feedbackItem.user.name
                    : feedbackItem.email || 'Anonymous'}
                </TableCell>
                <TableCell>{formatDate(feedbackItem.createdAt)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getReviewedColor(feedbackItem.reviewed)}
                  >
                    {feedbackItem.reviewed === 'true' ? 'Reviewed' : 'New'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewFeedback(feedbackItem)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {feedbacks.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No feedback found</p>
          </div>
        )}

        {isLoading && feedbacks.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        )}
      </div>

      {/* View/Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedFeedback && (
            <>
              <DialogHeader>
                <DialogTitle>Feedback Details</DialogTitle>
                <DialogDescription>
                  Review the feedback and add admin notes
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Type and Status */}
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={getTypeColor(selectedFeedback.type)}
                  >
                    {getTypeLabel(selectedFeedback.type)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={getReviewedColor(selectedFeedback.reviewed)}
                  >
                    {selectedFeedback.reviewed === 'true' ? 'Reviewed' : 'New'}
                  </Badge>
                  {selectedFeedback.rating && (
                    <span className="text-sm text-muted-foreground">
                      Rating: {selectedFeedback.rating}/5
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Submitted on {formatDate(selectedFeedback.createdAt)}
                  </span>
                </div>

                {/* From */}
                <div>
                  <Label>From</Label>
                  <p className="text-sm">
                    {selectedFeedback.user
                      ? `${selectedFeedback.user.name} (${selectedFeedback.user.email})`
                      : selectedFeedback.email || 'Anonymous'}
                  </p>
                </div>

                {/* Content */}
                <div>
                  <Label>Feedback</Label>
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedFeedback.content}
                  </p>
                </div>

                {/* Admin Notes (for reviewed feedback) */}
                {selectedFeedback.reviewed === 'true' &&
                  selectedFeedback.adminNotes && (
                    <div>
                      <Label>Admin Notes</Label>
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedFeedback.adminNotes}
                      </p>
                      {selectedFeedback.reviewedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reviewed on {formatDate(selectedFeedback.reviewedAt)}
                        </p>
                      )}
                    </div>
                  )}

                {/* Admin Notes Input (for unreviewed feedback) */}
                {selectedFeedback.reviewed === 'false' && (
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="adminNotes">
                        Admin Notes (optional)
                      </FieldLabel>
                      <Textarea
                        id="adminNotes"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about this feedback..."
                        rows={3}
                      />
                    </Field>
                  </FieldGroup>
                )}
              </div>

              <DialogFooter>
                {selectedFeedback.reviewed === 'false' ? (
                  <Button onClick={handleMarkReviewed} disabled={isLoading}>
                    {isLoading ? (
                      <Spinner className="w-4 h-4" />
                    ) : (
                      'Mark as Reviewed'
                    )}
                  </Button>
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
