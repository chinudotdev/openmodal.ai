# PRD: Technology Pages (Phase 1)

## Introduction

Implement the Technology entity pages to allow users to browse, view, and submit AI technologies. Technologies link Organizations to Capabilities and Jobs, forming a core part of OpenModal's value chain. Users can submit new technologies (pending approval), while the pages display only approved technologies publicly.

This completes Phase 1 from TASKS.md: Technology list page, detail page, submit form, and duplicate prevention.

## Goals

- Display approved technologies in a browsable, filterable list
- Provide detailed technology pages showing connections to organizations, capabilities, and jobs
- Allow authenticated users (Contributor tier+) to submit new technologies for review
- Prevent duplicate submissions via pre-submit fuzzy search on names and aliases
- Maintain consistency with existing page patterns (capabilities, jobs)

## User Stories

### US-001: Technology List Page Layout

**Description:** As a visitor, I want to see a list of approved technologies so I can explore what AI tools exist.

**Acceptance Criteria:**

- [ ] Page renders at `/technologies` route
- [ ] Displays only technologies with `status: 'approved'`
- [ ] Shows technology card with: name, organization name, type badge, stage badge, description (truncated), image
- [ ] Breadcrumb navigation: Home > Technologies
- [ ] Loading skeleton while data fetches
- [ ] Empty state when no technologies exist
- [ ] Typecheck passes

### US-002: Technology List Filtering

**Description:** As a visitor, I want to filter technologies by type, stage, and organization so I can find relevant tools.

**Acceptance Criteria:**

- [ ] Filter by type: ai_model, robot, software, hardware, api (multi-select)
- [ ] Filter by stage: research, pilot, deployed, discontinued (multi-select)
- [ ] Filter by organization (searchable dropdown)
- [ ] Search by technology name
- [ ] Filter state persists in URL params (`?type=ai_model&stage=deployed&search=claude`)
- [ ] Filters update results without full page reload
- [ ] Clear all filters button
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-003: Technology List Sorting and Pagination

**Description:** As a visitor, I want to sort and paginate the technology list so I can browse efficiently.

**Acceptance Criteria:**

- [ ] Sort options: Newest, Oldest, A-Z, Z-A
- [ ] Sort state persists in URL params (`?sort=newest`)
- [ ] Pagination with 12 items per page
- [ ] Page number in URL params (`?page=2`)
- [ ] Shows total count: "Showing X of Y technologies"
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-004: Technology Detail Page - Header

**Description:** As a visitor, I want to see comprehensive technology details so I can understand what the technology does.

**Acceptance Criteria:**

- [ ] Page renders at `/technologies/[slug]` route
- [ ] Returns 404 for non-existent or non-approved technologies
- [ ] Header shows: name, image, organization (linked), type badge, stage badge
- [ ] Description displays in full
- [ ] Website link (if available) opens in new tab
- [ ] Release date displayed (if available)
- [ ] Breadcrumb: Home > Technologies > [Technology Name]
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-005: Technology Detail Page - Capabilities Section

**Description:** As a visitor, I want to see which capabilities a technology demonstrates so I can understand its strengths.

**Acceptance Criteria:**

- [ ] Section titled "Capabilities" with linked capability cards
- [ ] Each capability shows: name, category, progress percentage
- [ ] Clicking capability navigates to `/capabilities/[slug]`
- [ ] Empty state: "No capabilities linked yet"
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-006: Technology Detail Page - Jobs Threatened Section

**Description:** As a visitor, I want to see which jobs this technology threatens so I can assess career impact.

**Acceptance Criteria:**

- [ ] Section titled "Jobs Threatened" with linked job cards
- [ ] Each job shows: name, category, automation risk level badge
- [ ] Clicking job navigates to `/jobs/[slug]`
- [ ] Empty state: "No jobs linked yet"
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-007: Technology Detail Page - Impact Reports Section

**Description:** As a visitor, I want to see real-world impact reports for this technology so I can understand its deployment.

**Acceptance Criteria:**

- [ ] Section titled "Impact Reports" showing approved reports linked to this technology
- [ ] Each report shows: title, event date, location (if available), upvote count
- [ ] Clicking report navigates to `/reports/[id]`
- [ ] Shows latest 5 reports with "View all" link if more exist
- [ ] Empty state: "No impact reports yet. Be the first to submit one."
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-008: Submit Technology - Access Control

**Description:** As an authenticated user, I want to access the technology submission form so I can contribute new technologies.

**Acceptance Criteria:**

- [ ] "Submit Technology" button visible on `/technologies` page
- [ ] Unauthenticated users see button but clicking redirects to login
- [ ] After login, user returns to submission flow
- [ ] User must have Contributor tier (50+ points) to submit
- [ ] Users below Contributor tier see message explaining point requirement
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-009: Submit Technology - Duplicate Check (Pre-Submit)

