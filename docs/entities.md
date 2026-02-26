# Entity Specifications

Complete specifications for all OpenModal entities.

## Organization

**Purpose:** Companies/labs building AI — sponsorship targets

| Field          | Type      | Description                                                          |
| -------------- | --------- | -------------------------------------------------------------------- |
| id             | uuid      | Primary key                                                          |
| name           | string    | Organization name                                                    |
| slug           | string    | URL-friendly unique identifier                                       |
| types          | enum[]    | ai_lab, robotics, enterprise_software, startup, research_institution |
| description    | text      | 2-3 sentence description                                             |
| website        | url       | Official website                                                     |
| logo           | string    | Image URL                                                            |
| founded_year   | number    | (optional)                                                           |
| is_sponsor     | boolean   | Sponsorship status                                                   |
| sponsor_tier   | enum      | none, bronze, silver, gold                                           |
| is_claimed     | boolean   | Organization claimed by verified rep                                 |
| verified_badge | boolean   | Verification badge                                                   |
| created_at     | timestamp | Auto-generated                                                       |
| updated_at     | timestamp | Auto-generated                                                       |

**Sponsor Tiers:**

| Tier   | Price   | Benefits                             |
| ------ | ------- | ------------------------------------ |
| None   | $0      | Listed, can be discussed             |
| Bronze | $100/mo | Verified badge, can post updates     |
| Silver | $250/mo | + Featured in category, analytics    |
| Gold   | $500/mo | + Homepage feature, priority support |

**Created By:** Admin only

---

## Technology

**Purpose:** Specific AI products, models, robots — links orgs to capability subtypes

| Field            | Type      | Description                              |
| ---------------- | --------- | ---------------------------------------- |
| id               | uuid      | Primary key                              |
| name             | string    | Technology name                          |
| slug             | string    | URL-friendly unique identifier           |
| type             | enum      | ai_model, robot, software, hardware, api |
| description      | text      | 2-3 sentence description                 |
| image            | string    | Image URL                                |
| website          | url       | (optional)                               |
| organization_id  | uuid      | Foreign key → Organization               |
| stage            | enum      | research, pilot, deployed, discontinued  |
| release_date     | date      | (optional)                               |
| last_updated     | timestamp | Auto-generated                           |
| status           | enum      | pending, approved, rejected              |
| submitted_by     | uuid      | User who submitted                       |
| submitted_at     | timestamp | Auto-generated                           |
| reviewed_by      | uuid      | (nullable)                               |
| reviewed_at      | timestamp | (nullable)                               |
| rejection_reason | text      | (nullable)                               |
| aliases          | string[]  | Alternative names                        |
| merged_into_id   | uuid      | (nullable)                               |
| created_at       | timestamp | Auto-generated                           |
| updated_at       | timestamp | Auto-generated                           |

**Created By:** Users (requires approval)

**Derived Relationships:**

- `jobs_affected` - via capability_subtype → task → job chain
- `impact_reports` - via report_enrichment

---

## Capability

**Purpose:** Broad categories of what AI can/can't do

| Field       | Type      | Description                            |
| ----------- | --------- | -------------------------------------- |
| id          | uuid      | Primary key                            |
| name        | string    | e.g., "Reasoning", "Image Recognition" |
| slug        | string    | URL-friendly unique identifier         |
| category    | enum      | physical, cognitive, social, meta      |
| description | text      | 2-3 sentence description               |
| icon        | string    | (optional)                             |
| created_at  | timestamp | Auto-generated                         |
| updated_at  | timestamp | Auto-generated                         |

**Created By:** Admin only

**Note:** Progress tracking moved to subtypes. Parent capability shows aggregate/average.

---

## Capability Subtype

**Purpose:** Domain-specific capabilities with individual progress tracking

| Field               | Type      | Description                                  |
| ------------------- | --------- | -------------------------------------------- |
| id                  | uuid      | Primary key                                  |
| capability_id       | uuid      | Foreign key → Capability                     |
| name                | string    | e.g., "Medical Reasoning", "Legal Reasoning" |
| slug                | string    | URL-friendly unique identifier               |
| domain              | string    | healthcare, legal, finance, technology, etc. |
| description         | text      | 2-3 sentence description                     |
| progress_percentage | number    | 0-100                                        |
| status              | enum      | solved, partial, unsolved                    |
| what_works          | string[]  | List of working aspects                      |
| what_struggles      | string[]  | List of struggles                            |
| what_doesnt_work    | string[]  | List of failures                             |
| created_at          | timestamp | Auto-generated                               |
| updated_at          | timestamp | Auto-generated                               |

**Created By:** Admin only

**Example Subtypes:**

