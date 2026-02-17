# Platform Features

Detailed documentation of OpenModal's key features and systems.

## Impact Reports System

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

### Report Fields

**Required (3 fields minimum):**

- `job_title` - Freetext job name
- `description` - Their story (100+ characters)
- `impact_type` - layoffs, reduced_hours, role_change, new_tools, productivity_boost, no_change

**Optional:**

- `location`, `country` - Geographic info
- `company_name`, `company_size` - Company details
- `technology_description` - Freetext tech description
- `workers_affected_count` - Number of workers
- `event_date` - When it happened
- `source_url` - News link

### Trust Signals

| Signal               | Purpose               |
| -------------------- | --------------------- |
| Verified email       | Confirms user is real |
| Completed onboarding | Shows commitment      |
| Reputation score     | Quality history       |
| Enrichment count     | Community engagement  |
| Enrichment agreement | Data accuracy         |

## Community Enrichment

### How It Works

1. User submits simple report (3 fields)
2. Report publishes immediately
3. Community members add enrichments:
   - "This is about Customer Service Rep job" (job_link)
   - "They're using ChatGPT" (technology_link)
   - "This affects 'Answer customer questions' task" (task_link)
4. Others vote on accuracy
5. High-voted enrichments become trusted links

### Enrichment Types

| Type                    | Links To          | Example                           |
| ----------------------- | ----------------- | --------------------------------- |
| job_link                | Job entity        | "Customer Service Representative" |
| technology_link         | Technology entity | "ChatGPT", "Claude"               |
| task_link               | Task entity       | "Answer customer questions"       |
| capability_subtype_link | CapabilitySubtype | "Customer Support Reasoning"      |

### Enrichment Permissions

| User Tier   | Can Add Enrichments | Enrichment Weight |
| ----------- | ------------------- | ----------------- |
| Observer    | ❌ No               | —                 |
| Contributor | ✅ Yes              | 1x                |
| Trusted     | ✅ Yes              | 2x                |
| Expert      | ✅ Yes              | 3x                |

## Discussions

### Structure

- **Reddit-style threads** - Nested conversations
- **Max depth: 3 levels** - root → reply → reply-to-reply
- **Post-moderated** - Instant publish, flag for issues
- **Attach to anything** - Organizations, technologies, capabilities, jobs, reports

### Thread Example

```
├── [root] "What do people think about Claude 3.5?"
│   ├── [reply] "It's been great for my workflow" (▲15)
│   │   └── [reply] "Same here, especially for coding" (▲8)
│   └── [reply] "I've had some accuracy issues" (▼2)
│       └── [reply] "Can you share examples?" (▲3)
```

### Voting

- Upvote/downvote on any comment
- Score affects visibility
- No self-voting allowed

## Suggestions System

Users can suggest new entities for admin review:

| Suggestion Type    | Purpose                              |
| ------------------ | ------------------------------------ |
| job                | Suggest a new job to track           |
| capability         | Suggest a new capability category    |
| capability_subtype | Suggest a domain-specific capability |
| organization       | Suggest a new organization to add    |

**Process:**

1. User submits suggestion with reason
2. Admin reviews queue
3. Admin accepts/declines with response
4. User notified of decision

## Feedback System

Users can submit:

- **Feature requests** - Ideas for new functionality
- **Bug reports** - Issues to fix
- **General feedback** - Thoughts and suggestions

This helps prioritize development and improve the platform.

## Duplicate Management

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

## Search & Discovery

### Searchable Entities

- Organizations
- Technologies
- Capabilities
- Capability Subtypes
- Jobs
- Tasks
- Impact Reports
- Discussions

### Search Features

- **Fuzzy matching** - Handles typos
- **Alias support** - Finds by alternative names
- **Entity-specific** - Search within types
- **Faceted filtering** - Filter by category, domain, etc.
