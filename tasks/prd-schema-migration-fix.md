# PRD: Schema Migration Fix - Public Pages

## Introduction

The OpenModal platform has undergone a significant schema restructure to align with the new entity model (Organization, Technology, Capability, Job, Impact Report, Discussion, Suggestion). This restructure has broken 73+ files across the codebase. This PRD focuses on fixing all public-facing pages to work with the new schema, removing deprecated admin/moderation pages, and documenting removed features for future tracking.

## Goals

- Fix all breaking public-facing pages (capabilities, jobs, reports/impact-reports)
- Update server actions to use new schema field names and structures
- Remove deprecated admin and moderation pages entirely
- Remove UI sections for features that no longer exist in the schema
- Document all removed features for future reference
- Ensure the application builds and runs without errors

## User Stories

### US-001: Update Capability Schema Exports

**Description:** As a developer, I need the capability schema exports to match the new structure so that all imports work correctly.

**Acceptance Criteria:**
- [ ] Remove `capabilityCategory` table export from schema
- [ ] Remove `capabilityTracking` table export from schema
- [ ] Export new enum types: `CapabilityCategory`, `CapabilityStatus`
- [ ] Typecheck passes

---

### US-002: Update Job Schema Exports

**Description:** As a developer, I need the job schema exports to match the new structure so that all imports work correctly.

**Acceptance Criteria:**
- [ ] Export new enum types: `JobCategory`, `RiskLevel`, `Confidence`, `Automatable`, `ImportanceLevel`
- [ ] Typecheck passes

---

### US-003: Fix Capabilities Server Action

**Description:** As a developer, I need the capabilities action to query and return data using the new schema structure.

**Acceptance Criteria:**
- [ ] Remove imports for `capabilityCategory` and `capabilityTracking` tables
- [ ] Update `getCapabilities()` to use `category` enum instead of `categoryId` FK join
- [ ] Remove references to deleted fields: `technicalDescription`, `whyItMatters`, `confidenceLevel`, `timelineEstimate`, `expertConsensus`, `communityPredictionMedian`, `reasoning`, `jobsProtectedCount`, `jobsProtectedExamples`, `researchActivityCount`, `recentBreakthroughDate`, `viewCount`, `trackingCount`
- [ ] Update return type to include new fields: `whatWorks`, `whatStruggles`, `whatDoesntWork`
- [ ] Remove `trackCapability()` function (tracking table deleted)
- [ ] Remove `incrementViewCount()` function (field deleted)
- [ ] Typecheck passes

---

### US-004: Fix Jobs Server Action

**Description:** As a developer, I need the jobs action to query and return data using the new schema structure.

**Acceptance Criteria:**
- [ ] Remove import for `industry` table
- [ ] Update field references: `title` → `name`, `automationStatus` → `riskLevel`
- [ ] Remove references to deleted fields: `shortDescription`, `keyResponsibilities`, `totalTasks`, `tasksReplaceable`, `tasksPartial`, `tasksSafe`, `totalWorkersGlobal`, `totalWorkersUsa`, `medianSalaryUsa`, `growthOutlook`, `growthRate`, `blsOccCode`, `estimatedAutomationYear`, `metaDescription`, `metaKeywords`, `viewCount`, `trackingCount`, `reportCount`, `verified`, `lastReviewed`
- [ ] Update `getJobs()` to use `category` enum instead of `industryId` FK join
- [ ] Remove `trackJob()` function (tracking table deleted)
- [ ] Remove `incrementViewCount()` function (field deleted)
- [ ] Remove `getRelatedJobs()` function (table deleted)
- [ ] Typecheck passes

---

### US-005: Fix Reports Server Action

**Description:** As a developer, I need the reports action to work with the new `impactReport` schema structure.

**Acceptance Criteria:**
- [ ] Update table references from `report` to `impactReport`
- [ ] Update field mappings to match new schema
- [ ] Remove references to deleted fields: `isDraft`, `reportType`, `company`, `workersAffected`, `impactType`, `automationPercentage`, `performanceComparison`, `moderationNotes`, `downvotes`, `verificationCount`, `commentCount`, `deletedAt`, `publishedAt`
- [ ] Update to use `technologyId` (required) and `jobId` (optional) connections
- [ ] Typecheck passes

