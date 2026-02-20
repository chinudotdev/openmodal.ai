import { useForm } from '@tanstack/react-form'
import z from 'zod'
import { useRef } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'

import { createJobFn } from '@/actions/admin/jobs'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

// Form-specific schema for validation
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
  category: z.enum([
    'healthcare',
    'technology',
    'trades',
    'service',
    'creative',
    'finance',
    'education',
    'legal',
    'manufacturing',
    'other',
  ]),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000),
})

export const Route = createFileRoute('/admin/jobs/add')({
  component: AddJobPage,
})

function AddJobPage() {
  const router = useRouter()
  const slugManuallyEdited = useRef(false)

  const form = useForm({
    defaultValues: {
      name: '',
      slug: '',
      category: 'technology',
      description: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await createJobFn({
        data: {
          name: value.name,
          slug: value.slug,
          category: value.category as
            | 'healthcare'
            | 'technology'
            | 'trades'
            | 'service'
            | 'creative'
            | 'finance'
            | 'education'
            | 'legal'
            | 'manufacturing'
            | 'other',
          description: value.description,
        },
      })

      if (result.success) {
        await router.invalidate()
        await router.navigate({ to: '/admin/jobs' })
      } else {
        // Handle error - you could show a toast here
        console.error('Failed to create job:', result.error)
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

  const categories = [
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'technology', label: 'Technology' },
    { value: 'trades', label: 'Trades' },
    { value: 'service', label: 'Service' },
    { value: 'creative', label: 'Creative' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'legal', label: 'Legal' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <main className="container mx-auto px-6 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/admin/jobs">
            <Button variant="ghost" size="sm">
              ← Back
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold">Add Job</h1>
        </div>
        <p className="text-muted-foreground">Create a new job listing</p>
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
                placeholder="e.g., Software Developer"
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
                placeholder="e.g., software-developer"
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="category">
          {(field) => (
            <Field>
              <FieldLabel>Category</FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) =>
                  field.handleChange(value)
                }
                disabled={form.state.isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                placeholder="Describe this job in 2-3 sentences..."
                rows={8}
                disabled={form.state.isSubmitting}
              />
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
                  {isSubmitting ? 'Creating...' : 'Create Job'}
                </Button>
                <Link to="/admin/jobs">
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
