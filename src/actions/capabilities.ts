"use server";

import { generateRandomString } from "better-auth/crypto";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { db } from "@/db";
import { userBadge, userProfile, userReputation } from "@/db/schema";
import { user } from "@/db/schema/auth";
import {
  bottleneck,
  type CapabilityStatus,
  type CommentVoteType,
  capability,
  capabilityCategory,
  capabilityComment,
  capabilityCommentVote,
  capabilityOrganization,
  capabilityPrediction,
  capabilityTracking,
  organization,
  type PredictionBackground,
  type PredictionConfidence,
} from "@/db/schema/capabilities";
import { job, jobComment } from "@/db/schema/jobs";
import { checkOnboardingFromSession } from "@/lib/session-utils";

// Types
export type CapabilityFilters = {
  categoryId?: string;
  status?: CapabilityStatus;
  timeline?: "near" | "medium" | "far";
  search?: string;
};

export type CapabilitySort =
  | "progress_desc"
  | "progress_asc"
  | "jobs_desc"
  | "activity_desc"
  | "name_asc";

// Get capability by slug
export async function getCapabilityBySlug(slug: string) {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600 * 24 });

  // Single query with JSON aggregation for bottlenecks and organizations
  const result = await db
    .select({
      capability,
      category: capabilityCategory,
      bottlenecks: sql<Array<typeof bottleneck.$inferSelect>>`
        COALESCE(
          (SELECT json_agg(b.* ORDER BY b.severity DESC)
           FROM ${bottleneck} b
           WHERE b.capability_id = ${capability.id}),
          '[]'::json
        )
      `.as("bottlenecks"),
      organizations: sql<
        Array<{
          organization: typeof organization.$inferSelect;
          focusArea: string | null;
        }>
      >`
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'organization', row_to_json(o.*),
              'focusArea', co.focus_area
            )
           )
           FROM ${capabilityOrganization} co
           INNER JOIN ${organization} o ON co.organization_id = o.id
           WHERE co.capability_id = ${capability.id}),
          '[]'::json
        )
      `.as("organizations"),
    })
    .from(capability)
    .leftJoin(
      capabilityCategory,
      eq(capability.categoryId, capabilityCategory.id),
    )
    .where(eq(capability.slug, slug))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const data = result[0];

  return {
    ...data.capability,
    category: data.category || undefined,
    bottlenecks: data.bottlenecks || [],
    organizations: (data.organizations || []).map((org) => ({
      ...org.organization,
      focusArea: org.focusArea,
    })),
  };
}

// Get capabilities with filters
export async function getCapabilities(
  filters: CapabilityFilters = {},
  sort: CapabilitySort = "progress_desc",
  limit = 20,
  offset = 0,
) {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600 * 24 });

  const conditions = [];

  if (filters.categoryId) {
    conditions.push(eq(capability.categoryId, filters.categoryId));
  }

  if (filters.status) {
    conditions.push(eq(capability.status, filters.status));
  }

  if (filters.timeline) {
    // Timeline filtering based on timeline_estimate text
    // This is a simplified version - you might want to parse the text
    // For now, we'll filter based on keywords
    if (filters.timeline === "near") {
      conditions.push(
        or(
          ilike(capability.timelineEstimate, "%0-5%"),
          ilike(capability.timelineEstimate, "%1-5%"),
          ilike(capability.timelineEstimate, "%2-5%"),
        ),
      );
    } else if (filters.timeline === "medium") {
      conditions.push(
        or(
          ilike(capability.timelineEstimate, "%5-15%"),
          ilike(capability.timelineEstimate, "%10-15%"),
        ),
      );
    } else if (filters.timeline === "far") {
      conditions.push(
        or(
          ilike(capability.timelineEstimate, "%15+%"),
          ilike(capability.timelineEstimate, "%20+%"),
        ),
      );
    }
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(capability.name, `%${filters.search}%`),
        ilike(capability.description, `%${filters.search}%`),
      ),
    );
  }

  // Apply sorting
  const getSortOrder = () => {
    switch (sort) {
      case "progress_desc":
        return desc(capability.progressPercentage);
      case "progress_asc":
        return asc(capability.progressPercentage);
      case "jobs_desc":
        return desc(capability.jobsProtectedCount);
      case "activity_desc":
        return desc(capability.updatedAt);
      case "name_asc":
        return asc(capability.name);
      default:
        return desc(capability.progressPercentage);
    }
  };

  // Single query with LEFT JOIN to get capabilities and categories
  const baseQuery = db
    .select({
      capability,
      category: capabilityCategory,
    })
    .from(capability)
    .leftJoin(
      capabilityCategory,
      eq(capability.categoryId, capabilityCategory.id),
    );

  const queryWithWhere =
    conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

  // Execute single query with pagination
  const results = await queryWithWhere
    .orderBy(getSortOrder())
    .limit(limit)
    .offset(offset);

  // Map results to match the expected format
  return results.map((result) => ({
    ...result.capability,
    category: result.category || undefined,
  }));
}

