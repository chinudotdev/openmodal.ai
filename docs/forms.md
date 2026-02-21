# Forms Implementation Guide

This guide covers how to implement forms in OpenModal using TanStack Form and Zod validation.

## Architecture Note

Forms interact with the **Actions Layer**, which uses the **Data Layer** for database access:

```
Form Component → Action (validation, business logic) → Data Layer (DB queries)
```

See [architecture.md](architecture.md) for more details.

## Core Pattern

## Step-by-Step Form Implementation

### 1. Define Data Layer Function

Create the data layer function for database access:

```typescript
// src/data-layer/users.ts
import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { user } from '@/db/schema'

export async function updateUser(userId: string, data: { name: string }) {
  const [updated] = await db
    .update(user)
    .set({ name: data.name, updatedAt: new Date() })
    .where(eq(user.id, userId))
    .returning()

  return updated
}
```

### 2. Define Server Action

Create the server action that handles validation and business logic:

```typescript
// src/actions/my-form.ts
import { createServerFn } from '@tanstack/react-start'

import z from 'zod'

import { updateUser } from '@/data-layer/users'
import { authMiddleware } from '@/middleware/server'

export const submitMyFormFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email'),
      age: z.number().min(18, 'Must be 18+'),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    // Access authenticated user from context
    const userId = context.user.id

    // Business logic: Validate email uniqueness, etc.
    // ...

    // Data access through data-layer
    const updated = await updateUser(userId, { name: data.name })

    return { success: true, user: updated }
  })
```

### 2. Define Validation Schema

Define the Zod schema for client-side validation:

```typescript
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be at least 18'),
  bio: z.string().optional(),
})
```

### 3. Create Form Component

```typescript
// src/components/my-form.tsx
import { useForm } from "@tanstack/react-form"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { submitMyFormFn } from "@/actions/my-form"
import { useRouter } from "@tanstack/react-router"

export function MyForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      age: 18,
      bio: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const result = await submitMyFormFn({
          data: value,
        })

        if (result.success) {
          // Optionally invalidate routes or navigate
          await router.invalidate()
        } else {
          setError(result.error || "Submission failed")
        }
      } catch (err) {
        setError("An unknown error occurred")
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      {error && (
        <div className="text-destructive text-sm mb-4">{error}</div>
      )}

      <FieldGroup>
        {/* Text Input */}
        <form.Field name="name">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
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
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* Email Input */}
        <form.Field name="email">
          {(field) => (
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="you@example.com"
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Number Input */}
        <form.Field name="age">
          {(field) => (
            <Field>
              <FieldLabel>Age</FieldLabel>
              <Input
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Textarea */}
        <form.Field name="bio">
          {(field) => (
            <Field>
              <FieldLabel>Bio (optional)</FieldLabel>
              <Textarea
                value={field.state.value || ""}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Tell us about yourself"
              />
            </Field>
          )}
        </form.Field>

        {/* Submit Button */}
        <Field>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? <Spinner className="w-4 h-4" /> : "Submit"}
              </Button>
            )}
          </form.Subscribe>
        </Field>
      </FieldGroup>
    </form>
  )
}
```

## Common Patterns

### Async Field Validation (e.g., Username Availability)

```typescript
const [isChecking, setIsChecking] = useState(false)
const [availabilityError, setAvailabilityError] = useState<string | null>(null)
const debounceRef = useRef<NodeJS.Timeout | null>(null)

const checkAvailability = async (username: string) => {
  if (debounceRef.current) clearTimeout(debounceRef.current)

  setIsChecking(true)
  setAvailabilityError(null)

  debounceRef.current = setTimeout(async () => {
    try {
      const available = await checkUsernameAvailabilityFn({ data: { username } })
      if (!available) {
        setAvailabilityError("Username already taken")
      }
    } finally {
      setIsChecking(false)
    }
  }, 500)
}

// In field onChange:
onChange={(e) => {
  field.handleChange(e.target.value)
  checkAvailability(e.target.value)
}}
```

### Select/Dropdown Fields

```typescript
<form.Field name="role">
  {(field) => (
    <Field>
      <FieldLabel>Role</FieldLabel>
      <Select
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="guest">Guest</SelectItem>
        </SelectContent>
      </Select>
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )}
</form.Field>
```

### Checkbox Fields

```typescript
<form.Field name="agree">
  {(field) => (
    <Field className="flex items-center gap-2">
      <Checkbox
        id={field.name}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked === true)}
      />
      <FieldLabel htmlFor={field.name}>I agree to the terms</FieldLabel>
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )}
</form.Field>
```

### Multi-Step Forms

For multi-step forms, consider using a state machine approach:

```typescript
const [step, setStep] = useState(1)

const form = useForm({
  defaultValues: {
    /* all fields */
  },
  validators: {
    onChange: formSchema,
  },
})

const nextStep = async () => {
  const currentFields = getFieldsForStep(step)
  const valid = await form.validateField(currentFields)
  if (valid) setStep(step + 1)
}
```

## UI Components

Use these UI components for forms:

| Component    | Purpose                                          |
| ------------ | ------------------------------------------------ |
| `Field`      | Wrapper for form fields, supports `data-invalid` |
| `FieldLabel` | Label element                                    |
| `FieldError` | Error message display                            |
| `FieldGroup` | Groups multiple fields                           |
| `Input`      | Text input                                       |
| `Textarea`   | Multi-line text input                            |
| `Button`     | Submit button                                    |
| `Spinner`    | Loading indicator                                |
| `Select`     | Dropdown (from `@/components/ui/select`)         |
| `Checkbox`   | Checkbox (from `@/components/ui/checkbox`)       |

## Tips

1. **Always use `void form.handleSubmit()`** - The void keyword prevents unhandled promise warnings
2. **Stop propagation on submit** - Use `e.stopPropagation()` to prevent parent form submissions
3. **Invalidate routes after data changes** - Use `router.invalidate()` to refresh data
4. **Handle errors gracefully** - Show user-friendly error messages
5. **Use Zod for validation** - Keep server and client validation in sync
