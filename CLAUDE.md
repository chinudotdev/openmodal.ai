# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenModal is a community-driven platform tracking AI's real-world impact on jobs and capabilities. The platform is built with TanStack Start (React SSR framework), deployed on Cloudflare Workers, and uses Neon PostgreSQL for the database.

**Key Stack:**

- **Framework:** TanStack Start (React + Vite + SSR on Cloudflare)
- **Database:** Neon PostgreSQL with Drizzle ORM
- **Auth:** Better Auth with Google OAuth
- **Styling:** Tailwind CSS v4
- **Package Manager:** Bun

**Core Philosophy:** The platform's value comes from unique, crowdsourced data (impact reports, discussions) that AI cannot replicate. See `RESTRUCTURE.md` for complete entity architecture.

**Architecture:** Layered architecture - UI → Actions → Middleware → Data Layer. See `docs/architecture.md` for details.

## Common Commands (All use Bun)

### Development

```bash
bun dev              # Start dev server on port 3001
bun run build        # Build for production
bun run preview      # Preview production build
bun run check        # Run prettier and eslint --fix
```

### Database

```bash
bun run db:generate  # Generate migrations from schema changes
bun run db:migrate   # Run migrations
bun run db:push      # Push schema directly (dev only)
bun run db:studio    # Open Drizzle Studio
bun run db:seed      # Seed database (uses src/db/seed/seed.ts)
```

### Testing & Linting

```bash
bun test             # Run tests (vitest)
bun run lint         # Run eslint
bun run format       # Run prettier
```

### Cloudflare

```bash
bun run cf-typegen   # Generate Cloudflare Worker types
```

## Architecture

### Route Structure (File-Based Routing)

TanStack Start uses file-based routing in `src/routes/`:

```
src/routes/
├── __root.tsx           # Root layout, required
├── index.tsx            # Home page (/)
├── login.tsx            # Login page (/login)
├── _authed/             # Protected routes (requires auth)
│   ├── route.tsx        # Auth layout (checks session, onboarding)
│   └── dashboard/       # Dashboard routes
├── capabilities/        # Nested routes example
│   ├── index.tsx        # /capabilities (root)
│   └── $slug/
│       ├── index.tsx    # /capabilities/:slug
│       └── $subslug.tsx # /capabilities/:slug/:subslug
└── api/                 # API routes
    └── auth/$.ts        # Better Auth handler
```

**Route protection:** Create a `_authed` folder with a `route.tsx` that uses `beforeLoad` to check session. Nested routes inherit this protection.

**IMPORTANT:** For nested dynamic routes, always use the `$segment/index.tsx` pattern for single parameters, and `$segment/$subsegment.tsx` for multiple parameters. See `docs/routing.md#nested-dynamic-routes-pattern` for details.

### Server Actions (Server Functions)

Server actions use `createServerFn` and follow the layered architecture:

```typescript
// src/actions/example.ts
import { createServerFn } from '@tanstack/react-start'
import { authMiddleware, rateLimitMiddleware } from '@/middleware/server'
import z from 'zod'
import { myDataFunction } from '@/data-layer/example'

export const myActionFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1),
    }),
  )
  .middleware([authMiddleware, rateLimitMiddleware({ max: 10, window: 60 })])
  .handler(async ({ data, context }) => {
    // context.user and context.session available from authMiddleware
    const userId = context.user.id

    // Business logic here (validation, checks, etc.)

    // Data access through data-layer (not db directly!)
    const result = await myDataFunction(data.name)

    return { success: true, result }
  })
```

**Layers:** Actions contain business logic, middleware handles auth/rate-limiting, data-layer handles DB queries. See `docs/architecture.md`.

### Database Schema (Drizzle ORM)

Schema files are in `src/db/schema/`:

```
src/db/schema/
├── index.ts             # Exports all schemas + authSchema
├── auth.ts              # Better Auth tables (user, account, session, verification)
├── capabilities.ts      # Capability, CapabilitySubtype
├── jobs.ts              # Job, Task
├── technologies.ts      # Technology
├── organizations.ts     # Organization
├── reports.ts           # ImpactReport, ReportEnrichment, ReportFlag
├── discussions.ts       # Discussion
├── suggestions.ts       # Suggestion
├── feedback.ts          # Feedback
├── notifications.ts     # Notification
├── admin.ts             # Admin tables
└── user-profile.ts      # UserProfile, UserReputation, UserBadge
```

