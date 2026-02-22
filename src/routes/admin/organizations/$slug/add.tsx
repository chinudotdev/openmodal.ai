import { useForm } from '@tanstack/react-form'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useRef, useState } from 'react'

import { getOrganizationBySlugForAdminFn } from '@/actions/admin/organizations'
import { createTechnologyFn } from '@/actions/admin/technologies'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

export const Route = createFileRoute('/admin/organizations/$slug/add')({
  component: AddTechnologyPage,
  loader: async ({ params }) => {
    const result = await getOrganizationBySlugForAdminFn({
      data: { slug: params.slug },
    })
    if (!result.success) {
      throw new Error(result.error || 'Organization not found')
    }
    return { organization: result.data }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
    </div>
  ),
})

function AddTechnologyPage() {
  const { organization } = Route.useLoaderData()
  const router = useRouter()
  const { slug } = Route.useParams()
  const slugManuallyEdited = useRef(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: '',
      slug: '',
      type: 'ai_model' as const,
      description: '',
      image: '',
      website: '',
      stage: 'research' as const,
      releaseDate: '',
      status: 'approved' as const,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      const result = await createTechnologyFn({
        data: {
          name: value.name,
          slug: value.slug,
          type: value.type,
          description: value.description,
          ...(value.image && { image: value.image }),
          ...(value.website && { website: value.website }),
          organizationId: organization.id,
          stage: value.stage,
          ...(value.releaseDate && { releaseDate: value.releaseDate }),
          status: value.status,
        },
      })

      if (result.success) {
        await router.invalidate()
        await router.navigate({
          to: '/admin/organizations/$slug',
          params: { slug },
        })
      } else {
        setSubmitError(
          result.error || 'Failed to create technology. Please try again.',
        )
      }
    },
  })

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
          <Link to="/admin/organizations/$slug" params={{ slug: slug }}>
            <Button variant="ghost" size="sm">
              ← Back
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold">Add Technology</h1>
        </div>
        <p className="text-muted-foreground">
          Add a new technology to {organization.name}
        </p>
      </div>

      {submitError && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <p className="text-sm text-destructive font-medium">
              {submitError}
            </p>
          </CardContent>
        </Card>
      )}

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
                  {isSubmitting ? 'Creating...' : 'Create Technology'}
                </Button>
                <Link to="/admin/organizations/$slug" params={{ slug: slug }}>
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
