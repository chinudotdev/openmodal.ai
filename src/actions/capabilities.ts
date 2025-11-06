"use server";

import { db } from "@/db";
import {
  bottleneck,
  capability,
  capabilityCategory,
  capabilityComment,
  capabilityCommentVote,
  capabilityOrganization,
  capabilityPrediction,
  capabilityTracking,
  organization,
  type CapabilityStatus,
  type CommentVoteType,
  type PredictionBackground,
  type PredictionConfidence,
} from "@/db/schema/capabilities";
import { generateRandomString } from "better-auth/crypto";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

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
  return db
    .select()
    .from(capabilityCategory)
    .orderBy(asc(capabilityCategory.name));
}

// Track capability
export async function trackCapability(capabilityId: string, userId: string) {
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

  // Create tracking record
  await db.insert(capabilityTracking).values({
    id: generateRandomString(32),
    capabilityId,
    userId,
    notificationsEnabled: true,
  });

  // Update tracking count
  const current = await db
    .select({ trackingCount: capability.trackingCount })
    .from(capability)
    .where(eq(capability.id, capabilityId))
    .limit(1);

  if (current.length > 0) {
    await db
      .update(capability)
      .set({
        trackingCount: current[0].trackingCount + 1,
      })
      .where(eq(capability.id, capabilityId));
  }

  return { success: true, alreadyTracking: false };
}

// Untrack capability
export async function untrackCapability(capabilityId: string, userId: string) {
  const result = await db
    .delete(capabilityTracking)
    .where(
      and(
        eq(capabilityTracking.capabilityId, capabilityId),
        eq(capabilityTracking.userId, userId)
      )
    );

  // Update tracking count
  const current = await db
    .select({ trackingCount: capability.trackingCount })
    .from(capability)
    .where(eq(capability.id, capabilityId))
    .limit(1);

  if (current.length > 0 && current[0].trackingCount > 0) {
    await db
      .update(capability)
      .set({
        trackingCount: current[0].trackingCount - 1,
      })
      .where(eq(capability.id, capabilityId));
  }

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

  // Recalculate community median
  const allPredictions = await db
    .select()
    .from(capabilityPrediction)
    .where(eq(capabilityPrediction.capabilityId, capabilityId));

  if (allPredictions.length > 0) {
    const years = allPredictions
      .map((p) => p.predictedYear)
      .sort((a, b) => a - b);
    const median = years[Math.floor(years.length / 2)];

    await db
      .update(capability)
      .set({
        communityPredictionMedian: median,
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
  const current = await db
    .select({ viewCount: capability.viewCount })
    .from(capability)
    .where(eq(capability.id, capabilityId))
    .limit(1);

  if (current.length > 0) {
    await db
      .update(capability)
      .set({ viewCount: current[0].viewCount + 1 })
      .where(eq(capability.id, capabilityId));
  }

  return { success: true };
}
