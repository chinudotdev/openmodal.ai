# Entity Relationships

How entities connect and relate to each other in OpenModal.

## Relationship Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ORGANIZATION                                                       │
│       │                                                             │
│       │ 1:N                                                         │
│       ▼                                                             │
│  TECHNOLOGY ────────────────────────────┐                          │
│       │                                  │                          │
│       │ N:N (technology_capability_     │                          │
│       │      subtype)                    │                          │
│       ▼                                  │                          │
│  CAPABILITY ◄──── 1:N ──── CAPABILITY_SUBTYPE                      │
│  (parent)                  (domain-specific)                        │
│                                  │                                  │
│                                  │ N:N (task_capability_subtype)   │
│                                  ▼                                  │
│                               TASK ◄──── N:1 ──── JOB              │
│                                                                     │
│                                  │                                  │
│                                  │ (derived via enrichment)        │
│                                  ▼                                  │
│                          IMPACT_REPORT                              │
│                                  │                                  │
│                    ┌─────────────┴─────────────┐                   │
│                    ▼                           ▼                    │
│           REPORT_ENRICHMENT             REPORT_FLAG                 │
│                                                                     │
│                           DISCUSSION                           │
│                      (Community threads)                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Direct Relationships

### Organization → Technology (1:N)

One organization has many technologies.

**Example:**

- Anthropic → Claude, Claude 2, Claude 3, Claude 3.5 Sonnet

```typescript
organization.technologies // Technology[]
```

### Capability → Capability Subtype (1:N)

One capability has many subtypes.

**Example:**

- Reasoning → Medical Reasoning, Legal Reasoning, Mathematical Reasoning

```typescript
capability.subtypes // CapabilitySubtype[]
```

### Job → Task (1:N)

One job has many tasks.

**Example:**

- Radiologist → Analyze X-rays, Write reports, Consult patients

```typescript
job.tasks // Task[]
```

## Junction Tables

### Technology ↔ Capability Subtype (N:N)

**Table:** `technology_capability_subtype`

**Fields:**

- `technology_id` → Technology
- `capability_subtype_id` → CapabilitySubtype
- `performance_score` (0-100) - How well this tech performs on this capability

**Purpose:** Links technologies to the specific capability subtypes they demonstrate.

**Example:**

- Claude 3.5 → Medical Reasoning (score: 85)
- GPT-4 → Legal Reasoning (score: 72)

### Task ↔ Capability Subtype (N:N)

**Table:** `task_capability_subtype`

**Fields:**

- `task_id` → Task
- `capability_subtype_id` → CapabilitySubtype
- `importance` (critical | important | minor)
- `minimum_level_required` (0-100)
- `notes` (text)

**Purpose:** Defines which capabilities are needed for each task.

**Example:**

- Task: "Analyze X-rays"
  - Medical Imaging (critical, 90% required)
  - Medical Reasoning (critical, 85% required)

## Derived Relationships

These relationships are NOT stored in the database but computed via queries.

### Technology → Jobs Affected

**Derivation:** technology → capability_subtype → task → job

**Query:**

```sql
SELECT DISTINCT j.*
FROM technology t
JOIN technology_capability_subtype tcs ON t.id = tcs.technology_id
JOIN capability_subtype cs ON tcs.capability_subtype_id = cs.id
JOIN task_capability_subtype taskcs ON cs.id = taskcs.capability_subtype_id
JOIN task ON taskcs.task_id = task.id
JOIN job j ON task.job_id = j.id
WHERE t.id = 'technology_id'
```

### Job → Technologies Threatening

**Derivation:** job → task → capability_subtype → technology

**Query:**

```sql
SELECT DISTINCT t.*
FROM job j
JOIN task ON task.job_id = j.id
JOIN task_capability_subtype tcs ON tcs.task_id = task.id
JOIN capability_subtype cs ON tcs.capability_subtype_id = cs.id
JOIN technology_capability_subtype tc ON cs.id = tc.capability_subtype_id
JOIN technology t ON tc.technology_id = t.id
WHERE j.id = 'job_id'
```

### Job → Capabilities Needed

**Derivation:** job → task → capability_subtype → capability

**Query:**

