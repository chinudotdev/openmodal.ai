"use server";

import { generateRandomString } from "better-auth/crypto";
import { and, asc, eq, ilike, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  onboardingResponse,
  onboardingSession,
  reputationHistory,
  userProfile,
  userReputation,
} from "@/db/schema";
import { job } from "@/db/schema/jobs";
import { auth } from "@/lib/auth";
import {
  type AutomationExperienceInput,
  automationExperienceSchema,
  type BasicInfoInput,
  basicInfoSchema,
  type PlatformIntentInput,
  type ProfessionalBackgroundInput,
  platformIntentSchema,
  professionalBackgroundSchema,
} from "@/lib/validations";

/**
 * Get all jobs for dropdown
 */
export async function getAllJobsForDropdown() {
  try {
    const jobs = await db
      .select({
        id: job.id,
        title: job.title,
        industry: job.industry,
      })
      .from(job)
      .orderBy(asc(job.title));

    return { success: true, jobs };
  } catch (error) {
    console.error("Error getting jobs:", error);
    return { success: false, jobs: [], error: "Failed to get jobs" };
  }
}

/**
 * Get all unique industries for dropdown
 */
export async function getAllIndustries() {
  try {
    const industries = await db
      .selectDistinct({ industry: job.industry })
      .from(job)
      .where(sql`${job.industry} IS NOT NULL`)
      .orderBy(asc(job.industry));

    return {
      success: true,
      industries: industries.map((i) => i.industry).filter(Boolean),
    };
  } catch (error) {
    console.error("Error getting industries:", error);
    return {
      success: false,
      industries: [],
      error: "Failed to get industries",
    };
  }
}

/**
 * Search jobs by title
 */
export async function searchJobsByTitle(query: string, limit = 10) {
  try {
    if (!query || query.length < 2) {
      return { success: true, jobs: [] };
    }

    const jobs = await db
      .select({
        id: job.id,
        title: job.title,
        industry: job.industry,
      })
      .from(job)
      .where(ilike(job.title, `%${query}%`))
      .limit(limit)
      .orderBy(asc(job.title));

    return { success: true, jobs };
  } catch (error) {
    console.error("Error searching jobs:", error);
    return { success: false, jobs: [], error: "Failed to search jobs" };
  }
}

/**
 * Create or get job by title and industry
 */
export async function createOrGetJob(
  jobTitle: string,
  industry: string,
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    // Try to find existing job by title
    const existing = await db
      .select()
      .from(job)
      .where(eq(job.title, jobTitle))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, jobId: existing[0].id };
    }

    // Create new job
    const jobId = generateRandomString(32);
    const slug = jobTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Ensure slug is unique
    let uniqueSlug = slug;
    let counter = 1;
    while (true) {
      const existingSlug = await db
        .select()
        .from(job)
        .where(eq(job.slug, uniqueSlug))
        .limit(1);
      if (existingSlug.length === 0) break;
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    await db.insert(job).values({
      id: jobId,
      slug: uniqueSlug,
      title: jobTitle,
      industry: industry || "Unknown",
      category: industry || "Unknown",
      description: `Job: ${jobTitle}`,
      shortDescription: jobTitle,
      keyResponsibilities: [],
      automationPercentage: 0,
      automationStatus: "safe",
      totalTasks: 0,
      tasksReplaceable: 0,
      tasksPartial: 0,
      tasksSafe: 0,
      confidenceLevel: "low",
      verified: false,
      dataQuality: 0,
    });

    return { success: true, jobId };
  } catch (error) {
    console.error("Error creating job:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create job",
    };
  }
}

/**
 * Check if username is available
 * Uses Better Auth's username plugin API
 */
export async function checkUsernameAvailability(username: string) {
  try {
    const response = await auth.api.isUsernameAvailable({
      headers: await headers(),
      body: {
        username,
      },
    });

    return {
      available: response.available ?? false,
      username: username.toLowerCase(),
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        available: false,
        error: error.message,
      };
    }
    return {
      available: false,
      error: "Error checking username availability",
    };
  }
}

/**
 * Save onboarding step progress
 */