**Description:** As a user submitting a technology, I want to be warned about potential duplicates so I avoid redundant submissions.

**Acceptance Criteria:**

- [ ] As user types technology name, fuzzy search runs against existing technologies
- [ ] Search checks both `name` and `aliases` fields
- [ ] Debounce search by 300ms to avoid excessive queries
- [ ] Shows "Similar technologies found:" with matching results
- [ ] Each match shows: name, organization, status badge (approved/pending)
- [ ] User must confirm "This is different" to proceed, or click existing technology to view it
- [ ] Search is case-insensitive
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-010: Submit Technology - Form Fields

**Description:** As a user, I want to fill out technology details so my submission is complete.

**Acceptance Criteria:**

- [ ] Form at `/technologies/submit` route
- [ ] Required fields: name, type (dropdown), description, organization (searchable dropdown), stage (dropdown)
- [ ] Optional fields: image (URL), website (URL), release date, aliases (comma-separated)
- [ ] Organization dropdown shows existing approved organizations
- [ ] Type options: AI Model, Robot, Software, Hardware, API
- [ ] Stage options: Research, Pilot, Deployed, Discontinued
- [ ] Description has character limit hint (2-3 sentences, ~300 chars)
- [ ] URL fields validate format
- [ ] Form shows validation errors inline
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-011: Submit Technology - Submission Flow

**Description:** As a user, I want to submit my technology for review so it can be added to the platform.

**Acceptance Criteria:**

- [ ] Submit button disabled until all required fields valid
- [ ] On submit, creates technology with `status: 'pending'`
- [ ] Sets `submittedBy` to current user ID
- [ ] Sets `submittedAt` to current timestamp
- [ ] Auto-generates slug from name (lowercase, hyphenated)
- [ ] Success message: "Technology submitted for review. You'll be notified when it's approved."
- [ ] Redirects to user dashboard submissions tab
- [ ] Error handling for submission failures
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-012: User Dashboard - My Submissions

**Description:** As a user, I want to see my submitted technologies so I can track their review status.

**Acceptance Criteria:**

- [ ] Dashboard has "My Submissions" section/tab
- [ ] Lists user's submitted technologies with status badges (pending/approved/rejected)
- [ ] Rejected submissions show rejection reason
- [ ] Approved submissions link to the public technology page
- [ ] Shows submission date for each
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Technology list page must only display technologies with `status = 'approved'`
- FR-2: Technology detail page must return 404 for technologies that are not approved or don't exist
- FR-3: Duplicate check must search both `name` and `aliases` columns using case-insensitive fuzzy matching
- FR-4: Technology submission must require authenticated user with Contributor tier (50+ points)
- FR-5: Slug generation must be unique - append number suffix if slug exists (e.g., `claude-2`)
- FR-6: All filters, sort, and pagination state must persist in URL search params
- FR-7: Image field should accept URLs only (no upload functionality in this phase)
- FR-8: Organization dropdown must only show approved/existing organizations (admin-created)

## Non-Goals

- No moderation queue UI (admin feature - separate PRD)
- No approve/reject/merge workflow (admin feature)
- No technology editing after submission (future feature)
- No image upload - only URL input
- No discussion threads on technology pages (Phase 4)
- No seeding of initial data (separate task)
- No organization creation from submit form (admin-only entity)

## Design Considerations

- Follow existing patterns from `/capabilities` and `/jobs` pages
- Reuse existing components: Breadcrumb, Card, Badge, Skeleton, filters pattern
- Technology cards similar to capability/job cards with type/stage badges
- Submit form follows TanStack Form patterns used elsewhere
- Mobile-responsive grid layout (1 col mobile, 2 col tablet, 3-4 col desktop)

## Technical Considerations

- Use existing `technology` schema from `src/db/schema/technologies.ts`
- Junction tables `technology_capability` and `technology_job` already exist
- Server actions for mutations (`src/actions/`)
- Auth check via `auth.api.getSession()`
- Permission check via Better Auth admin plugin for tier verification
- Fuzzy search can use PostgreSQL `ILIKE` with `%` wildcards or pg_trgm extension
- URL state management via `nuqs` or native `useSearchParams`

## Success Metrics

- Technology pages render without errors
- Users can browse, filter, and search technologies
- Users can submit technologies and see them in pending state
- Duplicate check prevents obviously duplicate submissions
- All acceptance criteria pass verification

## Open Questions

- Should pending technologies be visible to the submitter on the detail page (private preview)?
- Should aliases be editable after submission or locked?
- What fuzzy matching threshold should trigger duplicate warning (exact match, 80% similarity)?