---

### US-006: Fix Capability Card Component

**Description:** As a user viewing capabilities, I want to see capability cards with accurate data from the new schema.

**Acceptance Criteria:**
- [ ] Update `capability.category?.name` to use enum value directly (no `.name`)
- [ ] Remove `timelineEstimate` display (field deleted)
- [ ] Remove `jobsProtectedCount` display (field deleted)
- [ ] Remove `trackingCount` display (field deleted)
- [ ] Remove `researchActivityCount` display (field deleted)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-007: Fix Capability Detail Page Components

**Description:** As a user viewing a capability detail page, I want to see accurate information from the new schema.

**Acceptance Criteria:**
- [ ] Update `capability-header.tsx` to use new field names
- [ ] Update `capability-description.tsx` - remove `technicalDescription` and `whyItMatters` references
- [ ] Remove or update `timeline-forecast.tsx` - fields `timelineEstimate`, `communityPredictionMedian` deleted
- [ ] Remove or update `prediction-display.tsx` - prediction fields removed
- [ ] Add display for new fields: `whatWorks`, `whatStruggles`, `whatDoesntWork`
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-008: Fix Capabilities Dashboard Category Breakdown

**Description:** As a user viewing the capabilities dashboard, I want to see category breakdown using the new enum structure.

**Acceptance Criteria:**
- [ ] Update `category-breakdown.tsx` to use `category` enum values (physical, cognitive, social, meta)
- [ ] Remove joins to `capabilityCategory` table
- [ ] Update grouping/filtering logic to use enum
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-009: Fix Job Card Component

**Description:** As a user viewing jobs, I want to see job cards with accurate data from the new schema.

**Acceptance Criteria:**
- [ ] Update `job.title` references to `job.name`
- [ ] Remove `shortDescription` display (field deleted)
- [ ] Remove `totalWorkersGlobal` display (field deleted)
- [ ] Remove `medianSalaryUsa` display (field deleted)
- [ ] Update `automationStatus` to `riskLevel`
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-010: Fix Job Detail Page - At a Glance Component

**Description:** As a user viewing a job detail page, I want to see the "at a glance" section with accurate data.

**Acceptance Criteria:**
- [ ] Update `automationStatus` to `riskLevel`
- [ ] Remove `estimatedAutomationYear` display (field deleted)
- [ ] Remove `confidenceLevel` display from this component (moved to job-level `confidence` field)
- [ ] Update to use new `automationRiskPercentage` field
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-011: Fix Job Detail Page - Quick Stats Grid

**Description:** As a user viewing a job detail page, I want to see quick stats with available data only.

**Acceptance Criteria:**
- [ ] Remove `totalWorkersGlobal` stat (field deleted)
- [ ] Remove `medianSalaryUsa` stat (field deleted)
- [ ] Remove `growthRate` stat (field deleted)
- [ ] Remove `estimatedAutomationYear` stat (field deleted)
- [ ] Update component to show available stats: `automationRiskPercentage`, `riskLevel`, `timelineEstimate`, `confidence`
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-012: Fix Job Detail Page - About Section

**Description:** As a user viewing a job detail page, I want to see the about section with available data.

**Acceptance Criteria:**
- [ ] Update `job.title` to `job.name`
- [ ] Remove `keyResponsibilities` display (field deleted)
- [ ] Remove `shortDescription` display (field deleted)
- [ ] Use `description` field for job information
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-013: Remove Related Jobs Component

**Description:** As a developer, I need to remove the related jobs feature since the `relatedJob` table is deleted.

**Acceptance Criteria:**
- [ ] Remove `related-jobs.tsx` component or replace with placeholder
- [ ] Remove references to related jobs in job detail page
- [ ] Remove `getRelatedJobs` action calls
- [ ] Typecheck passes

---

### US-014: Fix Job Autocomplete Component

**Description:** As a user searching for jobs, I want the autocomplete to work with new field names.

**Acceptance Criteria:**
- [ ] Update `job.title` references to `job.name`
- [ ] Remove `shortDescription` from search results display
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-015: Fix Job Comparison Table

**Description:** As a user comparing jobs, I want the comparison to show available data only.