export async function saveOnboardingStep(
  userId: string,
  step: number,
  data:
    | BasicInfoInput
    | ProfessionalBackgroundInput
    | AutomationExperienceInput
    | PlatformIntentInput,
) {
  try {
    // Validate step number
    if (step < 1 || step > 4) {
      return { success: false, error: "Invalid step number" };
    }

    // Validate data based on step
    let validatedData:
      | BasicInfoInput
      | ProfessionalBackgroundInput
      | AutomationExperienceInput
      | PlatformIntentInput;
    switch (step) {
      case 1:
        validatedData = basicInfoSchema.parse(data);
        // Check username availability when saving step 1 using Better Auth plugin
        if (validatedData.username) {
          try {
            const usernameCheck = await auth.api.isUsernameAvailable({
              headers: await headers(),
              body: {
                username: validatedData.username,
              },
            });
            if (!usernameCheck.available) {
              return {
                success: false,
                error: "Username is already taken",
              };
            }
          } catch (error) {
            return {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Error checking username",
            };
          }
        }
        break;
      case 2:
        validatedData = professionalBackgroundSchema.parse(data);
        // Create or get job if job title and industry are provided
        if (validatedData.currentJobTitle && validatedData.industry) {
          const jobResult = await createOrGetJob(
            validatedData.currentJobTitle,
            validatedData.industry,
          );
          if (jobResult.success && jobResult.jobId) {
            // Store jobId in the data for later use
            (validatedData as any).jobId = jobResult.jobId;
          }
        }
        break;
      case 3:
        validatedData = automationExperienceSchema.parse(data);
        break;
      case 4:
        validatedData = platformIntentSchema.parse(data);
        break;
      default:
        return { success: false, error: "Invalid step number" };
    }

    // Get or create onboarding session
    const existingSession = await db
      .select()
      .from(onboardingSession)
      .where(eq(onboardingSession.userId, userId))
      .limit(1);

    let sessionId: string;
    if (existingSession.length === 0) {
      // Create new session
      sessionId = generateRandomString(32);
      await db.insert(onboardingSession).values({
        id: sessionId,
        userId,
        currentStep: step,
        completed: false,
        skipped: false,
      });
    } else {
      // Update existing session
      sessionId = existingSession[0].id;
      await db
        .update(onboardingSession)
        .set({
          currentStep: Math.max(step, existingSession[0].currentStep),
          updatedAt: new Date(),
        })
        .where(eq(onboardingSession.id, sessionId));
    }

    // Save responses for this step
    // Delete existing responses for this step first
    await db
      .delete(onboardingResponse)
      .where(
        and(
          eq(onboardingResponse.sessionId, sessionId),
          eq(onboardingResponse.step, step),
        ),
      );

    // Insert new responses
    const responses = Object.entries(validatedData).map(([key, value]) => ({
      id: generateRandomString(32),
      sessionId,
      step,
      questionKey: key,
      responseValue: typeof value === "string" ? value : JSON.stringify(value),
    }));

    if (responses.length > 0) {
      await db.insert(onboardingResponse).values(responses);
    }

    return { success: true, sessionId };
  } catch (error) {
    console.error("Error saving onboarding step:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to save onboarding step" };
  }
}

/**
 * Complete onboarding and award reputation points
 */
export async function completeOnboarding(userId: string) {
  try {
    // Get onboarding session
    const session = await db
      .select()
      .from(onboardingSession)
      .where(eq(onboardingSession.userId, userId))
      .limit(1);

    if (session.length === 0) {
      return { success: false, error: "Onboarding session not found" };
    }

    // Get all responses
    const responses = await db
      .select()
      .from(onboardingResponse)
      .where(eq(onboardingResponse.sessionId, session[0].id));

    // Parse responses into structured data
    const data: Record<string, unknown> = {};
    for (const response of responses) {
      try {
        data[response.questionKey] = JSON.parse(
          response.responseValue || "null",
        );
      } catch {
        data[response.questionKey] = response.responseValue;
      }
    }

    // Save username to user table if provided in step 1
    // Username is stored via Better Auth's username plugin
    if (data.username) {
      const username = String(data.username);
      // Double-check availability before saving
      try {
        const usernameCheck = await auth.api.isUsernameAvailable({
          headers: await headers(),
          body: {
            username,
          },
        });
        if (usernameCheck.available) {
          // Update user via Better Auth API to set username
          // Better Auth's username plugin will handle normalization and validation
          await auth.api.updateUser({
            headers: await headers(),
            body: {
              username,
            },
          });
        } else {
          return {
            success: false,
            error: "Username is no longer available",
          };
        }
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to set username",
        };
      }
    }

    // Create or update user profile
    const existingProfile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, userId))
      .limit(1);

    const profileData = {
      displayName: data.displayName as string | undefined,
      location: data.location as string | undefined,
      country: data.country as string | undefined,
      stateProvince: data.stateProvince as string | undefined,
      city: data.city as string | undefined,
      ageRange: data.ageRange as
        | "18-24"
        | "25-34"
        | "35-44"
        | "45-54"
        | "55-64"
        | "65+"
        | undefined,
      employmentStatus: data.employmentStatus as
        | "full_time"
        | "part_time"
        | "self_employed"
        | "unemployed"
        | "student"
        | "retired"
        | undefined,
      currentJobTitle: data.currentJobTitle as string | undefined,
      industry: data.industry as string | undefined,
      yearsOfExperience: data.yearsOfExperience as
        | "0-1"
        | "2-5"
        | "6-10"
        | "11-15"
        | "16-20"
        | "20+"
        | undefined,
      companySize: data.companySize as
        | "1-10"
        | "11-50"
        | "51-200"
        | "201-1000"
        | "1000+"
        | undefined,
      educationLevel: data.educationLevel as
        | "high_school"
        | "associates"
        | "bachelors"
        | "masters"
        | "phd"
        | "other"
        | undefined,
      hasSeenAutomation: data.hasSeenAutomation as boolean | undefined,
      automationTypes: data.automationTypes as string[] | undefined,
      automationImpact: data.automationImpact as string | undefined,
      platformIntents: data.platformIntents as string[] | undefined,
      willingToContribute: data.willingToContribute as boolean | undefined,
    };

    if (existingProfile.length === 0) {
      // Create new profile
      await db.insert(userProfile).values({
        id: generateRandomString(32),
        userId,
        ...profileData,
      });
    } else {
      // Update existing profile
      await db
        .update(userProfile)
        .set({
          ...profileData,
          updatedAt: new Date(),
        })
        .where(eq(userProfile.userId, userId));
    }

    // Create or update user reputation (award 50 points for onboarding)
    const existingReputation = await db
      .select()
      .from(userReputation)
      .where(eq(userReputation.userId, userId))
      .limit(1);

    const pointsToAward = 50;
    const newPoints =
      existingReputation.length === 0
        ? pointsToAward
        : existingReputation[0].reputationPoints + pointsToAward;

    // Determine tier based on points
    const tier =
      newPoints < 200
        ? "observer"
        : newPoints < 1000
          ? "contributor"
          : newPoints < 5000
            ? "trusted"
            : "expert";

    if (existingReputation.length === 0) {
      await db.insert(userReputation).values({
        id: generateRandomString(32),
        userId,
        reputationPoints: newPoints,
        tier,
      });
    } else {
      await db
        .update(userReputation)
        .set({
          reputationPoints: newPoints,
          tier,
          updatedAt: new Date(),
        })
        .where(eq(userReputation.userId, userId));
    }

    // Record reputation history
    await db.insert(reputationHistory).values({
      id: generateRandomString(32),
      userId,
      pointsChange: pointsToAward,
      reason: "onboarding_complete",
      relatedEntityType: "onboarding",
      relatedEntityId: session[0].id,
    });

    // Mark onboarding as completed
    await db
      .update(onboardingSession)
      .set({
        completed: true,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(onboardingSession.userId, userId));

    return { success: true, pointsAwarded: pointsToAward, newTier: tier };
  } catch (error) {
    console.error("Error completing onboarding:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to complete onboarding" };
  }
}

