import { useForm } from '@tanstack/react-form'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'

import {
  getOrganizationBySlugForAdminFn,
  updateOrganizationFn,
} from '@/actions/admin/organizations'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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

const ORGANIZATION_TYPES = [
  { value: 'ai_lab', label: 'AI Lab' },
  { value: 'robotics', label: 'Robotics' },
  { value: 'enterprise_software', label: 'Enterprise Software' },
  { value: 'startup', label: 'Startup' },
  { value: 'research_institution', label: 'Research Institution' },
] as const

const SPONSOR_TIERS = [
  { value: 'none', label: 'None' },
  { value: 'bronze', label: 'Bronze 🥉' },
  { value: 'silver', label: 'Silver 🥈' },
  { value: 'gold', label: 'Gold 🥇' },
] as const

export const Route = createFileRoute('/admin/organizations/$slug/edit')({
  loader: async ({ params }) => {
    const result = await getOrganizationBySlugForAdminFn({
      data: { slug: params.slug },
    })
    if (!result.success) {
      throw new Error('Organization not found')
    }
    return { organization: result.data }
  },
  component: EditOrganizationPage,
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading organization...</p>
      </div>
    </div>
  ),
})

function EditOrganizationPage() {
  const { organization } = Route.useLoaderData()
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      name: organization.name,
      slug: organization.slug,
      types: organization.types as Array<
        | 'ai_lab'
        | 'robotics'
        | 'enterprise_software'
        | 'startup'
        | 'research_institution'
      >,
      description: organization.description,
      website: organization.website || '',
      logo: organization.logo || '',
      foundedYear: organization.foundedYear ?? undefined,
      isSponsor: organization.isSponsor,
      sponsorTier: organization.sponsorTier,
      isClaimed: organization.isClaimed,
      verifiedBadge: organization.verifiedBadge,
    },
    onSubmit: async ({ value }) => {
      // Validate before submitting (only validate fields that changed)
      const apiResult = await updateOrganizationFn({
        data: {
          id: organization.id,
          name: value.name,
          slug: value.slug,
          types: value.types,
          description: value.description,
          website: value.website || undefined,
          logo: value.logo || undefined,
          foundedYear: value.foundedYear,
          isSponsor: value.isSponsor,
          sponsorTier: value.sponsorTier,
          isClaimed: value.isClaimed,
          verifiedBadge: value.verifiedBadge,
        },
      })

      if (apiResult.success) {
        await router.invalidate()
        await router.navigate({ to: '/admin/organizations' })
      } else {
        console.error('Failed to update organization:', apiResult.error)
      }
    },
  })

  const handleTypeToggle = (typeValue: string) => {
    const currentTypes = form.getFieldValue('types')
    if (currentTypes.includes(typeValue as any)) {
      form.setFieldValue(
        'types',
        currentTypes.filter((t) => t !== typeValue),
      )
    } else {
      form.setFieldValue('types', [...currentTypes, typeValue as any])
    }
  }

  return (
    <main className="container mx-auto px-6 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/admin/organizations">
            <Button variant="ghost" size="sm">
              ← Back
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold">Edit Organization</h1>
        </div>
        <p className="text-muted-foreground">Update organization details</p>
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
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="types">
          {(field) => (
            <Field>
              <FieldLabel>Types</FieldLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {ORGANIZATION_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={field.state.value.includes(type.value as any)}
                      onChange={() => handleTypeToggle(type.value)}
                      disabled={form.state.isSubmitting}
                    />
                    <span className="text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
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
                rows={6}
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="website">
          {(field) => (
            <Field>
              <FieldLabel>Website</FieldLabel>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                type="url"
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="logo">
          {(field) => (
            <Field>
              <FieldLabel>Logo URL</FieldLabel>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                type="url"
                disabled={form.state.isSubmitting}
              />
              {organization.logo && (
                <div className="mt-2">
                  <img
                    src={organization.logo}
                    alt="Current logo"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                </div>
              )}
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="foundedYear">
          {(field) => (
            <Field>
              <FieldLabel>Founded Year</FieldLabel>
              <Input
                value={field.state.value || ''}
                onChange={(e) =>
                  field.handleChange(
                    e.target.value
                      ? Number.parseInt(e.target.value)
                      : undefined,
                  )
                }
                type="number"
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Sponsor Settings */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold">Sponsor Settings</h3>

          <form.Field name="isSponsor">
            {(field) => (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={field.state.value}
                  onCheckedChange={(checked) =>
                    field.handleChange(checked === true ? true : false)
                  }
                  disabled={form.state.isSubmitting}
                />
                <span className="text-sm">Is Sponsor</span>
              </label>
            )}
          </form.Field>

          <form.Field name="sponsorTier">
            {(field) => (
              <Field>
                <FieldLabel>Sponsor Tier</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(
                      value as 'none' | 'bronze' | 'silver' | 'gold',
                    )
                  }
                  disabled={form.state.isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPONSOR_TIERS.map((tier) => (
                      <SelectItem key={tier.value} value={tier.value}>
                        {tier.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>
        </div>

        {/* Badge Settings */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold">Badge Settings</h3>

          <form.Field name="isClaimed">
            {(field) => (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={field.state.value}
                  onCheckedChange={(checked) =>
                    field.handleChange(checked === true ? true : false)
                  }
                  disabled={form.state.isSubmitting}
                />
                <span className="text-sm">Is Claimed</span>
              </label>
            )}
          </form.Field>

          <form.Field name="verifiedBadge">
            {(field) => (
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={field.state.value}
                  onCheckedChange={(checked) =>
                    field.handleChange(checked === true ? true : false)
                  }
                  disabled={form.state.isSubmitting}
                />
                <span className="text-sm">Verified Badge</span>
              </label>
            )}
          </form.Field>
        </div>

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
                <Link to="/admin/organizations">
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
