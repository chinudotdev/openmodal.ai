# OpenModal — Complete Restructure Document

**Version:** 2.0
**Date:** January 2025
**Purpose:** Comprehensive documentation of restructured platform

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Core Philosophy](#2-core-philosophy)
3. [Entity Structure](#3-entity-structure)
4. [Entity Specifications](#4-entity-specifications)
5. [Relationships & Connections](#5-relationships--connections)
6. [Moderation System](#6-moderation-system)
7. [Duplicate Management](#7-duplicate-management)
8. [Reward System](#8-reward-system)
9. [User Tiers & Permissions](#9-user-tiers--permissions)
10. [Feature Phases](#10-feature-phases)
11. [Tech Architecture](#11-tech-architecture)
12. [What We Dropped](#12-what-we-dropped)

---

## 1. Executive Summary

### What is OpenModal?

OpenModal is a community-driven platform that tracks AI's real-world impact on jobs and capabilities. Unlike generic AI information sites, OpenModal's value comes from **unique, crowdsourced data** that AI cannot replicate.

### The AI-Proof Formula

```
Capabilities + Jobs + Technologies = Information (AI can do this)

+ Impact Reports + Discussions = Unique Value (AI cannot do this)
```

### Core Value Proposition

| What AI Can Tell You | What OpenModal Provides |
|----------------------|-------------------------|
| Generic automation risk | Real deployment reports from workers |
| General capability descriptions | Community-verified progress tracking |
| List of AI companies | Structured org → technology → impact connections |
| Opinion on job safety | Geographic specifics, timeline evidence |

### Target Users

| User | Why They Need OpenModal |
|------|-------------------------|
| Workers | Verified data for career decisions, not just AI opinion |
| Career Counselors | Defensible, sourced data for client advice |
| Journalists | Real cases, quotes, verifiable claims |
| Researchers | Structured datasets, not prose |
| Policy Makers | Evidence-based insights |
| AI Companies | Sponsorship visibility, community feedback |

---

## 2. Core Philosophy

### AI-Proof Principles

1. **Unique Data Over Information** — Anyone can ask ChatGPT about AI capabilities. OpenModal's value is crowdsourced, verified, real-world data.

2. **Connections Are The Value** — Linking Organizations → Technologies → Capabilities → Jobs → Impact Reports creates insight AI can't replicate.

3. **Community Verification** — Multiple sources, reputation stakes, and moderation create trustworthy data.

4. **Worker Perspective** — Corporate PR says one thing, workers on the ground know the truth.

### Platform Principles

1. **Simple Over Complex** — Every feature must justify its existence
2. **Quality Over Quantity** — 50 good jobs > 500 bad ones
3. **Ship Then Iterate** — Launch imperfect, improve based on real usage
4. **Revenue-Aware** — Every feature should support monetization path

---

## 3. Entity Structure

### Complete Entity Map

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ORGANIZATION ──────────────────┐                          │
│  (Anthropic, OpenAI, etc.)      │                          │
│  [Admin-only, Sponsorship]      │                          │
│           │                     │                          │
│           │ has many            │                          │
│           ▼                     │                          │
│  TECHNOLOGY ◄───────────────────┘                          │
│  (Claude, GPT-4, Atlas)                                    │
│  [User-submitted, Approved]     │                          │
│           │                     │                          │
│           │ has many            │ threatens                │
│           ▼                     ▼                          │
│  CAPABILITY ◄─────────────► JOB                            │
│  (Language, Dexterity)      (Plumber, Writer)              │
│  [Admin-only]               [Admin-only]                   │
│           │                     │                          │
│           │                     │                          │
│           └──────────┬──────────┘                          │
│                      │                                     │
│                      ▼                                     │
│              IMPACT REPORT                                 │
│              (Real-world evidence)                         │
│              [User-submitted, Approved]                    │
│                      │                                     │
│                      ▼                                     │
│               DISCUSSION                                   │
│              (Community threads)                           │
│              [Open, Post-moderated]                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Entity Summary

| Entity | Purpose | Created By | Approval |
|--------|---------|------------|----------|
| Organization | Groups technologies, sponsorship target | Admin | — |
| Technology | Specific AI products/tools | Users | ✅ Required |
| Capability | What AI can/can't do | Admin | — |
| Job | Occupation automation risk | Admin | — |
| Impact Report | Real-world deployment evidence | Users | ✅ Required |
| Discussion | Community conversation | Users | Post-moderated |

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
│   ├── type: enum
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
│   ├── capabilities: Capability[] (via technologies)
│   └── impact_reports: ImpactReport[] (via technologies)
│
├── Meta
│   ├── created_at: timestamp
│   ├── updated_at: timestamp
│   └── created_by: user_id
│
└── Community
    └── discussions: Discussion[]
```

**Sponsor Tiers:**

| Tier | Price | Benefits |
|------|-------|----------|
| None | $0 | Listed, can be discussed |
| Bronze | $100/mo | Verified badge, can post updates |
| Silver | $250/mo | + Featured in category, analytics |
| Gold | $500/mo | + Homepage feature, priority support |

---

### 4.2 Technology

**Purpose:** Specific AI products, models, robots — links orgs to capabilities

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
│   ├── capabilities: Capability[] (many-to-many)
│   ├── jobs_threatened: Job[] (many-to-many)
│   └── impact_reports: ImpactReport[]
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

---

### 4.3 Capability

**Purpose:** What AI can/can't do — links to jobs it threatens

```
Capability
├── Core Info
│   ├── id: uuid
│   ├── name: string
│   ├── slug: string (unique)
│   ├── category: enum
│   │   ├── physical
│   │   ├── cognitive
│   │   ├── social
│   │   └── meta
│   ├── description: text (2-3 sentences)
│   └── icon: string (optional)
│
├── Status
│   ├── progress_percentage: number (0-100)
│   ├── status: enum (solved | partial | unsolved)
│   └── last_updated: timestamp
│
├── Analysis
│   ├── what_works: string[]
│   ├── what_struggles: string[]
│   └── what_doesnt_work: string[]
│
├── Connections
│   ├── jobs_protected: Job[] (jobs that need this capability)
│   ├── technologies: Technology[] (tech attempting this)
│   └── impact_reports: ImpactReport[]
│
├── Meta
│   ├── created_at: timestamp
│   ├── updated_at: timestamp
│   └── created_by: user_id (admin)
│
└── Community
    └── discussions: Discussion[]
```

---

### 4.4 Job

**Purpose:** Occupations and their automation risk

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
│   ├── automation_risk_percentage: number (0-100)
│   ├── risk_level: enum (low | medium | high | critical)
│   ├── timeline_estimate: string ("5-10 years", "unlikely", etc.)
│   └── confidence: enum (low | medium | high)
│
├── Task Breakdown
│   └── tasks: Task[]
│       ├── name: string
│       ├── percentage_of_job: number
│       ├── automatable: enum (yes | partial | no)
│       └── reason: string (1 sentence)
│
├── Connections
│   ├── capabilities_required: Capability[] (what protects this job)
│   ├── technologies_threatening: Technology[]
│   └── impact_reports: ImpactReport[]
│
├── Meta
│   ├── created_at: timestamp
│   ├── updated_at: timestamp
│   └── created_by: user_id (admin)
│
└── Community
    └── discussions: Discussion[]
```

---

### 4.5 Impact Report

**Purpose:** Real-world evidence of AI deployment — THE MOAT

```
Impact Report
├── Core Info
│   ├── id: uuid
│   ├── title: string (short summary)
│   ├── description: text (2-5 sentences of what happened)
│   ├── location: string (optional — city/country)
│   ├── event_date: date (when it happened)
│   └── source_url: url (optional — news article, proof)
│
├── Connections
│   ├── technology_id: uuid → Technology
│   ├── job_id: uuid → Job
│   └── capabilities_demonstrated: Capability[]
│
├── Submission
│   ├── status: enum (pending | approved | rejected)
│   ├── submitted_by: user_id
│   ├── submitted_at: timestamp
│   ├── reviewed_by: user_id (nullable)
│   ├── reviewed_at: timestamp (nullable)
│   ├── rejection_reason: text (nullable)
│   └── verification_status: enum (unverified | verified | disputed)
│
├── Engagement
│   ├── upvotes: number
│   └── is_featured: boolean
│
├── Meta
│   ├── created_at: timestamp
│   └── updated_at: timestamp
│
└── Community
    └── discussions: Discussion[]
```

---

### 4.6 Discussion

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
│   ├── entity_type: enum (organization | technology | capability | job | impact_report)
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

**Discussion Features:**

- Nested replies (2-3 levels deep)
- Upvote/downvote
- Sort by: New / Top / Hot
- Attached to any entity page
- No approval needed (post-moderation)

---

### 4.7 Suggestion

**Purpose:** User suggestions for admin-only entities

```
Suggestion
├── Core Info
│   ├── id: uuid
│   ├── type: enum (job | capability | organization)
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
┌─────────────────────────────────────────────────────────────┐
│                      CAPABILITY                             │
│                   "Dexterous Manipulation"                  │
│                      Progress: 25%                          │
│                                                             │
│    ┌──────────────────┐       ┌──────────────────┐        │
│    │ JOBS PROTECTED   │       │ TECH ATTEMPTING  │        │
│    ├──────────────────┤       ├──────────────────┤        │
│    │ • Plumber        │       │ • Figure 02      │        │
│    │ • Electrician    │       │ • Tesla Optimus  │        │
│    │ • Surgeon        │       │ • Boston Dynamics│        │
│    └──────────────────┘       └──────────────────┘        │
│                                                             │
│    ┌────────────────────────────────────────────┐          │
│    │ IMPACT REPORTS                              │          │
│    ├────────────────────────────────────────────┤          │
│    │ "Figure 02 demo still can't tie shoelaces" │          │
│    │ "Amazon Sparrow struggles with soft items" │          │
│    └────────────────────────────────────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Relationship Types

| From | To | Relationship | Type |
|------|----|--------------|------|
| Organization | Technology | has many | 1:N |
| Technology | Capability | demonstrates | N:N |
| Technology | Job | threatens | N:N |
| Capability | Job | protects | N:N |
| Technology | Impact Report | used in | 1:N |
| Job | Impact Report | affected in | 1:N |
| Any Entity | Discussion | has many | 1:N |

---

## 6. Moderation System

### Overview

| Entity | Created By | Approval Required | Moderation Type |
|--------|------------|-------------------|-----------------|
| Organization | Admin only | — | Trusted |
| Technology | Users | ✅ Yes | Pre-moderation |
| Capability | Admin only | — | Trusted |
| Job | Admin only | — | Trusted |
| Impact Report | Users | ✅ Yes | Pre-moderation |
| Discussion | Users | ❌ No | Post-moderation |
| Suggestion | Users | — | Review queue |

### Submission Status Flow

```
User submits
     ↓
  PENDING ──────► Moderator reviews
     │                  │
     │           ┌──────┴──────┐
     │           ↓             ↓
     │       APPROVED      REJECTED
     │           │             │
     │           ↓             ↓
     │       Public        Submitter notified
     │       visible       with reason
     │
     └──► Submitter can see in dashboard
```

### Moderation Queue (Admin App)

```
┌─────────────────────────────────────────────────────────────┐
│  Pending Review                                             │
├─────────────────────────────────────────────────────────────┤
│  Technologies (3)  │  Impact Reports (7)  │  Suggestions (2)│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ "Claude 4.0"                                        │   │
│  │ Submitted by: @user123 • 2 hours ago               │   │
│  │ Organization: Anthropic                            │   │
│  │ ⚠️ Possible duplicate of: Claude 3.5 Sonnet        │   │
│  │                                                     │   │
│  │ [View]  [✓ Approve]  [✗ Reject]  [Merge ▾]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Duplicate Management

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

## 8. Reward System

### Points Table

| Action | Points | Notes |
|--------|--------|-------|
| Complete onboarding | +20 | One-time |
| Submit Technology (approved) | +25 | Per approval |
| Submit Impact Report (approved) | +30 | Per approval |
| Suggest Job/Capability (used) | +10 | If admin creates it |
| Start Discussion | +5 | Per thread |
| Reply in Discussion | +3 | Per reply |
| Receive upvote | +1 | Per upvote |
| Submission featured | +50 | Bonus |
| First to report breaking news | +50 | Timeliness bonus |

### Quality Multipliers

```
Base points × multipliers = Final points

Multipliers:
├── Has source link: ×1.2
├── Verified by moderator: ×1.5
├── Gets 10+ upvotes: ×1.3
└── Featured on homepage: ×2.0

Example:
Impact Report: +30 × 1.2 × 1.5 × 1.3 = +70 points
```

### Anti-Gaming Protections

| Protection | Implementation |
|------------|----------------|
| Daily submission cap | Max 5 per day |
| Cooldown | 1 hour between submissions |
| Rejection penalty | 3 rejections → temp blocked |
| Upvote fraud | Can't self-upvote, rate limits |
| New user gate | Must be Contributor (50pts) to submit |

---

## 9. User Tiers & Permissions

### Tier Breakdown

| Tier | Points | Permissions |
|------|--------|-------------|
| **Observer** | 0-49 | View, upvote, discuss |
| **Contributor** | 50-499 | + Submit technologies & reports |
| **Trusted** | 500-1999 | + Priority review, flag content |
| **Expert** | 2000+ | + Verify others' submissions |
| **Moderator** | Invited | Full admin access |

### Progression Path

```
New user signs up
     ↓
Observer (can discuss, upvote)
     ↓
Completes onboarding: +20 points
     ↓
Participates in discussions: +5, +3, +1...
     ↓
Hits 50 points → CONTRIBUTOR
     ↓
Can now submit Technologies + Impact Reports
     ↓
Approved submissions: +25, +30...
     ↓
Hits 500 points → TRUSTED
     ↓
Consistent quality contributions
     ↓
Invited → MODERATOR
```

### Badges (Optional Gamification)

| Badge | Requirement |
|-------|-------------|
| 🚀 First Submission | Submit first technology |
| 📰 Reporter | 5 approved impact reports |
| 🔬 Tech Hunter | 10 approved technologies |
| 💬 Conversationalist | 50 discussion replies |
| ⭐ Quality Contributor | 5 submissions with 10+ upvotes |
| 🏢 Industry Insider | Verified works in relevant field |
| 🎯 Early Adopter | Joined in first month |
| 🛡️ Moderator | Trusted community guardian |

---

## 10. Feature Phases

### Phase 1: Foundation (Week 1-2)

```
□ Technology pages
  ├── Technology list page
  ├── Technology detail page
  ├── Submit technology form
  └── Pre-submit duplicate check

□ Seed initial data
  ├── 20-30 Organizations
  └── 30-50 Technologies
```

### Phase 2: Impact Reports (Week 3-4)

```
□ Impact Report system
  ├── Submit impact report form
  ├── Impact report detail page
  ├── Impact feed on homepage
  └── Link reports to Tech + Job pages

□ Connect everything
  ├── Tech page shows impact reports
  ├── Job page shows impact reports
  └── Capability page shows related reports
```

### Phase 3: Admin App (Week 5-6)

```
□ TanStack Start admin app
  ├── Moderation queue
  ├── Approve/reject/merge flow
  ├── Content management
  └── Basic analytics

□ Recruit moderators
  └── 2-3 trusted friends
```

### Phase 4: Discussions (Week 7-8)

```
□ Discussion system
  ├── Threaded replies (3 levels)
  ├── Upvote/downvote
  ├── Sort options (new/top/hot)
  └── Discussions on every entity page
```

### Phase 5: Polish & Launch (Week 9-10)

```
□ Reward system implementation
  ├── Points calculation
  ├── Tier progression
  └── Badges

□ Launch preparation
  ├── Seed more content
  ├── Test all flows
  └── Soft launch on Reddit
```

### Phase 6: Monetization (Week 11+)

```
□ Sponsorship system
  ├── Organization claiming flow
  ├── Sponsor tiers
  └── Payment integration
```

---

## 11. Tech Architecture

### Two-App Strategy

```
openmodal.ai (NextJS - existing)
├── Public pages
│   ├── Homepage (AGI Dashboard)
│   ├── Capabilities
│   ├── Jobs
│   ├── Technologies
│   ├── Impact Reports
│   └── Discussions
├── User features
│   ├── Auth + onboarding
│   ├── Submit content
│   ├── User dashboard
│   └── Notifications
└── Keep existing, avoid breaking changes

admin.openmodal.ai (TanStack Start - new)
├── Moderator features
│   ├── Moderation queue
│   ├── Approve/reject/merge
│   └── Content management
├── Admin features
│   ├── User management
│   ├── Analytics
│   └── Sponsor management
└── Fresh start, better DX
```

### Shared Resources

```
Both apps share:
├── Database: Neon PostgreSQL
├── Types/Schema: Shared package or copy
└── Storage: Same bucket for images

Auth strategy:
├── Phase 1: Separate logins (simple)
└── Phase 2: Unified auth (shared JWT)
```

### Database Schema Summary

```
Tables:
├── organizations
├── technologies
├── capabilities
├── jobs
├── impact_reports
├── discussions
├── suggestions
├── users
├── user_points
├── user_badges
└── technology_aliases

Junction tables:
├── technology_capabilities
├── technology_jobs
├── capability_jobs
└── impact_report_capabilities
```

---

## 12. What We Dropped

### Intentionally Removed

| Feature | Original Purpose | Why Dropped |
|---------|------------------|-------------|
| Complex Reports | Deployment tracking | Simplified to Impact Reports |
| Comments | Engagement | Replaced with Discussions (threaded) |
| Geographic Map | Show deployments | Expensive, add later if revenue |
| Bottlenecks (table) | Capability gaps | Merged into capability fields |
| Research Activities | Track papers | Too complex, hard to maintain |
| Expert Forecasts | Predictions | Hard to get, start with community |
| Organization Profiles | Company pages | Simplified, just link technologies |
| Complex Verification | Multiple tiers | Start simple: unverified/verified |

### Can Add Later

These are deferred, not killed:

| Feature | Add When |
|---------|----------|
| Geographic map | Revenue > $500/mo |
| Expert verification program | 1000+ users |
| API for researchers | Demand validated |
| Job board integration | Partnership opportunity |
| Mobile app | Web proven successful |

---

## Quick Reference

### Entity Creation Summary

| Entity | Who Creates | Approval | User Can Suggest |
|--------|-------------|----------|------------------|
| Organization | Admin | — | ✅ Yes |
| Technology | Users | ✅ Required | — |
| Capability | Admin | — | ✅ Yes |
| Job | Admin | — | ✅ Yes |
| Impact Report | Users | ✅ Required | — |
| Discussion | Users | Post-mod | — |

### User Tier Summary

| Tier | Points | Key Ability |
|------|--------|-------------|
| Observer | 0-49 | View, discuss |
| Contributor | 50+ | Submit content |
| Trusted | 500+ | Priority + flag |
| Expert | 2000+ | Verify others |
| Moderator | Invited | Full access |

### The Value Formula

```
Static Info (AI can replicate):
├── Capabilities
├── Jobs  
└── Technologies

+ Unique Data (AI cannot replicate):
├── Impact Reports (crowdsourced evidence)
└── Discussions (community perspective)

= OpenModal's Moat
```

---

**Document Version:** 2.0
**Last Updated:** January 2025
**Status:** Ready for implementation