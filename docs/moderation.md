# Moderation System

Overview of content moderation and quality control in OpenModal.

## Moderation Strategy

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

## Impact Reports (Instant Publish)

### Philosophy

Reports publish immediately to eliminate moderator bottleneck. Community flagging handles bad content.

### Flow

```
User submits report
     ↓
PUBLISHED IMMEDIATELY
     ↓
Community can:
├── Upvote/Downvote
├── Add enrichments
└── Flag if inappropriate
     ↓
If 3+ flags:
├── Auto-hidden
├── Moderator notified
└── Moderator reviews
     ↓
Moderator action:
├── Restore (if false flags)
└── Remove permanently (if valid)
```

### Flagging Thresholds

| Flags            | Action                          |
| ---------------- | ------------------------------- |
| 1-2              | Visible, tracked                |
| 3+               | Auto-hidden, moderator notified |
| Moderator review | Remove or restore               |

### Flag Reasons

| Reason        | Description                     |
| ------------- | ------------------------------- |
| spam          | Promotional content, irrelevant |
| fake          | Fictional or fabricated content |
| duplicate     | Same as existing report         |
| inappropriate | Offensive, harmful content      |
| other         | Other issues (notes required)   |

## Technology Submissions (Pre-Moderation)

### Flow

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

### Review Criteria

| Criteria   | Check                       |
| ---------- | --------------------------- |
| Duplicate? | Does it already exist?      |
| Valid?     | Is it a real AI technology? |
| Complete?  | Has sufficient info?        |
| Accurate?  | Is description correct?     |

### Moderator Actions

| Action  | When to Use                            |
| ------- | -------------------------------------- |
| Approve | Technology is valid and unique         |
| Reject  | Duplicate, invalid, or incomplete      |
| Merge   | Similar to existing - merge and notify |

## Report Enrichments (Community Voting)

### Voting System

- **Upvotes** - Agreement that enrichment is accurate
- **Downvotes** - Disagreement that enrichment is accurate
- **Net score** = upvotes - downvotes

### Trust Weighting

| User Tier   | Vote Weight |
| ----------- | ----------- |
| Contributor | 1x          |
| Trusted     | 2x          |
| Expert      | 3x          |

### Display Priority

Enrichments with higher net scores shown first.

## Discussions (Post-Moderated)

### Moderation Approach

- **Instant publish** - No pre-approval
- **Flag system** - Users can flag problematic content
- **Moderator queue** - Flagged content reviewed
- **Edit/Delete** - Moderators can edit or remove

### Deletion Policy

| Action                | When                       |
| --------------------- | -------------------------- |
| Edit                  | Minor issues, can be fixed |
| Delete entire thread  | Severe violations, spam    |
| Delete single comment | Inappropriate comment      |
| Ban user              | Repeated violations        |

## Duplicate Prevention

### Technology Duplicates

**Three layers of prevention:**

1. **Pre-submit check** - Show similar existing technologies
2. **Moderator review** - Catch during approval process
3. **Aliases** - Link alternative names to primary

### Report Duplicates

**Business rule:** Users can't submit identical reports within 24 hours.

## Moderation Workload Comparison

### Before (v2.0)

```
Every impact report → Moderator reviews → Approve/Reject
Bottleneck! Can't scale beyond ~50 reports/day
```

### After (v3.0)

```
Impact report → Publish immediately
Bad content → Community flags → Moderator only sees flagged
Scales to 1000+ reports/day
```

## Quality Signals

Users can judge content quality through:

| Signal               | Shows                               |
| -------------------- | ----------------------------------- |
| Verification status  | Email verified, onboarding complete |
| Reputation score     | Contribution history                |
| Enrichment count     | Community engagement                |
| Enrichment agreement | Data accuracy                       |
| Flag count           | Content issues                      |
| Upvote ratio         | Community approval                  |

## Reporting Issues

### User Reports

Users can report:

- Inappropriate content
- Spam/fake content
- Bugs/issues
- Policy violations

### Report Flow

```
User submits report
     ↓
Added to moderator queue
     ↓
Moderator reviews
     ↓
Action taken
     ↓
User notified (if applicable)
```

## Moderator Tools

### Queue Management

- **Technology queue** - Pending submissions
- **Flagged reports** - Auto-hidden content
- **User reports** - Community submissions
- **Suggestions** - Entity suggestions

### Bulk Actions

- Approve multiple technologies
- Remove multiple reports
- Ban users (with reason)
- Merge duplicate entities

## Appeals

Users can appeal:

- Content removal
- Rejection of submission
- Account suspension

**Process:**

1. User submits appeal with reason
2. Different moderator reviews
3. Final decision communicated
4. No further appeals
