import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { submitReportFn } from '@/actions/reports'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SelectWrapper } from '@/components/ui/select-wrapper'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

// ============================================
// TYPES & CONSTANTS
// ============================================

const IMPACT_TYPE_OPTIONS = [
  { value: 'layoffs', label: '🔴 Layoffs - Jobs were eliminated' },
  { value: 'reduced_hours', label: '🟠 Reduced Hours - Hours were cut' },
  {
    value: 'role_change',
    label: '🟡 Role Change - Job responsibilities changed',
  },
  {
    value: 'new_tools',
    label: '🟢 New Tools - AI assists without replacement',
  },
  {
    value: 'productivity_boost',
    label: '🚀 Productivity Boost - AI increased output',
  },
  { value: 'no_change', label: '➡️ No Change - No impact observed' },
]

const RELATIONSHIP_OPTIONS = [
  { value: '', label: 'Select your relationship to this event' },
  { value: 'employee', label: 'Employee - I work/worked there' },
  { value: 'former_employee', label: 'Former Employee' },
  { value: 'manager', label: 'Manager - I managed the affected team' },
  { value: 'witness', label: 'Witness - I saw it happen' },
  { value: 'news', label: 'News - From a news article or report' },
  { value: 'researcher', label: 'Researcher - Academic or industry research' },
]

const COMPANY_SIZE_OPTIONS = [
  { value: '', label: 'Company size (optional)' },
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
]

const IMPACT_TYPE_LABELS: Record<string, string> = {
  layoffs: '🔴 Layoffs',
  reduced_hours: '🟠 Reduced Hours',
  role_change: '🟡 Role Change',
  new_tools: '🟢 New Tools',
  productivity_boost: '🚀 Productivity Boost',
  no_change: '➡️ No Change',
}

// ============================================
// COMPONENT
// ============================================

