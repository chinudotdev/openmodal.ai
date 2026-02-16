# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenModal is a community-driven platform tracking AI's real-world impact on jobs and capabilities. The platform's unique value comes from crowdsourced data: Impact Reports and Discussions that AI cannot replicate.

## Commands

```bash
# Development
bun run dev          # Start development server (localhost:3000)
bun run build        # Production build
bun run start        # Start production server

# Code Quality
bun run lint         # Run Biome linter
bun run lint:fix     # Fix linting issues
bun run format       # Format code with Biome

# Database
bun run db:push      # Push schema changes to database
bun run db:generate  # Generate migrations
bun run db:migrate   # Run migrations
bun run db:studio    # Open Drizzle Studio
```

## Tech Stack

- **Framework**: Next.js 16.1 (App Router)
- **Database**: Postgres (Neon) with Drizzle ORM
- **Auth**: Better Auth with role-based permissions
- **Forms**: TanStack Form
- **State**: TanStack Query
- **UI**: shadcn/ui + Tailwind CSS 4
- **Linting**: Biome (2-space indent)

## Architecture

### Entity Model (per Restructure.md)

The platform has 6 core entities with specific ownership rules:

| Entity | Created By | Approval Required |
|--------|------------|-------------------|
| Organization | Admin only | — |
| Technology | Users | ✅ Pre-moderation |
| Capability | Admin only | — |
| Job | Admin only | — |
| Impact Report | Users | ✅ Pre-moderation |
| Discussion | Users | Post-moderation |

**Suggestions**: Users can suggest new Jobs, Capabilities, or Organizations for admin review.

### Database Schema (`src/db/schema/`)

Key tables and their relationships:
- `organization` → `technology` (1:N)
- `technology` ↔ `capability` (N:N via `technology_capability`)
- `technology` ↔ `job` (N:N via `technology_job`)
- `capability` ↔ `job` (N:N via `job_capability`)
- `impact_report` → `technology`, `job` (links real-world evidence)
- `discussion` → any entity (polymorphic via `entity_type` + `entity_id`)

### User Roles & Permissions (`src/lib/permissions.ts`)

| Role | Points | Key Abilities |
|------|--------|---------------|
| Observer | 0-199 | View, discuss, create reports |
| Contributor | 200-999 | + Edit own reports |
| Trusted | 1000-4999 | + Delete own reports |
| Expert | 5000+ | + Moderate reports |
| Moderator | Invited | Full moderation |
| Admin | Invited | Full control |

### Server Actions (`src/actions/`)

All data mutations use server actions. Key patterns:
- Actions check auth via `auth.api.getSession()`
- Actions check roles via Better Auth's admin plugin
- Use `db` from `@/db` for database operations

### Route Groups

- `(public)/` - Public pages (home, capabilities, jobs, reports)
- `(auth)/` - Auth pages (login, signup, verify-email)
- `dashboard/` - User dashboard
- `admin/` - Admin panel
- `moderation/` - Moderation queue

## Code Conventions

- Use Biome for linting/formatting (configured in `biome.json`)
- Server components by default, `"use client"` only when needed
- Forms use TanStack Form with Zod validation
- IDs use text-based UUIDs (not auto-increment)
- All timestamps include `createdAt` and `updatedAt`
