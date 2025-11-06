# OpenModal.ai Agent Instructions

## Project Overview
This is an **AGI Progress Tracker Platform** built with:
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js Server Actions, API Routes
- **Database**: PostgreSQL (Neon serverless) with Drizzle ORM
- **Auth**: Better Auth (email/password, Google OAuth, SIWE/Web3)
- **UI**: shadcn/ui components, Radix UI primitives
- **State**: React Query (TanStack Query), React Context

## Core Principles

### 1. Code Style
- Use TypeScript strict mode for everything
- Functional components with hooks only (no class components)
- 2-space indentation, kebab-case filenames
- Named exports preferred over default exports
- Run `bun run lint` and `bun run format` before commits

### 2. Next.js App Router
- **Server Components by default** - only add `"use client"` when necessary
- Use Server Actions for mutations (`/src/actions/`)
- Fetch data directly in Server Components (async/await)
- Use API routes only for webhooks/third-party integrations
- Always call `revalidatePath()` after mutations

### 3. TypeScript
- Avoid `any` - use `unknown` if type is truly unknown
- Use Zod for runtime validation (forms, API inputs, env vars)
- Infer types from Drizzle schemas: `typeof table.$inferSelect`
- Explicit return types for exported functions

### 4. Database (Drizzle ORM)
- Schemas in `/src/db/schema/` using snake_case for tables/columns
- Use query builder with `.with()` for eager loading
- Use transactions for multi-table operations
- Always validate inputs with Zod before database operations

### 5. Components
- Keep components small and focused (< 300 lines)
- Use shadcn/ui components from `/src/components/ui/`
- Use `cn()` utility for conditional className merging
- Implement proper loading and error states

### 6. Styling
- Tailwind CSS for all styling (no custom CSS unless necessary)
- Mobile-first responsive design
- Use semantic color names: `bg-background`, `text-foreground`
- Test both light and dark modes

### 7. Authentication
- Check session server-side for protected operations
- Use `useSession()` hook in client components
- Support email/password, Google OAuth, and wallet auth (SIWE)
- Never trust client-side auth data

### 8. Forms & State
- Use TanStack React Form for complex forms
- Use React Query for server state caching
- Keep state as local as possible
- Implement optimistic updates for better UX

## File Structure

```
src/
├── app/                    # Next.js pages & routes
│   ├── (public)/          # Public route group
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── agi-dashboard/     # Feature components
│   └── shared/            # Shared utilities
├── actions/               # Server Actions
├── db/
│   ├── schema/            # Database schemas
│   └── index.ts           # DB connection
├── lib/                   # Utilities
│   ├── auth.ts            # Server auth
│   ├── auth-client.ts     # Client auth
│   └── utils.ts           # Helper functions
└── hooks/                 # Custom React hooks
```

## Common Tasks

### Adding a New Feature
1. Define database schema if needed (`/src/db/schema/`)
2. Create Server Actions for data operations (`/src/actions/`)
3. Build UI components (`/src/components/`)
4. Create page in App Router (`/src/app/`)
5. Test both light/dark modes and mobile/desktop views

### Creating a Component
```typescript
import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ComponentProps {
  title: string
  children?: ReactNode
  className?: string
}

export function Component({ title, children, className }: ComponentProps) {
  return (
    <div className={cn("base-classes", className)}>
      <h2>{title}</h2>
      {children}
    </div>
  )
}
```

### Creating a Server Action
```typescript
"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function myAction(input: unknown) {
  // 1. Validate auth
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: "Unauthorized" }

  try {
    // 2. Validate input
    const validated = mySchema.parse(input)

    // 3. Database operation
    const result = await db.insert(table).values(validated).returning()

    // 4. Revalidate
    revalidatePath("/path")

    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: "Operation failed" }
  }
}
```

### Database Query with Relations
```typescript
import { db } from "@/db"
import { capability } from "@/db/schema"
import { eq } from "drizzle-orm"

const result = await db.query.capability.findFirst({
  where: eq(capability.slug, slug),
  with: {
    category: true,
    bottlenecks: true,
    predictions: {
      where: eq(capabilityPrediction.userId, userId),
    },
  },
})
```

## Best Practices

### DO ✅
- Validate all inputs with Zod schemas
- Use Server Components for data fetching
- Implement proper error handling with try-catch
- Show loading states for async operations
- Use semantic HTML and ARIA labels
- Test keyboard navigation and screen readers
- Keep components focused and composable
- Document complex logic with JSDoc
- Use TypeScript strict mode

### DON'T ❌
- Don't use `any` type
- Don't use class components
- Don't fetch data in Client Components (use React Query or Server Components)
- Don't commit secrets or `.env` files
- Don't create custom CSS unless Tailwind is insufficient
- Don't skip error handling
- Don't forget to revalidate after mutations
- Don't trust client-side data for authorization

## Environment Variables
Required variables (see `.env.example`):
- `DATABASE_URL` - Neon PostgreSQL connection
- `BETTER_AUTH_SECRET` - Auth encryption secret (32+ chars)
- `BETTER_AUTH_URL` - Application base URL
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `RESEND_API_KEY` - Email service
- `POSTHOG_KEY`, `POSTHOG_HOST` - Analytics (optional)

## Development Commands
```bash
bun run dev          # Start dev server
bun run build        # Build for production
bun run lint         # Run Biome linter
bun run format       # Format code with Biome
bun run db:generate  # Generate DB migrations
bun run db:migrate   # Run migrations
bun run db:studio    # Open Drizzle Studio
bun run db:push      # Push schema changes
```

## Domain Knowledge

### Core Entities
- **Capability**: AI capabilities with progress tracking
- **Category**: Capability categories (language models, computer vision, etc.)
- **Bottleneck**: Development obstacles (hardware, software, data, theory)
- **Prediction**: User predictions for capability achievement dates
- **Organization**: Companies/entities working on capabilities
- **Comment**: Community discussions with voting

### Key Features
- Track AI capability development progress
- Community predictions with confidence levels
- Bottleneck identification and severity assessment
- Job impact analysis (protected jobs affected)
- Research activity monitoring
- Comment threads with upvoting
- Web3 wallet authentication with ENS support

## Getting Help
- Next.js: https://nextjs.org/docs
- Drizzle ORM: https://orm.drizzle.team
- shadcn/ui: https://ui.shadcn.com
- Better Auth: https://better-auth.com
- Tailwind CSS: https://tailwindcss.com/docs

---

For detailed rules on specific areas, see the `.cursor/rules/` directory:
- `code-style.mdc` - Formatting and naming conventions
- `typescript.mdc` - Type safety guidelines
- `nextjs-patterns.mdc` - Next.js App Router patterns
- `react-components.mdc` - React component best practices
- `database.mdc` - Drizzle ORM and PostgreSQL
- `styling.mdc` - Tailwind CSS and theming
- `auth.mdc` - Authentication patterns
