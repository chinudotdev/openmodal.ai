"use server";

import { generateRandomString } from "better-auth/crypto";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  report,
  reportComment,
  user,
  userBadge,
  userProfile,
  userReputation,
} from "@/db/schema";
import { checkOnboardingFromSession } from "@/lib/session-utils";
import { commentSchema, commentUpdateSchema } from "@/lib/validations";

/**
 * Create comment on report
 */
export async function createReportComment(
  userId: string,
  commentData: z.infer<typeof commentSchema>,
) {
  try {
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

    // Validate input
    const validated = commentSchema.parse(commentData);

    // Create comment
    const commentId = generateRandomString(32);
    await db.insert(reportComment).values({
      id: commentId,
      reportId: validated.reportId,
      userId,
      parentId: validated.parentId || null,
      content: validated.content,
      upvotes: 0,
      downvotes: 0,
    });

    // Update report comment count
    const reportData = await db
      .select()
      .from(report)
      .where(eq(report.id, validated.reportId))
      .limit(1);

    if (reportData.length > 0) {
      await db
        .update(report)
        .set({
          commentCount: reportData[0].commentCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(report.id, validated.reportId));
    }

    return { success: true, commentId };
  } catch (error) {
    console.error("Error creating comment:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    return { success: false, error: "Failed to create comment" };
  }
}

/**
 * Get report comments (threaded)
 */
export async function getReportComments(reportId: string) {
  try {
    const rows = await db
      .select({
        comment: reportComment,
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
      })
      .from(reportComment)
      .leftJoin(user, eq(reportComment.userId, user.id))
      .leftJoin(userProfile, eq(userProfile.userId, user.id))
      .leftJoin(userReputation, eq(userReputation.userId, user.id))
      .where(
        and(
          eq(reportComment.reportId, reportId),
          isNull(reportComment.deletedAt),
        ),
      )
      .orderBy(desc(reportComment.upvotes), desc(reportComment.createdAt));

    const userIds = Array.from(
      new Set(
        rows
          .map((row) => row.comment.userId)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const badges = userIds.length
      ? await db
          .select()
          .from(userBadge)
          .where(inArray(userBadge.userId, userIds))
      : [];

    const badgeMap = new Map<string, typeof badges>();
    for (const badge of badges) {
      if (!badgeMap.has(badge.userId)) {
        badgeMap.set(badge.userId, []);
      }
      const userBadges = badgeMap.get(badge.userId);
      if (userBadges) {
        userBadges.push(badge);
      }
    }

    type CommentWithMeta = (typeof rows)[number]["comment"] & {
      author: (typeof rows)[number]["author"] | null;
      profile: (typeof rows)[number]["profile"] | null;
      reputation: (typeof rows)[number]["reputation"] | null;
      badges: typeof badges;
      replies: CommentWithMeta[];
    };

    const items: CommentWithMeta[] = rows.map((row) => ({
      ...row.comment,
      author: row.author || null,
      profile: row.profile || null,
      reputation: row.reputation || null,
      badges: badgeMap.get(row.comment.userId) || [],
      replies: [],
    }));

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

    return rootComments;
  } catch (error) {
    console.error("Error getting report comments:", error);
    return [];
  }
}

/**
 * Update comment
 */
export async function updateComment(
  commentId: string,
  userId: string,
  commentData: z.infer<typeof commentUpdateSchema>,
) {
  try {
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

    // Validate input
    const validated = commentUpdateSchema.parse(commentData);

    // Check if comment exists and belongs to user
    const existing = await db
      .select()
      .from(reportComment)
      .where(
        and(
          eq(reportComment.id, commentId),
          eq(reportComment.userId, userId),
          isNull(reportComment.deletedAt),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Comment not found" };
    }

    // Update comment
    await db
      .update(reportComment)
      .set({
        content: validated.content,
        updatedAt: new Date(),
      })
      .where(eq(reportComment.id, commentId));

    return { success: true };
  } catch (error) {
    console.error("Error updating comment:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    return { success: false, error: "Failed to update comment" };
  }
}

/**
 * Soft delete comment
 */
export async function softDeleteComment(commentId: string, userId: string) {
  try {
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

    // Check if comment exists and belongs to user
    const existing = await db
      .select()
      .from(reportComment)
      .where(
        and(
          eq(reportComment.id, commentId),
          eq(reportComment.userId, userId),
          isNull(reportComment.deletedAt),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Comment not found" };
    }

    // Soft delete
    await db
      .update(reportComment)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reportComment.id, commentId));

    // Update report comment count
    const reportData = await db
      .select()
      .from(report)
      .where(eq(report.id, existing[0].reportId))
      .limit(1);

    if (reportData.length > 0) {
      await db
        .update(report)
        .set({
          commentCount: Math.max(0, reportData[0].commentCount - 1),
          updatedAt: new Date(),
        })
        .where(eq(report.id, existing[0].reportId));
    }

    return { success: true };
  } catch (error) {
    console.error("Error soft deleting comment:", error);
    return { success: false, error: "Failed to delete comment" };
  }
}

/**
 * Restore soft-deleted comment
 */
export async function restoreComment(commentId: string, userId: string) {
  try {
    // Check onboarding completion from session
    const onboardingCompleted = await checkOnboardingFromSession();
    if (onboardingCompleted === null) {
      return { success: false, error: "Please sign in to restore comments" };
    }
    if (!onboardingCompleted) {
      return {
        success: false,
        error: "Please complete onboarding before restoring comments",
      };
    }

    // Check if comment exists and belongs to user
    const existing = await db
      .select()
      .from(reportComment)
      .where(
        and(eq(reportComment.id, commentId), eq(reportComment.userId, userId)),
      )
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Comment not found" };
    }

    // Restore
    await db
      .update(reportComment)
      .set({
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(reportComment.id, commentId));

    // Update report comment count
    const reportData = await db
      .select()
      .from(report)
      .where(eq(report.id, existing[0].reportId))
      .limit(1);

    if (reportData.length > 0) {
      await db
        .update(report)
        .set({
          commentCount: reportData[0].commentCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(report.id, existing[0].reportId));
    }

    return { success: true };
  } catch (error) {
    console.error("Error restoring comment:", error);
    return { success: false, error: "Failed to restore comment" };
  }
}
