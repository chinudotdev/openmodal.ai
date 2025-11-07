"use server";

import { generateRandomString } from "better-auth/crypto";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
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
import { cacheTag } from "next/cache";

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
  const result = await db
    .select()
    .from(capability)
    .leftJoin(
      capabilityCategory,
      eq(capability.categoryId, capabilityCategory.id)
    )
    .where(eq(capability.slug, slug))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const cap = result[0].capability;
  const category = result[0].capability_category;

  // Get bottlenecks
  const bottlenecks = await db
    .select()
    .from(bottleneck)
    .where(eq(bottleneck.capabilityId, cap.id))
    .orderBy(desc(bottleneck.severity));

  // Get organizations
  const orgs = await db
    .select({
      organization: organization,
      focusArea: capabilityOrganization.focusArea,
    })
    .from(capabilityOrganization)
    .innerJoin(
      organization,
      eq(capabilityOrganization.organizationId, organization.id)
    )
    .where(eq(capabilityOrganization.capabilityId, cap.id));

  return {
    ...cap,
    category,
    bottlenecks,
    organizations: orgs.map((o) => ({
      ...o.organization,
      focusArea: o.focusArea,
    })),
  };
}

// Get capabilities with filters
export async function getCapabilities(
  filters: CapabilityFilters = {},
  sort: CapabilitySort = "progress_desc",
  limit = 20,
  offset = 0
) {
  // Build conditions array
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
          ilike(capability.timelineEstimate, "%2-5%")
        )
      );
    } else if (filters.timeline === "medium") {
      conditions.push(
        or(
          ilike(capability.timelineEstimate, "%5-15%"),
          ilike(capability.timelineEstimate, "%10-15%")
        )
      );
    } else if (filters.timeline === "far") {
      conditions.push(
        or(
          ilike(capability.timelineEstimate, "%15+%"),
          ilike(capability.timelineEstimate, "%20+%")
        )
      );
    }
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(capability.name, `%${filters.search}%`),
        ilike(capability.description, `%${filters.search}%`)
      )
    );
  }

  // Build query with where clause
  const baseQuery = db.select().from(capability);
  const queryWithWhere =
    conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

  // Apply sorting and build final query
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

  // Apply pagination and execute
  const results = await queryWithWhere
    .orderBy(getSortOrder())
    .limit(limit)
    .offset(offset);

  // Get categories for each capability
  const categories = await db
    .select()
    .from(capabilityCategory)
    .where(
      inArray(
        capabilityCategory.id,
        results.map((r) => r.categoryId)
      )
    );

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return results.map((cap) => ({
    ...cap,
    category: categoryMap.get(cap.categoryId),
  }));
}

