import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useRef } from 'react'
import z from 'zod'
import { createCapabilityFn } from '@/actions/admin/capabilities'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens',
    ),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500),
  icon: z.string(),
})

export const Route = createFileRoute('/admin/capabilities/add')({
  component: AddCapabilityPage,
})

function AddCapabilityPage() {
  const router = useRouter()
  const slugManuallyEdited = useRef(false)

  const form = useForm({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      icon: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await createCapabilityFn({
        data: {
          name: value.name,
          slug: value.slug,
          description: value.description,
          ...(value.icon && { icon: value.icon }),
        },
      })

      if (result.success) {
        await router.invalidate()
        await router.navigate({ to: '/admin/capabilities' })
      } else {
        // Handle error - you could show a toast here
        console.error('Failed to create capability:', result.error)
      }
    },
  })

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    form.setFieldValue('name', name)
    // Only auto-generate slug if user hasn't manually edited it
    if (!slugManuallyEdited.current) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      form.setFieldValue('slug', slug)
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    slugManuallyEdited.current = true
    form.setFieldValue('slug', e.target.value)
  }

  return (
    <main className="container mx-auto px-6 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/admin/capabilities">
            <Button variant="ghost" size="sm">
              ← Back
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold">Add Capability</h1>
        </div>
        <p className="text-muted-foreground">Create a new AI capability</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="space-y-6"
      >
        <form.Field name="name">
          {(field) => (
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                value={field.state.value}
                onChange={handleNameChange}
                placeholder="e.g., Reasoning"
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="slug">
          {(field) => (
            <Field>
              <FieldLabel>Slug</FieldLabel>
              <Input
                value={field.state.value}
                onChange={handleSlugChange}
                placeholder="e.g., reasoning"
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Describe this capability in 2-3 sentences..."
                rows={4}
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="icon">
          {(field) => (
            <Field>
              <FieldLabel>Icon (optional)</FieldLabel>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g., 🧠"
                disabled={form.state.isSubmitting}
              />
              <p className="text-sm text-muted-foreground mt-1">
                An emoji to represent this capability
              </p>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <div className="flex items-center gap-4 pt-4">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <>
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                  {isSubmitting ? 'Creating...' : 'Create Capability'}
                </Button>
                <Link to="/admin/capabilities">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </Link>
              </>
            )}
          </form.Subscribe>
        </div>
      </form>
    </main>
  )
}
