import { useForm } from '@tanstack/react-form'

import {
  addEnrichmentFn,
  flagReportFn,
  voteEnrichmentFn,
  voteReportFn,
} from '@/actions/reports'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SelectWrapper } from '@/components/ui/select-wrapper'
import { Textarea } from '@/components/ui/textarea'
import { formatNumber, formatRelativeTime } from '@/lib/format'

// ============================================
// TYPES & CONSTANTS
// ============================================

export interface ReportDetailProps {
  report: {
    id: string
    jobTitle: string
    description: string
    impactType: string
    title: string | null
    location: string | null
    country: string | null
    companyName: string | null
    companySize: string | null
    technologyDescription: string | null
    workersAffectedCount: number | null
    eventDate: Date | null
    sourceUrl: string | null
    technologyId: string | null
    submittedBy: string
    isAnonymous: boolean
    reporterRelationship: string | null
    status: string
    upvotes: number
    viewCount: number
    isFeatured: boolean
    createdAt: Date
    updatedAt: Date
    submitter?: {
      id: string
      name: string | null
      username: string
      email: string | null
    } | null
    technology?: {
      id: string
      name: string
      slug: string
      type: string
    } | null
    enrichments?: Array<{
      id: string
      enrichmentType: string
      linkedEntityId: string | null
      suggestedName: string | null
      confidence: string
      notes: string | null
      upvotes: number
      downvotes: number
      createdAt: Date
      user?: {
        id: string
        username: string
      } | null
    }>
    _enrichmentCount?: number
    _flagCount?: number
  }
  session?: {
    user: {
      id: string
      username: string
    }
  } | null
}

const IMPACT_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  layoffs: { label: 'Layoffs', color: 'destructive', icon: '🔴' },
  reduced_hours: { label: 'Reduced Hours', color: 'secondary', icon: '🟠' },
  role_change: { label: 'Role Change', color: 'default', icon: '🟡' },
  new_tools: { label: 'New Tools', color: 'outline', icon: '🟢' },
  productivity_boost: {
    label: 'Productivity Boost',
    color: 'outline',
    icon: '🚀',
  },
  no_change: { label: 'No Change', color: 'outline', icon: '➡️' },
}

const ENRICHMENT_TYPE_OPTIONS = [
  { value: 'job_link', label: '👔 Job' },
  { value: 'technology_link', label: '🤖 Technology' },
  { value: 'task_link', label: '✅ Task' },
  { value: 'capability_subtype_link', label: '🎯 Capability' },
]

const CONFIDENCE_OPTIONS = [
  { value: 'certain', label: 'Certain - I have direct knowledge' },
  { value: 'likely', label: 'Likely - Reasonable inference' },
  { value: 'guess', label: 'Guess - Speculative' },
]

