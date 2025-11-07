import { z } from "zod";

/**
 * Onboarding Step 1: Basic Information
 * Username validation is handled by Better Auth's username plugin
 */
export const basicInfoSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be no more than 20 characters"),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(100, "Display name is too long"),
  location: z.string().optional(),
  country: z.string().optional(),
  stateProvince: z.string().optional(),
  city: z.string().optional(),
  ageRange: z
    .enum(["18-24", "25-34", "35-44", "45-54", "55-64", "65+"])
    .optional(),
  employmentStatus: z
    .enum([
      "full_time",
      "part_time",
      "self_employed",
      "unemployed",
      "student",
      "retired",
    ])
    .optional(),
});

export type BasicInfoInput = z.infer<typeof basicInfoSchema>;

/**
 * Onboarding Step 2: Professional Background
 */
export const professionalBackgroundSchema = z.object({
  currentJobTitle: z
    .string()
    .min(1, "Job title is required")
    .max(200, "Job title is too long"),
  industry: z
    .string()
    .min(1, "Industry is required")
    .max(100, "Industry is too long"),
  yearsOfExperience: z
    .enum(["0-1", "2-5", "6-10", "11-15", "16-20", "20+"])
    .optional(),
  companySize: z
    .enum(["1-10", "11-50", "51-200", "201-1000", "1000+"])
    .optional(),
  educationLevel: z
    .enum(["high_school", "associates", "bachelors", "masters", "phd", "other"])
    .optional(),
});

export type ProfessionalBackgroundInput = z.infer<
  typeof professionalBackgroundSchema
>;

/**
 * Onboarding Step 3: Automation Experience
 */
export const automationExperienceSchema = z.object({
  hasSeenAutomation: z.boolean(),
  automationTypes: z
    .array(z.enum(["ai_ml_software", "rpa", "physical_robots", "other"]))
    .optional(),
  automationImpact: z.string().max(500, "Description is too long").optional(),
});

export type AutomationExperienceInput = z.infer<
  typeof automationExperienceSchema
>;

/**
 * Onboarding Step 4: Platform Intent
 */
export const platformIntentSchema = z.object({
  platformIntents: z.array(z.string()).min(1, "Select at least one intent"),
  willingToContribute: z.boolean(),
});

export type PlatformIntentInput = z.infer<typeof platformIntentSchema>;

/**
 * Complete onboarding data
 */
export const onboardingDataSchema = z.object({
  step1: basicInfoSchema,
  step2: professionalBackgroundSchema,
  step3: automationExperienceSchema,
  step4: platformIntentSchema,
});

export type OnboardingDataInput = z.infer<typeof onboardingDataSchema>;
