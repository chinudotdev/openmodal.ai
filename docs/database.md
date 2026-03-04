# Database & Data Layer Guide

This guide covers the data layer pattern and database operations using Drizzle ORM.

## Architecture Pattern

In OpenModal, all database access goes through the **data layer** (`src/data-layer/`), which contains pure data access functions. Actions then use these functions to implement business logic.

```
┌─────────────────┐
│   UI Layer      │  (Routes, Components)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Actions       │  (Business logic, validation, auth)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Data Layer     │  (Pure database queries - THIS GUIDE)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │  (PostgreSQL on Neon)
└─────────────────┘
```

See [architecture.md](architecture.md) for the full architecture overview.

## Data Layer Principles

### DO:

- Pure database queries only
- Return raw data from database
- Use Drizzle ORM for type safety
- Organize by domain entity

### DO NOT:

- Implement business logic
- Check permissions (done in actions/middleware)
- Validate business rules (done in actions)
- Send emails or notifications (done in actions)
- Cache (done in actions)

## Setup

### Database Connection

```typescript
// src/db/index.ts
import { neon } from '@neondatabase/serverless'

import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/neon-http'

const sql = neon(env.DATABASE_URL)
export const db =  drizzle(sql)
```

### Usage in Data Layer

```typescript
import { db } from '@/db'
import { user } from '@/db/schema'
```

## Schema Definition

Schemas are defined in `src/db/schema/`:

```typescript
// src/db/schema/users.ts
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  username: text('username').unique(),
  role: text('role').default('observer'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').$onUpdateFn(() => new Date()),
})

export const userReputation = pgTable('user_reputation', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => user.id)
    .unique(),
  score: integer('score').default(0),
  tier: text('tier').default('observer'),
  updatedAt: timestamp('updated_at').$onUpdateFn(() => new Date()),
})
```

## Data Layer Functions

### File Organization

Organize data-layer files by domain entity:

```
src/data-layer/
├── users.ts          # User queries
├── reports.ts        # Report queries
├── capabilities.ts   # Capability queries
├── technologies.ts   # Technology queries
├── jobs.ts           # Job queries
├── discussions.ts    # Discussion queries
├── suggestions.ts    # Suggestion queries
└── feedback.ts       # Feedback queries
```

### Basic CRUD

```typescript
// src/data-layer/users.ts
import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { user } from '@/db/schema'

// Create
export async function createUser(data: {
  name: string
  email: string
  username?: string
}) {
  const [newUser] = await db.insert(user).values(data).returning()

  return newUser
}

// Read by ID
export async function getUserById(userId: string) {
  const [result] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  return result || null
}

// Read by field
export async function getUserByEmail(email: string) {
  const [result] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1)

  return result || null
}

// Update
export async function updateUser(
  userId: string,
  data: Partial<{
    name: string
    username: string
    onboardingCompleted: boolean
  }>,
) {
  const [updated] = await db
    .update(user)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(user.id, userId))
    .returning()

  return updated
}

// Delete
export async function deleteUser(userId: string) {
  await db.delete(user).where(eq(user.id, userId))
}
```

### List with Pagination

```typescript
// src/data-layer/reports.ts
import { and, desc } from 'drizzle-orm'

import { db } from '@/db'
import { report } from '@/db/schema'

export async function getReports(options: {
  limit: number
  offset: number
  userId?: string
  status?: string
}) {
  let query = db.select().from(report)

  const conditions = []

  if (options.userId) {
    conditions.push(eq(report.userId, options.userId))
  }

  if (options.status) {
    conditions.push(eq(report.status, options.status))
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions))
  }

  return query
    .orderBy(desc(report.createdAt))
    .limit(options.limit)
    .offset(options.offset)
}
```

### Joins

```typescript
// src/data-layer/reports.ts
import { eq } from 'drizzle-orm'

import { report, reportEnrichment, user } from '@/db/schema'

export async function getReportWithUser(reportId: string) {
  const [result] = await db
    .select({
      report,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
      },
    })
    .from(report)
    .innerJoin(user, eq(report.userId, user.id))
    .where(eq(report.id, reportId))
    .limit(1)

  return result || null
}

export async function getReportWithEnrichments(reportId: string) {
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

### Aggregation

```typescript
// src/data-layer/users.ts
import { count, eq, sql } from 'drizzle-orm'

import { db } from '@/db'
import { report, user } from '@/db/schema'

export async function getUserReportCount(userId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(report)
    .where(eq(report.userId, userId))

  return result?.count || 0
}

export async function getUserStats(userId: string) {
  const [result] = await db
    .select({
      totalReports: count(),
      avgUpvotes: sql<number>`coalesce(avg(${report.upvotes}), 0)`,
    })
    .from(report)
    .where(eq(report.userId, userId))

  return {
    totalReports: result?.totalReports || 0,
    avgUpvotes: result?.avgUpvotes || 0,
  }
}
```

### Transactions

```typescript
// src/data-layer/users.ts
export async function createUserWithProfile(data: {
  name: string
  email: string
  bio: string
}) {
  return await db.transaction(async (tx) => {
    const [newUser] = await tx
      .insert(user)
      .values({ name: data.name, email: data.email })
      .returning()

    await tx.insert(userProfile).values({ userId: newUser.id, bio: data.bio })

    return newUser
  })
}
```

## Using Data Layer in Actions

Actions use data-layer functions and add business logic:

```typescript
// src/actions/reports.ts
import { createServerFn } from '@tanstack/react-start'

import { z } from 'zod'

import { createReport, getRecentReportByUser } from '@/data-layer/reports'
import { authMiddleware } from '@/middleware/server'

export const submitReportFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      jobTitle: z.string().min(3),
      description: z.string().min(100),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context.user.id

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
    })

    return { success: true, report }
  })
```

## Migrations

### Generate Migration

After changing schema, generate a migration:

```bash
bun run db:generate
```

### Run Migrations

```bash
bun run db:migrate
```

### Push Schema (Dev Only)

For development, push schema directly without migration:

```bash
bun run db:push
```

## Drizzle Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

## Common Drizzle Operators

```typescript
import {
  and,
  asc, // Ordering
  count,
  desc,
  eq,
  ilike, // Pattern matching
  inArray, // IN clause
  isNotNull, // NULL checks
  isNull,
  like,
  or, // Equality / Logic
  sql, // Aggregation
} from 'drizzle-orm'
```

## Tips

1. **Data layer is pure** - No business logic, just queries
2. **Return null for not found** - Use `|| null` pattern
3. **Use transactions** - For multi-step operations
4. **Leverage Drizzle query builder** - Instead of raw SQL
5. **Keep functions focused** - One query per function when possible
