import { useForm } from '@tanstack/react-form'
import {
  Link,
  createFileRoute,
  notFound,
  useRouter,
} from '@tanstack/react-router'

import z from 'zod'

import { getJobBySlugForAdminFn, updateJobFn } from '@/actions/admin/jobs'
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
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
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
  description: z.string().min(10).max(2000),
})

export const Route = createFileRoute('/admin/jobs/$slug/edit')({
  component: EditJobPage,
  loader: async ({ params }) => {
    const result = await getJobBySlugForAdminFn({
      data: { slug: params.slug },
    })
    if (!result.success) {
      throw notFound()
    }
    return { job: result.data }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center py-12">
      <Spinner />
    </div>
  ),
})

function EditJobPage() {
  const { job } = Route.useLoaderData()
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      name: job.name,
      slug: job.slug,
      category: job.category,
      description: job.description,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await updateJobFn({
        data: {
          id: job.id,
          name: value.name,
          slug: value.slug,
          category: value.category,
          description: value.description,
        },
      })

      if (result.success) {
        await router.invalidate()
        await router.navigate({ to: '/admin/jobs' })
      } else {
        console.error('Failed to update job:', result.error)
      }
    },
  })

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
          <h1 className="text-3xl font-semibold">Edit Job</h1>
        </div>
        <p className="text-muted-foreground">Update the job "{job.name}"</p>
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
                onChange={(e) => field.handleChange(e.target.value)}
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
                onChange={(e) => field.handleChange(e.target.value)}
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
                  field.handleChange(value as typeof field.state.value)
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
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
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
