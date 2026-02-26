# Authentication Guide

This guide covers authentication using Better Auth in OpenModal.

## Configuration

Better Auth is configured in `src/lib/auth.ts`:

```typescript
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, customSession, username } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { db } from '@/db'
import { authSchema } from '@/db/schema'

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmailVerification({ to: user.email, url })
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 20,
      usernameValidator: (username) => /^[a-zA-Z0-9_]+$/.test(username),
    }),
    customSession(async ({ user, session }) => {
      // Add custom fields to session
      return {
        user: {
          ...user,
          onboardingCompleted: user.onboardingCompleted,
          role: user.role,
        },
        session,
      }
    }),
    admin({
      ac,
      roles,
      defaultRole: 'observer',
      adminRoles: ['admin'],
    }),
    tanstackStartCookies(),
  ],
})
```

## Getting the Session

### Server-Side (Actions/Loaders)

```typescript
import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from '@/lib/auth'

const session = await auth.api.getSession({ headers: getRequestHeaders() })
```

### Using Auth Middleware

```typescript
import { authMiddleware } from '@/middleware/server'

export const myAction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    // context.user and context.session available
    const userId = context.user.id
  })
```

### Client-Side (Routes)

```typescript
// In a route component
const { session } = Route.useRouteContext()

if (session) {
  console.log(session.user.name, session.user.role)
}
```

## Authentication Methods

### Email/Password

**Sign Up:**

```typescript
import { auth } from '@/lib/auth'

await auth.api.signUpEmail({
  body: {
    email: 'user@example.com',
    password: 'SecurePassword123!',
    name: 'John Doe',
  },
})
```

**Sign In:**

```typescript
await auth.api.signInEmail({
  body: {
    email: 'user@example.com',
    password: 'SecurePassword123!',
  },
})
```

### Google OAuth

**Redirect to Google:**

```typescript
import { auth } from '@/lib/auth'

await auth.api.signInSocial({
  body: {
    provider: 'google',
    callbackURL: '/dashboard',
  },
})
```

**Handle Callback:**

The callback is handled by `src/routes/api/auth/$.ts`:

```typescript
import { createFileRoute } from '@tanstack/react-router'

import { auth } from '@/lib/auth'

export const Route = createFileRoute('/api/auth/$')({
  middleware: [
    createMiddleware().server(async ({ next }) => {
      // Better Auth handles the callback
      return next()
    }),
  ],
})
```

## User Registration Flow

1. User signs up (email/password or OAuth)
2. Email verification sent (if email signup)
3. User must verify email
4. Upon verification, redirected to onboarding
5. Onboarding form collects name and username
6. `user.onboardingCompleted` set to `true`

## Username Handling

### Username Validation

Usernames must:

- Be 3-20 characters
- Contain only letters, numbers, and underscores
- Be unique

### Check Availability

```typescript
// src/actions/user.ts
import { createServerFn } from '@tanstack/react-start'

import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { user } from '@/db/schema'

export const checkUsernameAvailabilityFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ username: z.string().min(4).max(20) }))
  .middleware([authMiddleware])
  .handler(async ({ data: { username } }) => {
    const existingUser = await db
      .select({ username: user.username })
      .from(user)
      .where(eq(user.username, username))
      .limit(1)

    return existingUser.length === 0
  })
```

## Roles and Permissions

### Role Hierarchy

| Role        | Points    | Description                          |
| ----------- | --------- | ------------------------------------ |
| observer    | 0-199     | Can view, submit reports, verify     |
| contributor | 200-999   | Can edit own reports                 |
| trusted     | 1000-4999 | Can delete own reports, flag content |
| expert      | 5000+     | Can moderate                         |
| moderator   | Assigned  | Full moderation                      |
| admin       | Assigned  | Full control                         |

### Permission Checking

```typescript
import { canPerformAction } from '@/lib/permissions'

const canEdit = canPerformAction(user.role, 'report', 'edit')
```

### Access Control Statement

```typescript
// src/lib/permissions.ts
import { createAccessControl } from 'better-auth/plugins/access'

export const statement = {
  report: ['create', 'verify', 'edit', 'delete', 'moderate'],
  verification: ['create', 'delete'],
  moderation: ['approve', 'reject', 'request_changes'],
  comment: ['create', 'edit', 'delete'],
} as const

export const ac = createAccessControl(statement)

export const observer = ac.newRole({
  report: ['create', 'verify'],
  comment: ['create'],
})

// ... other roles
```

## Session Custom Fields

Custom fields are added via the `customSession` plugin:

```typescript
customSession(async ({ user, session }) => {
  const onboardingStatus = await getOnboardingStatus(user.id)
  return {
    user: {
      ...user,
      onboardingCompleted: onboardingStatus.completed,
      role: onboardingStatus.role,
    },
    session,
  }
})
```

Access these fields:

```typescript
session.user.onboardingCompleted
session.user.role
```

## Email Verification

Email verification is required and sent automatically on signup.

**Resend Verification:**

```typescript
await auth.api.sendVerificationEmail({
  body: {
    email: 'user@example.com',
  },
})
```

## Sign Out

```typescript
await auth.api.signOut({
  headers: getRequestHeaders(),
})
```

## Auth Components

### Login Form

```typescript
// src/components/login-form.tsx
import { useForm } from '@tanstack/react-form'

import { signInEmailFn } from '@/actions/auth'

const form = useForm({
  defaultValues: { email: '', password: '' },
  onSubmit: async ({ value }) => {
    await signInEmailFn({ data: value })
  },
})
```

### Google Login Button

```typescript
// src/components/google-login.tsx
import { auth } from '@/lib/auth'

const handleGoogleLogin = async () => {
  await auth.api.signInSocial({
    body: {
      provider: 'google',
      callbackURL: '/dashboard',
    },
  })
}
```

## Tips

1. **Always use `authMiddleware`** for protected server actions
2. **Check `onboardingCompleted`** in protected routes
3. **Use `canPerformAction`** for permission checks
4. **Custom session fields** are available on `session.user`
5. **Email verification** is required - handle the state properly
