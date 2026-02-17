import { useForm } from '@tanstack/react-form'
import { AlertCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import z from 'zod'
import { useRouter } from '@tanstack/react-router'
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
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { completeOnboardingFn } from '@/actions/onboarding'
import { checkUsernameAvailabilityFn } from '@/actions/user'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores',
    ),
})

interface OnboardFormProps {
  name: string
  className?: string
}

export function OnboardForm({
  name,
  className,
  ...props
}: OnboardFormProps & React.ComponentProps<'div'>) {
  const [error, setError] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null)
  const [isInvalidating, setIsInvalidating] = useState(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastCheckedUsernameRef = useRef<string>('')
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      name: name || '',
      username: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const result = await completeOnboardingFn({
          data: {
            name: value.name,
            username: value.username,
          },
        })

        if (result.success) {
          // Set invalidating state to keep button in loading state
          setIsInvalidating(true)
          // Invalidate route to refresh the session with updated onboarding status
          await router.invalidate()
        } else {
          setError('Failed to complete onboarding')
        }
      } catch (err) {
        setError('An unknown error occurred')
      }
    },
  })

  // Debounced username availability check function
  const checkUsernameAvailability = (username: string) => {
    // Skip if username hasn't changed
    if (username === lastCheckedUsernameRef.current) {
      return
    }

    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Only check availability if username meets minimum length requirement
    if (username.length < 3) {
      setUsernameError(null)
      setIsUsernameAvailable(null)
      setIsCheckingUsername(false)
      lastCheckedUsernameRef.current = username
      return
    }

    // For usernames with 3 chars, skip the availability check
    // (checkUsernameAvailabilityFn requires min 4 chars)
    // Keep isUsernameAvailable as null - button will stay disabled until 4+ chars are entered
    if (username.length < 4) {
      setUsernameError(null)
      setIsUsernameAvailable(null)
      setIsCheckingUsername(false)
      lastCheckedUsernameRef.current = username
      return
    }

    // Debounce the check - wait 300ms after user stops typing
    setIsCheckingUsername(true)
    setUsernameError(null)
    setIsUsernameAvailable(null)

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const isAvailable = await checkUsernameAvailabilityFn({
          data: { username },
        })

        // Only update if the username hasn't changed
        if (
          username === lastCheckedUsernameRef.current ||
          form.state.values.username === username
        ) {
          if (!isAvailable) {
            setUsernameError('Username is already taken')
            setIsUsernameAvailable(false)
          } else {
            setUsernameError(null)
            setIsUsernameAvailable(true)
          }
          lastCheckedUsernameRef.current = username
        }
      } catch (err) {
        // If check fails, don't block form submission
        // Server will validate anyway
        if (
          username === lastCheckedUsernameRef.current ||
          form.state.values.username === username
        ) {
          setUsernameError(null)
          setIsUsernameAvailable(null)
          lastCheckedUsernameRef.current = username
        }
      } finally {
        if (
          username === lastCheckedUsernameRef.current ||
          form.state.values.username === username
        ) {
          setIsCheckingUsername(false)
        }
      }
    }, 500)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      className={cn(
        'flex min-h-svh w-full items-center justify-center p-6 md:p-10',
        className,
      )}
      {...props}
    >
      <div className="w-full max-w-sm">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>
              Please fill in your profile details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="onboard-form"
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void form.handleSubmit()
              }}
            >
              {error && (
                <div className="mb-2 flex items-center justify-center gap-2 text-center text-destructive text-sm font-normal">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              <FieldGroup>
                <form.Field
                  name="name"
                  // biome-ignore lint/correctness/noChildrenProp: <explanation>
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Enter your name"
                          required
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
                <form.Field
                  name="username"
                  // biome-ignore lint/correctness/noChildrenProp: <explanation>
                  children={(field) => {
                    const isInvalid =
                      (field.state.meta.isTouched &&
                        !field.state.meta.isValid) ||
                      usernameError !== null

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => {
                            const newValue = e.target.value
                            field.handleChange(newValue)
                            // Clear username error when user starts typing
                            if (usernameError) {
                              setUsernameError(null)
                            }
                            setIsUsernameAvailable(null)
                            // Trigger debounced availability check
                            checkUsernameAvailability(newValue)
                          }}
                          aria-invalid={isInvalid}
                          placeholder="@username"
                        />
                        {isCheckingUsername && (
                          <div className="text-sm text-muted-foreground">
                            Checking availability...
                          </div>
                        )}
                        {field.state.meta.isTouched &&
                          !field.state.meta.isValid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        {usernameError && (
                          <FieldError errors={[{ message: usernameError }]} />
                        )}
                      </Field>
                    )
                  }}
                />
                <Field>
                  <form.Subscribe
                    selector={(formState) => {
                      // Get username from form state
                      const values = formState.values
                      const usernameValue = (
                        values as { username: string | boolean }
                      ).username
                      const username =
                        typeof usernameValue === 'string' ? usernameValue : ''

                      return [
                        formState.canSubmit,
                        formState.isSubmitting,
                        username,
                      ] as [boolean, boolean, string]
                    }}
                  >
                    {([canSubmit, isSubmitting, username]) => {
                      // Show loading if form is submitting or route is being invalidated
                      const isLoading = isSubmitting || isInvalidating
                      // Check if username needs availability validation (4+ chars)
                      const usernameNeedsCheck = username.length >= 4

                      // For usernames that need checking (4+ chars), ensure:
                      // 1. Not currently checking
                      // 2. Check has completed and username is available (isUsernameAvailable === true)
                      // 3. No username error exists
                      // For usernames < 4 chars: button stays disabled (isUsernameAvailable is null)
                      const isUsernameValid = usernameNeedsCheck
                        ? !isCheckingUsername &&
                          isUsernameAvailable === true &&
                          usernameError === null
                        : false // Usernames < 4 chars: keep disabled until they reach 4 chars and check completes

                      // Disable submit if:
                      // - Form validation fails
                      // - Username is empty or too short (< 3 chars)
                      // - Username is being checked
                      // - Username validation failed (not available or not checked yet)
                      // - Username has an error
                      // - Username is 3 chars (needs to reach 4 chars for check)
                      // - For 4+ char usernames: if availability hasn't been confirmed (isUsernameAvailable !== true)
                      const shouldDisable =
                        !canSubmit ||
                        username.length < 3 ||
                        username.length === 3 || // Keep disabled at 3 chars until user types 4th char
                        isCheckingUsername ||
                        !isUsernameValid ||
                        usernameError !== null ||
                        (usernameNeedsCheck && isUsernameAvailable !== true)

                      return (
                        <Button
                          type="submit"
                          disabled={shouldDisable || isLoading}
                          form="onboard-form"
                        >
                          {isLoading ? <Spinner className="w-4 h-4" /> : 'Save'}
                        </Button>
                      )
                    }}
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