**Database instance:** `src/db/index.ts` exports `db` using Neon HTTP with connection pooling.

**Generating migrations:** Run `bun run db:generate` after schema changes.

### Authentication (Better Auth)

Configuration in `src/lib/auth.ts`:

**Features:**

- Email/password with verification
- Google OAuth
- Username plugin (unique usernames, 3-20 chars, alphanumeric + underscore)
- Custom session plugin (adds `onboardingCompleted` and `role` to session)
- Admin/Access Control plugin (roles: observer, contributor, trusted, expert, moderator, admin)

**Session access:**

- Server: `await auth.api.getSession({ headers })` or use `authMiddleware` context
- Client: `const { session } = Route.useRouteContext()` in route components

**Permissions:** See `src/lib/permissions.ts` for role definitions and `canPerformAction` helper.

### Data Layer Pattern

Data layer functions in `src/data-layer/` contain **pure database queries only**:

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
```

**Purpose:** Separates data access from business logic. Actions use data-layer functions and add validation, auth, rate limiting. See `docs/architecture.md` for details.

### Components

UI components in `src/components/`:

- `ui/` - Base UI components (shadcn/ui style)
- Feature components (forms, layouts, etc.)

**Styling:** Tailwind CSS v4 with `@tailwindcss/vite` plugin.

## Key Patterns

### Form Implementation

Use `@tanstack/react-form` for forms:

```typescript
import { useForm } from "@tanstack/react-form"
import z from "zod"

const formSchema = z.object({
  username: z.string().min(3),
})

export function MyForm() {
  const form = useForm({
    defaultValues: { username: "" },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      await myActionFn({ data: value })
    },
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); void form.handleSubmit() }}>
      <form.Field name="username">
        {(field) => (
          <Field>
            <FieldLabel>Username</FieldLabel>
            <Input
              value={field.state.value}
              onChange={e => field.handleChange(e.target.value)}
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>
      <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button disabled={!canSubmit} type="submit">
            {isSubmitting ? <Spinner /> : "Submit"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
```

**Components:** Use `Field`, `FieldLabel`, `FieldError` from `@/components/ui/field`.

### Protected Routes

```typescript
// src/routes/_authed/route.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSessionFn } from '@/actions/session'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    const session = await getSessionFn()
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    return { session }
  },
})
```

Access session in child routes: `const { session } = Route.useRouteContext()`

### Onboarding Flow

1. User signs up → `user.onboardingCompleted = false`
2. `_authed/route.tsx` checks `session.user.onboardingCompleted`
3. If false, shows `OnboardForm` component
4. Form submits `completeOnboardingFn` action
5. On success, calls `router.invalidate()` to refresh session
6. Route now renders `<Outlet />` with authenticated content

## Environment Variables

Required in Cloudflare Workers:

- `DATABASE_URL` - Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Secret for Better Auth
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret

## Deployment

**Target:** Cloudflare Workers via `wrangler` (see `wrangler.jsonc`)

**Build:** `bun run build` creates optimized build for Cloudflare.

**Type generation:** `bun run cf-typegen` generates types for `cloudflare:workers` env.

## Documentation

Detailed guides are available in the `docs/` folder:

- **[docs/index.md](docs/index.md)** - Documentation index
- **[docs/architecture.md](docs/architecture.md)** - Layered architecture (UI → Actions → Middleware → Data)
- **[docs/forms.md](docs/forms.md)** - Complete form implementation guide
- **[docs/routing.md](docs/routing.md)** - Routing patterns and protected routes
- **[docs/database.md](docs/database.md)** - Database operations and Drizzle ORM
- **[docs/authentication.md](docs/authentication.md)** - Auth, sessions, and permissions
- **[docs/quick-reference.md](docs/quick-reference.md)** - Common patterns and snippets

## Important Notes

- **Bun only:** All package operations use `bun`, not `npm` or `yarn`
- **Path aliases:** `@/*` maps to `./src/*`, `@/drizzle/*` maps to `./drizzle/*`
- **Drizzle:** Schema changes require `bun run db:generate` then `bun run db:migrate`
- **Route generation:** Route tree auto-generated by TanStack Router plugin
- **Cloudflare env:** Access via `import { env } from 'cloudflare:workers'`
