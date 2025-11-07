import { z } from "zod";

/**
 * Comment Schema
 */
export const commentSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment is too long"),
  parentId: z.string().optional(), // For threaded comments
});

export type CommentInput = z.infer<typeof commentSchema>;

/**
 * Comment Update Schema
 */
export const commentUpdateSchema = z.object({
  commentId: z.string().min(1, "Comment ID is required"),
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment is too long"),
});

export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>;

/**
 * Comment Vote Schema
 */
export const commentVoteSchema = z.object({
  commentId: z.string().min(1, "Comment ID is required"),
  voteType: z.enum(["up", "down"]),
});

export type CommentVoteInput = z.infer<typeof commentVoteSchema>;
