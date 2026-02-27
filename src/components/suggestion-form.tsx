import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'

import { AlertCircle, ChevronRightIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import z from 'zod'

import {
  searchCapabilitiesAndJobsFn,
  submitSuggestionsFn,
} from '@/actions/suggestions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  type: z.enum(['job', 'capability', 'technology']),
  mode: z.enum(['new', 'existing']),
  existingId: z.string().optional(),
  newName: z.string().optional(),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  additionalInfo: z.string().optional(),
})

interface SearchResult {
  id: string
  name: string
  type: 'capability' | 'job' | 'technology'
}

interface SuggestionFormProps {
  defaultType?: 'job' | 'capability' | 'technology'
  defaultMode?: 'new' | 'existing'
  defaultName?: string
  defaultExistingId?: string
  onSuccess?: () => void
  className?: string
}

export function SuggestionForm({
  defaultType = 'job',
  defaultMode = 'new',
  defaultName = '',
  defaultExistingId = '',
  onSuccess,
  className,
  ...props
}: SuggestionFormProps & React.ComponentProps<'div'>) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [searchResults, setSearchResults] = useState<Array<SearchResult>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [existingName, setExistingName] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const form = useForm({
    defaultValues: {
      type: defaultType,
      mode: defaultMode,
      existingId: defaultExistingId,
      newName: defaultName,
      reason: '',
      additionalInfo: '',
    },
    validators: {
      onSubmit: ({ value }) => {
        // Validate based on mode
        if (value.mode === 'new' && !value.newName.trim()) {
          return {
            fieldErrors: {
              newName: 'Name is required',
            },
          }
        }
        if (value.mode === 'existing' && !value.existingId) {
          return {
            fieldErrors: {
              existingId: 'Please select an item',
            },
          }
        }

        // Run schema validation
        const result = formSchema.safeParse(value)
        if (!result.success) {
          return {
            fieldErrors: result.error.flatten().fieldErrors,
          }
        }

        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const suggestedName =
          value.mode === 'new' ? value.newName : existingName || value.newName

        if (!suggestedName.trim()) {
          setError('Please provide a name for the suggestion')
          return
        }

        const result = await submitSuggestionsFn({
          data: {
            type: value.type,
            suggestedName,
            reason: value.reason,
            additionalInfo: value.additionalInfo || undefined,
          },
        })

        if (result.success) {
          setSuccess(true)
          onSuccess?.()
        } else {
          setError(result.error)
        }
      } catch (err) {
        console.error('Suggestion submission error:', err)
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred'
        setError(errorMessage)
      }
    },
  })

  // Debounced search function
  const handleSearch = (query: string) => {
    setExistingName(query)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!query.trim() || query.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const type = form.state.values.type
        const results = await searchCapabilitiesAndJobsFn({
          data: { query, type },
        })
        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const handleTypeChange = (newType: 'job' | 'capability' | 'technology') => {
    form.setFieldValue('type', newType)
    // Reset mode-dependent fields when type changes
    form.setFieldValue('existingId', '')
    setExistingName('')
    setSearchResults([])
  }

  const handleModeChange = (newMode: 'new' | 'existing') => {
    form.setFieldValue('mode', newMode)
    // Reset mode-dependent fields
    form.setFieldValue('existingId', '')
    form.setFieldValue('newName', '')
    setExistingName('')
    setSearchResults([])
  }

  const handleSelectExisting = (item: SearchResult) => {
    form.setFieldValue('existingId', item.id)
    setExistingName(item.name)
    setSearchResults([])
  }

  if (success) {
    return (
      <div
        className={cn('flex w-full items-center justify-center p-6', className)}
        {...props}
      >
        <div className="w-full max-w-lg">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 mr-1"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to Contribute
          </Link>
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Thank You!</CardTitle>
              <CardDescription className="text-center">
                Your suggestion has been submitted successfully. We'll review it
                and consider it for inclusion in the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => setSuccess(false)}>Submit Another</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('flex w-full items-center justify-center p-6', className)}
      {...props}
    >
      <div className="w-full max-w-lg">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 mr-1"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to Contribute
        </Link>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Submit a Suggestion</CardTitle>
            <CardDescription>
              Help us improve our database by suggesting new jobs, capabilities,
              or technologies to track
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="suggestion-form"
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
                      <FieldLabel>What would you like to suggest?</FieldLabel>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="type"
                            value="job"
                            checked={field.state.value === 'job'}
                            onChange={() => handleTypeChange('job')}
                            className="w-4 h-4"
                          />
                          <span>Job</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="type"
                            value="capability"
                            checked={field.state.value === 'capability'}
                            onChange={() => handleTypeChange('capability')}
                            className="w-4 h-4"
                          />
                          <span>Capability</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="type"
                            value="technology"
                            checked={field.state.value === 'technology'}
                            onChange={() => handleTypeChange('technology')}
                            className="w-4 h-4"
                          />
                          <span>Technology</span>
                        </label>
                      </div>
                    </Field>
                  )}
                />

                {/* Mode Selection */}
                <form.Field
                  name="mode"
                  children={(field) => (
                    <Field>
                      <FieldLabel>Is this a new or existing item?</FieldLabel>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="mode"
                            value="new"
                            checked={field.state.value === 'new'}
                            onChange={() => handleModeChange('new')}
                            className="w-4 h-4"
                          />
                          <span>New (not in database)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="mode"
                            value="existing"
                            checked={field.state.value === 'existing'}
                            onChange={() => handleModeChange('existing')}
                            className="w-4 h-4"
                          />
                          <span>Existing</span>
                        </label>
                      </div>
                    </Field>
                  )}
                />

                {/* New Name Input */}
                {form.state.values.mode === 'new' && (
                  <form.Field
                    name="newName"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            {form.state.values.type === 'job'
                              ? 'Job'
                              : form.state.values.type === 'capability'
                                ? 'Capability'
                                : 'Technology'}{' '}
                            Name
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder={`Enter the ${form.state.values.type} name`}
                            required
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      )
                    }}
                  />
                )}

                {/* Existing Search */}
                {form.state.values.mode === 'existing' && (
                  <Field>
                    <FieldLabel>
                      Search{' '}
                      {form.state.values.type === 'job'
                        ? 'Jobs'
                        : form.state.values.type === 'capability'
                          ? 'Capabilities'
                          : 'Technologies'}
                    </FieldLabel>
                    <Combobox
                      value={form.state.values.existingId}
                      onValueChange={(value) => {
                        form.setFieldValue('existingId', value ?? '')
                      }}
                    >
                      <div className="relative">
                        <ComboboxInput
                          placeholder={`Search for a ${form.state.values.type}...`}
                          value={existingName}
                          onChange={(e) => handleSearch(e.target.value)}
                          showTrigger={false}
                        />
                        {isSearching && (
                          <Spinner className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4" />
                        )}
                        <ComboboxTrigger />
                      </div>
                      <ComboboxContent>
                        <ComboboxList>
                          {searchResults.length === 0 &&
                            existingName.length >= 2 &&
                            !isSearching && (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                No results found
                              </div>
                            )}
                          {searchResults.map((item) => (
                            <ComboboxItem
                              key={item.id}
                              value={item.id}
                              onClick={() => handleSelectExisting(item)}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span>{item.name}</span>
                                <span className="text-xs text-muted-foreground capitalize">
                                  {item.type}
                                </span>
                              </div>
                            </ComboboxItem>
                          ))}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    {existingName && form.state.values.existingId && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Selected:{' '}
                        <span className="font-medium">{existingName}</span>
                      </div>
                    )}
                  </Field>
                )}

                {/* Type Badge */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Suggesting:</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {form.state.values.mode === 'new' ? 'New' : 'Existing'}{' '}
                    {form.state.values.type === 'job'
                      ? 'Job'
                      : form.state.values.type === 'capability'
                        ? 'Capability'
                        : 'Technology'}
                    <ChevronRightIcon className="h-3 w-3" />
                  </span>
                </div>

                {/* Reason */}
                <form.Field
                  name="reason"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Reason <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Why should we add or track this? What impact does AI have on it?"
                          rows={4}
                          required
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />

                {/* Additional Info */}
                <form.Field
                  name="additionalInfo"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Additional Information{' '}
                        <span className="text-muted-foreground">
                          (optional)
                        </span>
                      </FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Any extra context, examples, or resources that might help us understand your suggestion better..."
                        rows={3}
                      />
                    </Field>
                  )}
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
                        form="suggestion-form"
                        className="w-full"
                      >
                        {isSubmitting ? (
                          <Spinner className="w-4 h-4" />
                        ) : (
                          'Submit Suggestion'
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