```
Capability: "Reasoning"
├── Medical Reasoning (healthcare, 45%)
├── Legal Reasoning (legal, 38%)
├── Mathematical Reasoning (stem, 85%)
├── Code Reasoning (technology, 75%)
└── Financial Reasoning (finance, 55%)

Capability: "Image Recognition"
├── Medical Imaging (healthcare, 70%)
├── Document OCR (general, 90%)
├── Facial Recognition (security, 85%)
└── Satellite Imagery (geospatial, 75%)
```

---

## Job

**Purpose:** Occupations and their automation risk (derived from tasks)

| Field                      | Type      | Description                                                                                        |
| -------------------------- | --------- | -------------------------------------------------------------------------------------------------- |
| id                         | uuid      | Primary key                                                                                        |
| name                       | string    | Job title                                                                                          |
| slug                       | string    | URL-friendly unique identifier                                                                     |
| category                   | enum      | healthcare, technology, trades, service, creative, finance, education, legal, manufacturing, other |
| description                | text      | 2-3 sentence description                                                                           |
| icon                       | string    | (optional)                                                                                         |
| automation_risk_percentage | number    | 0-100, calculated from tasks                                                                       |
| risk_level                 | enum      | low, medium, high, critical                                                                        |
| timeline_estimate          | string    | "5-10 years", "unlikely", etc.                                                                     |
| confidence                 | enum      | low, medium, high                                                                                  |
| created_at                 | timestamp | Auto-generated                                                                                     |
| updated_at                 | timestamp | Auto-generated                                                                                     |

**Created By:** Admin only

**Derived Relationships:**

- `capability_subtypes` - derived from tasks
- `technologies` - derived from capability_subtypes
- `impact_reports` - via report_enrichment

---

## Task

**Purpose:** Atomic work units within a job, linked to capability subtypes

| Field             | Type      | Description                      |
| ----------------- | --------- | -------------------------------- |
| id                | uuid      | Primary key                      |
| job_id            | uuid      | Foreign key → Job                |
| name              | string    | e.g., "Analyze X-ray images"     |
| percentage_of_job | number    | 0-100, should sum to 100 per job |
| automatable       | enum      | yes, partial, no                 |
| reason            | text      | Why this assessment              |
| created_at        | timestamp | Auto-generated                   |
| updated_at        | timestamp | Auto-generated                   |

**Junction: task_capability_subtype**

| Field                  | Type   | Description                     |
| ---------------------- | ------ | ------------------------------- |
| id                     | uuid   | Primary key                     |
| task_id                | uuid   | Foreign key → Task              |
| capability_subtype_id  | uuid   | Foreign key → CapabilitySubtype |
| importance             | enum   | critical, important, minor      |
| minimum_level_required | number | 0-100, what progress % needed   |
| notes                  | text   | Why this subtype matters        |

**Created By:** Admin only

**Example:**

```
Job: "Radiologist"

Task: "Analyze X-ray images" (40% of job)
├── Medical Imaging (critical, needs 90%)
└── Medical Reasoning (critical, needs 85%)

Task: "Write diagnostic reports" (30% of job)
├── Medical Reasoning (critical, needs 80%)
└── Language Generation - Medical (important, needs 75%)

Task: "Consult with patients" (30% of job)
├── Empathy & Emotional Intelligence (critical, needs 90%)
└── Medical Reasoning (important, needs 70%)
```

---

## Impact Report

**Purpose:** Real-world worker stories — THE MOAT

**Philosophy:** Low friction for users, instant publish, community enrichment for structure.

| Field                  | Type      | Required | Description                                                                   |
| ---------------------- | --------- | -------- | ----------------------------------------------------------------------------- |
| id                     | uuid      | ✅       | Primary key                                                                   |
| job_title              | string    | ✅       | Freetext - what they call their job                                           |
| description            | text      | ✅       | Their story, 100+ chars                                                       |
| impact_type            | enum      | ✅       | layoffs, reduced_hours, role_change, new_tools, productivity_boost, no_change |
| location               | string    | ❌       | City, state                                                                   |
| country                | string    | ❌       | Country                                                                       |
| company_name           | string    | ❌       | Company name                                                                  |
| company_size           | enum      | ❌       | 1-10, 11-50, 51-200, 201-1000, 1000+                                          |
| technology_description | string    | ❌       | Freetext - "some chatbot", "robot arms"                                       |
| workers_affected_count | number    | ❌       | Number of workers affected                                                    |
| event_date             | date      | ❌       | When it happened                                                              |
| source_url             | url       | ❌       | News link if available                                                        |
| submitted_by           | uuid      | ✅       | User who submitted                                                            |
| is_anonymous           | boolean   | ✅       | Anonymous submission                                                          |
| reporter_relationship  | enum      | ❌       | employee, former_employee, manager, witness, news, researcher                 |
| status                 | enum      | ✅       | published, flagged, removed (NO pending!)                                     |
| upvotes                | number    | ✅       | Engagement metric                                                             |
| view_count             | number    | ✅       | View tracking                                                                 |
| created_at             | timestamp | ✅       | Auto-generated                                                                |
| updated_at             | timestamp | ✅       | Auto-generated                                                                |