**Acceptance Criteria:**
- [ ] Remove comparison columns for deleted fields
- [ ] Update field references to new names
- [ ] Show comparison for: `name`, `category`, `description`, `automationRiskPercentage`, `riskLevel`, `timelineEstimate`, `confidence`
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-016: Fix Search API Route

**Description:** As a user searching the platform, I want search to work with new field names.

**Acceptance Criteria:**
- [ ] Update job search to use `name` instead of `title`
- [ ] Update capability search to use new field structure
- [ ] Remove references to deleted fields in search indexing
- [ ] Typecheck passes

---

### US-017: Fix Dashboard Actions

**Description:** As a user viewing my dashboard, I want it to work without tracking count fields.

**Acceptance Criteria:**
- [ ] Remove references to `trackingCount` fields
- [ ] Update dashboard queries to use new schema
- [ ] Typecheck passes

---

### US-018: Fix Onboarding Actions and Validations

**Description:** As a new user going through onboarding, I want it to work with the new schema.

**Acceptance Criteria:**
- [ ] Update job references in onboarding to use new field names
- [ ] Update validation schemas in `src/lib/validations/onboarding.ts`
- [ ] Typecheck passes

---

### US-019: Fix Report Validations

**Description:** As a user submitting reports, I want validation to match the new impact report schema.

**Acceptance Criteria:**
- [ ] Update `src/lib/validations/reports.ts` to match new `impactReport` schema
- [ ] Remove validation for deleted fields
- [ ] Add validation for required `technologyId` connection
- [ ] Typecheck passes

---

### US-020: Remove Admin Pages

**Description:** As a developer, I need to remove all admin pages since they are being deprecated.

**Acceptance Criteria:**
- [ ] Remove `src/app/admin/` directory entirely
- [ ] Remove admin-related actions in `src/actions/admin-content.ts`
- [ ] Remove admin navigation and layout components
- [ ] Typecheck passes

---

### US-021: Remove Moderation Pages

**Description:** As a developer, I need to remove all moderation pages since they are being deprecated.

**Acceptance Criteria:**
- [ ] Remove `src/app/moderation/` directory entirely
- [ ] Remove moderation-related actions
- [ ] Remove moderation navigation and components
- [ ] Typecheck passes

---

### US-022: Remove Industry Management

**Description:** As a developer, I need to remove industry table references since it's replaced by enum.

**Acceptance Criteria:**
- [ ] Remove `src/db/schema/industries.ts` if it exists
- [ ] Remove industry-related exports from schema index
- [ ] Update any remaining industry references to use `jobCategoryEnum`
- [ ] Typecheck passes

---

### US-023: Clean Up Schema Index Exports

**Description:** As a developer, I need the schema index to export only valid tables and types.

**Acceptance Criteria:**
- [ ] Update `src/db/schema/index.ts` to export all new tables
- [ ] Remove exports for deleted tables
- [ ] Export new junction tables: `technologyCapability`, `technologyJob`, `jobCapability`, `taskCapability`, `impactReportCapability`
- [ ] Typecheck passes

---

### US-024: Update Mock Data

**Description:** As a developer, I need mock data to match the new schema for testing.

**Acceptance Criteria:**
- [ ] Update `src/lib/mock-data.ts` to use new field names and structures
- [ ] Remove mock data for deleted fields
- [ ] Add mock data for new fields where needed
- [ ] Typecheck passes

---

### US-025: Final Build Verification

**Description:** As a developer, I need the application to build successfully with no TypeScript errors.

**Acceptance Criteria:**
- [ ] Run `bun run build` successfully
- [ ] Run `bun run lint` with no errors
- [ ] All pages render without runtime errors
- [ ] Verify in browser using dev-browser skill

---

## Functional Requirements

- FR-1: All capability queries must use `category` enum (physical, cognitive, social, meta) instead of FK join
- FR-2: All job queries must use `category` enum instead of `industryId` FK join
- FR-3: All job references must use `name` field instead of `title`
- FR-4: All job risk references must use `riskLevel` enum instead of `automationStatus`
- FR-5: All report queries must reference `impactReport` table with `technologyId` and `jobId` connections
- FR-6: All tracking-related functionality (view counts, tracking counts) must be removed
- FR-7: Admin pages at `/admin/*` must be removed entirely
- FR-8: Moderation pages at `/moderation/*` must be removed entirely
- FR-9: Industry management must be removed (replaced by enum)

