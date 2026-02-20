import {
  Link,
  createFileRoute,
  notFound,
  useRouter,
} from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import z from 'zod'
import {
  getAllCapabilitiesForAdminFn,
  getSubtypeForAdminFn,
  updateCapabilitySubtypeFn,
} from '@/actions/admin/capabilities'
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
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  domain: z.string().min(1).max(50),
  description: z.string().min(10).max(500),
  progressPercentage: z.number().min(0).max(100),
  status: z.enum(['solved', 'partial', 'unsolved']),
  whatWorks: z.string(),
  whatStruggles: z.string(),
  whatDoesntWork: z.string(),
})

export const Route = createFileRoute('/admin/capabilities/$slug/$subslug/edit')(
  {
    component: EditSubtypePage,
    loader: async ({ params }) => {
      const [subtypeResult, capabilitiesResult] = await Promise.all([
        getSubtypeForAdminFn({ data: { id: params.subslug } }),
        getAllCapabilitiesForAdminFn(),
      ])

      if (!subtypeResult.success) {
        throw notFound()
      }

      if (!capabilitiesResult.success) {
        throw new Error(
          capabilitiesResult.error || 'Failed to fetch capabilities',
        )
      }

      const capability = capabilitiesResult.data.find(
        (c) => c.slug === params.slug,
      )

      if (!capability) {
        throw new Error('Capability not found')
      }

      return {
        subtype: subtypeResult.data,
        capability,
      }
    },
    pendingComponent: () => (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    ),
  },
)

function EditSubtypePage() {
  const { subtype, capability } = Route.useLoaderData()
  const router = useRouter()
  const { slug } = Route.useParams()

  const form = useForm({
    defaultValues: {
      name: subtype.name,
      slug: subtype.slug,
      domain: subtype.domain,
      description: subtype.description,
      progressPercentage: subtype.progressPercentage,
      status: subtype.status,
      whatWorks: subtype.whatWorks.join('\n'),
      whatStruggles: subtype.whatStruggles.join('\n'),
      whatDoesntWork: subtype.whatDoesntWork.join('\n'),
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await updateCapabilitySubtypeFn({
        data: {
          id: subtype.id,
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
        await router.navigate({
          to: '/admin/capabilities/$slug',
          params: { slug },
        })
      } else {
        console.error('Failed to update subtype:', result.error)
      }
    },
  })

  return (
    <main className="container mx-auto px-6 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/admin/capabilities/$slug" params={{ slug }}>
            <Button variant="ghost" size="sm">
              ← Back
            </Button>
          </Link>
          <span className="text-2xl">{capability.icon || '🔷'}</span>
          <h1 className="text-3xl font-semibold">Edit Subtype</h1>
        </div>
        <p className="text-muted-foreground">
          Update "{subtype.name}" under {capability.name}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="space-y-6"
      >
        <Field>
          <FieldLabel>Parent Capability</FieldLabel>
          <div className="flex items-center gap-2 text-sm border rounded-md px-3 py-2 bg-muted">
            <span>{capability.icon}</span>
            <span>{capability.name}</span>
          </div>
        </Field>

        <form.Field name="name">
          {(field) => (
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
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
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Link to="/admin/capabilities/$slug" params={{ slug }}>
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
