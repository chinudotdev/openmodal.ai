# Quick Reference

Common patterns and commands for OpenModal development.

## Bun Commands

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `bun dev`         | Start dev server on port 3001 |
| `bun run build`   | Build for production          |
| `bun run preview` | Preview production build      |
| `bun run check`   | Run prettier + eslint --fix   |
| `bun test`        | Run tests                     |
| `bun run lint`    | Run eslint                    |
| `bun run format`  | Run prettier                  |

## Database Commands

| Command               | Description                            |
| --------------------- | -------------------------------------- |
| `bun run db:generate` | Generate migration from schema changes |
| `bun run db:migrate`  | Run migrations                         |
| `bun run db:push`     | Push schema (dev only)                 |
| `bun run db:studio`   | Open Drizzle Studio                    |
| `bun run db:seed`     | Seed database                          |

## Path Aliases

```typescript
@/*              → ./src/*
@/drizzle/*      → ./drizzle/*
```

## Imports

### Server Action

```typescript
import { createServerFn } from '@tanstack/react-start'
```

### Auth

```typescript
import { auth } from '@/lib/auth'
import { authMiddleware } from '@/middleware/server'
```

### Database

```typescript
import { db } from '@/db'
import { user, post } from '@/db/schema'
import { eq, and, or } from 'drizzle-orm'
```

### Router

```typescript
import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { useRouter } from '@tanstack/react-router'
```

### Forms

```typescript
import { useForm } from '@tanstack/react-form'
import z from 'zod'
```

### UI Components

```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@/components/ui/field'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
```

## Server Action Template

```typescript
// src/actions/example.ts
import { createServerFn } from '@tanstack/react-start'
import { authMiddleware, rateLimitMiddleware } from '@/middleware/server'
import z from 'zod'
import { myDataLayerFunction } from '@/data-layer/example'

export const myActionFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string(),
    }),
  )
  .middleware([authMiddleware, rateLimitMiddleware({ max: 10, window: 60 })])
  .handler(async ({ data, context }) => {
    const userId = context.user.id

    // Business logic here
    const existing = await myDataLayerFunction(data.id)
    if (existing && existing.userId !== userId) {
      return { success: false, error: 'Not authorized' }
    }

    // Data access through data-layer
    const result = await myDataLayerFunction(data.id)

    return { success: true, result }
  })
```

## Route Template

```typescript
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSessionFn } from '@/actions/session'

export const Route = createFileRoute('/_authed/mypage')({
  beforeLoad: async ({ location }) => {
    const session = await getSessionFn()
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    return { session }
  },
  component: MyPage,
})
```

## Database Query Template (Data Layer)

```typescript
// src/data-layer/users.ts
import { db } from '@/db'
import { user } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function getUserById(userId: string) {
  const [result] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  return result || null
}
```

## Form Template

```typescript
import { useForm } from '@tanstack/react-form'
import { myActionFn } from '@/actions/myaction'

const form = useForm({
  defaultValues: { name: '' },
  validators: {
    onSubmit: z.object({ name: z.string().min(1) }),
  },
  onSubmit: async ({ value }) => {
    await myActionFn({ data: value })
  },
})
```

## Common Drizzle Operators

```typescript
import {
  eq,
  and,
  or,
  like,
  ilike,
  inArray,
  isNull,
  isNotNull,
  desc,
  asc,
} from 'drizzle-orm'

eq(column, value) // column = value
and(...conditions) // AND
or(...conditions) // OR
like(column, pattern) // LIKE
ilike(column, pattern) // ILIKE (case-insensitive)
inArray(column, values) // IN
isNull(column) // IS NULL
isNotNull(column) // IS NOT NULL
desc(column) // ORDER BY column DESC
asc(column) // ORDER BY column ASC
```

## Tailwind Utilities

```typescript
import { cn } from '@/lib/utils'

cn('base-class', conditional && 'conditional-class', 'another-class')
```

## Router Navigation

```typescript
import { useRouter } from '@tanstack/react-router'

const router = useRouter()

// Navigate
await router.navigate({ to: '/dashboard' })

// Navigate with params
await router.navigate({ to: '/users/$userId', params: { userId: '123' } })

// Navigate with search
await router.navigate({ to: '/users', search: { page: 2 } })

// Invalidate routes
await router.invalidate()
```

## Session Access

### Server (Action/Loader)

```typescript
import { authMiddleware } from '@/middleware/server'

export const action = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const user = context.user
    const session = context.session
  })
```

### Client (Route)

```typescript
const { session } = Route.useRouteContext()
const user = session?.user
```

## Environment Variables

```typescript
import { env } from 'cloudflare:workers'

env.DATABASE_URL
env.BETTER_AUTH_SECRET
env.GOOGLE_CLIENT_ID
env.GOOGLE_CLIENT_SECRET
```

## Zod Validation

```typescript
import z from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18).max(120),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'user']),
  tags: z.array(z.string()).optional(),
})

// Validate
const result = schema.safeParse(data)
if (!result.success) {
  console.log(result.error.errors)
}
```

## Architecture Patterns

### Data Layer (Pure DB Queries)

```typescript
// src/data-layer/users.ts
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { user } from '@/db/schema'

export async function getUserById(userId: string) {
  const [result] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  return result || null
}

export async function getUserByUsername(username: string) {
  const [result] = await db
    .select()
    .from(user)
    .where(eq(user.username, username))
    .limit(1)

  return result || null
}
```

### Action (Business Logic + Data Layer)

```typescript
// src/actions/user.ts
import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/middleware/server'
import { getUserById, getUserByUsername } from '@/data-layer/users'

export const checkUsernameAvailabilityFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ username: z.string().min(4) }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const existing = await getUserByUsername(data.username)
    return !existing
  })
```

### Middleware (Auth, Rate Limiting)

```typescript
// src/middleware/server.ts
import { auth } from '@/lib/auth'
import { createMiddleware } from '@tanstack/react-start'

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() })
    if (!session) throw new Error('Unauthorized')
    return next({ context: { user: session.user, session: session.session } })
  },
)

export const rateLimitMiddleware = (opts: { max: number; window: number }) =>
  createMiddleware({ type: 'function' }).server(async ({ next, context }) => {
    // Rate limiting logic
    return next()
  })
```

## Common UI Patterns

### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Form Field

```tsx
<form.Field name="email">
  {(field) => (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <Input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )}
</form.Field>
```

### Button with Loading

```tsx
<Button disabled={isLoading}>{isLoading ? <Spinner /> : 'Submit'}</Button>
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add my feature"

# Push and create PR
git push origin feature/my-feature
```

## Deployment

```bash
# Build
bun run build

# Deploy to Cloudflare (via Wrangler)
wrangler deploy
```