## Non-Goals

- Implementing new entity pages (Organization, Technology, Discussion, Suggestion)
- Adding new features beyond schema compatibility
- Migrating existing data (fresh start approach)
- Building new admin/moderation interfaces
- Adding tracking/analytics features back

## Technical Considerations

- **Database:** Fresh start with new schema - run `bun run db:push` after all schema changes
- **Type Safety:** Ensure all TypeScript types are updated to match new schema
- **Imports:** Many files import from schema - all must be updated
- **Junction Tables:** New many-to-many relationships via junction tables need proper querying

## Removed Features Tracking

The following features have been removed from the schema and should be tracked for potential future implementation:

### Capability Removed Features
| Feature | Original Field | Notes |
|---------|---------------|-------|
| Technical Description | `technicalDescription` | Detailed technical explanation |
| Why It Matters | `whyItMatters` | User-facing importance explanation |
| Confidence Level | `confidenceLevel` | How confident the assessment is |
| Timeline Estimate | `timelineEstimate` | When capability might be achieved |
| Expert Consensus | `expertConsensus` | Expert opinion summary |
| Community Prediction | `communityPredictionMedian` | Crowdsourced prediction |
| Reasoning | `reasoning` | Explanation of assessment |
| Jobs Protected Count | `jobsProtectedCount` | Number of jobs this protects |
| Jobs Protected Examples | `jobsProtectedExamples` | Example jobs protected |
| Research Activity Count | `researchActivityCount` | Active research tracking |
| Recent Breakthrough | `recentBreakthroughDate` | Last major progress |
| View Count | `viewCount` | Analytics |
| Tracking Count | `trackingCount` | User tracking feature |
| Category Table | `capabilityCategory` | Now enum-based |
| Tracking Table | `capabilityTracking` | User tracking feature |

### Job Removed Features
| Feature | Original Field | Notes |
|---------|---------------|-------|
| Short Description | `shortDescription` | Brief summary |
| Key Responsibilities | `keyResponsibilities` | Job duties list |
| Total Workers Global | `totalWorkersGlobal` | Employment statistics |
| Total Workers USA | `totalWorkersUsa` | US employment statistics |
| Median Salary USA | `medianSalaryUsa` | Salary data |
| Growth Outlook | `growthOutlook` | Job growth prediction |
| Growth Rate | `growthRate` | Growth percentage |
| BLS Occ Code | `blsOccCode` | Bureau of Labor Statistics code |
| Estimated Automation Year | `estimatedAutomationYear` | Prediction |
| Meta Description | `metaDescription` | SEO |
| Meta Keywords | `metaKeywords` | SEO |
| View Count | `viewCount` | Analytics |
| Tracking Count | `trackingCount` | User tracking |
| Report Count | `reportCount` | Linked reports count |
| Verified | `verified` | Verification status |
| Last Reviewed | `lastReviewed` | Review date |
| Industry Table | `industry` | Now category enum |
| Job Tracking Table | `jobTracking` | User tracking feature |
| Related Job Table | `relatedJob` | Related jobs feature |

### Report Removed Features
| Feature | Original Field | Notes |
|---------|---------------|-------|
| Is Draft | `isDraft` | Draft status |
| Report Type | `reportType` | Type categorization |
| Company | `company` | Company involved |
| Workers Affected | `workersAffected` | Impact count |
| Impact Type | `impactType` | Type of impact |
| Automation Percentage | `automationPercentage` | Degree of automation |
| Performance Comparison | `performanceComparison` | AI vs human comparison |
| Moderation Notes | `moderationNotes` | Internal notes |
| Downvotes | `downvotes` | Negative votes |
| Verification Count | `verificationCount` | Verification tracking |
| Comment Count | `commentCount` | Comments count |

## Success Metrics

- Application builds with zero TypeScript errors
- All public pages load without runtime errors
- Lint passes with no errors
- All 25 user stories completed and verified

## Open Questions

1. Should we add redirect routes from old admin/moderation URLs to home page?
2. Should capability detail pages show the new `whatWorks`/`whatStruggles`/`whatDoesntWork` arrays or wait for design?
3. Should we update the navigation to remove admin/moderation links?
