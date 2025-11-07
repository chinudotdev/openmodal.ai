import { z } from "zod";

/**
 * Approve Report Schema
 */
export const approveReportSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
  moderationNotes: z.string().max(1000, "Notes are too long").optional(),
});

export type ApproveReportInput = z.infer<typeof approveReportSchema>;

/**
 * Reject Report Schema
 */
export const rejectReportSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
  moderationReason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason is too long"),
  moderationNotes: z.string().max(1000, "Notes are too long").optional(),
});

export type RejectReportInput = z.infer<typeof rejectReportSchema>;

/**
 * Request Changes Schema
 */
export const requestChangesSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
  moderationNotes: z
    .string()
    .min(10, "Notes must be at least 10 characters")
    .max(1000, "Notes are too long"),
});

export type RequestChangesInput = z.infer<typeof requestChangesSchema>;
