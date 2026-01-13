# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `bun run dev` - Start development server on http://localhost:3000
- `bun install` - Install dependencies

### Build & Lint
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run Biome linter
- `bun run lint:fix` - Run Biome linter and auto-fix issues
- `bun run format` - Format code with Biome

### Database (Drizzle ORM)
- `bun run db:push` - Push schema changes to database (use for development)
- `bun run db:generate` - Generate migration files
- `bun run db:migrate` - Run migrations (use for production)
- `bun run db:studio` - Open Drizzle Studio for database management

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 16.1 with App Router
- **Database**: PostgreSQL via Neon serverless driver
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth with custom session, username plugin, and admin plugin
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Email**: Resend with React Email components
- **Analytics**: PostHog

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, signup, verify-email, forgot-password)
│   ├── (public)/          # Public-facing pages
│   │   ├── capabilities/  # AI capabilities tracking
│   │   └── jobs/          # Job automation analysis
│   ├── admin/             # Admin dashboard (content, users, moderation, analytics, reports)
│   ├── dashboard/         # User dashboard (badges, streaks, expert application)
│   ├── moderation/        # Moderation interface (pending, flagged, disputed)
│   └── api/               # API routes
├── actions/               # Server actions (data mutations and queries)
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── shared/           # Shared components
│   └── [feature]/        # Feature-specific components
├── db/                    # Database layer
│   └── schema/           # Drizzle schema definitions
├── lib/                   # Utilities and configurations
│   ├── auth.ts           # Better Auth configuration
│   ├── permissions.ts    # Role-based access control
│   └── validations/      # Zod validation schemas
├── hooks/                 # React hooks
└── emails/                # React Email templates
```

### Authentication & Authorization

**Better Auth Setup** (`src/lib/auth.ts`):
- Email/password authentication with required email verification
- Google OAuth integration
- Custom session plugin that attaches onboarding status and role to session
- Username plugin with alphanumeric + underscore validation
- Admin plugin with role-based access control

**Role-Based Permissions** (`src/lib/permissions.ts`):
- **Observer** (0-199 reputation): Create reports, verify, comment
- **Contributor** (200-999 reputation): Edit own reports and comments
- **Trusted** (1000-4999 reputation): Delete own unverified reports
- **Expert** (5000+ reputation): Moderate reports and verifications
- **Moderator**: Special admin-assigned role with full moderation powers
- **Admin**: Full control over all resources

Roles are automatically assigned based on reputation tiers. Check permissions using the `canPerformAction()` helper.

### Database Schema

Core schemas in `src/db/schema/`:
- **auth.ts**: Better Auth tables (user, session, verification, account)
- **capabilities.ts**: AI capabilities, predictions, comments, tracking, bottlenecks, organizations
- **jobs.ts**: Jobs, tasks, comments
- **industries.ts**: Industries and job relationships
- **reports.ts**: User-submitted reports and verification system
- **comments.ts**: Generic comment system
- **notifications.ts**: User notifications
- **onboarding.ts**: Onboarding flow tracking
- **admin.ts**: Admin settings, expert applications, moderation logs
- **user-profile.ts**: User profiles, reputation, badges, streaks

Database connection uses Neon's serverless HTTP driver for better performance and connection pooling.

### Server Actions Pattern

All server actions are in `src/actions/` and follow this pattern:
- Use `"use server"` directive
- Import from Drizzle schema, not circular schema/index
- Validate inputs with Zod schemas from `src/lib/validations/`
- Check authentication and permissions using session utilities
- Use `"use cache"` with `cacheLife()` for read operations where appropriate
- Return structured data or throw errors

Example categories:
- `capabilities.ts` - Capability CRUD and querying
- `jobs.ts` - Job CRUD and querying
- `votes.ts` - Voting system
- `comments.ts` - Comment system
- `admin-*.ts` - Admin operations
- `moderation.ts` - Moderation workflows

### Component Organization

**Route Components**: Pages in `src/app/` should be lean and compose feature components from `_components/` folders.

**Shared Components** (`src/components/shared/`):
- Status badges, progress bars, automation indicators
- Reusable across capabilities and jobs

**UI Components** (`src/components/ui/`):
- shadcn/ui components
- Built on Radix UI primitives

### Validation

All user input validation uses Zod schemas in `src/lib/validations/`:
- `comments.ts` - Comment creation/editing
- `onboarding.ts` - Onboarding flow
- `reports.ts` - Report submission
- `verifications.ts` - Report verification
- `votes.ts` - Voting system
- `moderation.ts` - Moderation actions

### Email System

Email templates in `src/emails/` using React Email:
- `email-verification.tsx`
- `comment-reply.tsx`
- `report-status.tsx`
- `report-verified.tsx`
- `reputation-milestone.tsx`

Send emails via `src/lib/email.ts` using Resend.

### Key Features

**Gamification System**:
- Reputation points and tiers
- Badges and achievements
- Streak tracking
- Leaderboards

**Report & Verification System**:
- Users submit reports about AI capabilities or job automation
- Reports require verification from multiple users
- Moderation workflow: pending → approved/rejected/needs_changes
- Expert and moderator roles can moderate reports
- Full audit logging for all moderation actions (tracked in `moderation_audit_log` table)

**Onboarding Flow**:
- Multi-step onboarding for new users
- Tracked in `onboarding` table
- Custom session plugin attaches completion status

### Route Protection

**Proxy (Next.js 16 Middleware)**:
- `src/proxy.ts` - Protects routes before pages render
- `/moderation/*` routes require moderator/expert/admin roles
- `/admin/*` routes require admin role only
- Unauthenticated users redirected to `/login`
- Unauthorized users redirected to `/403`

### Caching Strategy

Next.js 16 cache tags:
- Use `"use cache"` directive for cacheable server functions
- Configure with `cacheLife()` for stale/revalidate times
- Capabilities and jobs are heavily cached (1 hour stale, 24 hour revalidate)

### Environment Variables

Required environment variables:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Better Auth secret key
- `BETTER_AUTH_URL` - Auth callback URL
- `GOOGLE_CLIENT_ID` - Google OAuth
- `GOOGLE_CLIENT_SECRET` - Google OAuth
- `RESEND_API_KEY` - Email service
- `NEXT_PUBLIC_POSTHOG_KEY` - Analytics
- `NEXT_PUBLIC_POSTHOG_HOST` - Analytics host

## Development Notes

### Adding New Features

1. **New database tables**: Add schema in `src/db/schema/`, export from `index.ts`, run `bun run db:generate`
2. **New server actions**: Create in `src/actions/`, validate with Zod, check permissions
3. **New pages**: Add to `src/app/` with route groups for auth/admin/public
4. **New components**: Place in feature `_components/` or `src/components/shared/`

### Code Style

- Use Biome for linting and formatting (configured in `biome.json`)
- TypeScript strict mode enabled
- Prefer server components by default
- Use `"use client"` only when needed (hooks, interactivity, browser APIs)
- Server actions should handle all data mutations

### Database Migrations

For development, use `bun run db:push` to sync schema directly.

For production:
1. `bun run db:generate` to create migration files
2. Review generated SQL in `drizzle/` directory
3. `bun run db:migrate` to apply migrations

### Testing Changes

- Check linting: `bun run lint`
- Build locally: `bun run build`
- Test in dev mode: `bun run dev`
- Use Drizzle Studio to inspect database: `bun run db:studio`
