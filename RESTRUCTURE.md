# OpenModal — Complete Restructure Document

**Version:** 3.0
**Date:** January 2025
**Purpose:** Comprehensive documentation of restructured platform with capability hierarchy and simplified reports

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Core Philosophy](#2-core-philosophy)
3. [Entity Structure](#3-entity-structure)
4. [Entity Specifications](#4-entity-specifications)
5. [Relationships & Connections](#5-relationships--connections)
6. [Impact Reports & Community Enrichment](#6-impact-reports--community-enrichment)
7. [Moderation System](#7-moderation-system)
8. [Duplicate Management](#8-duplicate-management)
9. [Reward System](#9-reward-system)
10. [User Tiers & Permissions](#10-user-tiers--permissions)
11. [Feature Phases](#11-feature-phases)
12. [Tech Architecture](#12-tech-architecture)
13. [What We Dropped](#13-what-we-dropped)
14. [Migration Guide](#14-migration-guide)

---

## 1. Executive Summary

### What is OpenModal?

OpenModal is a community-driven platform that tracks AI's real-world impact on jobs and capabilities. Unlike generic AI information sites, OpenModal's value comes from **unique, crowdsourced data** that AI cannot replicate.

### The AI-Proof Formula

```
Capabilities + Jobs + Technologies = Information (AI can do this)

+ Impact Reports + Discussions = Unique Value (AI cannot do this)
```

### What's New in v3.0

| Change                      | Why                                                                   |
| --------------------------- | --------------------------------------------------------------------- |
| **Capability Subtypes**     | Track domain-specific progress (Medical Reasoning vs Legal Reasoning) |
| **Derived Relationships**   | Remove redundant job↔technology, job↔capability tables                |
| **Simplified Reports**      | Story-first, instant publish, community enrichment                    |
| **No Moderator Bottleneck** | Reports publish immediately, flagging for bad content                 |

### Core Value Proposition

| What AI Can Tell You            | What OpenModal Provides                                    |
| ------------------------------- | ---------------------------------------------------------- |
| Generic automation risk         | Real deployment reports from workers                       |
| General capability descriptions | Domain-specific progress tracking                          |
| List of AI companies            | Structured org → technology → capability → job connections |
| Opinion on job safety           | Worker stories, geographic specifics, timeline evidence    |

### Target Users

| User              | Why They Need OpenModal                                 |
| ----------------- | ------------------------------------------------------- |
| Workers           | Verified data for career decisions, not just AI opinion |
| Career Counselors | Defensible, sourced data for client advice              |
| Journalists       | Real cases, quotes, verifiable claims                   |
| Researchers       | Structured datasets with domain-level insights          |
| Policy Makers     | Evidence-based insights by industry                     |
| AI Companies      | Sponsorship visibility, community feedback              |

---

## 2. Core Philosophy

### AI-Proof Principles

1. **Unique Data Over Information** — Anyone can ask ChatGPT about AI capabilities. OpenModal's value is crowdsourced, verified, real-world data.

2. **Connections Are The Value** — Linking Organizations → Technologies → Capability Subtypes → Tasks → Jobs → Impact Reports creates insight AI can't replicate.

3. **Community Verification** — Multiple sources, reputation stakes, and community enrichment create trustworthy data.

4. **Worker Perspective** — Corporate PR says one thing, workers on the ground know the truth.

### Platform Principles

1. **Simple Over Complex** — Every feature must justify its existence
2. **Quality Over Quantity** — 50 good jobs > 500 bad ones
3. **Ship Then Iterate** — Launch imperfect, improve based on real usage
4. **Revenue-Aware** — Every feature should support monetization path
5. **No Bottlenecks** — Don't require moderator approval for everything

---

## 3. Entity Structure

### Complete Entity Map

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ORGANIZATION ──────────────────┐                              │
│  (Anthropic, OpenAI, etc.)      │                              │
│  [Admin-only, Sponsorship]      │                              │
│           │                     │                              │
│           │ has many            │                              │
│           ▼                     │                              │
│  TECHNOLOGY ◄───────────────────┘                              │
│  (Claude, GPT-4, Atlas)                                        │
│  [User-submitted, Approved]                                    │
│           │                                                    │
│           │ demonstrates (via subtypes)                        │
│           ▼                                                    │
│  CAPABILITY ────────────► CAPABILITY_SUBTYPE                   │
│  (Reasoning, Image        (Medical Reasoning,                  │
│   Recognition)             Legal Reasoning)                    │
│  [Admin-only]              [Admin-only]                        │
│                                   │                            │
│                                   │ required by                │
│                                   ▼                            │
│                               TASK ◄──────────── JOB           │
│                           (Analyze X-rays,    (Radiologist,    │
│                            Write reports)      Writer)         │
│                                                [Admin-only]    │
│                                   │                            │
│                                   │                            │
│                                   ▼                            │
│                           IMPACT REPORT                        │
│                       (Real-world evidence)                    │
│                    [User-submitted, Instant Publish]           │
│                                   │                            │
│                    ┌──────────────┴──────────────┐            │
│                    ▼                             ▼             │
│           REPORT_ENRICHMENT              REPORT_FLAG           │
│         (Community adds data)          (Community flags)       │
│                                                                │
│                           DISCUSSION                           │
│                      (Community threads)                       │
│                      [Open, Post-moderated]                    │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

### Entity Summary

| Entity             | Purpose                                 | Created By | Approval           |
| ------------------ | --------------------------------------- | ---------- | ------------------ |
| Organization       | Groups technologies, sponsorship target | Admin      | —                  |
| Technology         | Specific AI products/tools              | Users      | ✅ Required        |
| Capability         | Broad AI ability categories             | Admin      | —                  |
| Capability Subtype | Domain-specific capabilities            | Admin      | —                  |
| Job                | Occupation automation risk              | Admin      | —                  |
| Task               | Atomic work units within jobs           | Admin      | —                  |
| Impact Report      | Real-world worker stories               | Users      | ❌ Instant Publish |
| Report Enrichment  | Community-added structured data         | Users      | Post-moderated     |
| Discussion         | Community conversation                  | Users      | Post-moderated     |

---

## 4. Entity Specifications

### 4.1 Organization

**Purpose:** Companies/labs building AI — sponsorship targets

```
Organization
├── Core Info
│   ├── id: uuid
│   ├── name: string
│   ├── slug: string (unique)
│   ├── types: enum[] (can have multiple)
│   │   ├── ai_lab
│   │   ├── robotics
│   │   ├── enterprise_software
│   │   ├── startup
│   │   └── research_institution
│   ├── description: text (2-3 sentences)
│   ├── website: url
│   ├── logo: image_url
│   └── founded_year: number (optional)
│
├── Sponsorship
│   ├── is_sponsor: boolean
│   ├── sponsor_tier: enum (none | bronze | silver | gold)
│   ├── is_claimed: boolean
│   └── verified_badge: boolean
│
├── Connections (derived)
│   ├── technologies: Technology[]
│   ├── capability_subtypes: CapabilitySubtype[] (via technologies)
│   └── impact_reports: ImpactReport[] (via technologies)
│
├── Meta
│   ├── created_at: timestamp
│   └── updated_at: timestamp
│
└── Community
    └── discussions: Discussion[]
```

**Sponsor Tiers:**

| Tier   | Price   | Benefits                             |
| ------ | ------- | ------------------------------------ |
| None   | $0      | Listed, can be discussed             |
| Bronze | $100/mo | Verified badge, can post updates     |
| Silver | $250/mo | + Featured in category, analytics    |
| Gold   | $500/mo | + Homepage feature, priority support |

---

### 4.2 Technology

**Purpose:** Specific AI products, models, robots — links orgs to capability subtypes

```
Technology
├── Core Info
│   ├── id: uuid
│   ├── name: string
│   ├── slug: string (unique)
│   ├── type: enum
│   │   ├── ai_model
│   │   ├── robot
│   │   ├── software
│   │   ├── hardware
│   │   └── api
│   ├── description: text (2-3 sentences)
│   ├── image: image_url
│   └── website: url (optional)
│
├── Organization
│   └── organization_id: uuid → Organization
│
├── Status
│   ├── stage: enum (research | pilot | deployed | discontinued)
│   ├── release_date: date (optional)
│   └── last_updated: timestamp
│
├── Connections
│   └── capability_subtypes: CapabilitySubtype[] (via technology_capability_subtype)
│
│   # DERIVED (not stored):
│   # → jobs_affected: derived via capability_subtype → task → job chain
│   # → impact_reports: via report_enrichment linking
│
├── Submission
│   ├── status: enum (pending | approved | rejected)
│   ├── submitted_by: user_id
│   ├── submitted_at: timestamp
│   ├── reviewed_by: user_id (nullable)
│   ├── reviewed_at: timestamp (nullable)
│   └── rejection_reason: text (nullable)
│
├── Duplicate Prevention
│   ├── aliases: string[] (alternative names)
│   └── merged_into_id: uuid (nullable)
│
├── Meta
│   ├── created_at: timestamp
│   └── updated_at: timestamp
│
└── Community
    └── discussions: Discussion[]
```

**REMOVED:**

- ~~technology_job~~ — Now derived from capability chain
- ~~technology_capability~~ — Replaced with technology_capability_subtype

---

### 4.3 Capability (Parent)

**Purpose:** Broad categories of what AI can/can't do

```
Capability
├── Core Info
│   ├── id: uuid
│   ├── name: string (e.g., "Reasoning", "Image Recognition")
│   ├── slug: string (unique)
│   ├── category: enum
│   │   ├── physical
│   │   ├── cognitive
│   │   ├── social
│   │   └── meta
│   ├── description: text (2-3 sentences)
│   └── icon: string (optional)
│
├── Connections
│   └── subtypes: CapabilitySubtype[] (one-to-many)
│
├── Meta
│   ├── created_at: timestamp
│   └── updated_at: timestamp
│
└── Community
    └── discussions: Discussion[]
```

**Note:** Progress tracking moved to subtypes. Parent capability can show aggregate/average.

---

### 4.4 Capability Subtype (NEW)

**Purpose:** Domain-specific capabilities with individual progress tracking

```
CapabilitySubtype
├── Core Info
│   ├── id: uuid
│   ├── capability_id: uuid → Capability (parent)
│   ├── name: string (e.g., "Medical Reasoning", "Legal Reasoning")
│   ├── slug: string (unique)
│   ├── domain: string (e.g., "healthcare", "legal", "finance", "technology")
│   └── description: text (2-3 sentences)
│
├── Progress Tracking
│   ├── progress_percentage: number (0-100)
│   ├── status: enum (solved | partial | unsolved)
│   ├── what_works: string[]
│   ├── what_struggles: string[]
│   └── what_doesnt_work: string[]
│
├── Connections (derived)
│   ├── technologies: Technology[] (via technology_capability_subtype)
│   ├── tasks: Task[] (via task_capability_subtype)
│   └── jobs: Job[] (via tasks)
│
├── Meta
│   ├── created_at: timestamp
│   └── updated_at: timestamp
│
└── Community
    └── discussions: Discussion[]
```

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

### 4.5 Job

**Purpose:** Occupations and their automation risk (derived from tasks)

```
Job
├── Core Info
│   ├── id: uuid
│   ├── name: string
│   ├── slug: string (unique)
│   ├── category: enum
│   │   ├── healthcare
│   │   ├── technology
│   │   ├── trades
│   │   ├── service
│   │   ├── creative
│   │   ├── finance
│   │   ├── education
│   │   ├── legal
│   │   ├── manufacturing
│   │   └── other
│   ├── description: text (2-3 sentences)
│   └── icon: string (optional)
│
├── Risk Assessment
│   ├── automation_risk_percentage: number (0-100, calculated from tasks)
│   ├── risk_level: enum (low | medium | high | critical)
│   ├── timeline_estimate: string ("5-10 years", "unlikely", etc.)
│   └── confidence: enum (low | medium | high)
│
├── Task Breakdown
│   └── tasks: Task[] (one-to-many)
│
├── Connections (DERIVED - not stored)
│   # → capability_subtypes: derived from tasks
│   # → technologies: derived from capability_subtypes
│   # → impact_reports: via report_enrichment
│
├── Meta
│   ├── created_at: timestamp
│   └── updated_at: timestamp
│
└── Community
    └── discussions: Discussion[]
```

**REMOVED:**

- ~~job_capability~~ — Now derived from task → capability_subtype chain
- ~~technologies_threatening~~ — Now derived from capability chain

---

### 4.6 Task

**Purpose:** Atomic work units within a job, linked to capability subtypes

```
Task
├── Core Info
│   ├── id: uuid
│   ├── job_id: uuid → Job
│   ├── name: string (e.g., "Analyze X-ray images")
│   ├── percentage_of_job: number (0-100, should sum to 100 per job)
│   ├── automatable: enum (yes | partial | no)
│   └── reason: text (why this assessment)
│
├── Capability Requirements
│   └── capability_subtypes: CapabilitySubtype[] (via task_capability_subtype)
│       Each with:
│       ├── importance: enum (critical | important | minor)
│       ├── minimum_level_required: number (0-100, what progress % needed)
│       └── notes: text (why this subtype matters for this task)
│
├── Meta
│   ├── created_at: timestamp
│   └── updated_at: timestamp
```

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

### 4.7 Impact Report (SIMPLIFIED)

**Purpose:** Real-world worker stories — THE MOAT

**Philosophy:** Low friction for users, instant publish, community enrichment for structure.

```
ImpactReport
├── Required Fields (3 fields minimum!)
│   ├── id: uuid
│   ├── job_title: string (freetext - what they call their job)
│   ├── description: text (their story, 100+ chars)
│   └── impact_type: enum
│       ├── layoffs
│       ├── reduced_hours
│       ├── role_change
│       ├── new_tools (AI assists but doesn't replace)
│       ├── productivity_boost
│       └── no_change
│
├── Optional Fields (user can skip all)
│   ├── location: string (city, state)
│   ├── country: string
│   ├── company_name: string
│   ├── company_size: enum (1-10 | 11-50 | 51-200 | 201-1000 | 1000+)
│   ├── technology_description: string (freetext - "some chatbot", "robot arms")
│   ├── workers_affected_count: number
│   ├── event_date: date
│   └── source_url: url (news link if available)
│
├── Submitter
│   ├── submitted_by: user_id
│   ├── is_anonymous: boolean
│   └── reporter_relationship: enum (optional)
│       ├── employee
│       ├── former_employee
│       ├── manager
│       ├── witness
│       ├── news
│       └── researcher
│
├── Status (NO PENDING!)
│   └── status: enum (published | flagged | removed)
│
├── Engagement
│   ├── upvotes: number
│   └── view_count: number
│
├── Community Data (via report_enrichment)
│   └── enrichments: ReportEnrichment[]
│
├── Meta
│   ├── created_at: timestamp
│   └── updated_at: timestamp
│
└── Community
    └── discussions: Discussion[]
```

**REMOVED:**

- ~~status: pending~~ — Reports publish immediately
- ~~technology_id~~ — Technology linked via enrichment
- ~~job_id~~ — Job linked via enrichment
- ~~capabilities_demonstrated~~ — Via enrichment
- ~~reviewed_by, reviewed_at~~ — No approval workflow

---

### 4.8 Report Enrichment (NEW)

**Purpose:** Community-added structured data linking reports to entities

```
ReportEnrichment
├── Core Info
│   ├── id: uuid
│   ├── report_id: uuid → ImpactReport
│   ├── user_id: uuid → User (who added this)
│   └── created_at: timestamp
│
├── Link Type
│   ├── enrichment_type: enum
│   │   ├── job_link
│   │   ├── technology_link
│   │   ├── task_link
│   │   └── capability_subtype_link
│   │
│   ├── linked_entity_id: uuid (optional - if entity exists in system)
│   └── suggested_name: string (freetext if entity doesn't exist yet)
│
├── Confidence
│   ├── confidence: enum (certain | likely | guess)
│   └── notes: text (optional)
│
└── Voting
    ├── upvotes: number
    └── downvotes: number
```

**How It Works:**

1. User submits simple report (3 fields)
2. Report publishes immediately
3. Community members add enrichments:
   - "This is about Customer Service Rep job" (job_link)
   - "They're using ChatGPT" (technology_link)
   - "This affects 'Answer customer questions' task" (task_link)
4. Others vote on accuracy
5. High-voted enrichments become trusted links

---

### 4.9 Report Flag (NEW)

**Purpose:** Community flagging for moderation

```
ReportFlag
├── Core Info
│   ├── id: uuid
│   ├── report_id: uuid → ImpactReport
│   ├── user_id: uuid → User
│   └── created_at: timestamp
│
├── Flag Details
│   ├── reason: enum
│   │   ├── spam
│   │   ├── fake
│   │   ├── duplicate
│   │   ├── inappropriate
│   │   └── other
│   └── notes: text (optional)
```

**Auto-Moderation:**

- 3+ flags → auto-hide report, notify moderator
- Moderator only handles flagged content (reactive, not proactive)

---

### 4.10 Discussion

**Purpose:** Reddit-style threaded conversations on any entity

```
Discussion
├── Core Info
│   ├── id: uuid
│   ├── title: string (for top-level threads)
│   ├── body: text
│   └── is_top_level: boolean
│
├── Attachment
│   ├── entity_type: enum (organization | technology | capability | capability_subtype | job | impact_report)
│   └── entity_id: uuid
│
├── Threading
│   ├── parent_id: uuid (nullable — for replies)
│   └── depth: number (0, 1, 2 — max 3 levels)
│
├── Author
│   ├── user_id: uuid
│   └── is_anonymous: boolean
│
├── Engagement
│   ├── upvotes: number
│   ├── downvotes: number
│   └── reply_count: number
│
├── Moderation
│   ├── is_deleted: boolean
│   ├── deleted_by: user_id (nullable)
│   └── delete_reason: string (nullable)
│
└── Meta
    ├── created_at: timestamp
    └── updated_at: timestamp
```

---

### 4.11 Suggestion

**Purpose:** User suggestions for admin-only entities

```
Suggestion
├── Core Info
│   ├── id: uuid
│   ├── type: enum (job | capability | capability_subtype | organization)
│   ├── suggested_name: string
│   ├── reason: text (why should we add this?)
│   └── additional_info: text (optional)
│
├── Submitter
│   ├── user_id: uuid (nullable)
│   └── email: string (optional, for follow-up)
│
├── Status
│   ├── status: enum (pending | accepted | rejected)
│   ├── reviewed_by: user_id (nullable)
│   ├── reviewed_at: timestamp (nullable)
│   └── response: text (nullable)
│
└── Meta
    ├── created_at: timestamp
    └── updated_at: timestamp
```

---

## 5. Relationships & Connections

### Visual Map

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
└─────────────────────────────────────────────────────────────────────┘
```

### Junction Tables

| Junction Table                | From       | To                | Extra Fields                              |
| ----------------------------- | ---------- | ----------------- | ----------------------------------------- |
| technology_capability_subtype | Technology | CapabilitySubtype | performance_score (0-100)                 |
| task_capability_subtype       | Task       | CapabilitySubtype | importance, minimum_level_required, notes |

### Derived Relationships (No Tables Needed)

| Query                          | Derived Via                                  |
| ------------------------------ | -------------------------------------------- |
| Technology → Jobs affected     | technology → capability_subtype → task → job |
| Job → Technologies threatening | job → task → capability_subtype → technology |
| Job → Capabilities needed      | job → task → capability_subtype → capability |
| Capability progress by domain  | capability → subtype (group by domain)       |

### Example Queries

**Technologies affecting a job:**

```sql
SELECT DISTINCT t.*
FROM technology t
JOIN technology_capability_subtype tcs ON t.id = tcs.technology_id
JOIN capability_subtype cs ON tcs.capability_subtype_id = cs.id
JOIN task_capability_subtype taskcs ON cs.id = taskcs.capability_subtype_id
JOIN task ON taskcs.task_id = task.id
WHERE task.job_id = 'target_job_id'
```

**Capability progress by industry:**

```sql
SELECT
  cs.domain,
  c.name as capability,
  AVG(cs.progress_percentage) as avg_progress
FROM capability_subtype cs
JOIN capability c ON cs.capability_id = c.id
GROUP BY cs.domain, c.id
ORDER BY cs.domain, avg_progress DESC
```

**Jobs at risk (calculated from tasks):**

```sql
SELECT
  j.name,
  SUM(
    t.percentage_of_job *
    CASE
      WHEN MIN(cs.progress_percentage) >= tcs.minimum_level_required THEN 1.0
      WHEN MIN(cs.progress_percentage) >= tcs.minimum_level_required * 0.7 THEN 0.5
      ELSE 0.0
    END
  ) as automatable_percentage
FROM job j
JOIN task t ON t.job_id = j.id
JOIN task_capability_subtype tcs ON tcs.task_id = t.id
JOIN capability_subtype cs ON tcs.capability_subtype_id = cs.id
GROUP BY j.id
ORDER BY automatable_percentage DESC
```

---

## 6. Impact Reports & Community Enrichment

### The Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    IMPACT REPORT FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  STEP 1: User Submits (30 seconds)                             │
│  ┌─────────────────────────────────────┐                       │
│  │ Your job: [Customer Service Rep  ]  │                       │
│  │                                     │                       │
│  │ What happened?                      │                       │
│  │ [They added AI chatbot, team went  ]│                       │
│  │ [from 50 to 30 people...           ]│                       │
│  │                                     │                       │
│  │ Impact: ○ Layoffs ○ Role change... │                       │
│  │                                     │                       │
│  │ [Publish Story]                     │                       │
│  └─────────────────────────────────────┘                       │
│           │                                                     │
│           ▼                                                     │
│  STEP 2: Instant Publish                                       │
│  Report goes live immediately (no approval!)                   │
│           │                                                     │
│           ▼                                                     │
│  STEP 3: Community Enrichment (async)                          │
│  ┌─────────────────────────────────────┐                       │
│  │ 🏷️ Community Tags:                  │                       │
│  │ ┌─────────────────────────────────┐ │                       │
│  │ │ 💼 Job: Customer Service (▲12)  │ │                       │
│  │ │ 🤖 Tech: ChatGPT (▲8)           │ │                       │
│  │ │ ⚡ Task: Handle inquiries (▲5)  │ │                       │
│  │ └─────────────────────────────────┘ │                       │
│  │ [+ Add Tag]                         │                       │
│  └─────────────────────────────────────┘                       │
│           │                                                     │
│           ▼                                                     │
│  STEP 4: Trust Signals                                         │
│  ┌─────────────────────────────────────┐                       │
│  │ ✓ Verified email                    │                       │
│  │ ✓ Completed onboarding              │                       │
│  │ ★ Trusted contributor (500+ rep)    │                       │
│  │ 🏷️ 3 enrichments (high agreement)   │                       │
│  └─────────────────────────────────────┘                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Works

| Old Approach                       | New Approach               | Benefit                    |
| ---------------------------------- | -------------------------- | -------------------------- |
| Moderator approves every report    | Instant publish + flagging | Scales without bottleneck  |
| Complex form (10+ fields)          | 3 required fields          | Higher submission rate     |
| Fixed entity links                 | Community enrichment       | Crowdsourced accuracy      |
| Binary quality (approved/rejected) | Trust signals              | Users judge for themselves |

### Enrichment Permissions

| User Tier   | Can Add Enrichments | Enrichment Weight |
| ----------- | ------------------- | ----------------- |
| Observer    | ❌ No               | —                 |
| Contributor | ✅ Yes              | 1x                |
| Trusted     | ✅ Yes              | 2x                |
| Expert      | ✅ Yes              | 3x                |

### Flagging Thresholds

| Flags            | Action                          |
| ---------------- | ------------------------------- |
| 1-2              | Visible, tracked                |
| 3+               | Auto-hidden, moderator notified |
| Moderator review | Remove or restore               |

---

## 7. Moderation System

### Overview

| Entity             | Created By | Approval  | Moderation Type                |
| ------------------ | ---------- | --------- | ------------------------------ |
| Organization       | Admin only | —         | Trusted                        |
| Technology         | Users      | ✅ Yes    | Pre-moderation                 |
| Capability         | Admin only | —         | Trusted                        |
| Capability Subtype | Admin only | —         | Trusted                        |
| Job                | Admin only | —         | Trusted                        |
| Task               | Admin only | —         | Trusted                        |
| **Impact Report**  | Users      | ❌ **No** | **Post-moderation (flagging)** |
| Report Enrichment  | Users      | ❌ No     | Community voting               |
| Discussion         | Users      | ❌ No     | Post-moderation                |
| Suggestion         | Users      | —         | Review queue                   |

### Moderator Workload Comparison

**Before (v2.0):**

```
Every impact report → Moderator reviews → Approve/Reject
Bottleneck! Can't scale beyond ~50 reports/day
```

**After (v3.0):**

```
Impact report → Publish immediately
Bad content → Community flags → Moderator only sees flagged
Scales to 1000+ reports/day
```

### Technology Submission Flow (Still Requires Approval)

```
User submits technology
     ↓
  PENDING ──────► Moderator reviews
     │                  │
     │           ┌──────┴──────┐
     │           ↓             ↓
     │       APPROVED      REJECTED
     │           │             │
     │           ↓             ↓
     │       Public        Notified
     │       visible       with reason
     │
     └──► Submitter can see in dashboard
```

---

## 8. Duplicate Management

### Three-Layer Prevention

#### Layer 1: Pre-Submit Check (UX)

```
User types: "Claude 3.5"
     ↓
┌─────────────────────────────────────────────────────────────┐
│  Similar technologies already exist:                        │
│                                                             │
│  • Claude 3.5 Sonnet (Anthropic) ✓ Approved                │
│  • Claude 3.5 Opus (Anthropic) ✓ Approved                  │
│                                                             │
│  Is yours one of these?                                    │
│  [Yes, view existing]  [No, mine is different]             │
└─────────────────────────────────────────────────────────────┘
```

#### Layer 2: Moderator Merge Tool

```
Moderator sees duplicate:
├── [Approve] — It's genuinely new
├── [Reject] — With reason
└── [Merge] — Into existing technology
    └── Copies useful info, rejects submission
    └── Notifies submitter with link to existing
```

#### Layer 3: Aliases

```
Technology: Claude 3.5 Sonnet
├── Primary name: "Claude 3.5 Sonnet"
└── Aliases: ["Claude Sonnet 3.5", "Sonnet 3.5"]
    └── All aliases work in search
```

---

## 9. Reward System

### Points Table

| Action                                 | Points | Notes                                |
| -------------------------------------- | ------ | ------------------------------------ |
| Complete onboarding                    | +20    | One-time                             |
| Submit Technology (approved)           | +25    | Per approval                         |
| Submit Impact Report                   | +15    | Per submission (no approval needed!) |
| Impact Report gets 10+ upvotes         | +15    | Bonus for quality                    |
| Add Report Enrichment (high agreement) | +10    | Net upvotes > 5                      |
| Suggest Job/Capability (used)          | +10    | If admin creates it                  |
| Start Discussion                       | +5     | Per thread                           |
| Reply in Discussion                    | +3     | Per reply                            |
| Receive upvote                         | +1     | Per upvote                           |
| Flag confirmed as valid                | +5     | Helped moderate                      |

### Quality Multipliers

```
Base points × multipliers = Final points

Multipliers:
├── Has source link: ×1.2
├── Gets 10+ upvotes: ×1.3
├── Featured on homepage: ×2.0
└── First to report breaking news: ×1.5

Example:
Impact Report: +15 × 1.2 × 1.3 = +23 points
```

### Anti-Gaming Protections

| Protection           | Implementation                        |
| -------------------- | ------------------------------------- |
| Daily submission cap | Max 5 per day                         |
| Cooldown             | 1 hour between submissions            |
| Flag penalty         | False flags → -5 points               |
| Upvote fraud         | Can't self-upvote, rate limits        |
| New user gate        | Must be Contributor (50pts) to enrich |

---

## 10. User Tiers & Permissions

### Tier Breakdown

| Tier            | Points   | Permissions                                           |
| --------------- | -------- | ----------------------------------------------------- |
| **Observer**    | 0-49     | View, upvote, discuss, submit reports                 |
| **Contributor** | 50-499   | + Submit technologies, add enrichments                |
| **Trusted**     | 500-1999 | + Priority review, flag content, 2x enrichment weight |
| **Expert**      | 2000+    | + 3x enrichment weight, verify others                 |
| **Moderator**   | Invited  | Full admin access                                     |

### Key Change from v2.0

**Before:** Observers couldn't submit impact reports
**After:** Anyone can submit impact reports (low friction!)

### Progression Path

```
New user signs up
     ↓
Observer (can discuss, upvote, submit reports!)
     ↓
Completes onboarding: +20 points
     ↓
Submits impact reports: +15, +15...
     ↓
Participates in discussions: +5, +3, +1...
     ↓
Hits 50 points → CONTRIBUTOR
     ↓
Can now submit Technologies + Add Enrichments
     ↓
Approved submissions: +25, +25...
     ↓
Hits 500 points → TRUSTED
     ↓
Higher enrichment weight, can flag
     ↓
Consistent quality contributions
     ↓
Invited → MODERATOR
```

### Badges (Optional Gamification)

| Badge                  | Requirement                        |
| ---------------------- | ---------------------------------- |
| 🚀 First Story         | Submit first impact report         |
| 📰 Reporter            | 5 impact reports with 10+ upvotes  |
| 🔬 Tech Hunter         | 10 approved technologies           |
| 💬 Conversationalist   | 50 discussion replies              |
| ⭐ Quality Contributor | 5 submissions with 10+ upvotes     |
| 🏢 Industry Insider    | Verified works in relevant field   |
| 🎯 Early Adopter       | Joined in first month              |
| 🏷️ Enricher            | 20 enrichments with positive votes |
| 🛡️ Moderator           | Trusted community guardian         |

---

## 11. Feature Phases

### Phase 1: Foundation (Week 1-2)

```
□ Schema Migration
  ├── Add capability_subtype table
  ├── Add technology_capability_subtype junction
  ├── Add task_capability_subtype junction
  ├── Remove technology_job
  ├── Remove job_capability
  └── Remove technology_capability

□ Update existing pages
  ├── Capability pages show subtypes
  ├── Job pages derive capabilities from tasks
  └── Technology pages derive job impact
```

### Phase 2: Simplified Reports (Week 3-4)

```
□ New Impact Report system
  ├── 3-field submission form
  ├── Instant publish (no approval)
  ├── Report detail page with trust signals
  └── Report feed on homepage

□ Report Enrichment system
  ├── Add enrichment UI
  ├── Enrichment voting
  └── Reputation requirements

□ Flagging system
  ├── Flag button on reports
  ├── Auto-hide threshold
  └── Moderator flag queue
```

### Phase 3: Data Migration (Week 5-6)

```
□ Migrate existing data
  ├── Convert capabilities to subtypes
  ├── Link tasks to subtypes
  ├── Update impact reports (remove approval status)
  └── Backfill enrichments from old links

□ Seed domain-specific subtypes
  ├── Healthcare domain
  ├── Legal domain
  ├── Finance domain
  └── Technology domain
```

### Phase 4: Polish & Launch (Week 7-8)

```
□ Industry Reports
  ├── Capability progress by domain
  ├── Job risk by industry
  └── Technology impact by sector

□ Launch preparation
  ├── Test all flows
  ├── Seed more content
  └── Soft launch on Reddit
```

### Phase 5: Monetization (Week 9+)

```
□ Sponsorship system
  ├── Organization claiming flow
  ├── Sponsor tiers
  └── Payment integration
```

---

## 12. Tech Architecture

### Database Schema Summary

```
Core Tables:
├── organizations
├── technologies
├── capabilities
├── capability_subtypes (NEW)
├── jobs
├── tasks
├── impact_reports (SIMPLIFIED)
├── report_enrichments (NEW)
├── report_flags (NEW)
├── discussions
├── suggestions
├── users
├── user_reputations
└── user_badges

Junction Tables:
├── technology_capability_subtype (NEW - replaces technology_capability)
└── task_capability_subtype (NEW - replaces task_capability)

REMOVED:
├── technology_job
├── job_capability
├── technology_capability
└── task_capability
└── impact_report_capability
```

### Two-App Strategy

```
openmodal.ai (NextJS - existing)
├── Public pages
│   ├── Homepage (AGI Dashboard)
│   ├── Capabilities (with subtypes!)
│   ├── Jobs (derived capabilities)
│   ├── Technologies (derived job impact)
│   ├── Impact Reports (instant publish)
│   └── Discussions
├── User features
│   ├── Auth + onboarding
│   ├── Submit content
│   ├── Add enrichments
│   ├── User dashboard
│   └── Notifications
└── Keep existing, avoid breaking changes

admin.openmodal.ai (TanStack Start - new)
├── Moderator features
│   ├── Technology queue (still needs approval)
│   ├── Flagged reports queue
│   └── Content management
├── Admin features
│   ├── Capability/subtype management
│   ├── User management
│   ├── Analytics
│   └── Sponsor management
└── Fresh start, better DX
```

---

## 13. What We Dropped

### Intentionally Removed in v3.0

| Feature                     | Original Purpose             | Why Dropped                           |
| --------------------------- | ---------------------------- | ------------------------------------- |
| technology_job table        | Direct tech→job links        | Derived from capability chain         |
| job_capability table        | Direct job→capability links  | Derived from tasks                    |
| technology_capability table | Tech→capability links        | Replaced with subtype version         |
| Impact report approval      | Quality control              | Instant publish + flagging            |
| impact_report_capability    | Link reports to capabilities | Replaced with enrichments             |
| Complex report form         | Capture all data             | 3-field minimum, enrichment adds rest |

### Previously Removed (v2.0)

| Feature              | Why Dropped                       |
| -------------------- | --------------------------------- |
| Geographic Map       | Expensive, add later if revenue   |
| Research Activities  | Too complex, hard to maintain     |
| Expert Forecasts     | Hard to get, start with community |
| Complex Verification | Start simple: trust signals       |

### Can Add Later

| Feature                           | Add When                |
| --------------------------------- | ----------------------- |
| AI-powered enrichment suggestions | Revenue > $500/mo       |
| Geographic map                    | Revenue > $500/mo       |
| Expert verification program       | 1000+ users             |
| API for researchers               | Demand validated        |
| Job board integration             | Partnership opportunity |

---

## 14. Migration Guide

### Database Changes

#### Step 1: Add New Tables

```sql
-- Capability Subtype
CREATE TABLE capability_subtype (
  id TEXT PRIMARY KEY,
  capability_id TEXT REFERENCES capability(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  description TEXT NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  status capability_status NOT NULL,
  what_works TEXT[] DEFAULT '{}',
  what_struggles TEXT[] DEFAULT '{}',
  what_doesnt_work TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Technology ↔ Capability Subtype
CREATE TABLE technology_capability_subtype (
  id TEXT PRIMARY KEY,
  technology_id TEXT REFERENCES technology(id) ON DELETE CASCADE,
  capability_subtype_id TEXT REFERENCES capability_subtype(id) ON DELETE CASCADE,
  performance_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Task ↔ Capability Subtype
CREATE TABLE task_capability_subtype (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES task(id) ON DELETE CASCADE,
  capability_subtype_id TEXT REFERENCES capability_subtype(id) ON DELETE CASCADE,
  importance importance_level NOT NULL,
  minimum_level_required INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Report Enrichment
CREATE TABLE report_enrichment (
  id TEXT PRIMARY KEY,
  report_id TEXT REFERENCES impact_report(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  enrichment_type TEXT NOT NULL, -- job_link, technology_link, task_link, capability_subtype_link
  linked_entity_id TEXT,
  suggested_name TEXT,
  confidence TEXT NOT NULL, -- certain, likely, guess
  notes TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Report Flag
CREATE TABLE report_flag (
  id TEXT PRIMARY KEY,
  report_id TEXT REFERENCES impact_report(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  reason TEXT NOT NULL, -- spam, fake, duplicate, inappropriate, other
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Step 2: Modify Impact Report

```sql
-- Add new columns
ALTER TABLE impact_report ADD COLUMN job_title TEXT;
ALTER TABLE impact_report ADD COLUMN technology_description TEXT;
ALTER TABLE impact_report ADD COLUMN reporter_relationship TEXT;
ALTER TABLE impact_report ADD COLUMN view_count INTEGER DEFAULT 0;

-- Make technology_id optional (was required)
ALTER TABLE impact_report ALTER COLUMN technology_id DROP NOT NULL;

-- Change status enum (remove 'pending')
-- Note: Migrate existing 'pending' to 'published' first
UPDATE impact_report SET status = 'published' WHERE status = 'pending';
```

#### Step 3: Drop Old Tables

```sql
-- After migrating data
DROP TABLE technology_job;
DROP TABLE job_capability;
DROP TABLE technology_capability;
DROP TABLE task_capability;
DROP TABLE impact_report_capability;
```

### Data Migration

1. **Capabilities → Subtypes**: Convert existing capabilities with domain info to subtypes
2. **technology_capability → technology_capability_subtype**: Migrate with subtype mapping
3. **task_capability → task_capability_subtype**: Migrate with subtype mapping
4. **impact_report_capability → report_enrichment**: Convert to enrichment format
5. **Pending reports**: Change status to 'published'

---

## Quick Reference

### Entity Creation Summary

| Entity             | Who Creates     | Approval    | User Can Suggest |
| ------------------ | --------------- | ----------- | ---------------- |
| Organization       | Admin           | —           | ✅ Yes           |
| Technology         | Users           | ✅ Required | —                |
| Capability         | Admin           | —           | ✅ Yes           |
| Capability Subtype | Admin           | —           | ✅ Yes           |
| Job                | Admin           | —           | ✅ Yes           |
| Task               | Admin           | —           | ✅ Yes           |
| Impact Report      | Users           | ❌ Instant  | —                |
| Report Enrichment  | Users (50+ pts) | ❌ Voting   | —                |
| Discussion         | Users           | Post-mod    | —                |

### The Value Formula

```
Static Info (AI can replicate):
├── Capabilities & Subtypes
├── Jobs & Tasks
└── Technologies

+ Unique Data (AI cannot replicate):
├── Impact Reports (worker stories)
├── Report Enrichments (community links)
└── Discussions (community perspective)

= OpenModal's Moat
```

### Key Metrics to Track

| Metric                        | Why It Matters           |
| ----------------------------- | ------------------------ |
| Reports submitted/day         | User engagement          |
| Time to first enrichment      | Community health         |
| Enrichment agreement rate     | Data quality             |
| Flag accuracy rate            | Moderation effectiveness |
| Capability progress by domain | Core product value       |

---

**Document Version:** 3.0
**Last Updated:** January 2025
**Status:** Ready for implementation
