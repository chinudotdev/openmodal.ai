import { useForm } from '@tanstack/react-form'

import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Field, FieldError } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'

// ============================================
// TYPES
// ============================================

export interface CreateReplyFormProps {
  parentId: string
  onSubmit: (data: { body: string }) => void
  isLoading?: boolean
  placeholder?: string
}

// ============================================
// COMPONENT
// ============================================

export function CreateReplyForm({
  parentId: _parentId,
  onSubmit,
  isLoading = false,
  placeholder = 'Write your reply...',
}: CreateReplyFormProps) {
  const form = useForm({
    defaultValues: {
      body: '',
    },
    validators: {
      onSubmit: z.object({
        body: z.string().min(10, 'Reply must be at least 10 characters'),
      }),
    },
    onSubmit: async ({ value }) => {
      await onSubmit({ body: value.body })
      form.reset()
    },
  })

  return (
    <div className="bg-card border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Add your reply</h3>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="space-y-4"
      >
        <form.Field name="body">
          {(field) => (
            <Field>
              <Textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={placeholder}
                rows={4}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? 'Posting...' : 'Post Reply'}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  )
}
