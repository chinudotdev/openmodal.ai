import { z } from "zod";

/**
 * Report Vote Schema
 */
export const reportVoteSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
  voteType: z.enum(["up", "down"]),
});

export type ReportVoteInput = z.infer<typeof reportVoteSchema>;
