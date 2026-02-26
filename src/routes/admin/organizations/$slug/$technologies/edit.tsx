import { useForm } from '@tanstack/react-form'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { getOrganizationBySlugForAdminFn } from '@/actions/admin/organizations'
import {
  getTechnologyBySlugForAdminFn,
  updateTechnologyFn,
} from '@/actions/admin/technologies'
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

export const Route = createFileRoute(
  '/admin/organizations/$slug/$technologies/edit',
)({
  component: EditTechnologyPage,
  loader: async ({ params }) => {
    const [orgResult, techResult] = await Promise.all([
      getOrganizationBySlugForAdminFn({ data: { slug: params.slug } }),
      getTechnologyBySlugForAdminFn({ data: { slug: params.technologies } }),
    ])

    if (!orgResult.success) {
      throw new Error(orgResult.error || 'Organization not found')
    }

    if (!techResult.success) {
      throw new Error(techResult.error || 'Technology not found')
    }

    return {
      organization: orgResult.data,
      technology: techResult.data,
    }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center py-12">
      <Spinner />
    </div>
  ),
})

function EditTechnologyPage() {
  const { organization, technology } = Route.useLoaderData()
  const router = useRouter()
  const { slug, technologies: techSlug } = Route.useParams()
  const slugManuallyEdited = useRef(false)

  const form = useForm({
    defaultValues: {
      name: technology.name,
      slug: technology.slug,
      type: technology.type as any,
      description: technology.description,
      image: technology.image || '',
      website: technology.website || '',
      stage: technology.stage as any,
      releaseDate: technology.releaseDate
        ? new Date(technology.releaseDate).toISOString().split('T')[0]
        : '',
      status: technology.status as any,
    },
    onSubmit: async ({ value }) => {
      const result = await updateTechnologyFn({
        data: {
          id: technology.id,
          name: value.name,
          slug: value.slug,
          type: value.type,
          description: value.description,
          ...(value.image && { image: value.image }),
          ...(value.website && { website: value.website }),
          stage: value.stage,
          ...(value.releaseDate && { releaseDate: value.releaseDate }),
          status: value.status,
        },
      })

      if (result.success) {
        await router.invalidate()
        await router.navigate({
          to: `/admin/organizations/${slug}/${techSlug}`,
        })
      } else {
        console.error('Failed to update technology:', result.error)
      }
    },
  })

  // Reset slug manually edited flag when slug changes
  useEffect(() => {
    slugManuallyEdited.current = false
  }, [techSlug])

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    form.setFieldValue('name', name)
    // Only auto-generate slug if user hasn't manually edited it
    if (!slugManuallyEdited.current) {
      const slugValue = name
        .toLowerCase()
        .replace(/[^a-z0-9\s.-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      form.setFieldValue('slug', slugValue)
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
          <Link
            to="/admin/organizations/$slug/$technologies/edit"
            params={{ slug, technologies: techSlug }}
          >
            <Button variant="ghost" size="sm">
              ← Back
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold">Edit Technology</h1>
        </div>
        <p className="text-muted-foreground">
          Edit {technology.name} from {organization.name}
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
                onChange={handleNameChange}
                placeholder="e.g., GPT-4"
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
                placeholder="e.g., gpt-4"
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="type">
          {(field) => (
            <Field>
              <FieldLabel>Type</FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as any)}
                disabled={form.state.isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai_model">AI Model</SelectItem>
                  <SelectItem value="robot">Robot</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="api">API</SelectItem>
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
                placeholder="Describe this technology..."
                rows={4}
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="image">
          {(field) => (
            <Field>
              <FieldLabel>Image URL (optional)</FieldLabel>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="https://example.com/image.png"
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="website">
          {(field) => (
            <Field>
              <FieldLabel>Website URL (optional)</FieldLabel>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="https://example.com"
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="stage">
          {(field) => (
            <Field>
              <FieldLabel>Stage</FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as any)}
                disabled={form.state.isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="pilot">Pilot</SelectItem>
                  <SelectItem value="deployed">Deployed</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="releaseDate">
          {(field) => (
            <Field>
              <FieldLabel>Release Date (optional)</FieldLabel>
              <Input
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
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
                onValueChange={(value) => field.handleChange(value as any)}
                disabled={form.state.isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
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
                  {isSubmitting ? 'Updating...' : 'Update Technology'}
                </Button>
                <Link
                  to="/admin/organizations/$slug/$technologies/edit"
                  params={{ slug, technologies: techSlug }}
                >
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
