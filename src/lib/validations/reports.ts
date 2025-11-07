import { z } from "zod";

/**
 * Report Type Enum
 */
export const reportTypeSchema = z.enum(["deployment", "barrier", "research"]);

/**
 * Deployment Report - Step 1: Basic Information
 */
export const deploymentBasicInfoSchema = z.object({
  jobId: z.string().optional(),
  jobTitle: z
    .string()
    .min(1, "Job title is required")
    .max(200, "Job title is too long"),
  technology: z
    .string()
    .min(1, "Technology is required")
    .max(200, "Technology name is too long"),
  company: z.string().max(200, "Company name is too long").optional(),
  country: z.string().min(1, "Country is required"),
  stateProvince: z.string().optional(),
  city: z.string().optional(),
  location: z.string().optional(), // Full location string
});

export type DeploymentBasicInfoInput = z.infer<
  typeof deploymentBasicInfoSchema
>;

/**
 * Deployment Report - Step 2: Impact Data
 */
export const deploymentImpactSchema = z.object({
  deploymentStatus: z.enum(["fully_deployed", "pilot", "announced", "failed"]),
  deploymentDate: z.date().optional(),
  workersAffected: z
    .number()
    .int()
    .min(0, "Workers affected must be 0 or greater")
    .optional(),
  impactType: z.enum([
    "completely_replaced",
    "partially_replaced",
    "augmented",
    "no_job_loss",
  ]),
  automationPercentage: z
    .number()
    .int()
    .min(0)
    .max(100, "Automation percentage must be 0-100"),
  performanceComparison: z.enum([
    "better_than_humans",
    "about_same",
    "worse_improving",
    "worse_not_improving",
  ]),
});

export type DeploymentImpactInput = z.infer<typeof deploymentImpactSchema>;

/**
 * Deployment Report - Step 3: Evidence & Details
 */
export const deploymentEvidenceSchema = z.object({
  description: z
    .string()
    .min(500, "Description must be at least 500 characters")
    .max(2000, "Description must be no more than 2000 characters"),
  evidenceLinks: z
    .array(z.string().url("Must be a valid URL"))
    .min(1, "At least one evidence link is required"),
  fileUrls: z.array(z.string().url()).optional(), // Uploaded file URLs
  source: z.enum([
    "work_at_company",
    "news_article",
    "public_announcement",
    "industry_knowledge",
    "other",
  ]),
  sourceOther: z.string().max(200).optional(), // If source is "other"
});

export type DeploymentEvidenceInput = z.infer<typeof deploymentEvidenceSchema>;

/**
 * Complete Deployment Report
 */
export const deploymentReportSchema = z.object({
  type: z.literal("deployment"),
  step1: deploymentBasicInfoSchema,
  step2: deploymentImpactSchema,
  step3: deploymentEvidenceSchema,
  isDraft: z.boolean().default(false),
});

export type DeploymentReportInput = z.infer<typeof deploymentReportSchema>;

/**
 * Barrier Report - Step 1: Basic Information
 */
export const barrierBasicInfoSchema = z.object({
  jobId: z.string().optional(),
  jobTitle: z
    .string()
    .min(1, "Job title is required")
    .max(200, "Job title is too long"),
  capabilityId: z.string().optional(), // Barrier preventing automation
  technology: z
    .string()
    .min(1, "Technology is required")
    .max(200, "Technology name is too long"),
  company: z.string().max(200, "Company name is too long").optional(),
  country: z.string().min(1, "Country is required"),
  stateProvince: z.string().optional(),
  city: z.string().optional(),
  location: z.string().optional(),
});

export type BarrierBasicInfoInput = z.infer<typeof barrierBasicInfoSchema>;

/**
 * Barrier Report - Step 2: Impact Data
 */
export const barrierImpactSchema = z.object({
  barrierType: z.enum([
    "regulatory",
    "technical",
    "cost",
    "safety",
    "trust",
    "other",
  ]),
  barrierDescription: z
    .string()
    .min(200, "Barrier description must be at least 200 characters")
    .max(1000, "Barrier description must be no more than 1000 characters"),
  estimatedSolveDate: z.string().optional(), // e.g., "2030-2035" or "Unknown"
  organizationsWorkingOnIt: z.number().int().min(0).optional(),
});

export type BarrierImpactInput = z.infer<typeof barrierImpactSchema>;