/**
 * Get saved onboarding data for a specific step
 */
export async function getOnboardingStepData(
  userId: string,
  step: number,
): Promise<Record<string, unknown> | null> {
  try {
    // Get onboarding session
    const session = await db
      .select()
      .from(onboardingSession)
      .where(eq(onboardingSession.userId, userId))
      .limit(1);

    if (session.length === 0) {
      return null;
    }

    // Get responses for this step
    const responses = await db
      .select()
      .from(onboardingResponse)
      .where(
        and(
          eq(onboardingResponse.sessionId, session[0].id),
          eq(onboardingResponse.step, step),
        ),
      );

    if (responses.length === 0) {
      return null;
    }

    // Parse responses into object
    const data: Record<string, unknown> = {};
    for (const response of responses) {
      try {
        // Try to parse as JSON first
        data[response.questionKey] = JSON.parse(
          response.responseValue || "null",
        );
        // If parsed as null, try as string
        if (data[response.questionKey] === null && response.responseValue) {
          data[response.questionKey] = response.responseValue;
        }
      } catch {
        // If not JSON, use as string
        data[response.questionKey] = response.responseValue || "";
      }
    }

    return data;
  } catch (error) {
    console.error("Error getting onboarding step data:", error);
    return null;
  }
}

/**
 * Get onboarding status
 */
export async function getOnboardingStatus(userId: string) {
  try {
    const session = await db
      .select()
      .from(onboardingSession)
      .where(eq(onboardingSession.userId, userId))
      .limit(1);

    if (session.length === 0) {
      return { completed: false, currentStep: 1 };
    }

    return {
      completed: session[0].completed,
      currentStep: session[0].currentStep,
      skipped: session[0].skipped,
    };
  } catch (error) {
    console.error("Error getting onboarding status:", error);
    return { completed: false, currentStep: 1 };
  }
}

/**
 * Skip onboarding
 */
export async function skipOnboarding(userId: string) {
  try {
    const existingSession = await db
      .select()
      .from(onboardingSession)
      .where(eq(onboardingSession.userId, userId))
      .limit(1);

    if (existingSession.length === 0) {
      const sessionId = generateRandomString(32);
      await db.insert(onboardingSession).values({
        id: sessionId,
        userId,
        currentStep: 4,
        completed: false,
        skipped: true,
      });
    } else {
      await db
        .update(onboardingSession)
        .set({
          skipped: true,
          updatedAt: new Date(),
        })
        .where(eq(onboardingSession.userId, userId));
    }

    return { success: true };
  } catch (error) {
    console.error("Error skipping onboarding:", error);
    return { success: false, error: "Failed to skip onboarding" };
  }
}
