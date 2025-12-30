"use server";

import { generateRandomString } from "better-auth/crypto";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
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

    // Optimized: Single query to create comment and update report count
    const commentId = generateRandomString(32);

    await db.execute(sql`
      WITH comment_insert AS (
        INSERT INTO ${reportComment} (
          id, report_id, user_id, parent_id, content, upvotes, downvotes
        )
        VALUES (
          ${commentId},
          ${validated.reportId},
          ${userId},
          ${validated.parentId || null},
          ${validated.content},
          0,
          0
        )
        RETURNING report_id
      )
      UPDATE ${report}
      SET 
        comment_count = comment_count + 1,
        updated_at = NOW()
      WHERE id = ${validated.reportId}
    `);

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
    // Optimized: Single query with JSON aggregation for badges
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
        badges: sql<Array<typeof userBadge.$inferSelect>>`
          COALESCE(
            (SELECT json_agg(b.* ORDER BY b.earned_at DESC)
             FROM ${userBadge} b
             WHERE b.user_id = ${reportComment.userId}),
            '[]'::json
          )
        `.as("badges"),
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

    // Optimized: Single query to soft delete comment and update report count
    await db.execute(sql`
      WITH comment_delete AS (
        UPDATE ${reportComment}
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = ${commentId}
          AND user_id = ${userId}
          AND deleted_at IS NULL
        RETURNING report_id
      )
      UPDATE ${report}
      SET 
        comment_count = GREATEST(0, comment_count - 1),
        updated_at = NOW()
      WHERE id = (SELECT report_id FROM comment_delete)
    `);

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

    // Optimized: Single query to restore comment and update report count
    await db.execute(sql`
      WITH comment_restore AS (
        UPDATE ${reportComment}
        SET deleted_at = NULL, updated_at = NOW()
        WHERE id = ${commentId}
          AND user_id = ${userId}
        RETURNING report_id
      )
      UPDATE ${report}
      SET 
        comment_count = comment_count + 1,
        updated_at = NOW()
      WHERE id = (SELECT report_id FROM comment_restore)
    `);

    return { success: true };
  } catch (error) {
    console.error("Error restoring comment:", error);
    return { success: false, error: "Failed to restore comment" };
  }
}
