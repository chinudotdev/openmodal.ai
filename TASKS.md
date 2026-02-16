# TASKS.md

Incomplete features based on Restructure.md (v2.0, January 2025).

## Legend
- [ ] Not started
- [~] In progress / Partial
- [x] Completed

---

## Phase 1: Foundation (Technologies)

### Schema ✅
- [x] Organization schema (`src/db/schema/organizations.ts`)
- [x] Technology schema with submission workflow (`src/db/schema/technologies.ts`)
- [x] Technology-Capability junction table
- [x] Technology-Job junction table

### UI/Features
- [ ] Technology list page (`/technologies`)
- [ ] Technology detail page (`/technologies/[slug]`)
- [ ] Submit technology form (user-submitted, requires approval)
- [ ] Pre-submit duplicate check (fuzzy search on name + aliases)

### Data
- [ ] Seed 20-30 Organizations
- [ ] Seed 30-50 Technologies

---

## Phase 2: Impact Reports

### Schema ✅
- [x] Impact Report schema (`src/db/schema/reports.ts`)
- [x] Impact Report-Capability junction table

### UI/Features
- [~] Submit impact report form (exists but may need update per restructure)
- [~] Impact report detail page (`/reports/[id]`)
- [ ] Impact feed on homepage (show recent approved reports)
- [ ] Link reports to Technology pages
- [ ] Link reports to Job pages
- [ ] Link reports to Capability pages

---

## Phase 3: Admin/Moderation

### Features
- [ ] Moderation queue for Technologies
- [ ] Moderation queue for Impact Reports
- [ ] Approve/Reject/Merge workflow for Technologies
- [ ] Approve/Reject workflow for Impact Reports
- [ ] Duplicate merge tool for Technologies

---

## Phase 4: Discussions

### Schema ✅
- [x] Discussion schema (`src/db/schema/discussions.ts`)

### UI/Features
- [ ] Discussion threads on Organization pages
- [ ] Discussion threads on Technology pages
- [ ] Discussion threads on Capability pages
- [ ] Discussion threads on Job pages
- [ ] Discussion threads on Impact Report pages
- [ ] Nested replies (up to 3 levels)
- [ ] Upvote/Downvote functionality
- [ ] Sort by: New / Top / Hot

---

## Phase 5: Reward System

### Schema
- [ ] User points table
- [ ] User badges table

### Features
- [ ] Points calculation per action (see Restructure.md §8)
- [ ] Quality multipliers (source link, verified, upvotes)
- [ ] User tier progression display
- [ ] Badges system
- [ ] Anti-gaming protections (daily caps, cooldowns)

---

## Phase 6: Suggestions

### Schema ✅
- [x] Suggestion schema (`src/db/schema/suggestions.ts`)

### UI/Features
- [ ] Suggest Job form
- [ ] Suggest Capability form
- [ ] Suggest Organization form
- [ ] Suggestion review queue (admin)

---

## Phase 7: Sponsorship (Future)

- [ ] Organization claiming flow
- [ ] Sponsor tier management
- [ ] Payment integration
- [ ] Sponsor badges on org/tech pages

---

## Notes

- Schema changes have been implemented per Restructure.md
- Old tables/fields removed are documented in schema file comments
- See Restructure.md for complete entity specifications and relationships
