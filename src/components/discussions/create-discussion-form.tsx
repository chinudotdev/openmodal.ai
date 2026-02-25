import { useForm } from '@tanstack/react-form'

import { z } from 'zod'

import type { EntityType } from '@/db/schema'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'

// ============================================
// TYPES
// ============================================

export interface CreateDiscussionFormProps {
  entityType: EntityType
  entityId: string
  entityName?: string
  onSubmit: (data: { title: string; body: string }) => void
  onCancel?: () => void
  isLoading?: boolean
}

// ============================================
// COMPONENT
// ============================================

export function CreateDiscussionForm({
  entityType,
  entityId: _entityId,
  entityName,
  onSubmit,
  onCancel,
  isLoading = false,
}: CreateDiscussionFormProps) {
  const form = useForm({
    defaultValues: {
      body: '',
    },
    validators: {
      onSubmit: z.object({
        body: z.string().min(10, 'Discussion must be at least 10 characters'),
      }),
    },
    onSubmit: async ({ value }) => {
      // Generate title based on entity type and name
      const title = generateDiscussionTitle(entityType, entityName)
      await onSubmit({ title, body: value.body })
      form.reset()
    },
  })

  const entityLabel = getEntityLabel(entityType)

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Start a Discussion</h2>
          {entityName && (
            <p className="text-sm text-muted-foreground">
              About: {entityLabel} &quot;{entityName}&quot;
            </p>
          )}
        </div>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            ✕
          </Button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="space-y-6"
      >
        <form.Field name="body">
          {(field) => (
            <Field>
              <FieldLabel>Discussion</FieldLabel>
              <Textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Share your thoughts, questions, or insights..."
                rows={6}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <div className="flex items-center gap-4">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? 'Creating...' : 'Start Discussion'}
              </Button>
            )}
          </form.Subscribe>

          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

// ============================================
// HELPERS
// ============================================

function getEntityLabel(entityType: EntityType): string {
  switch (entityType) {
    case 'organization':
      return 'Organization'
    case 'technology':
      return 'Technology'
    case 'capability':
      return 'Capability'
    case 'capability_subtype':
      return 'Sub-capability'
    case 'job':
      return 'Job'
    case 'impact_report':
      return 'Impact Report'
  }
}

function generateDiscussionTitle(
  entityType: EntityType,
  entityName?: string,
): string {
  const label = getEntityLabel(entityType)
  if (entityName) {
    return `Discussion on ${entityName}`
  }
  return `Discussion on ${label}`
}
