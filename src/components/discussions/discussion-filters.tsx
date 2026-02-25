import { useForm } from '@tanstack/react-form'

import { z } from 'zod'

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

// ============================================
// TYPES & VALIDATION
// ============================================

export interface DiscussionFiltersValues {
  entityType?: string
  searchTerm?: string
  sort: 'recent' | 'upvotes' | 'hot'
  timeRange?: 'today' | 'week' | 'month' | 'all'
}

const filterSchema = z.object({
  entityType: z.string(),
  searchTerm: z.string(),
  sort: z.enum(['recent', 'upvotes', 'hot']),
  timeRange: z.enum(['today', 'week', 'month', 'all']),
})

export interface DiscussionFiltersProps {
  onSubmit: (filters: DiscussionFiltersValues) => void
  isLoading?: boolean
  defaultValues?: Partial<DiscussionFiltersValues>
}

// ============================================
// COMPONENT
// ============================================

export function DiscussionFilters({
  onSubmit,
  isLoading = false,
  defaultValues,
}: DiscussionFiltersProps) {
  const form = useForm({
    defaultValues: {
      entityType: defaultValues?.entityType || 'all',
      searchTerm: defaultValues?.searchTerm || '',
      sort: defaultValues?.sort || 'recent',
      timeRange: defaultValues?.timeRange || 'all',
    },
    validators: {
      onSubmit: filterSchema,
    },
    onSubmit: ({ value }) => {
      const filters: DiscussionFiltersValues = {
        sort: value.sort,
      }

      if (value.entityType && value.entityType !== 'all') {
        filters.entityType = value.entityType
      }
      if (value.searchTerm) {
        filters.searchTerm = value.searchTerm
      }
      if (value.timeRange !== 'all') {
        filters.timeRange = value.timeRange
      }

      onSubmit(filters)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <form.Field name="searchTerm">
          {(field) => (
            <Field>
              <FieldLabel>Search</FieldLabel>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Search discussions..."
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Entity Type */}
        <form.Field name="entityType">
          {(field) => (
            <Field>
              <FieldLabel>Entity Type</FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="organization">Organizations</SelectItem>
                  <SelectItem value="technology">Technologies</SelectItem>
                  <SelectItem value="capability">Capabilities</SelectItem>
                  <SelectItem value="capability_subtype">
                    Sub-capabilities
                  </SelectItem>
                  <SelectItem value="job">Jobs</SelectItem>
                  <SelectItem value="impact_report">Impact Reports</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Sort */}
        <form.Field name="sort">
          {(field) => (
            <Field>
              <FieldLabel>Sort by</FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) =>
                  field.handleChange(value as 'recent' | 'upvotes' | 'hot')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">🔥 Hot</SelectItem>
                  <SelectItem value="recent">✨ Recent</SelectItem>
                  <SelectItem value="upvotes">🏆 Top</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Time Range */}
        <form.Field name="timeRange">
          {(field) => (
            <Field>
              <FieldLabel>Time</FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) =>
                  field.handleChange(
                    value as 'today' | 'week' | 'month' | 'all',
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? 'Applying...' : 'Apply Filters'}
            </Button>
          )}
        </form.Subscribe>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            form.reset()
            onSubmit({ sort: 'recent' })
          }}
        >
          Clear Filters
        </Button>
      </div>
    </form>
  )
}
