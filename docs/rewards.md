# Rewards & User Tiers

Explanation of the reputation system, user tiers, and rewards.

## User Tiers

| Tier            | Points   | Permissions                                           |
| --------------- | -------- | ----------------------------------------------------- |
| **Observer**    | 0-49     | View, upvote, discuss, submit reports                 |
| **Contributor** | 50-499   | + Submit technologies, add enrichments                |
| **Trusted**     | 500-1999 | + Priority review, flag content, 2x enrichment weight |
| **Expert**      | 2000+    | + 3x enrichment weight, verify others                 |
| **Moderator**   | Invited  | Full admin access                                     |

### Key Changes from v2.0

| Before                                   | After                                            |
| ---------------------------------------- | ------------------------------------------------ |
| Observers couldn't submit impact reports | Anyone can submit impact reports (low friction!) |

## Progression Path

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
Hits 2000 points → EXPERT
     ↓
3x enrichment weight, can verify
     ↓
Invited → MODERATOR
```

## Points Table

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

## Quality Multipliers

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

## Badges

Badges provide visual recognition for achievements.

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

## Anti-Gaming Protections

| Protection           | Implementation                        |
| -------------------- | ------------------------------------- |
| Daily submission cap | Max 5 impact reports per day          |
| Cooldown             | 1 hour between technology submissions |
| Flag penalty         | False flags → -5 points               |
| Upvote fraud         | Can't self-upvote, rate limits        |
| New user gate        | Must be Contributor (50pts) to enrich |

## Permission Matrix

| Action               | Observer | Contributor | Trusted | Expert | Moderator |
| -------------------- | -------- | ----------- | ------- | ------ | --------- |
| View content         | ✅       | ✅          | ✅      | ✅     | ✅        |
| Upvote/Downvote      | ✅       | ✅          | ✅      | ✅     | ✅        |
| Submit reports       | ✅       | ✅          | ✅      | ✅     | ✅        |
| Start discussion     | ✅       | ✅          | ✅      | ✅     | ✅        |
| Reply in discussion  | ✅       | ✅          | ✅      | ✅     | ✅        |
| Submit technology    | ❌       | ✅          | ✅      | ✅     | ✅        |
| Add enrichments      | ❌       | ✅          | ✅      | ✅     | ✅        |
| Flag content         | ❌       | ❌          | ✅      | ✅     | ✅        |
| Verify reports       | ❌       | ❌          | ❌      | ✅     | ✅        |
| Moderate content     | ❌       | ❌          | ❌      | ✅     | ✅        |
| Approve technologies | ❌       | ❌          | ❌      | ❌     | ✅        |

## Enrichment Weight

Higher tier users have more influence on enrichments:

| Tier        | Vote Weight |
| ----------- | ----------- |
| Contributor | 1x          |
| Trusted     | 2x          |
| Expert      | 3x          |

**Example:** An Expert's upvote counts as 3 votes from a Contributor.

## Reputation Decay (Optional)

To encourage ongoing participation, reputation may decay over time:

| Rule             | Implementation                          |
| ---------------- | --------------------------------------- |
| Inactivity decay | -5 points/month of inactivity           |
| Minimum floor    | Can't drop below current tier threshold |

**Note:** This feature can be enabled/disabled based on community feedback.

## Leaderboards

Public leaderboards recognize top contributors:

| Leaderboard      | Sorted By                  |
| ---------------- | -------------------------- |
| Top Contributors | Total reputation           |
| Top Reporters    | Number of impact reports   |
| Top Tech Hunters | Approved technologies      |
| Top Discussants  | Discussion replies         |
| Rising Stars     | Reputation gain this month |

## Special Recognition

### Featured Contributors

Users with 1000+ reputation may be featured on homepage.

### Expert Verification

Users can verify their expertise in specific domains:

- Upload credentials
- Admin review
- Verified badge displayed

### Moderator Invitation

Exceptional contributors may be invited to become moderators:

- 2000+ reputation
- Consistent quality contributions
- Clean flag history
- Community endorsement

## Tracking

### Personal Stats

Users can track:

- Total reputation
- Current tier
- Points to next tier
- Badges earned
- Contributions breakdown
- Leaderboard position

### Notifications

Users notified when:

- Tier changes
- Badge earned
- Submission approved/rejected
- Report reaches milestone (10+ upvotes)
- Featured on homepage