/**
 * Barrier Report - Step 3: Evidence & Details
 */
export const barrierEvidenceSchema = z.object({
  description: z
    .string()
    .min(500, "Description must be at least 500 characters")
    .max(2000, "Description must be no more than 2000 characters"),
  evidenceLinks: z
    .array(z.string().url("Must be a valid URL"))
    .min(1, "At least one evidence link is required"),
  fileUrls: z.array(z.string().url()).optional(),
  source: z.enum([
    "work_at_company",
    "news_article",
    "public_announcement",
    "industry_knowledge",
    "other",
  ]),
  sourceOther: z.string().max(200).optional(),
});

export type BarrierEvidenceInput = z.infer<typeof barrierEvidenceSchema>;

/**
 * Complete Barrier Report
 */
export const barrierReportSchema = z.object({
  type: z.literal("barrier"),
  step1: barrierBasicInfoSchema,
  step2: barrierImpactSchema,
  step3: barrierEvidenceSchema,
  isDraft: z.boolean().default(false),
});

export type BarrierReportInput = z.infer<typeof barrierReportSchema>;

/**
 * Research Report - Step 1: Basic Information
 */
export const researchBasicInfoSchema = z.object({
  capabilityId: z.string().optional(),
  capabilityName: z
    .string()
    .min(1, "Capability name is required")
    .max(200, "Capability name is too long"),
  technology: z
    .string()
    .min(1, "Technology is required")
    .max(200, "Technology name is too long"),
  organization: z.string().max(200, "Organization name is too long").optional(),
  country: z.string().min(1, "Country is required").optional(),
  stateProvince: z.string().optional(),
  city: z.string().optional(),
  location: z.string().optional(),
});

export type ResearchBasicInfoInput = z.infer<typeof researchBasicInfoSchema>;

/**
 * Research Report - Step 2: Impact Data
 */
export const researchImpactSchema = z.object({
  researchType: z.enum([
    "breakthrough",
    "paper",
    "demo",
    "announcement",
    "other",
  ]),
  publicationDate: z.date().optional(),
  impactDescription: z
    .string()
    .min(200, "Impact description must be at least 200 characters")
    .max(1000, "Impact description must be no more than 1000 characters"),
  potentialJobsAffected: z.number().int().min(0).optional(),
});

export type ResearchImpactInput = z.infer<typeof researchImpactSchema>;

/**
 * Research Report - Step 3: Evidence & Details
 */
export const researchEvidenceSchema = z.object({
  description: z
    .string()
    .min(500, "Description must be at least 500 characters")
    .max(2000, "Description must be no more than 2000 characters"),
  evidenceLinks: z
    .array(z.string().url("Must be a valid URL"))
    .min(1, "At least one evidence link is required"),
  fileUrls: z.array(z.string().url()).optional(),
  source: z.enum([
    "work_at_company",
    "news_article",
    "public_announcement",
    "industry_knowledge",
    "other",
  ]),
  sourceOther: z.string().max(200).optional(),
});

export type ResearchEvidenceInput = z.infer<typeof researchEvidenceSchema>;

/**
 * Complete Research Report
 */
export const researchReportSchema = z.object({
  type: z.literal("research"),
  step1: researchBasicInfoSchema,
  step2: researchImpactSchema,
  step3: researchEvidenceSchema,
  isDraft: z.boolean().default(false),
});

export type ResearchReportInput = z.infer<typeof researchReportSchema>;

/**
 * Union type for all report types
 */
export const reportSchema = z.discriminatedUnion("type", [
  deploymentReportSchema,
  barrierReportSchema,
  researchReportSchema,
]);

export type ReportInput = z.infer<typeof reportSchema>;

/**
 * Partial schemas for each report type (for updates)
 */
const deploymentReportPartialSchema = deploymentReportSchema.partial();
const barrierReportPartialSchema = barrierReportSchema.partial();
const researchReportPartialSchema = researchReportSchema.partial();

/**
 * Report Update Schema (for editing)
 * Uses union of partial schemas since discriminatedUnion doesn't support .partial()
 */
export const reportUpdateSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
  data: z.union([
    deploymentReportPartialSchema,
    barrierReportPartialSchema,
    researchReportPartialSchema,
  ]),
});

export type ReportUpdateInput = z.infer<typeof reportUpdateSchema>;