// Get capability categories
export async function getCapabilityCategories() {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600 * 24 });

  return db
    .select()
    .from(capabilityCategory)
    .orderBy(asc(capabilityCategory.name));
}

// Track capability
export async function trackCapability(capabilityId: string, userId: string) {
  // Check onboarding completion from session
  const onboardingCompleted = await checkOnboardingFromSession();
  if (onboardingCompleted === null) {
    return { success: false, error: "Please sign in to track capabilities" };
  }
  if (!onboardingCompleted) {
    return {
      success: false,
      error: "Please complete onboarding before tracking capabilities",
    };
  }

  // Check if already tracking
  const existing = await db
    .select()
    .from(capabilityTracking)
    .where(
      and(
        eq(capabilityTracking.capabilityId, capabilityId),
        eq(capabilityTracking.userId, userId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return { success: true, alreadyTracking: true };
  }

  // Create tracking record and update tracking count in parallel
  await Promise.all([
    db.insert(capabilityTracking).values({
      id: generateRandomString(32),
      capabilityId,
      userId,
      notificationsEnabled: true,
    }),
    db
      .update(capability)
      .set({
        trackingCount: sql`${capability.trackingCount} + 1`,
      })
      .where(eq(capability.id, capabilityId)),
  ]);

  return { success: true, alreadyTracking: false };
}

// Untrack capability
export async function untrackCapability(capabilityId: string, userId: string) {
  // Check onboarding completion from session
  const onboardingCompleted = await checkOnboardingFromSession();
  if (onboardingCompleted === null) {
    return { success: false, error: "Please sign in to untrack capabilities" };
  }
  if (!onboardingCompleted) {
    return {
      success: false,
      error: "Please complete onboarding before untracking capabilities",
    };
  }

  // Delete tracking record and update tracking count in parallel
  await Promise.all([
    db
      .delete(capabilityTracking)
      .where(
        and(
          eq(capabilityTracking.capabilityId, capabilityId),
          eq(capabilityTracking.userId, userId),
        ),
      ),
    db
      .update(capability)
      .set({
        trackingCount: sql`GREATEST(${capability.trackingCount} - 1, 0)`,
      })
      .where(eq(capability.id, capabilityId)),
  ]);

  return { success: true };
}

// Check if user is tracking
export async function isTrackingCapability(
  capabilityId: string,
  userId: string,
) {
  const result = await db
    .select()
    .from(capabilityTracking)
    .where(
      and(
        eq(capabilityTracking.capabilityId, capabilityId),
        eq(capabilityTracking.userId, userId),
      ),
    )
    .limit(1);

  return result.length > 0;
}

// Submit prediction
export async function submitPrediction(
  capabilityId: string,
  userId: string,
  prediction: {
    predictedYear: number;
    predictedYearEnd?: number;
    confidence: PredictionConfidence;
    reasoning?: string;
    background: PredictionBackground;
  },
) {
  // Check onboarding completion from session
  const onboardingCompleted = await checkOnboardingFromSession();
  if (onboardingCompleted === null) {
    return { success: false, error: "Please sign in to submit predictions" };
  }
  if (!onboardingCompleted) {
    return {
      success: false,
      error: "Please complete onboarding before submitting predictions",
    };
  }

  // Optimized: Single query to check existing, then UPSERT and update median
  const existing = await db
    .select({ id: capabilityPrediction.id })
    .from(capabilityPrediction)
    .where(
      and(
        eq(capabilityPrediction.capabilityId, capabilityId),
        eq(capabilityPrediction.userId, userId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing and recalculate median in single query
    await db.execute(sql`
      WITH updated_prediction AS (
        UPDATE ${capabilityPrediction}
        SET 
          predicted_year = ${prediction.predictedYear},
          predicted_year_end = ${prediction.predictedYearEnd ?? null},
          confidence = ${prediction.confidence},
          reasoning = ${prediction.reasoning ?? null},
          background = ${prediction.background},
          updated_at = NOW()
        WHERE id = ${existing[0].id}
        RETURNING capability_id
      ),
      median_calc AS (
        SELECT 
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY predicted_year) as median
        FROM ${capabilityPrediction}
        WHERE capability_id = ${capabilityId}
      )
      UPDATE ${capability}
      SET community_prediction_median = ROUND(COALESCE((SELECT median FROM median_calc), 0))
      WHERE id = ${capabilityId}
    `);
  } else {
    // Insert new and recalculate median in single query
    const predictionId = generateRandomString(32);
    await db.execute(sql`
      WITH inserted_prediction AS (
        INSERT INTO ${capabilityPrediction} (
          id, capability_id, user_id, predicted_year, predicted_year_end,
          confidence, reasoning, background
        )
        VALUES (
          ${predictionId},
          ${capabilityId},
          ${userId},
          ${prediction.predictedYear},
          ${prediction.predictedYearEnd ?? null},
          ${prediction.confidence},
          ${prediction.reasoning ?? null},
          ${prediction.background}
        )
        RETURNING capability_id
      ),
      median_calc AS (
        SELECT 
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY predicted_year) as median
        FROM ${capabilityPrediction}
        WHERE capability_id = ${capabilityId}
      )
      UPDATE ${capability}
      SET community_prediction_median = ROUND(COALESCE((SELECT median FROM median_calc), 0))
      WHERE id = ${capabilityId}
    `);
  }

  return { success: true };
}

// Get user prediction
export async function getUserPrediction(capabilityId: string, userId: string) {
  const result = await db
    .select()
    .from(capabilityPrediction)
    .where(
      and(
        eq(capabilityPrediction.capabilityId, capabilityId),
        eq(capabilityPrediction.userId, userId),
      ),
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// Create comment
export async function createComment(
  capabilityId: string,
  userId: string,
  content: string,
  parentId?: string,
) {
  // Check onboarding completion from session
  const onboardingCompleted = await checkOnboardingFromSession();
  if (onboardingCompleted === null) {
    return { success: false, error: "Please sign in to comment" };
  }
  if (!onboardingCompleted) {
    return {
      success: false,
      error: "Please complete onboarding before commenting",
    };
  }

  const id = generateRandomString(32);
  await db.insert(capabilityComment).values({
    id,
    capabilityId,
    userId,
    parentId: parentId || null,
    content,
    upvotes: 0,
  });

  return { success: true, commentId: id };
}

// Update comment
export async function updateComment(
  commentId: string,
  userId: string,
  content: string,
) {
  // Check onboarding completion from session
  const onboardingCompleted = await checkOnboardingFromSession();
  if (onboardingCompleted === null) {
    return { success: false, error: "Please sign in to update comments" };
  }
  if (!onboardingCompleted) {
    return {
      success: false,
      error: "Please complete onboarding before updating comments",
    };
  }

  // Verify ownership
  const comment = await db
    .select()
    .from(capabilityComment)
    .where(
      and(
        eq(capabilityComment.id, commentId),
        eq(capabilityComment.userId, userId),
      ),
    )
    .limit(1);

  if (comment.length === 0) {
    return { success: false, error: "Comment not found or unauthorized" };
  }

  await db
    .update(capabilityComment)
    .set({
      content,
      updatedAt: new Date(),
    })
    .where(eq(capabilityComment.id, commentId));

  return { success: true };
}

// Delete comment
export async function deleteComment(commentId: string, userId: string) {
  // Check onboarding completion from session
  const onboardingCompleted = await checkOnboardingFromSession();
  if (onboardingCompleted === null) {
    return { success: false, error: "Please sign in to delete comments" };
  }
  if (!onboardingCompleted) {
    return {
      success: false,
      error: "Please complete onboarding before deleting comments",
    };
  }

  // Verify ownership
  const comment = await db
    .select()
    .from(capabilityComment)
    .where(
      and(
        eq(capabilityComment.id, commentId),
        eq(capabilityComment.userId, userId),
      ),
    )
    .limit(1);

  if (comment.length === 0) {
    return { success: false, error: "Comment not found or unauthorized" };
  }

  await db.delete(capabilityComment).where(eq(capabilityComment.id, commentId));

  return { success: true };
}

// Vote comment
export async function voteComment(
  commentId: string,
  userId: string,
  voteType: CommentVoteType,
) {
  // Check onboarding completion from session
  const onboardingCompleted = await checkOnboardingFromSession();
  if (onboardingCompleted === null) {
    return { success: false, error: "Please sign in to vote" };
  }
  if (!onboardingCompleted) {
    return {
      success: false,
      error: "Please complete onboarding before voting",
    };
  }

  // Check if comment exists first
  const commentExists = await db
    .select({ id: capabilityComment.id })
    .from(capabilityComment)
    .where(eq(capabilityComment.id, commentId))
    .limit(1);

  if (commentExists.length === 0) {
    return { success: false, error: "Comment not found" };
  }

  // Optimized: Single atomic query to handle vote upsert/delete and update counts
  const voteId = generateRandomString(32);

  await db.execute(sql`
    WITH existing_vote AS (
      SELECT id, vote_type
      FROM ${capabilityCommentVote}
      WHERE comment_id = ${commentId} AND user_id = ${userId}
      LIMIT 1
    ),
    vote_deletion AS (
      -- Delete vote if same type exists (toggle off)
      DELETE FROM ${capabilityCommentVote}
      WHERE id IN (SELECT id FROM existing_vote WHERE vote_type = ${voteType})
      RETURNING comment_id
    ),
    vote_upsert AS (
      -- Upsert vote only if no existing vote with same type (new vote or changing type)
      INSERT INTO ${capabilityCommentVote} (id, comment_id, user_id, vote_type)
      SELECT 
        COALESCE(
          (SELECT id FROM existing_vote WHERE vote_type != ${voteType} LIMIT 1),
          ${voteId}
        ),
        ${commentId},
        ${userId},
        ${voteType}
      WHERE NOT EXISTS (
        SELECT 1 FROM existing_vote WHERE vote_type = ${voteType}
      )
      ON CONFLICT (comment_id, user_id) DO UPDATE
      SET vote_type = EXCLUDED.vote_type
      RETURNING comment_id
    ),
    vote_counts AS (
      SELECT 
        COUNT(*) FILTER (WHERE vote_type = 'up')::int as upvotes
      FROM ${capabilityCommentVote}
      WHERE comment_id = ${commentId}
    )
    UPDATE ${capabilityComment}
    SET 
      upvotes = GREATEST(0, (SELECT upvotes FROM vote_counts)),
      updated_at = NOW()
    WHERE id = ${commentId}
  `);

  return { success: true };
}

// Get comments
export async function getComments(capabilityId: string, parentId?: string) {
  // Fetch all comments for the capability to build tree structure with user info
  const rows = await db
    .select({
      comment: capabilityComment,
      author: {
        id: user.id,
        name: user.name,
        username: user.username,
        displayUsername: user.displayUsername,
        image: user.image,
      },
      profile: {
        displayName: userProfile.displayName,
        industry: userProfile.industry,
        location: userProfile.location,
        country: userProfile.country,
        stateProvince: userProfile.stateProvince,
        city: userProfile.city,
      },
      reputation: {
        reputationPoints: userReputation.reputationPoints,
        tier: userReputation.tier,
      },
      badges: sql<Array<typeof userBadge.$inferSelect>>`
        COALESCE(
          (SELECT json_agg(b.* ORDER BY b.earned_at DESC)
           FROM ${userBadge} b
           WHERE b.user_id = ${capabilityComment.userId}),
          '[]'::json
        )
      `.as("badges"),
    })
    .from(capabilityComment)
    .leftJoin(user, eq(capabilityComment.userId, user.id))
    .leftJoin(userProfile, eq(userProfile.userId, user.id))
    .leftJoin(userReputation, eq(userReputation.userId, user.id))
    .where(eq(capabilityComment.capabilityId, capabilityId))
    .orderBy(
      desc(capabilityComment.upvotes),
      desc(capabilityComment.createdAt),
    );

  type CommentWithMeta = (typeof rows)[number]["comment"] & {
    author: (typeof rows)[number]["author"] | null;
    profile: (typeof rows)[number]["profile"] | null;
    reputation: (typeof rows)[number]["reputation"] | null;
    badges: (typeof rows)[number]["badges"];
    replies: CommentWithMeta[];
  };

  const items: CommentWithMeta[] = rows.map((row) => ({
    ...row.comment,
    author: row.author || null,
    profile: row.profile || null,
    reputation: row.reputation || null,
    badges: row.badges || [],
    replies: [],
  }));

  // Build reply tree structure
  const commentMap = new Map<string, CommentWithMeta>();
  const rootComments: CommentWithMeta[] = [];

  for (const item of items) {
    commentMap.set(item.id, item);
  }

  for (const item of items) {
    if (item.parentId) {
      const parent = commentMap.get(item.parentId);
      if (parent) {
        parent.replies.push(item);
      }
    } else {
      rootComments.push(item);
    }
  }

  // If parentId is provided, return only that comment's replies
  if (parentId) {
    const parentComment = commentMap.get(parentId);
    return parentComment ? parentComment.replies : [];
  }

  return rootComments;
}

// Increment view count
export async function incrementViewCount(capabilityId: string) {
  await db
    .update(capability)
    .set({
      viewCount: sql`${capability.viewCount} + 1`,
    })
    .where(eq(capability.id, capabilityId));

  return { success: true };
}

// Get activities for activity feed
export type ActivityType =
  | "breakthrough"
  | "setback"
  | "deployment"
  | "research"
  | "funding"
  | "technology";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  url?: string;
  timestamp: string;
  author: {
    username: string;
    avatar?: string;
  };
  upvotes: number;
  comments: number;
  tags: string[];
}

export async function getActivities(limit = 10): Promise<Activity[]> {
  "use cache";

  cacheLife({ stale: 3600, revalidate: 3600 * 4 });
  try {
    // Execute all queries in parallel for better performance
    const [recentComments, recentPredictions, recentUpdates] =
      await Promise.all([
        // Comments with user info and reply count
        db
          .select({
            id: capabilityComment.id,
            content: capabilityComment.content,
            upvotes: capabilityComment.upvotes,
            createdAt: capabilityComment.createdAt,
            userId: capabilityComment.userId,
            capabilityName: capability.name,
            capabilitySlug: capability.slug,
            replyCount: sql<number>`
            (SELECT COUNT(*) FROM ${capabilityComment} c2 
             WHERE c2.parent_id = ${capabilityComment.id})
          `.as("reply_count"),
            username: user.displayUsername,
            userUsername: user.username,
            userName: user.name,
          })
          .from(capabilityComment)
          .innerJoin(
            capability,
            eq(capabilityComment.capabilityId, capability.id),
          )
          .leftJoin(user, eq(capabilityComment.userId, user.id))
          .where(sql`${capabilityComment.parentId} IS NULL`)
          .orderBy(desc(capabilityComment.createdAt))
          .limit(limit),

        // Predictions with user info
        db
          .select({
            id: capabilityPrediction.id,
            predictedYear: capabilityPrediction.predictedYear,
            confidence: capabilityPrediction.confidence,
            reasoning: capabilityPrediction.reasoning,
            createdAt: capabilityPrediction.createdAt,
            userId: capabilityPrediction.userId,
            capabilityName: capability.name,
            capabilitySlug: capability.slug,
            capabilityStatus: capability.status,
            username: user.displayUsername,
            userUsername: user.username,
            userName: user.name,
          })
          .from(capabilityPrediction)
          .innerJoin(
            capability,
            eq(capabilityPrediction.capabilityId, capability.id),
          )
          .leftJoin(user, eq(capabilityPrediction.userId, user.id))
          .orderBy(desc(capabilityPrediction.createdAt))
          .limit(limit),

        // Capability updates (only with breakthrough dates)
        db
          .select({
            id: capability.id,
            name: capability.name,
            slug: capability.slug,
            updatedAt: capability.updatedAt,
            recentBreakthroughDate: capability.recentBreakthroughDate,
            status: capability.status,
          })
          .from(capability)
          .where(
            and(
              sql`${capability.updatedAt} > NOW() - INTERVAL '7 days'`,
              sql`${capability.recentBreakthroughDate} IS NOT NULL`,
            ),
          )
          .orderBy(desc(capability.updatedAt))
          .limit(limit),
      ]);

    // Combine and map all activities with raw timestamps for sorting
    const activitiesWithTimestamp: Array<Activity & { rawTimestamp: Date }> =
      [];

    // Map comments
    for (const comment of recentComments) {
      const username =
        comment.username ||
        comment.userUsername ||
        comment.userName ||
        "anonymous";

      activitiesWithTimestamp.push({
        id: `comment-${comment.id}`,
        type: "research",
        title: `New discussion on ${comment.capabilityName}`,
        description: comment.content.slice(0, 200),
        url: `/capabilities/${comment.capabilitySlug}`,
        timestamp: formatRelativeTime(comment.createdAt),
        rawTimestamp: comment.createdAt,
        author: { username },
        upvotes: comment.upvotes,
        comments: Number(comment.replyCount || 0),
        tags: [comment.capabilityName],
      });
    }

    // Map predictions
    for (const prediction of recentPredictions) {
      const username =
        prediction.username ||
        prediction.userUsername ||
        prediction.userName ||
        "expert";
      const isBreakthrough =
        prediction.capabilityStatus === "solved" ||
        (prediction.capabilityStatus === "partial" &&
          prediction.confidence === "high");

      activitiesWithTimestamp.push({
        id: `prediction-${prediction.id}`,
        type: isBreakthrough ? "breakthrough" : "research",
        title: `${username} predicted ${prediction.capabilityName} by ${prediction.predictedYear}`,
        description:
          prediction.reasoning?.slice(0, 200) ||
          `New prediction for ${prediction.capabilityName} with ${prediction.confidence} confidence`,
        url: `/capabilities/${prediction.capabilitySlug}`,
        timestamp: formatRelativeTime(prediction.createdAt),
        rawTimestamp: prediction.createdAt,
        author: { username },
        upvotes: 0,
        comments: 0,
        tags: [prediction.capabilityName, "Prediction"],
      });
    }

    // Map updates
    for (const update of recentUpdates) {
      activitiesWithTimestamp.push({
        id: `update-${update.id}`,
        type: "breakthrough",
        title: `Breakthrough in ${update.name}`,
        description: `Recent progress update on ${update.name} capability`,
        url: `/capabilities/${update.slug}`,
        timestamp: formatRelativeTime(update.updatedAt),
        rawTimestamp: update.updatedAt,
        author: { username: "community" },
        upvotes: 0,
        comments: 0,
        tags: [update.name],
      });
    }

    // Sort by raw timestamp (most recent first) and limit
    activitiesWithTimestamp.sort((a, b) => {
      return b.rawTimestamp.getTime() - a.rawTimestamp.getTime();
    });

    // Remove rawTimestamp and return only Activity objects
    const activities: Activity[] = activitiesWithTimestamp
      .slice(0, limit)
      .map(({ rawTimestamp, ...activity }) => activity);

    return activities;
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
}

// Helper function to format relative time
function formatRelativeTime(date: Date | null): string {
  if (!date) return "unknown";
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return `${Math.floor(diffDays / 7)}w`;
}

// Get stats
export interface Stats {
  reports: number;
  experts: number;
  papers: number;
  jobsSafe: number;
}

export async function getStats(): Promise<Stats> {
  "use cache";

  cacheLife({ stale: 3600, revalidate: 3600 * 24 });
  try {
    // Single query with subqueries to get all stats at once
    const result = await db
      .select({
        capabilityCommentsCount: sql<number>`
          (SELECT COUNT(*) FROM ${capabilityComment})
        `.as("capability_comments_count"),
        jobCommentsCount: sql<number>`
          (SELECT COUNT(*) FROM ${jobComment})
        `.as("job_comments_count"),
        expertsCount: sql<number>`
          (SELECT COUNT(DISTINCT ${capabilityPrediction.userId}) FROM ${capabilityPrediction})
        `.as("experts_count"),
        jobsSafe: sql<number>`
          (SELECT COALESCE(SUM(${job.totalWorkersGlobal}), 0) FROM ${job} WHERE ${job.automationPercentage} < 50)
        `.as("jobs_safe"),
      })
      .from(capability)
      .limit(1);

    const stats = result[0];

    return {
      reports:
        Number(stats?.capabilityCommentsCount || 0) +
        Number(stats?.jobCommentsCount || 0),
      experts: Number(stats?.expertsCount || 0),
      papers: 0, // Papers not in database
      jobsSafe: Number(stats?.jobsSafe || 0),
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      reports: 0,
      experts: 0,
      papers: 0,
      jobsSafe: 0,
    };
  }
}

// Get AGI Progress
export interface AGIProgress {
  overall: number;
  lastUpdated: string;
  lastUpdatedBy: string;
  contributors: number;
  expertForecasts: number;
  reports: number;
}

export async function getAGIProgress(): Promise<AGIProgress> {
  "use cache";

  cacheLife({ stale: 3600, revalidate: 3600 * 24 });
  try {
    // Single query to get all data at once
    const result = await db
      .select({
        // Overall progress
        overall: sql<number>`ROUND(COALESCE(AVG(${capability.progressPercentage}), 0))::int`,
        // Most recent capability update
        maxUpdated: sql<Date>`MAX(${capability.updatedAt})`,
        // Unique contributors count (from comments, predictions, and tracking)
        contributors: sql<number>`
          (SELECT COUNT(DISTINCT user_id) FROM (
            SELECT user_id FROM ${capabilityComment}
            UNION
            SELECT user_id FROM ${capabilityPrediction}
            UNION
            SELECT user_id FROM ${capabilityTracking}
          ) AS all_contributors)::int
        `,
        // Expert forecasts count (predictions)
        expertForecasts: sql<number>`(SELECT COUNT(*) FROM ${capabilityPrediction})::int`,
        // Reports count (comments)
        reports: sql<number>`(SELECT COUNT(*) FROM ${capabilityComment})::int`,
        // Most recent user who updated (from most recent comment, prediction, or tracking)
        lastUpdatedBy: sql<string>`
          COALESCE(
            (SELECT COALESCE(u.display_username, u.username, u.name) FROM ${user} u
             WHERE u.id = (
               SELECT user_id FROM (
                 SELECT user_id, updated_at AS activity_time FROM ${capabilityComment}
                 UNION ALL
                 SELECT user_id, updated_at AS activity_time FROM ${capabilityPrediction}
                 UNION ALL
                 SELECT user_id, created_at AS activity_time FROM ${capabilityTracking}
               ) AS recent_activities
               ORDER BY activity_time DESC NULLS LAST
               LIMIT 1
             )
             LIMIT 1),
            'community'
          )
        `,
        // Most recent activity timestamp
        mostRecentActivity: sql<Date | null>`
          NULLIF(
            GREATEST(
              COALESCE((SELECT MAX(updated_at) FROM ${capabilityComment}), '1970-01-01'::timestamp),
              COALESCE((SELECT MAX(updated_at) FROM ${capabilityPrediction}), '1970-01-01'::timestamp),
              COALESCE((SELECT MAX(created_at) FROM ${capabilityTracking}), '1970-01-01'::timestamp)
            ),
            '1970-01-01'::timestamp
          )
        `,
      })
      .from(capability);

    const data = result[0];

    // Use the most recent between capability update and activity update
    const mostRecent = data?.mostRecentActivity || data?.maxUpdated;
    const lastUpdated = mostRecent ? formatRelativeTime(mostRecent) : "unknown";

    return {
      overall: Number(data?.overall || 0),
      lastUpdated,
      lastUpdatedBy: data?.lastUpdatedBy || "community",
      contributors: Number(data?.contributors || 0),
      expertForecasts: Number(data?.expertForecasts || 0),
      reports: Number(data?.reports || 0),
    };
  } catch (error) {
    console.error("Error fetching AGI progress:", error);
    return {
      overall: 0,
      lastUpdated: "unknown",
      lastUpdatedBy: "community",
      contributors: 0,
      expertForecasts: 0,
      reports: 0,
    };
  }
}