// Get capability categories
export async function getCapabilityCategories() {
  "use cache";
  cacheTag("capability-categories");
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
        eq(capabilityTracking.userId, userId)
      )
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
          eq(capabilityTracking.userId, userId)
        )
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
  userId: string
) {
  const result = await db
    .select()
    .from(capabilityTracking)
    .where(
      and(
        eq(capabilityTracking.capabilityId, capabilityId),
        eq(capabilityTracking.userId, userId)
      )
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
  }
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

  // Check if prediction exists
  const existing = await db
    .select()
    .from(capabilityPrediction)
    .where(
      and(
        eq(capabilityPrediction.capabilityId, capabilityId),
        eq(capabilityPrediction.userId, userId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    await db
      .update(capabilityPrediction)
      .set({
        ...prediction,
        updatedAt: new Date(),
      })
      .where(eq(capabilityPrediction.id, existing[0].id));
  } else {
    // Create new
    await db.insert(capabilityPrediction).values({
      id: generateRandomString(32),
      capabilityId,
      userId,
      ...prediction,
    });
  }

  // Recalculate community median using SQL
  const result = await db
    .select({
      median: sql<number>`
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${capabilityPrediction.predictedYear})
      `,
    })
    .from(capabilityPrediction)
    .where(eq(capabilityPrediction.capabilityId, capabilityId));

  if (result.length > 0 && result[0].median !== null) {
    await db
      .update(capability)
      .set({
        communityPredictionMedian: Math.round(result[0].median),
      })
      .where(eq(capability.id, capabilityId));
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
        eq(capabilityPrediction.userId, userId)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// Create comment
export async function createComment(
  capabilityId: string,
  userId: string,
  content: string,
  parentId?: string
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
  content: string
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
        eq(capabilityComment.userId, userId)
      )
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
        eq(capabilityComment.userId, userId)
      )
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
  voteType: CommentVoteType
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

  // Check if vote exists
  const existing = await db
    .select()
    .from(capabilityCommentVote)
    .where(
      and(
        eq(capabilityCommentVote.commentId, commentId),
        eq(capabilityCommentVote.userId, userId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    if (existing[0].voteType === voteType) {
      // Remove vote
      await db
        .delete(capabilityCommentVote)
        .where(eq(capabilityCommentVote.id, existing[0].id));

      // Update upvotes
      const current = await db
        .select({ upvotes: capabilityComment.upvotes })
        .from(capabilityComment)
        .where(eq(capabilityComment.id, commentId))
        .limit(1);

      if (current.length > 0) {
        const delta = voteType === "up" ? -1 : 0;
        const newUpvotes = Math.max(0, current[0].upvotes + delta);
        await db
          .update(capabilityComment)
          .set({ upvotes: newUpvotes })
          .where(eq(capabilityComment.id, commentId));
      }
    } else {
      // Change vote
      await db
        .update(capabilityCommentVote)
        .set({ voteType })
        .where(eq(capabilityCommentVote.id, existing[0].id));

      // Update upvotes
      const current = await db
        .select({ upvotes: capabilityComment.upvotes })
        .from(capabilityComment)
        .where(eq(capabilityComment.id, commentId))
        .limit(1);

      if (current.length > 0) {
        const delta = voteType === "up" ? 2 : -2;
        const newUpvotes = Math.max(0, current[0].upvotes + delta);
        await db
          .update(capabilityComment)
          .set({ upvotes: newUpvotes })
          .where(eq(capabilityComment.id, commentId));
      }
    }
  } else {
    // Create new vote
    await db.insert(capabilityCommentVote).values({
      id: generateRandomString(32),
      commentId,
      userId,
      voteType,
    });

    // Update upvotes
    const current = await db
      .select({ upvotes: capabilityComment.upvotes })
      .from(capabilityComment)
      .where(eq(capabilityComment.id, commentId))
      .limit(1);

    if (current.length > 0) {
      const delta = voteType === "up" ? 1 : 0;
      await db
        .update(capabilityComment)
        .set({ upvotes: current[0].upvotes + delta })
        .where(eq(capabilityComment.id, commentId));
    }
  }

  return { success: true };
}

// Get comments
export async function getComments(capabilityId: string, parentId?: string) {
  const conditions = [eq(capabilityComment.capabilityId, capabilityId)];

  if (parentId) {
    conditions.push(eq(capabilityComment.parentId, parentId));
  } else {
    conditions.push(sql`${capabilityComment.parentId} IS NULL`);
  }

  const comments = await db
    .select()
    .from(capabilityComment)
    .where(and(...conditions))
    .orderBy(
      desc(capabilityComment.upvotes),
      desc(capabilityComment.createdAt)
    );

  // Get user info for each comment
  const userIds = [...new Set(comments.map((c) => c.userId))];
  // Note: In a real app, you'd join with user table to get user info
  // For now, we'll just return the comments

  // Get replies for each comment
  const commentIds = comments.map((c) => c.id);
  const replies =
    commentIds.length > 0
      ? await db
          .select()
          .from(capabilityComment)
          .where(inArray(capabilityComment.parentId, commentIds))
          .orderBy(
            desc(capabilityComment.upvotes),
            desc(capabilityComment.createdAt)
          )
      : [];

  // Group replies by parent
  const repliesMap = new Map<string, typeof replies>();
  for (const reply of replies) {
    if (reply.parentId) {
      if (!repliesMap.has(reply.parentId)) {
        repliesMap.set(reply.parentId, []);
      }
      repliesMap.get(reply.parentId)!.push(reply);
    }
  }

  return comments.map((comment) => ({
    ...comment,
    replies: repliesMap.get(comment.id) || [],
  }));
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
  try {
    const activities: Activity[] = [];

    // Get recent capability comments with reply count as subquery
    const recentComments = await db
      .select({
        id: capabilityComment.id,
        content: capabilityComment.content,
        upvotes: capabilityComment.upvotes,
        createdAt: capabilityComment.createdAt,
        userId: capabilityComment.userId,
        capabilityId: capabilityComment.capabilityId,
        capabilityName: capability.name,
        capabilitySlug: capability.slug,
        replyCount: sql<number>`
          (SELECT COUNT(*) FROM ${capabilityComment} c2 
           WHERE c2.parent_id = ${capabilityComment.id})
        `.as("reply_count"),
      })
      .from(capabilityComment)
      .innerJoin(capability, eq(capabilityComment.capabilityId, capability.id))
      .where(sql`${capabilityComment.parentId} IS NULL`)
      .orderBy(desc(capabilityComment.createdAt))
      .limit(limit);

    for (const comment of recentComments) {
      // Get user info (simplified - in real app you'd join with user table)
      const username = comment.userId.slice(0, 16) || "anonymous";

      activities.push({
        id: `comment-${comment.id}`,
        type: "research",
        title: `New discussion on ${comment.capabilityName}`,
        description: comment.content.slice(0, 200),
        url: `/capabilities/${comment.capabilitySlug}`,
        timestamp: formatRelativeTime(comment.createdAt),
        author: {
          username,
        },
        upvotes: comment.upvotes,
        comments: Number(comment.replyCount || 0),
        tags: [comment.capabilityName],
      });
    }

    // Get recent predictions
    const recentPredictions = await db
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
      })
      .from(capabilityPrediction)
      .innerJoin(
        capability,
        eq(capabilityPrediction.capabilityId, capability.id)
      )
      .orderBy(desc(capabilityPrediction.createdAt))
      .limit(limit);

    for (const prediction of recentPredictions) {
      const username = prediction.userId.slice(0, 16) || "expert";
      const isBreakthrough =
        prediction.capabilityStatus === "solved" ||
        (prediction.capabilityStatus === "partial" &&
          prediction.confidence === "high");

      activities.push({
        id: `prediction-${prediction.id}`,
        type: isBreakthrough ? "breakthrough" : "research",
        title: `${username} predicted ${prediction.capabilityName} by ${prediction.predictedYear}`,
        description:
          prediction.reasoning?.slice(0, 200) ||
          `New prediction for ${prediction.capabilityName} with ${prediction.confidence} confidence`,
        url: `/capabilities/${prediction.capabilitySlug}`,
        timestamp: formatRelativeTime(prediction.createdAt),
        author: {
          username,
        },
        upvotes: 0,
        comments: 0,
        tags: [prediction.capabilityName, "Prediction"],
      });
    }

    // Get recent capability updates
    const recentUpdates = await db
      .select({
        id: capability.id,
        name: capability.name,
        slug: capability.slug,
        updatedAt: capability.updatedAt,
        recentBreakthroughDate: capability.recentBreakthroughDate,
        status: capability.status,
      })
      .from(capability)
      .where(sql`${capability.updatedAt} > NOW() - INTERVAL '7 days'`)
      .orderBy(desc(capability.updatedAt))
      .limit(limit);

    for (const update of recentUpdates) {
      if (update.recentBreakthroughDate) {
        activities.push({
          id: `update-${update.id}`,
          type: "breakthrough",
          title: `Breakthrough in ${update.name}`,
          description: `Recent progress update on ${update.name} capability`,
          url: `/capabilities/${update.slug}`,
          timestamp: formatRelativeTime(update.updatedAt),
          author: {
            username: "community",
          },
          upvotes: 0,
          comments: 0,
          tags: [update.name],
        });
      }
    }

    // Sort by timestamp (most recent first)
    // Since we're getting activities from different sources, we need to sort them
    // Activities are already sorted by createdAt DESC from individual queries
    // We'll keep them in the order they were added (most recent first from each query)
    // For a more accurate sort, we'd need to store the actual Date and sort by that
    // For now, we'll just take the first N items as they're already roughly sorted

    return activities.slice(0, limit);
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
  try {
    // Count reports (capability comments + job comments)
    const capabilityCommentsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(capabilityComment);

    const jobCommentsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobComment);

    const reports =
      Number(capabilityCommentsCount[0]?.count || 0) +
      Number(jobCommentsCount[0]?.count || 0);

    // Count experts (users who made predictions)
    const expertsResult = await db
      .selectDistinct({ userId: capabilityPrediction.userId })
      .from(capabilityPrediction);

    const experts = expertsResult.length;

    // Papers not in database - return 0
    const papers = 0;

    // Jobs Safe: Sum of totalWorkersGlobal for jobs with automationPercentage < 50
    const jobsSafeResult = await db
      .select({
        total: sql<number>`sum(${job.totalWorkersGlobal})`,
      })
      .from(job)
      .where(sql`${job.automationPercentage} < 50`);

    const jobsSafe = Number(jobsSafeResult[0]?.total || 0);

    return {
      reports,
      experts,
      papers,
      jobsSafe,
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
  try {
    // Calculate overall progress as average of all capabilities
    const capabilitiesResult = await db
      .select({
        avgProgress: sql<number>`avg(${capability.progressPercentage})`,
        maxUpdated: sql<Date>`max(${capability.updatedAt})`,
      })
      .from(capability);

    const overall = Math.round(Number(capabilitiesResult[0]?.avgProgress || 0));

    // Get most recent update
    const mostRecent = capabilitiesResult[0]?.maxUpdated;
    const lastUpdated = mostRecent ? formatRelativeTime(mostRecent) : "unknown";

    // Count contributors (unique users from comments + predictions + tracking)
    const contributorsFromComments = await db
      .selectDistinct({ userId: capabilityComment.userId })
      .from(capabilityComment);

    const contributorsFromPredictions = await db
      .selectDistinct({ userId: capabilityPrediction.userId })
      .from(capabilityPrediction);

    const contributorsFromTracking = await db
      .selectDistinct({ userId: capabilityTracking.userId })
      .from(capabilityTracking);

    const contributorSet = new Set<string>();
    contributorsFromComments.forEach((c) => contributorSet.add(c.userId));
    contributorsFromPredictions.forEach((c) => contributorSet.add(c.userId));
    contributorsFromTracking.forEach((c) => contributorSet.add(c.userId));

    const contributors = contributorSet.size;

    // Count expert forecasts (predictions)
    const forecastsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(capabilityPrediction);

    const expertForecasts = Number(forecastsResult[0]?.count || 0);

    // Count reports (capability comments)
    const reportsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(capabilityComment);

    const reports = Number(reportsResult[0]?.count || 0);

    // Get last updated by (simplified - would need to join with user table)
    const lastUpdatedBy = "community";

    return {
      overall,
      lastUpdated,
      lastUpdatedBy,
      contributors,
      expertForecasts,
      reports,
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
