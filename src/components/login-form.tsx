import { useForm } from '@tanstack/react-form'
import { Link, useRouter, useSearch } from '@tanstack/react-router'

import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import z from 'zod'

import { GoogleLogin } from './google-login'
import { loginOrSignupFn } from '@/actions/auth'
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'


const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const search = useSearch({ from: '/login' })

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null)
      const result = await loginOrSignupFn({ data: value })

      if (result.success) {
        // If new user, redirect to verify email
        if (!result.existingUser && result.email) {
          await router.navigate({
            to: '/verify-email',
            search: { email: result.email },
          })
          return
        }

        // If existing user, invalidate and redirect
        await router.invalidate()
        const redirectTo = search.redirect || '/dashboard'
        await router.navigate({ to: redirectTo })
      } else {
        setError(result.message)
      }
    },
  })
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome to OpenModal.ai</CardTitle>
          <CardDescription>
            Enter your email to sign in or create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="login-form"
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
              <Field>
                <GoogleLogin callbackURL={search.redirect || '/dashboard'} />
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <form.Field
                name="email"
                // biome-ignore lint/correctness/noChildrenProp: <explanation>
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="m@example.com"
                        type="email"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
              <form.Field
                name="password"
                // biome-ignore lint/correctness/noChildrenProp: <explanation>
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <div className="flex items-center">
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <Link
                          to="/forgot-password"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Password"
                        type="password"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
              <Field>
                <form.Subscribe
                  selector={(formState) => [
                    formState.canSubmit,
                    formState.isSubmitting,
                  ]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      form="login-form"
                    >
                      {isSubmitting ? (
                        <Spinner className="w-4 h-4" />
                      ) : (
                        'Continue'
                      )}
                    </Button>
                  )}
                </form.Subscribe>
                <FieldDescription className="text-center">
                  We&apos;ll create an account if you don&apos;t have one
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{' '}
        <a href="/terms">Terms of Service</a> and{' '}
        <a href="/privacy">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