const FLAG_REASON_OPTIONS = [
  { value: 'spam', label: 'Spam or self-promotion' },
  { value: 'fake', label: 'Fake or fabricated' },
  { value: 'duplicate', label: 'Duplicate report' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
]

// ============================================
// COMPONENTS
// ============================================

export function ReportDetail({ report, session }: ReportDetailProps) {
  // Get impact type config with fallback
  const impactConfig =
    IMPACT_TYPE_CONFIG[report.impactType] ?? IMPACT_TYPE_CONFIG.no_change

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    try {
      await voteReportFn({ data: { reportId: report.id, voteType } })
    } catch (error) {
      console.error('Failed to vote:', error)
    }
  }

  const handleEnrichmentVote = async (
    enrichmentId: string,
    voteType: 'upvote' | 'downvote',
  ) => {
    try {
      await voteEnrichmentFn({ data: { enrichmentId, voteType } })
    } catch (error) {
      console.error('Failed to vote on enrichment:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Badge variant={impactConfig.color as any}>
            <span className="mr-1">{impactConfig.icon}</span>
            {impactConfig.label}
          </Badge>
          {report.isFeatured && (
            <Badge
              variant="outline"
              className="text-amber-600 border-amber-600"
            >
              ⭐ Featured
            </Badge>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-2">
          {report.title || report.jobTitle}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>
            By{' '}
            {report.isAnonymous
              ? 'Anonymous'
              : report.submitter?.username || 'Unknown'}
          </span>
          <span>•</span>
          <span>{formatRelativeTime(report.createdAt)}</span>
          <span>•</span>
          <span>{formatNumber(report.viewCount)} views</span>
        </div>
      </div>

      {/* Engagement Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVote('upvote')}
              >
                <span className="mr-1">👍</span>
                <span>{formatNumber(report.upvotes)}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVote('downvote')}
              >
                <span className="mr-1">👎</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {session && (
                <>
                  <EnrichmentDialog reportId={report.id} />
                  <FlagDialog reportId={report.id} />
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Impact Report</CardTitle>
              <CardDescription>
                What happened and how it affected this role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Role</h3>
                <p className="text-lg">{report.jobTitle}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Story</h3>
                <p className="whitespace-pre-wrap">{report.description}</p>
              </div>

              {report.technologyDescription && (
                <div>
                  <h3 className="font-semibold mb-1">Technology Involved</h3>
                  <p>{report.technologyDescription}</p>
                </div>
              )}

              {report.workersAffectedCount && (
                <div>
                  <h3 className="font-semibold mb-1">Workers Affected</h3>
                  <p>{formatNumber(report.workersAffectedCount)}</p>
                </div>
              )}

              {report.eventDate && (
                <div>
                  <h3 className="font-semibold mb-1">When It Happened</h3>
                  <p>{new Date(report.eventDate).toLocaleDateString()}</p>
                </div>
              )}

              {report.sourceUrl && (
                <div>
                  <h3 className="font-semibold mb-1">Source</h3>
                  <a
                    href={report.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {report.sourceUrl}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enrichments */}
          {report.enrichments && report.enrichments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Community Enrichments</CardTitle>
                <CardDescription>
                  Linked entities and context added by the community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.enrichments.map((enrichment) => (
                  <div key={enrichment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">
                            {
                              ENRICHMENT_TYPE_OPTIONS.find(
                                (e) => e.value === enrichment.enrichmentType,
                              )?.label
                            }
                          </Badge>
                          <Badge variant="secondary">
                            {enrichment.confidence}
                          </Badge>
                        </div>
                        <p className="font-medium">
                          {enrichment.linkedEntityId ||
                            enrichment.suggestedName ||
                            'Unknown'}
                        </p>
                        {enrichment.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {enrichment.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Added by {enrichment.user?.username || 'Anonymous'} •{' '}
                          {formatRelativeTime(enrichment.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleEnrichmentVote(enrichment.id, 'upvote')
                          }
                        >
                          👍 {enrichment.upvotes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleEnrichmentVote(enrichment.id, 'downvote')
                          }
                        >
                          👎 {enrichment.downvotes}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Info */}
          {(report.companyName ||
            report.location ||
            report.country ||
            report.companySize) && (
            <Card>
              <CardHeader>
                <CardTitle>Company</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {report.companyName && (
                  <div>
                    <span className="text-sm text-muted-foreground">Name</span>
                    <p className="font-medium">{report.companyName}</p>
                  </div>
                )}
                {report.companySize && (
                  <div>
                    <span className="text-sm text-muted-foreground">Size</span>
                    <p className="font-medium">{report.companySize}</p>
                  </div>
                )}
                {(report.location || report.country) && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Location
                    </span>
                    <p className="font-medium">
                      {[report.location, report.country]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reporter Info */}
          {report.reporterRelationship && (
            <Card>
              <CardHeader>
                <CardTitle>Reporter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {report.reporterRelationship === 'employee' &&
                    'Current employee'}
                  {report.reporterRelationship === 'former_employee' &&
                    'Former employee'}
                  {report.reporterRelationship === 'manager' &&
                    'Manager of affected team'}
                  {report.reporterRelationship === 'witness' &&
                    'Direct witness'}
                  {report.reporterRelationship === 'news' && 'From news report'}
                  {report.reporterRelationship === 'researcher' &&
                    'Academic/industry researcher'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Technology */}
          {report.technology && (
            <Card>
              <CardHeader>
                <CardTitle>Related Technology</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`/technologies/${report.technology.slug}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {report.technology.name}
                </a>
                <p className="text-sm text-muted-foreground mt-1">
                  {report.technology.type}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Upvotes</span>
                <span className="font-medium">
                  {formatNumber(report.upvotes)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Views</span>
                <span className="font-medium">
                  {formatNumber(report.viewCount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enrichments</span>
                <span className="font-medium">
                  {report._enrichmentCount || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

function EnrichmentDialog({ reportId }: { reportId: string }) {
  const form = useForm({
    defaultValues: {
      enrichmentType: '',
      linkedEntityId: '',
      suggestedName: '',
      confidence: 'likely',
      notes: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await addEnrichmentFn({
          data: {
            reportId,
            enrichmentType: value.enrichmentType as any,
            linkedEntityId: value.linkedEntityId || undefined,
            suggestedName: value.suggestedName || undefined,
            confidence: value.confidence as any,
            notes: value.notes || undefined,
          },
        })
      } catch (error) {
        console.error('Failed to add enrichment:', error)
      }
    },
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          🔗 Add Enrichment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Enrichment</DialogTitle>
          <DialogDescription>
            Help link this report to jobs, technologies, tasks, or capabilities
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="enrichmentType"
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Type</FieldLabel>
                <SelectWrapper
                  id={field.name}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value as any)}
                  options={ENRICHMENT_TYPE_OPTIONS}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />

          <form.Field
            name="suggestedName"
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Software Engineer, ChatGPT..."
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />

          <form.Field
            name="confidence"
            children={(field) => (
              <Field>
                <SelectWrapper
                  id={field.name}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value as any)}
                  options={CONFIDENCE_OPTIONS}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />

          <form.Field
            name="notes"
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Notes (optional)</FieldLabel>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Explain why this link is relevant..."
                  rows={2}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Adding...' : 'Add Enrichment'}
              </Button>
            )}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FlagDialog({ reportId }: { reportId: string }) {
  const form = useForm({
    defaultValues: {
      reason: '',
      notes: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await flagReportFn({
          data: {
            reportId,
            reason: value.reason as any,
            notes: value.notes || undefined,
          },
        })
      } catch (error) {
        console.error('Failed to flag report:', error)
      }
    },
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          🚩 Flag
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Flag this report</AlertDialogTitle>
          <AlertDialogDescription>
            Help us maintain quality by flagging inappropriate, fake, or
            duplicate content.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="reason"
            validators={{
              onChange: ({ value }) =>
                !value ? { message: 'Please select a reason' } : undefined,
            }}
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Reason</FieldLabel>
                <SelectWrapper
                  id={field.name}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value as any)}
                  options={FLAG_REASON_OPTIONS}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />

          <form.Field
            name="notes"
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Additional notes (optional)
                </FieldLabel>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Provide more context..."
                  rows={2}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <AlertDialogAction asChild>
                  <Button type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting ? 'Flagging...' : 'Flag Report'}
                  </Button>
                </AlertDialogAction>
              )}
            />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
