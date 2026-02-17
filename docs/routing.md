# Routing Guide

This guide covers TanStack Start's file-based routing system used in OpenModal.

## Route Structure

Routes are defined as files in `src/routes/` using the TanStack Router file-based routing convention:

```
src/routes/
├── __root.tsx              # Root layout (required)
├── index.tsx               # Home page (/)
├── login.tsx               # Login page (/login)
├── signup.tsx              # Signup page (/signup)
├── about.tsx               # About page (/about)
├── _authed/                # Protected route group
│   ├── route.tsx           # Layout for authed routes
│   ├── dashboard/          # Dashboard routes
│   │   └── index.tsx       # /dashboard
│   └── settings/
│       └── index.tsx       # /settings
└── api/                    # API routes
    └── auth/
        └── $.ts            # /api/auth/* (catch-all)
```

## Route File Conventions

| File/Folder                       | Route                          | Description                           |
| --------------------------------- | ------------------------------ | ------------------------------------- |
| `__root.tsx`                      | `/`                            | Root layout, wraps all routes         |
| `index.tsx`                       | `/`                            | Index/home page                       |
| `about.tsx`                       | `/about`                       | Simple route                          |
| `_authed/route.tsx`               | `/dashboard/*`                 | Route group layout                    |
| `_authed/dashboard/index.tsx`     | `/dashboard`                   | Nested index                          |
| `api/$.ts`                        | `/api/*`                       | Catch-all route                       |
| `capabilities/index.tsx`          | `/capabilities`                | Root path for nested routes           |
| `capabilities/$slug/index.tsx`    | `/capabilities/:slug`          | Single dynamic path (use index.tsx)   |
| `capabilities/$slug/$subslug.tsx` | `/capabilities/:slug/:subslug` | Multiple dynamic paths (nested files) |

## Nested Dynamic Routes Pattern

**IMPORTANT:** When creating nested routes with dynamic parameters, follow this pattern:

### Single Dynamic Segment

For a route like `/capabilities/:slug`, create a folder with an `index.tsx` file:

```
src/routes/capabilities/
├── index.tsx          # /capabilities (root path)
└── $slug/
    └── index.tsx      # /capabilities/:slug (single dynamic)
```

**DO NOT** create `capabilities/$slug.tsx` when you plan to have nested routes. This prevents extending the route tree.

### Multiple Dynamic Segments

For routes like `/capabilities/:slug/:subslug`, use nested folders with the next segment as a file:

```
src/routes/capabilities/
├── index.tsx          # /capabilities (root path)
└── $slug/
    ├── index.tsx      # /capabilities/:slug (single dynamic)
    └── $subslug.tsx   # /capabilities/:slug/:subslug (multiple dynamic)
```

### Example Implementation

```typescript
// src/routes/capabilities/$slug/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/capabilities/$slug/')({
  component: CapabilityPage,
})

function CapabilityPage() {
  const { slug } = Route.useParams()
  return <div>Capability: {slug}</div>
}
```

```typescript
// src/routes/capabilities/$slug/$subslug.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/capabilities/$slug/$subslug')({
  component: CapabilitySubtypePage,
})

function CapabilitySubtypePage() {
  const { slug, subslug } = Route.useParams()
  return <div>Capability: {slug} / Subtype: {subslug}</div>
}
```

### Why This Pattern Matters

1. **Extensibility:** Using `$slug/index.tsx` allows adding more nested routes later without file moves
2. **Clarity:** Separates the single-parameter route from multi-parameter routes
3. **Consistency:** Follows TanStack Router's recommended pattern for nested routes
4. **Avoids Issues:** Creating `$slug.tsx` prevents adding `$slug/$subslug.tsx` later

### Extending Further

If you need more nesting (e.g., `/capabilities/:slug/:subslug/:id`), the structure extends naturally:

```
src/routes/capabilities/
├── index.tsx
└── $slug/
    ├── index.tsx
    └── $subslug/
        ├── index.tsx      # /capabilities/:slug/:subslug
        └── $id.tsx        # /capabilities/:slug/:subslug/:id
```

## Creating Routes

### Basic Route

```typescript
// src/routes/about.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return <div>About page content</div>
}
```

### Route with Meta (SEO)

```typescript
export const Route = createFileRoute('/about')({
  component: AboutPage,
  meta: () => ({
    title: 'About OpenModal',
    description: 'Learn about our mission',
  }),
})
```

### Route with Data Loading

```typescript
export const Route = createFileRoute('/users/$userId')({
  loader: async ({ params }) => {
    const user = await getUserFn({ data: { id: params.userId } })
    return { user }
  },
  component: UserPage,
})

function UserPage() {
  const { user } = Route.useLoaderData()
  return <div>{user.name}</div>
}
```

## Protected Routes