export function SubmitReportForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)

  const form = useForm({
    defaultValues: {
      // Required
      jobTitle: '',
      description: '',
      impactType: '',
      // Optional
      title: '',
      location: '',
      country: '',
      companyName: '',
      companySize: '',
      technologyDescription: '',
      workersAffectedCount: '',
      eventDate: '',
      sourceUrl: '',
      isAnonymous: false,
      reporterRelationship: '',
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await submitReportFn({
          data: {
            // Required
            jobTitle: value.jobTitle,
            description: value.description,
            impactType: value.impactType as any,
            // Optional - only include if set
            ...(value.title && { title: value.title }),
            ...(value.location && { location: value.location }),
            ...(value.country && { country: value.country }),
            ...(value.companyName && { companyName: value.companyName }),
            ...(value.companySize && { companySize: value.companySize as any }),
            ...(value.technologyDescription && {
              technologyDescription: value.technologyDescription,
            }),
            ...(value.workersAffectedCount && {
              workersAffectedCount: parseInt(value.workersAffectedCount, 10),
            }),
            ...(value.eventDate && { eventDate: value.eventDate }),
            ...(value.sourceUrl && { sourceUrl: value.sourceUrl }),
            isAnonymous: value.isAnonymous,
            ...(value.reporterRelationship && {
              reporterRelationship: value.reporterRelationship as any,
            }),
          },
        })

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (result.success) {
          // Invalidate and redirect to the new report
          await router.invalidate()
          await router.navigate({
            to: '/reports/$id',
            params: { id: result.report.id },
          })
        }
      } catch (error) {
        console.error('Failed to submit report:', error)
      }
    },
  })

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as 1 | 2 | 3)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3)
    }
  }

  const handleSkipStep2 = () => {
    setCurrentStep(3)
  }

  return (
    <form.Subscribe
      selector={(state) => {
        const jobTitleValid =
          state.values.jobTitle.length >= 2 &&
          !state.fieldMeta.jobTitle?.errors.length
        const impactTypeValid =
          state.values.impactType !== '' &&
          !state.fieldMeta.impactType?.errors.length
        const descriptionValid =
          state.values.description.length >= 100 &&
          !state.fieldMeta.description?.errors.length
        const canProceed = jobTitleValid && impactTypeValid && descriptionValid

        return { canProceed }
      }}
      children={({ canProceed }) => (
        <div className="space-y-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2">
            <StepIndicator
              step={1}
              currentStep={currentStep}
              label="Required Info"
              onClick={() => setCurrentStep(1)}
            />
            <div className="w-8 h-px bg-border" />
            <StepIndicator
              step={2}
              currentStep={currentStep}
              label="Additional Details"
              onClick={() => canProceed && setCurrentStep(2)}
            />
            <div className="w-8 h-px bg-border" />
            <StepIndicator
              step={3}
              currentStep={currentStep}
              label="Confirm & Publish"
              onClick={() => canProceed && setCurrentStep(3)}
            />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (currentStep === 3) {
                void form.handleSubmit()
              } else {
                handleNextStep()
              }
            }}
            className="space-y-6"
          >
            {/* Step 1: Required Information */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Required Information
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Please provide the essential details about your experience
                  </p>
                </div>

                {/* Job Title */}
                <form.Field
                  name="jobTitle"
                  validators={{
                    onChange: ({ value }) =>
                      !value
                        ? { message: 'Job title is required' }
                        : value.length < 2
                          ? { message: 'Job title is too short' }
                          : undefined,
                  }}
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Job Title *</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. Software Engineer, Customer Service Representative"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                {/* Impact Type */}
                <form.Field
                  name="impactType"
                  validators={{
                    onChange: ({ value }) =>
                      !value
                        ? { message: 'Please select an impact type' }
                        : undefined,
                  }}
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        What happened? *
                      </FieldLabel>
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

                {/* Description */}
                <form.Field
                  name="description"
                  validators={{
                    onChange: ({ value }) =>
                      !value
                        ? { message: 'Description is required' }
                        : value.length < 100
                          ? {
                              message: `Description must be at least 100 characters (current: ${value.length})`,
                            }
                          : undefined,
                  }}
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Tell Your Story *{' '}
                        <span className="text-muted-foreground text-sm">
                          (min. 100 characters)
                        </span>
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Share what happened. How did AI affect this role or company? What changes did you see? The more detail you provide, the more valuable your report is to the community..."
                        rows={6}
                      />
                      <div className="flex justify-between">
                        <FieldError errors={field.state.meta.errors} />
                        <span className="text-xs text-muted-foreground">
                          {field.state.value.length} / 100 min characters
                        </span>
                      </div>
                    </Field>
                  )}
                />

                {/* Navigation */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!canProceed}
                  >
                    Continue to Additional Details
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Additional Details (Optional) */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Additional Details
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    These details help others understand the context (all fields
                    are optional)
                  </p>
                </div>

                {/* Title */}
                <form.Field
                  name="title"
                  validators={{
                    onChange: ({ value }) =>
                      value && value.length > 200
                        ? { message: 'Title is too long (max 200 characters)' }
                        : undefined,
                  }}
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Short Summary
                      </FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="A brief headline for your report"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                {/* Company Name */}
                <form.Field
                  name="companyName"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Company Name</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. Acme Corp"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                {/* Location & Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <form.Field
                    name="location"
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Location</FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="City, State"
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />

                  <form.Field
                    name="country"
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Country</FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g. USA, UK"
                        />
                        <FieldError errors={field.state.meta.errors} />
                      </Field>
                    )}
                  />
                </div>

                {/* Company Size */}
                <form.Field
                  name="companySize"
                  children={(field) => (
                    <Field>
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

                {/* Workers Affected */}
                <form.Field
                  name="workersAffectedCount"
                  validators={{
                    onChange: ({ value }) =>
                      value && isNaN(parseInt(value, 10))
                        ? { message: 'Please enter a valid number' }
                        : undefined,
                  }}
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Number of Workers Affected
                      </FieldLabel>
                      <Input
                        id={field.name}
                        type="number"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. 50"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                {/* Event Date */}
                <form.Field
                  name="eventDate"
                  validators={{
                    onChange: ({ value }) =>
                      value && isNaN(Date.parse(value))
                        ? { message: 'Please enter a valid date' }
                        : undefined,
                  }}
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        When did this happen?
                      </FieldLabel>
                      <Input
                        id={field.name}
                        type="date"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                {/* Technology Description */}
                <form.Field
                  name="technologyDescription"
                  validators={{
                    onChange: ({ value }) =>
                      value && value.length > 500
                        ? {
                            message:
                              'Description is too long (max 500 characters)',
                          }
                        : undefined,
                  }}
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        What AI technology was involved?
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. ChatGPT, a custom chatbot, robotic automation, etc."
                        rows={2}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                {/* Source URL */}
                <form.Field
                  name="sourceUrl"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value) return undefined
                      try {
                        new URL(value)
                        return undefined
                      } catch {
                        return { message: 'Please enter a valid URL' }
                      }
                    },
                  }}
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Source URL</FieldLabel>
                      <Input
                        id={field.name}
                        type="url"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="https://news-article.com"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                {/* Reporter Relationship */}
                <form.Field
                  name="reporterRelationship"
                  children={(field) => (
                    <Field>
                      <SelectWrapper
                        id={field.name}
                        value={field.state.value}
                        onChange={(value) => field.handleChange(value as any)}
                        options={RELATIONSHIP_OPTIONS}
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                />

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
                  >
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleSkipStep2}
                    >
                      Skip
                    </Button>
                    <Button type="button" onClick={handleNextStep}>
                      Review & Publish
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirm & Publish */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Confirm & Publish
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Review your report before publishing
                  </p>
                </div>

                {/* Summary Card */}
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  {/* Required Fields */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Required Information
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Job Title
                        </span>
                        <p className="font-medium">
                          {form.state.values.jobTitle}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Impact Type
                        </span>
                        <p>
                          <Badge variant="default">
                            {IMPACT_TYPE_LABELS[form.state.values.impactType] ||
                              form.state.values.impactType}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Your Story
                        </span>
                        <p className="text-sm whitespace-pre-wrap">
                          {form.state.values.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Optional Fields */}
                  {(form.state.values.title ||
                    form.state.values.companyName ||
                    form.state.values.location ||
                    form.state.values.technologyDescription ||
                    form.state.values.workersAffectedCount ||
                    form.state.values.eventDate) && (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        Additional Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {form.state.values.title && (
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Summary
                            </span>
                            <p className="text-sm">{form.state.values.title}</p>
                          </div>
                        )}
                        {form.state.values.companyName && (
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Company
                            </span>
                            <p className="text-sm">
                              {form.state.values.companyName}
                            </p>
                          </div>
                        )}
                        {(form.state.values.location ||
                          form.state.values.country) && (
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Location
                            </span>
                            <p className="text-sm">
                              {[
                                form.state.values.location,
                                form.state.values.country,
                              ]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                          </div>
                        )}
                        {form.state.values.workersAffectedCount && (
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Workers Affected
                            </span>
                            <p className="text-sm">
                              {form.state.values.workersAffectedCount}
                            </p>
                          </div>
                        )}
                        {form.state.values.eventDate && (
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Date
                            </span>
                            <p className="text-sm">
                              {form.state.values.eventDate}
                            </p>
                          </div>
                        )}
                        {form.state.values.technologyDescription && (
                          <div className="col-span-2">
                            <span className="text-xs text-muted-foreground">
                              Technology
                            </span>
                            <p className="text-sm">
                              {form.state.values.technologyDescription}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Privacy */}
                  <div className="pt-4 border-t">
                    {form.state.values.isAnonymous ? (
                      <p className="text-sm text-muted-foreground">
                        🔒 This will be posted anonymously
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        👤 This will be posted under your username
                      </p>
                    )}
                  </div>
                </div>

                {/* Anonymous Checkbox */}
                <form.Field
                  name="isAnonymous"
                  children={(field) => (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.state.value}
                        onChange={(e) => field.handleChange(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm">
                        Post anonymously (your username will not be shown)
                      </span>
                    </label>
                  )}
                />

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
                  >
                    Back
                  </Button>
                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                      <Button
                        type="submit"
                        disabled={!canSubmit || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner /> Publishing...
                          </>
                        ) : (
                          'Publish Report'
                        )}
                      </Button>
                    )}
                  />
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    />
  )
}

// ============================================
// SUBCOMPONENTS
// ============================================

function StepIndicator({
  step,
  currentStep,
  label,
  onClick,
}: {
  step: number
  currentStep: number
  label: string
  onClick?: () => void
}) {
  const isCompleted = currentStep > step
  const isCurrent = currentStep === step

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick || (step > 1 && currentStep < step)}
      className="flex flex-col items-center gap-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
          isCompleted
            ? 'bg-primary text-primary-foreground'
            : isCurrent
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
        }`}
      >
        {isCompleted ? '✓' : step}
      </div>
      <span
        className={`text-xs ${
          isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
        }`}
      >
        {label}
      </span>
    </button>
  )
}
