import { integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { type CommentVoteType, commentVoteTypeEnum } from "./capabilities";
import { report } from "./reports";

// Re-export type for convenience
export type { CommentVoteType };

// ============================================
// 1. REPORT COMMENT TABLE
// ============================================

export const reportComment = pgTable("report_comment", {
  id: text("id").primaryKey(),
  reportId: text("report_id")
    .notNull()
    .references(() => report.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  parentId: text("parent_id").references(
    // biome-ignore lint/suspicious/noExplicitAny: self-reference for threading
    (): any => reportComment.id,
    { onDelete: "cascade" },
  ), // For threaded comments
  content: text("content").notNull(),
  upvotes: integer("upvotes").notNull().default(0),
  downvotes: integer("downvotes").notNull().default(0),
  // Soft delete
  deletedAt: timestamp("deleted_at"), // Soft delete timestamp
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================
// 2. REPORT COMMENT VOTE TABLE
// ============================================

export const reportCommentVote = pgTable(
  "report_comment_vote",
  {
    id: text("id").primaryKey(),
    commentId: text("comment_id")
      .notNull()
      .references(() => reportComment.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    voteType: commentVoteTypeEnum("vote_type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    commentUserUnique: unique().on(table.commentId, table.userId),
  }),
);