### Route Group Layout Pattern

Create a `_authed` folder with a `route.tsx` that handles authentication:

```typescript
// src/routes/_authed/route.tsx
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSessionFn } from '@/actions/session'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    const session = await getSessionFn()

    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }

    return { session }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { session } = Route.useRouteContext()

  // Check onboarding
  if (!session.user.onboardingCompleted) {
    return <OnboardForm name={session.user.name} />
  }

  return <Outlet />
}
```

### Accessing Session in Child Routes

```typescript
// src/routes/_authed/dashboard/index.tsx
export const Route = createFileRoute('/_authed/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { session } = Route.useRouteContext()
  return <div>Welcome, {session.user.name}</div>
}
```

## Route Context

### Providing Context in Layout

```typescript
export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const session = await getSessionFn()
    return { session, user: session?.user }
  },
})
```

### Consuming Context

```typescript
function MyComponent() {
  const { session, user } = Route.useRouteContext()
  // ...
}
```

## Route Parameters

### Path Parameters

```typescript
// src/routes/users/$userId.tsx
export const Route = createFileRoute('/users/$userId')({
  component: UserPage,
})

function UserPage() {
  const { userId } = Route.useParams()
  return <div>User ID: {userId}</div>
}
```

### Nested Path Parameters

When using nested dynamic segments, destructure all required params:

```typescript
// src/routes/capabilities/$slug/$subslug.tsx
export const Route = createFileRoute('/capabilities/$slug/$subslug')({
  component: CapabilitySubtypePage,
})

function CapabilitySubtypePage() {
  const { slug, subslug } = Route.useParams()
  // slug = parent capability
  // subslug = child subtype
  return <div>{slug} / {subslug}</div>
}
```

**IMPORTANT:** Always destructure all dynamic segments from `Route.useParams()`. Missing a parameter will cause TypeScript errors and runtime issues.

### Query Parameters

```typescript
function MyComponent() {
  const search = Route.useSearch()
  // search.tab, search.page, etc.
  return <div>Tab: {search.tab}</div>
}
```

### Navigate with Parameters

```typescript
import { useRouter } from '@tanstack/react-router'

const router = useRouter()

// Navigate with params
await router.navigate({ to: '/users/$userId', params: { userId: '123' } })

// Navigate with search
await router.navigate({ to: '/users', search: { page: 2, tab: 'active' } })
```

## Redirects

### In beforeLoad

```typescript
export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    const session = await getSessionFn()
    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
})
```

### Programmatic Redirect

```typescript
import { redirect } from '@tanstack/react-router'

// In an action or handler
throw redirect({ to: '/dashboard' })
```

## Link Navigation

### Using Link Component

```typescript
import { Link } from '@tanstack/react-router'

<Link to="/about">About</Link>
<Link to="/users/$userId" params={{ userId: '123' }}>User</Link>
```

### Using useRouter

```typescript
import { useRouter } from '@tanstack/react-router'

const router = useRouter()

<button onClick={() => router.navigate({ to: '/about' })}>
  Go to About
</button>
```

## Route Invalidation

After data mutations, invalidate routes to refresh data:

```typescript
const router = useRouter()

await router.invalidate() // Invalidate all routes
await router.invalidate({ route: '/_authed/dashboard' }) // Specific route
```

## Error Handling

### Error Boundary

```typescript
export const Route = createFileRoute('/about')({
  component: AboutPage,
  errorComponent: ({ error }) => (
    <div>Error: {error.message}</div>
  ),
})
```

### Pending State

```typescript
export const Route = createFileRoute('/users/$userId')({
  loader: async ({ params }) => getUserFn({ data: { id: params.userId } }),
  pendingComponent: () => <Spinner />,
  component: UserPage,
})
```

## Common Patterns

### Authenticated Page with Data

```typescript
export const Route = createFileRoute('/_authed/settings')({
  beforeLoad: async () => {
    const session = await getSessionFn()
    if (!session) throw redirect({ to: '/login' })
    return { session }
  },
  loader: async () => {
    return getSettingsFn()
  },
  component: SettingsPage,
})

function SettingsPage() {
  const { session } = Route.useRouteContext()
  const settings = Route.useLoaderData()
  // ...
}
```

### Modal/Dialog Routes

```typescript
// src/routes/_authed/dashboard/index.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <>
      <DashboardContent />
      <Outlet /> {/* Renders modal routes */}
    </>
  )
}
```

## Tips

1. **Use route groups** (`_folderName`) for layouts without path segments
2. **Always redirect with search params** when redirecting unauthenticated users
3. **Use `router.invalidate()`** after mutations to refresh stale data
4. **Keep `beforeLoad` lightweight** - move heavy logic to loaders
5. **Use `Route.useRouteContext()`** for data passed from parent routes
