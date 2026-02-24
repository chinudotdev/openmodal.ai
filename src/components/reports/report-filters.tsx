import { useForm } from '@tanstack/react-form'

import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SelectWrapper } from '@/components/ui/select-wrapper'

// ============================================
// SCHEMA & TYPES
// ============================================

export const reportFiltersSchema = z.object({
  impactType: z
    .enum([
      '',
      'layoffs',
      'reduced_hours',
      'role_change',
      'new_tools',
      'productivity_boost',
      'no_change',
    ])
    .optional(),
  country: z.string().optional(),
  companySize: z
    .enum(['', '1-10', '11-50', '51-200', '201-1000', '1000+'])
    .optional(),
  searchTerm: z.string().optional(),
  sort: z.enum(['recent', 'upvotes', 'views']),
})

export type ReportFiltersValues = z.infer<typeof reportFiltersSchema>

export interface ReportFiltersProps {
  initialValues?: Partial<ReportFiltersValues>
  onSubmit: (values: ReportFiltersValues) => void
  isLoading?: boolean
}

const IMPACT_TYPE_OPTIONS = [
  { value: '', label: 'All Impact Types' },
  { value: 'layoffs', label: '🔴 Layoffs' },
  { value: 'reduced_hours', label: '🟠 Reduced Hours' },
  { value: 'role_change', label: '🟡 Role Change' },
  { value: 'new_tools', label: '🟢 New Tools' },
  { value: 'productivity_boost', label: '🚀 Productivity Boost' },
  { value: 'no_change', label: '➡️ No Change' },
]

const COMPANY_SIZE_OPTIONS = [
  { value: '', label: 'All Company Sizes' },
  { value: '1-10', label: '1-10' },
  { value: '11-50', label: '11-50' },
  { value: '51-200', label: '51-200' },
  { value: '201-1000', label: '201-1000' },
  { value: '1000+', label: '1000+' },
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'upvotes', label: 'Most Upvoted' },
  { value: 'views', label: 'Most Viewed' },
]

// ============================================
// COMPONENT
// ============================================

export function ReportFilters({
  initialValues,
  onSubmit,
  isLoading,
}: ReportFiltersProps) {
  const form = useForm({
    defaultValues: {
      impactType: initialValues?.impactType || '',
      country: initialValues?.country || '',
      companySize: initialValues?.companySize || '',
      searchTerm: initialValues?.searchTerm || '',
      sort: initialValues?.sort || 'recent',
    } as ReportFiltersValues,
    onSubmit: ({ value }) => {
      const cleanValues = {
        ...value,
        impactType: value.impactType || undefined,
        country: value.country || undefined,
        companySize: value.companySize || undefined,
        searchTerm: value.searchTerm || undefined,
      }
      onSubmit(cleanValues)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <div className="space-y-4">
        {/* Search */}
        <form.Field
          name="searchTerm"
          children={(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Search</FieldLabel>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Job title, company, or keywords..."
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Impact Type */}
          <form.Field
            name="impactType"
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Impact Type</FieldLabel>
                <SelectWrapper
                  id={field.name}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value as any)}
                  options={IMPACT_TYPE_OPTIONS}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />

          {/* Company Size */}
          <form.Field
            name="companySize"
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Company Size</FieldLabel>
                <SelectWrapper
                  id={field.name}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value as any)}
                  options={COMPANY_SIZE_OPTIONS}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />

          {/* Country */}
          <form.Field
            name="country"
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Country</FieldLabel>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. USA, UK..."
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />

          {/* Sort */}
          <form.Field
            name="sort"
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Sort By</FieldLabel>
                <SelectWrapper
                  id={field.name}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value as any)}
                  options={SORT_OPTIONS}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />
        </div>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={!canSubmit || isLoading || isSubmitting}
              >
                {isSubmitting ? 'Applying...' : 'Apply Filters'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  onSubmit({
                    sort: 'recent',
                  })
                }}
              >
                Clear
              </Button>
            </div>
          )}
        />
      </div>
    </form>
  )
}
