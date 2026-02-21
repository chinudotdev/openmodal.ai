# Architecture Guide

This document covers OpenModal's layered architecture pattern.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         UI Layer                                │
│  (Routes, Components - TanStack Start, React)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Actions Layer                               │
│  (Business Logic, Validation, Rate Limiting, Caching)           │
│  src/actions/*.ts                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Middleware Layer                              │
│  (Auth, Rate Limiting - injected before actions)                │
│  src/middleware/*.ts                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Data Layer                                     │
│  (Database Queries - pure data access)                          │
│  src/data-layer/*.ts                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                         │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. UI Layer (Routes & Components)

**Location:** `src/routes/`, `src/components/`

**Responsibilities:**

- Render UI
- Handle user interactions
- Call actions
- Display data
- Navigation

**DO NOT:**

- Access database directly
- Implement business logic
- Validate business rules

**Example:**

```typescript
// src/routes/_authed/dashboard/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { getDashboardDataFn } from '@/actions/dashboard'

export const Route = createFileRoute('/_authed/dashboard/')({
  loader: async () => getDashboardDataFn(),
  component: DashboardPage,
})

function DashboardPage() {
  const data = Route.useLoaderData()
  return <DashboardContent data={data} />
}
```

### 2. Actions Layer

**Location:** `src/actions/`

**Responsibilities:**

- Business logic
- Input validation (Zod schemas)
- Authorization (via middleware)
- Rate limiting (via middleware)
- Caching
- Error handling
- Orchestrate multiple data-layer calls
- Transform data for UI

**DO NOT:**

- Access database directly (use data-layer)

**Example:**

```typescript
// src/actions/reports.ts
import { createServerFn } from '@tanstack/react-start'

import { z } from 'zod'

import { createReport, getReportById } from '@/data-layer/reports'
import { getUserReputation } from '@/data-layer/users'
import { authMiddleware, rateLimitMiddleware } from '@/middleware/server'

export const submitReportFn = createServerFn({ method: 'POST' })
  // Validation
  .inputValidator(
    z.object({
      jobTitle: z.string().min(3, 'Job title is required'),
      description: z
        .string()
        .min(100, 'Description must be at least 100 characters'),
      impactType: z.enum([
        'layoffs',
        'reduced_hours',
        'role_change',
        'new_tools',
        'productivity_boost',
        'no_change',
      ]),
    }),
  )
  // Middleware (auth + rate limit)
  .middleware([authMiddleware, rateLimitMiddleware({ max: 5, window: 60 })])
  // Handler (business logic)
  .handler(async ({ data, context }) => {
    const userId = context.user.id

    // Business rule: Check if user has sufficient reputation
    const reputation = await getUserReputation(userId)
    if (reputation.score < 0) {
      return {
        success: false,
        error: 'Insufficient reputation to submit reports',
      }
    }

    // Business logic: Check for recent duplicates
    const recentReport = await getRecentReportByUser(userId, data.jobTitle)
    if (recentReport && isWithinTimeWindow(recentReport.createdAt, 24)) {
      return {
        success: false,
        error: 'You recently submitted a similar report',
      }
    }

    // Data access through data-layer
    const report = await createReport({
      userId,
      jobTitle: data.jobTitle,
      description: data.description,
      impactType: data.impactType,
    })

    // Business logic: Award reputation points
    await updateUserReputation(userId, reputation.score + 15)

    return { success: true, report }
  })
```

### 3. Middleware Layer

**Location:** `src/middleware/`

**Responsibilities:**

- Authentication (attach user/session to context)
- Rate limiting
- Request logging
- Common cross-cutting concerns

**Example:**

```typescript
// src/middleware/server.ts
import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from '@/lib/auth'

// Auth middleware - ensures user is authenticated
export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session) {
      throw new Error('Unauthorized')
    }

    return next({
      context: {
        user: session.user,
        session: session.session,
      },
    })
  },
)

// Optional auth - attaches user if available, doesn't throw
export const optionalAuthMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  return next({
    context: {
      user: session?.user,
      session: session?.session,
    },
  })
})

// Rate limiting middleware
export const rateLimitMiddleware = (options: {
  max: number
  window: number
}) => {
  return createMiddleware({ type: 'function' }).server(
    async ({ next, context }) => {
      const userId = context.user?.id

      if (!userId) {
        return next() // Skip rate limiting for unauthenticated
      }

      const key = `ratelimit:${userId}`
      const count = await getRedis(key)

      if (count >= options.max) {
        throw new Error('Rate limit exceeded')
      }

      await incrementRedis(key, options.window)

      return next()
    },
  )
}

// Role-based middleware
export const requireRoleMiddleware = (allowedRoles: string[]) => {
  return createMiddleware({ type: 'function' }).server(
    async ({ next, context }) => {
      const userRole = context.user?.role

      if (!userRole || !allowedRoles.includes(userRole)) {
        throw new Error('Forbidden')
      }

      return next()
    },
  )
}
```

### 4. Data Layer

**Location:** `src/data-layer/`

**Responsibilities:**

- Database queries ONLY
- Pure data access functions
- No business logic
- No validation (beyond basic schema constraints)
- Returns raw data

**DO NOT:**

- Implement business rules
- Check permissions
- Send emails
- Cache (caching is in actions layer)

**Example:**

```typescript
// src/data-layer/reports.ts
import { and, desc, eq } from 'drizzle-orm'

import { db } from '@/db'
import { report, reportEnrichment } from '@/db/schema'

export async function createReport(data: {
  userId: string
  jobTitle: string
  description: string
  impactType: string
}) {
  const [newReport] = await db
    .insert(report)
    .values({
      userId: data.userId,
      jobTitle: data.jobTitle,
      description: data.description,
      impactType: data.impactType,
    })
    .returning()

  return newReport
}

export async function getReportById(reportId: string) {
  const [result] = await db
    .select()
    .from(report)
    .where(eq(report.id, reportId))
    .limit(1)

  return result || null
}

export async function getRecentReportByUser(userId: string, jobTitle: string) {
  const [result] = await db
    .select()
    .from(report)
    .where(and(eq(report.userId, userId), eq(report.jobTitle, jobTitle)))
    .orderBy(desc(report.createdAt))
    .limit(1)

  return result || null
}

export async function getReportsWithEnrichments(reportId: string) {
  return db
    .select({
      report,
      enrichments: reportEnrichment,
    })
    .from(report)
    .leftJoin(reportEnrichment, eq(report.id, reportEnrichment.reportId))
    .where(eq(report.id, reportId))
}
```

## Data Layer File Organization

Organize data-layer files by domain entity:

```
src/data-layer/
├── users.ts          # User queries
├── reports.ts        # Report queries
├── enrichments.ts    # Report enrichment queries
├── capabilities.ts   # Capability queries
├── technologies.ts   # Technology queries
├── jobs.ts           # Job queries
├── organizations.ts  # Organization queries
├── discussions.ts    # Discussion queries
├── suggestions.ts    # Suggestion queries
├── feedback.ts       # Feedback queries
├── notifications.ts  # Notification queries
├── reputation.ts     # Reputation/badge queries
└── onboarding.ts     # Onboarding status queries
```

## Action File Organization

Organize actions by feature/use case:

```
src/actions/
├── session.ts        # Session management
├── auth.ts           # Login, signup, logout
├── onboarding.ts     # Onboarding flow
├── reports.ts        # Report CRUD
├── enrichments.ts    # Enrichment actions
├── discussions.ts    # Discussion actions
├── suggestions.ts    # Suggestion actions
├── feedback.ts       # Feedback actions
├── notifications.ts  # Notification actions
└── admin.ts          # Admin-only actions
```

## Middleware File Organization

```
src/middleware/
├── server.ts         # All middleware exports
└── rate-limit.ts     # Rate limiting implementation
```

## Common Patterns

### Public Action (No Auth)

```typescript
export const getPublicDataFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    return getPublicData(data.id)
  })
```

### Protected Action (Auth Required)

```typescript
export const getMyDataFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return getUserData(context.user.id)
  })
```

### Rate-Limited Action

```typescript
export const submitReportFn = createServerFn({ method: 'POST' })
  .inputValidator(validationSchema)
  .middleware([authMiddleware, rateLimitMiddleware({ max: 5, window: 60 })])
  .handler(async ({ data, context }) => {
    // Business logic here
  })
```

### Role-Restricted Action

```typescript
export const adminActionFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware, requireRoleMiddleware(['admin', 'moderator'])])
  .handler(async ({ context }) => {
    // Admin-only logic
  })
```

### Cached Action

```typescript
export const getPopularReportsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    return await cache('popular-reports', 300, async () => {
      return getPopularReportsFromDB()
    })
  },
)
```

## Data Access Patterns

### Single Record

```typescript
// data-layer
export async function getUserById(userId: string) {
  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1)

  return user || null
}
```

### List with Pagination

```typescript
// data-layer
export async function getReports(options: {
  limit: number
  offset: number
  userId?: string
}) {
  let query = db.select().from(report)

  if (options.userId) {
    query = query.where(eq(report.userId, options.userId))
  }

  return query
    .orderBy(desc(report.createdAt))
    .limit(options.limit)
    .offset(options.offset)
}
```

### Aggregation

```typescript
// data-layer
export async function getUserReputation(userId: string) {
  const [result] = await db
    .select({
      score: userReputation.score,
      tier: userReputation.tier,
    })
    .from(userReputation)
    .where(eq(userReputation.userId, userId))
    .limit(1)

  return result || { score: 0, tier: 'observer' }
}
```

## Testing Strategy

| Layer      | Test Type       | Focus                      |
| ---------- | --------------- | -------------------------- |
| UI         | Integration/E2E | User flows, interactions   |
| Actions    | Unit            | Business logic, validation |
| Data Layer | Unit            | Query correctness          |
| Middleware | Unit            | Auth, rate limiting        |

## Benefits of This Architecture

1. **Separation of Concerns** - Each layer has a single responsibility
2. **Testability** - Each layer can be tested independently
3. **Reusability** - Data-layer functions can be reused across actions
4. **Maintainability** - Business logic is centralized in actions
5. **Scalability** - Easy to add caching, rate limiting, etc. at the action layer