**Created By:** Users (instant publish, no approval)

---

## Report Enrichment

**Purpose:** Community-added structured data linking reports to entities

| Field            | Type      | Description                                                   |
| ---------------- | --------- | ------------------------------------------------------------- |
| id               | uuid      | Primary key                                                   |
| report_id        | uuid      | Foreign key → ImpactReport                                    |
| user_id          | uuid      | User who added this                                           |
| enrichment_type  | enum      | job_link, technology_link, task_link, capability_subtype_link |
| linked_entity_id | uuid      | (optional) If entity exists in system                         |
| suggested_name   | string    | Freetext if entity doesn't exist yet                          |
| confidence       | enum      | certain, likely, guess                                        |
| notes            | text      | (optional)                                                    |
| upvotes          | number    | Community agreement                                           |
| downvotes        | number    | Community disagreement                                        |
| created_at       | timestamp | Auto-generated                                                |

**Created By:** Users (50+ reputation required)

---

## Report Flag

**Purpose:** Community flagging for moderation

| Field      | Type      | Description                                 |
| ---------- | --------- | ------------------------------------------- |
| id         | uuid      | Primary key                                 |
| report_id  | uuid      | Foreign key → ImpactReport                  |
| user_id    | uuid      | User who flagged                            |
| reason     | enum      | spam, fake, duplicate, inappropriate, other |
| notes      | text      | (optional)                                  |
| created_at | timestamp | Auto-generated                              |

**Auto-Moderation:** 3+ flags → auto-hide report, notify moderator

---

## Discussion

**Purpose:** Reddit-style threaded conversations on any entity

| Field         | Type      | Description                                                                  |
| ------------- | --------- | ---------------------------------------------------------------------------- |
| id            | uuid      | Primary key                                                                  |
| title         | string    | For top-level threads                                                        |
| body          | text      | Discussion content                                                           |
| is_top_level  | boolean   | Is this a top-level thread                                                   |
| entity_type   | enum      | organization, technology, capability, capability_subtype, job, impact_report |
| entity_id     | uuid      | ID of attached entity                                                        |
| parent_id     | uuid      | (nullable) For replies                                                       |
| depth         | number    | 0, 1, 2 (max 3 levels)                                                       |
| user_id       | uuid      | Author                                                                       |
| is_anonymous  | boolean   | Anonymous post                                                               |
| upvotes       | number    | Engagement                                                                   |
| downvotes     | number    | Engagement                                                                   |
| reply_count   | number    | Reply tracking                                                               |
| is_deleted    | boolean   | Moderation                                                                   |
| deleted_by    | uuid      | (nullable)                                                                   |
| delete_reason | string    | (nullable)                                                                   |
| created_at    | timestamp | Auto-generated                                                               |
| updated_at    | timestamp | Auto-generated                                                               |

**Created By:** Users (post-moderated)

---

## Suggestion

**Purpose:** User suggestions for admin-only entities

| Field           | Type      | Description                                       |
| --------------- | --------- | ------------------------------------------------- |
| id              | uuid      | Primary key                                       |
| type            | enum      | job, capability, capability_subtype, organization |
| suggested_name  | string    | Name to add                                       |
| reason          | text      | Why should we add this?                           |
| additional_info | text      | (optional)                                        |
| user_id         | uuid      | (nullable)                                        |
| email           | string    | (optional) For follow-up                          |
| status          | enum      | pending, accepted, rejected                       |
| reviewed_by     | uuid      | (nullable)                                        |
| reviewed_at     | timestamp | (nullable)                                        |
| response        | text      | (nullable)                                        |
| created_at      | timestamp | Auto-generated                                    |
| updated_at      | timestamp | Auto-generated                                    |

---

## Junction Tables

### technology_capability_subtype

Links technologies to capability subtypes.

| Field                 | Type      | Description                     |
| --------------------- | --------- | ------------------------------- |
| id                    | uuid      | Primary key                     |
| technology_id         | uuid      | Foreign key → Technology        |
| capability_subtype_id | uuid      | Foreign key → CapabilitySubtype |
| performance_score     | number    | 0-100                           |
| created_at            | timestamp | Auto-generated                  |

### task_capability_subtype

Links tasks to capability subtypes with requirements.

| Field                  | Type      | Description                     |
| ---------------------- | --------- | ------------------------------- |
| id                     | uuid      | Primary key                     |
| task_id                | uuid      | Foreign key → Task              |
| capability_subtype_id  | uuid      | Foreign key → CapabilitySubtype |
| importance             | enum      | critical, important, minor      |
| minimum_level_required | number    | 0-100                           |
| notes                  | text      | Explanation                     |
| created_at             | timestamp | Auto-generated                  |
