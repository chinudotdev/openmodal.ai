import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import z from 'zod'
import { createCapabilitySubtypeFn, getAllCapabilitiesForAdminFn } from '@/actions/admin/capabilities'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formSchema = z.object({
  capabilityId: z.string().min(1, 'Capability is required'),
  name: z.string().min(1, 'Name is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens',
    ),
  domain: z.string().min(1, 'Domain is required').max(50),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500),
  progressPercentage: z.number().min(0).max(100).default(0),
  status: z.enum(['solved', 'partial', 'unsolved']).default('unsolved'),
  whatWorks: z.string().optional(),
  whatStruggles: z.string().optional(),
  whatDoesntWork: z.string().optional(),
})

export const Route = createFileRoute('/admin/subtypes/add')({
  component: AddSubtypePage,
  loader: async () => {
    const result = await getAllCapabilitiesForAdminFn()
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch capabilities')
    }
    return { capabilities: result.data }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center py-12">
      <Spinner />
    </div>
  ),
})

function AddSubtypePage() {
  const router = useRouter()
  const { capabilities } = Route.useLoaderData()

  const form = useForm({
    defaultValues: {
      capabilityId: '',
      name: '',
      slug: '',
      domain: '',
      description: '',
      progressPercentage: 0,
      status: 'unsolved' as const,
      whatWorks: '',
      whatStruggles: '',
      whatDoesntWork: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await createCapabilitySubtypeFn({
        data: {
          capabilityId: value.capabilityId,
          name: value.name,
          slug: value.slug,
          domain: value.domain,
          description: value.description,
          progressPercentage: value.progressPercentage,
          status: value.status,
          whatWorks: value.whatWorks
            ? value.whatWorks.split('\n').filter((s) => s.trim())
            : [],
          whatStruggles: value.whatStruggles
            ? value.whatStruggles.split('\n').filter((s) => s.trim())
            : [],
          whatDoesntWork: value.whatDoesntWork
            ? value.whatDoesntWork.split('\n').filter((s) => s.trim())
            : [],
        },
      })

      if (result.success) {
        await router.invalidate()
        await router.navigate({ to: '/admin/subtypes' })
      } else {
        console.error('Failed to create subtype:', result.error)
      }
    },
  })

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    form.setFieldValue('name', name)
    if (!form.getFieldValue('slug')) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      form.setFieldValue('slug', slug)
    }
  }

  return (
    <main className="container mx-auto px-6 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/admin/subtypes">
            <Button variant="ghost" size="sm">
              ← Back
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold">Add Capability Subtype</h1>
        </div>
        <p className="text-muted-foreground">
          Create a new AI capability subtype
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="space-y-6"
      >
        <form.Field name="capabilityId">
          {(field) => (
            <Field>
              <FieldLabel>Parent Capability</FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
                disabled={form.state.isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a capability" />
                </SelectTrigger>
                <SelectContent>
                  {capabilities.map((capability) => (
                    <SelectItem key={capability.id} value={capability.id}>
                      {capability.icon && <span className="mr-2">{capability.icon}</span>}
                      {capability.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="name">
          {(field) => (
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                value={field.state.value}
                onChange={handleNameChange}
                placeholder="e.g., Mathematical Reasoning"
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
                placeholder="e.g., mathematical-reasoning"
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="domain">
          {(field) => (
            <Field>
              <FieldLabel>Domain</FieldLabel>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g., Education"
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
                placeholder="Describe this capability subtype in 2-3 sentences..."
                rows={4}
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="progressPercentage">
            {(field) => (
              <Field>
                <FieldLabel>Progress (%)</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(parseInt(e.target.value) || 0)
                  }
                  disabled={form.state.isSubmitting}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="status">
            {(field) => (
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value: 'solved' | 'partial' | 'unsolved') =>
                    field.handleChange(value)
                  }
                  disabled={form.state.isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unsolved">Unsolved</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="solved">Solved</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>
        </div>

        <form.Field name="whatWorks">
          {(field) => (
            <Field>
              <FieldLabel>What Works Well (one per line)</FieldLabel>
              <Textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g.&#10;Simple arithmetic&#10;Basic algebra"
                rows={4}
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="whatStruggles">
          {(field) => (
            <Field>
              <FieldLabel>What AI Struggles With (one per line)</FieldLabel>
              <Textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g.&#10;Complex word problems&#10;Multi-step reasoning"
                rows={4}
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="whatDoesntWork">
          {(field) => (
            <Field>
              <FieldLabel>What AI Cannot Do Yet (one per line)</FieldLabel>
              <Textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g.&#10;Abstract proofs&#10;Novel problem solving"
                rows={4}
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
                  {isSubmitting ? 'Creating...' : 'Create Subtype'}
                </Button>
                <Link to="/admin/subtypes">
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
