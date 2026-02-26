import { useForm } from '@tanstack/react-form'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useRef } from 'react'

import z from 'zod'

import { createOrganizationFn } from '@/actions/admin/organizations'
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

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens',
    ),
  types: z
    .array(
      z.enum([
        'ai_lab',
        'robotics',
        'enterprise_software',
        'startup',
        'research_institution',
      ]),
    )
    .min(1, 'At least one type is required'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000),
  website: z.string().optional(),
  logo: z.string().optional(),
  foundedYear: z
    .number()
    .int('Must be a whole number')
    .min(1800, 'Must be a valid year')
    .max(new Date().getFullYear() + 10, 'Year cannot be too far in the future')
    .optional(),
  isSponsor: z.boolean().optional(),
  sponsorTier: z.enum(['none', 'bronze', 'silver', 'gold']).optional(),
  isClaimed: z.boolean().optional(),
  verifiedBadge: z.boolean().optional(),
})

export const Route = createFileRoute('/admin/organizations/add')({
  component: AddOrganizationPage,
})

function AddOrganizationPage() {
  const router = useRouter()
  const slugManuallyEdited = useRef(false)

  const form = useForm({
    defaultValues: {
      name: '',
      slug: '',
      types: [] as Array<
        | 'ai_lab'
        | 'robotics'
        | 'enterprise_software'
        | 'startup'
        | 'research_institution'
      >,
      description: '',
      website: '',
      logo: '',
      foundedYear: undefined as number | undefined,
      isSponsor: false,
      sponsorTier: 'none' as 'none' | 'bronze' | 'silver' | 'gold',
      isClaimed: false,
      verifiedBadge: false,
    },
    onSubmit: async ({ value }) => {
      // Validate before submitting
      const result = formSchema.safeParse(value)
      if (!result.success) {
        console.error('Validation errors:', result.error)
        return
      }

      const apiResult = await createOrganizationFn({
        data: result.data,
      })

      if (apiResult.success) {
        await router.invalidate()
        await router.navigate({ to: '/admin/organizations' })
      } else {
        console.error('Failed to create organization:', apiResult.error)
      }
    },
  })

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    form.setFieldValue('name', name)
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
          <h1 className="text-3xl font-semibold">Add Organization</h1>
        </div>
        <p className="text-muted-foreground">Create a new organization</p>
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
                placeholder="e.g., OpenAI"
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
                placeholder="e.g., openai"
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="types">
          {(field) => (
            <Field>
              <FieldLabel>Types (select at least one)</FieldLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {ORGANIZATION_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={field.state.value.includes(type.value as any)}
                      onCheckedChange={() => handleTypeToggle(type.value)}
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
                placeholder="Describe this organization in 2-3 sentences..."
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
              <FieldLabel>Website (optional)</FieldLabel>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="https://example.com"
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
              <FieldLabel>Logo URL (optional)</FieldLabel>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="https://example.com/logo.png"
                type="url"
                disabled={form.state.isSubmitting}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        <form.Field name="foundedYear">
          {(field) => (
            <Field>
              <FieldLabel>Founded Year (optional)</FieldLabel>
              <Input
                value={field.state.value || ''}
                onChange={(e) =>
                  field.handleChange(
                    e.target.value
                      ? Number.parseInt(e.target.value)
                      : undefined,
                  )
                }
                placeholder="2015"
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
                  {isSubmitting ? 'Creating...' : 'Create Organization'}
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
