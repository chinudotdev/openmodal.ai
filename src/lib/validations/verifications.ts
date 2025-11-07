import { z } from "zod";

/**
 * Verification Schema
 */
export const verificationSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
  canVerify: z.boolean(), // true = verify, false = dispute
  source: z.enum([
    "work_at_company",
    "direct_knowledge",
    "additional_evidence",
    "industry_insider",
    "other",
  ]),
  comment: z.string().max(1000, "Comment is too long").optional(),
  evidenceLinks: z.array(z.string().url("Must be a valid URL")).optional(),
});

export type VerificationInput = z.infer<typeof verificationSchema>;

/**
 * Dispute Schema
 */
export const disputeSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
  reason: z.enum([
    "factually_inaccurate",
    "missing_context",
    "exaggerated_claims",
    "outdated_information",
    "spam_irrelevant",
    "other",
  ]),
  explanation: z
    .string()
    .min(200, "Explanation must be at least 200 characters")
    .max(2000, "Explanation is too long"),
  evidenceLinks: z
    .array(z.string().url("Must be a valid URL"))
    .min(1, "At least one evidence link is required"),
});

export type DisputeInput = z.infer<typeof disputeSchema>;