```sql
SELECT DISTINCT c.*
FROM job j
JOIN task ON task.job_id = j.id
JOIN task_capability_subtype tcs ON tcs.task_id = task.id
JOIN capability_subtype cs ON tcs.capability_subtype_id = cs.id
JOIN capability c ON cs.capability_id = c.id
WHERE j.id = 'job_id'
```

### Job → Automation Risk

**Derivation:** Calculated from tasks and capability progress

**Logic:**

```javascript
automationRisk = SUM(
  task.percentage_of_job *
  CASE
    WHEN capability.progress >= task.minimum_required THEN 1.0
    WHEN capability.progress >= task.minimum_required * 0.7 THEN 0.5
    ELSE 0.0
  END
)
```

**Example:**

- Job: Radiologist
- Task 1: Analyze X-rays (40%)
  - Medical Imaging at 80% of required 90% → partially automatable (0.5)
  - Contribution: 40% \* 0.5 = 20%
- Task 2: Write reports (30%)
  - Medical Reasoning at 40% of required 80% → not automatable (0)
  - Contribution: 0%
- Task 3: Consult patients (30%)
  - Empathy at 10% of required 90% → not automatable (0)
  - Contribution: 0%
- **Total automation risk: 20%**

## Community Relationships

### Impact Report ↔ Enrichments (1:N)

One report has many enrichments.

**Enrichment types:**

- `job_link` - Links to Job entity
- `technology_link` - Links to Technology entity
- `task_link` - Links to Task entity
- `capability_subtype_link` - Links to CapabilitySubtype entity

### Impact Report ↔ Flags (1:N)

One report can have many flags.

**Auto-hide threshold:** 3+ flags

### Discussion → Entity (N:1)

Discussions can be attached to any entity:

- Organization
- Technology
- Capability
- Capability Subtype
- Job
- Impact Report

## Relationship Examples

### Example 1: Finding All Jobs Threatened by GPT-4

```typescript
// Start with technology
const technology = await getTechnologyBySlug('gpt-4')

// Get related capability subtypes
const capabilitySubtypes = await getCapabilitySubtypesByTechnology(
  technology.id,
)

// Get tasks requiring those capabilities
const tasks = await getTasksByCapabilitySubtypes(
  capabilitySubtypes.map((cs) => cs.id),
)

// Get unique jobs
const jobs = await getJobsByTasks(tasks.map((t) => t.id))

// Result: Jobs threatened by GPT-4
```

### Example 2: Finding What Capabilities AI Needs to Replace Radiologists

```typescript
// Start with job
const job = await getJobBySlug('radiologist')

// Get job's tasks
const tasks = await getTasksByJob(job.id)

// Get capability requirements for each task
const requirements = await getTaskCapabilityRequirements(tasks.map((t) => t.id))

// Group by capability
const capabilities = groupByCapability(requirements)

// Result: Capabilities needed (with importance and minimum levels)
```

### Example 3: Finding Real-World Evidence for a Job

```typescript
// Start with job
const job = await getJobBySlug('customer-service-representative')

// Get enrichments linking to this job
const enrichments = await getEnrichmentsByEntity('job', job.id)

// Get reports with those enrichments
const reportIds = enrichments.map((e) => e.report_id)
const reports = await getReportsByIds(reportIds)

// Result: Real-world impact reports for this job
```

## Data Integrity Rules

| Rule                              | Purpose                         |
| --------------------------------- | ------------------------------- |
| Technology must have organization | Every tech comes from somewhere |
| Task must belong to job           | Tasks don't exist in isolation  |
| Enrichment must link to report    | Orphan enrichments not allowed  |
| Discussion must have entity       | Attach to something specific    |
| Capability subtypes need parent   | No orphan subtypes              |

## Cascade Deletes

| Entity        | Cascade Action                      |
| ------------- | ----------------------------------- |
| Organization  | Delete all technologies             |
| Technology    | Delete all tech-capability links    |
| Capability    | Delete all subtypes                 |
| Job           | Delete all tasks                    |
| Task          | Delete all task-capability links    |
| Impact Report | Delete all enrichments and flags    |
| User          | Anonymize reports, keep enrichments |
