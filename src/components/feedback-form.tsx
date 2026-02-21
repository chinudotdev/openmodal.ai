import { useForm } from '@tanstack/react-form'

import { AlertCircle, StarIcon } from 'lucide-react'
import { useState } from 'react'

import { submitFeedbackFn } from '@/actions/feedback'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface FeedbackFormProps {
  onSuccess?: () => void
  className?: string
}

export function FeedbackForm({
  onSuccess,
  className,
  ...props
}: FeedbackFormProps & React.ComponentProps<'div'>) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)

  const form = useForm({
    defaultValues: {
      type: 'general' as const,
      content: '',
      rating: undefined as string | undefined,
    },
    validators: {
      onSubmit: ({ value }) => {
        if (!value.content.trim()) {
          return {
            fieldErrors: {
              content: 'Feedback is required',
            },
          }
        }

        if (value.content.length < 10) {
          return {
            fieldErrors: {
              content: 'Please provide more details (at least 10 characters)',
            },
          }
        }

        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const result = await submitFeedbackFn({
          data: {
            type: value.type,
            content: value.content,
            rating: value.rating as '1' | '2' | '3' | '4' | '5' | undefined,
          },
        })

        if (result.success) {
          setSuccess(true)
          onSuccess?.()
        } else {
          setError(result.error)
        }
      } catch (err) {
        console.error('Feedback submission error:', err)
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred'
        setError(errorMessage)
      }
    },
  })

  if (success) {
    return (
      <div
        className={cn('flex w-full items-center justify-center p-6', className)}
        {...props}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Thank You!</CardTitle>
            <CardDescription className="text-center">
              Your feedback has been submitted successfully. We appreciate your
              input and will review it shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => setSuccess(false)}>Submit Another</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      className={cn('flex w-full items-center justify-center p-6', className)}
      {...props}
    >
      <div className="w-full max-w-lg">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Submit Feedback</CardTitle>
            <CardDescription>
              Help us improve by sharing your thoughts, reporting bugs, or
              suggesting new features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="feedback-form"
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void form.handleSubmit()
              }}
            >
              {error && (
                <div className="mb-4 flex items-center justify-center gap-2 text-center text-destructive text-sm font-normal">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <FieldGroup>
                {/* Type Selection */}
                <form.Field
                  name="type"
                  children={(field) => (
                    <Field>
                      <FieldLabel>Feedback Type</FieldLabel>
                      <RadioGroup
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(value as typeof field.state.value)
                        }
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <Label
                            htmlFor="type-general"
                            className="flex cursor-pointer items-center gap-2 rounded-md border p-3 has-[:checked]:border-primary"
                          >
                            <RadioGroupItem value="general" id="type-general" />
                            <span className="text-sm">General Feedback</span>
                          </Label>
                          <Label
                            htmlFor="type-bug"
                            className="flex cursor-pointer items-center gap-2 rounded-md border p-3 has-[:checked]:border-primary"
                          >
                            <RadioGroupItem value="bug" id="type-bug" />
                            <span className="text-sm">Bug Report</span>
                          </Label>
                          <Label
                            htmlFor="type-feature"
                            className="flex cursor-pointer items-center gap-2 rounded-md border p-3 has-[:checked]:border-primary"
                          >
                            <RadioGroupItem value="feature" id="type-feature" />
                            <span className="text-sm">Feature Request</span>
                          </Label>
                          <Label
                            htmlFor="type-improvement"
                            className="flex cursor-pointer items-center gap-2 rounded-md border p-3 has-[:checked]:border-primary"
                          >
                            <RadioGroupItem
                              value="improvement"
                              id="type-improvement"
                            />
                            <span className="text-sm">Improvement</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </Field>
                  )}
                />

                {/* Rating */}
                <form.Field
                  name="rating"
                  children={(field) => (
                    <Field>
                      <FieldLabel>
                        Rating{' '}
                        <span className="text-muted-foreground">
                          (optional)
                        </span>
                      </FieldLabel>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            className={cn(
                              'p-1 transition-colors hover:text-yellow-500',
                              (hoveredRating ||
                                Number(field.state.value || 0)) >= rating
                                ? 'text-yellow-500'
                                : 'text-gray-300',
                            )}
                            onMouseEnter={() => setHoveredRating(rating)}
                            onMouseLeave={() => setHoveredRating(0)}
                            onClick={() => {
                              const currentValue = Number(
                                field.state.value || 0,
                              )
                              // Toggle off if clicking the same rating
                              if (currentValue === rating) {
                                field.handleChange(undefined as any)
                              } else {
                                field.handleChange(rating.toString() as any)
                              }
                            }}
                          >
                            <StarIcon className="h-6 w-6 fill-current" />
                          </button>
                        ))}
                        {field.state.value && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            {field.state.value}/5
                          </span>
                        )}
                      </div>
                    </Field>
                  )}
                />

                {/* Content */}
                <form.Field
                  name="content"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Feedback <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Tell us what you think, report a bug, or suggest an improvement..."
                          rows={5}
                          required
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />

                {/* Submit Button */}
                <Field>
                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                  >
                    {([canSubmit, isSubmitting]) => (
                      <Button
                        type="submit"
                        disabled={!canSubmit}
                        form="feedback-form"
                        className="w-full"
                      >
                        {isSubmitting ? (
                          <Spinner className="w-4 h-4" />
                        ) : (
                          'Submit Feedback'
                        )}
                      </Button>
                    )}
                  </form.Subscribe>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
