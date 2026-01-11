"use server";

import { generateRandomString } from "better-auth/crypto";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  report,
  reportComment,
  reportCommentVote,
  reportVote,
} from "@/db/schema";
import { checkOnboardingFromSession } from "@/lib/session-utils";
import { commentVoteSchema, reportVoteSchema } from "@/lib/validations";

/**
 * Vote on report
 */
export async function voteReport(
  userId: string,
  voteData: z.infer<typeof reportVoteSchema>,
) {
  try {
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

    // Validate input
    const validated = reportVoteSchema.parse(voteData);

    // Optimized: Single query to handle vote upsert and update counts
    const voteId = generateRandomString(32);

    await db.execute(sql`
      WITH vote_upsert AS (
        INSERT INTO ${reportVote} (id, report_id, user_id, vote_type)
        SELECT 
          COALESCE(
            (SELECT id FROM ${reportVote}
             WHERE report_id = ${validated.reportId} AND user_id = ${userId} LIMIT 1),
            ${voteId}
          ),
          ${validated.reportId},
          ${userId},
          ${validated.voteType}
        ON CONFLICT (report_id, user_id) DO UPDATE
        SET vote_type = EXCLUDED.vote_type
        RETURNING report_id
      ),
      vote_counts AS (
        SELECT 
          COUNT(*) FILTER (WHERE vote_type = 'up')::int as upvotes,
          COUNT(*) FILTER (WHERE vote_type = 'down')::int as downvotes
        FROM ${reportVote}
        WHERE report_id = ${validated.reportId}
      )
      UPDATE ${report}
      SET 
        upvotes = (SELECT upvotes FROM vote_counts),
        downvotes = (SELECT downvotes FROM vote_counts),
        updated_at = NOW()
      WHERE id = ${validated.reportId}
    `);

    return { success: true };
  } catch (error) {
    console.error("Error voting on report:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    return { success: false, error: "Failed to vote on report" };
  }
}

/**
 * Vote on comment
 */
export async function voteComment(
  userId: string,
  voteData: z.infer<typeof commentVoteSchema>,
) {
  try {
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

    // Validate input
    const validated = commentVoteSchema.parse(voteData);

    // Optimized: Single query to handle vote upsert and update counts
    const voteId = generateRandomString(32);

    await db.execute(sql`
      WITH vote_upsert AS (
        INSERT INTO ${reportCommentVote} (id, comment_id, user_id, vote_type)
        SELECT 
          COALESCE(
            (SELECT id FROM ${reportCommentVote}
             WHERE comment_id = ${validated.commentId} AND user_id = ${userId} LIMIT 1),
            ${voteId}
          ),
          ${validated.commentId},
          ${userId},
          ${validated.voteType}
        ON CONFLICT (comment_id, user_id) DO UPDATE
        SET vote_type = EXCLUDED.vote_type
        RETURNING comment_id
      ),
      vote_counts AS (
        SELECT 
          COUNT(*) FILTER (WHERE vote_type = 'up')::int as upvotes,
          COUNT(*) FILTER (WHERE vote_type = 'down')::int as downvotes
        FROM ${reportCommentVote}
        WHERE comment_id = ${validated.commentId}
      )
      UPDATE ${reportComment}
      SET 
        upvotes = (SELECT upvotes FROM vote_counts),
        downvotes = (SELECT downvotes FROM vote_counts),
        updated_at = NOW()
      WHERE id = ${validated.commentId}
    `);

    return { success: true };
  } catch (error) {
    console.error("Error voting on comment:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
      };
    }
    return { success: false, error: "Failed to vote on comment" };
  }
}

/**
 * Get report votes
 */
export async function getReportVotes(reportId: string) {
  try {
    const votes = await db
      .select()
      .from(reportVote)
      .where(eq(reportVote.reportId, reportId));

    const upvotes = votes.filter((v) => v.voteType === "up").length;
    const downvotes = votes.filter((v) => v.voteType === "down").length;

    return { upvotes, downvotes, total: votes.length };
  } catch (error) {
    console.error("Error getting report votes:", error);
    return { upvotes: 0, downvotes: 0, total: 0 };
  }
}

/**
 * Get user vote on report
 */
export async function getUserVote(reportId: string, userId: string) {
  try {
    const vote = await db
      .select()
      .from(reportVote)
      .where(
        and(eq(reportVote.reportId, reportId), eq(reportVote.userId, userId)),
      )
      .limit(1);

    return vote[0] || null;
  } catch (error) {
    console.error("Error getting user vote:", error);
    return null;
  }
}
