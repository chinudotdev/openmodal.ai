import {
  Link,
  createFileRoute,
  notFound,
  useRouter,
} from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import z from 'zod'
import {
  getCapabilityForAdminFn,
  updateCapabilityFn,
} from '@/actions/admin/capabilities'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'

const formSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().min(10).max(500),
  icon: z.string(),
})

export const Route = createFileRoute('/admin/capabilities/$id/edit')({
  component: EditCapabilityPage,
  loader: async ({ params }) => {
    const result = await getCapabilityForAdminFn({ data: { id: params.id } })
    if (!result.success) {
      throw notFound()
    }
    return { capability: result.data }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center py-12">
      <Spinner />
    </div>
  ),
})

function EditCapabilityPage() {
  const { capability } = Route.useLoaderData()
  const router = useRouter()
  const { id } = Route.useParams()

  const form = useForm({
    defaultValues: {
      name: capability.name || '',
      slug: capability.slug || '',
      description: capability.description || '',
      icon: capability.icon || '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await updateCapabilityFn({
        data: {
          id,
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
        console.error('Failed to update capability:', result.error)
      }
    },
  })

  return (
    <main className="container mx-auto px-6 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/admin/capabilities">
            <Button variant="ghost" size="sm">
              ← Back
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold">Edit Capability</h1>
        </div>
        <p className="text-muted-foreground">
          Update the AI capability "{capability.name}"
        </p>
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
                onChange={(e) => field.handleChange(e.target.value)}
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
              <FieldLabel>Icon</FieldLabel>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g., 🧠"
                disabled={form.state.isSubmitting}
              />
              <p className="text-sm text-muted-foreground mt-1">
                An emoji to represent this capability (leave empty to remove)
              </p>
              {field.state.value && (
                <p className="text-lg mt-2">{field.state.value}</p>
              )}
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
