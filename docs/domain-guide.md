# Domain Guide

This guide covers OpenModal's purpose, philosophy, and core concepts.

## What is OpenModal?

OpenModal is a community-driven platform that tracks AI's real-world impact on jobs and capabilities. Unlike generic AI information sites, OpenModal's value comes from **unique, crowdsourced data** that AI cannot replicate.

### The AI-Proof Formula

```
Capabilities + Jobs + Technologies = Information (AI can do this)

+ Impact Reports + Discussions = Unique Value (AI cannot do this)
```

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

## Core Philosophy

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

## Entity Overview

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

## Entity Relationships

```
ORGANIZATION (Anthropic, OpenAI, etc.)
    │
    │ has many
    ▼
TECHNOLOGY (Claude, GPT-4, Atlas)
    │
    │ demonstrates (via subtypes)
    ▼
CAPABILITY ────────────► CAPABILITY_SUBTYPE
(Reasoning, Image        (Medical Reasoning,
 Recognition)             Legal Reasoning)
                                │
                                │ required by
                                ▼
                            TASK ◄──────────── JOB
                        (Analyze X-rays,    (Radiologist,
                         Write reports)      Writer)
                                │
                                ▼
                        IMPACT REPORT
                    (Real-world evidence)
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            REPORT_ENRICHMENT        REPORT_FLAG
          (Community adds data)    (Community flags)
```

See [entities.md](entities.md) for detailed entity specifications.

## What's New in v3.0

| Change                      | Why                                                                   |
| --------------------------- | --------------------------------------------------------------------- |
| **Capability Subtypes**     | Track domain-specific progress (Medical Reasoning vs Legal Reasoning) |
| **Derived Relationships**   | Remove redundant job↔technology, job↔capability tables                |
| **Simplified Reports**      | Story-first, instant publish, community enrichment                    |
| **No Moderator Bottleneck** | Reports publish immediately, flagging for bad content                 |

## Key Features

### Impact Reports (The Moat)

- **3 required fields only** - job title, description, impact type
- **Instant publish** - no approval bottleneck
- **Community enrichment** - others add structured data (jobs, technologies, capabilities)
- **Trust signals** - verification status, reputation, enrichments

### Capability Tracking

- **Domain-specific subtypes** - track progress by industry/domain
- **Task-based job analysis** - break jobs into atomic tasks
- **Derived automation risk** - calculated from task automation potential

### Discussions

- **Reddit-style threads** - nested conversations on any entity
- **Post-moderated** - instant publish, flag for issues
- **Attach to anything** - organizations, technologies, capabilities, jobs, reports

## Sponsorship System

Organizations can sponsor to gain visibility:

| Tier   | Price   | Benefits                             |
| ------ | ------- | ------------------------------------ |
| None   | $0      | Listed, can be discussed             |
| Bronze | $100/mo | Verified badge, can post updates     |
| Silver | $250/mo | + Featured in category, analytics    |
| Gold   | $500/mo | + Homepage feature, priority support |

## Design Principles

### Moderation Strategy

| Entity            | Moderation Type                    |
| ----------------- | ---------------------------------- |
| Technology        | Pre-moderation (approval required) |
| Impact Report     | Post-moderation (flagging only)    |
| Discussion        | Post-moderated                     |
| Report Enrichment | Community voting                   |

### Content Quality

1. **Quality over quantity** - Better to have 50 great jobs than 500 bad ones
2. **Community-driven** - Users add structure through enrichments
3. **Reputation matters** - Higher reputation users have more influence
4. **Transparency** - Trust signals visible to all

### User Journey

1. **Sign up** → Email verification required
2. **Onboarding** → Name + username
3. **Start contributing** → Submit reports, add enrichments
4. **Build reputation** → Quality contributions earn points
5. **Unlock features** → Higher tiers = more permissions
