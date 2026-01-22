"use server";

import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { cacheLife } from "next/cache";
import { db } from "@/db";
import { type CapabilityStatus, capability } from "@/db/schema/capabilities";

// Types
export type CapabilityFilters = {
  category?: "physical" | "cognitive" | "social" | "meta";
  status?: CapabilityStatus;
  search?: string;
};

export type CapabilitySort =
  | "progress_desc"
  | "progress_asc"
  | "jobs_desc"
  | "activity_desc"
  | "name_asc";

// Get capability by slug
export async function getCapabilityBySlug(slug: string) {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600 * 24 });

  const result = await db
    .select()
    .from(capability)
    .where(eq(capability.slug, slug))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

// Get capabilities with filters
export async function getCapabilities(
  filters: CapabilityFilters = {},
  sort: CapabilitySort = "progress_desc",
  limit = 20,
  offset = 0,
) {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600 * 24 });

  const conditions = [];

  if (filters.category) {
    conditions.push(eq(capability.category, filters.category));
  }

  if (filters.status) {
    conditions.push(eq(capability.status, filters.status));
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(capability.name, `%${filters.search}%`),
        ilike(capability.description, `%${filters.search}%`),
      ),
    );
  }

  // Apply sorting
  const getSortOrder = () => {
    switch (sort) {
      case "progress_desc":
        return desc(capability.progressPercentage);
      case "progress_asc":
        return asc(capability.progressPercentage);
      case "jobs_desc":
      case "activity_desc":
        return desc(capability.updatedAt);
      case "name_asc":
        return asc(capability.name);
      default:
        return desc(capability.progressPercentage);
    }
  };

  const baseQuery = db.select().from(capability);

  const queryWithWhere =
    conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

  // Execute single query with pagination
  const results = await queryWithWhere
    .orderBy(getSortOrder())
    .limit(limit)
    .offset(offset);

  return results;
}

// Get capability categories (static enum values)
export async function getCapabilityCategories() {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600 * 24 });

  // Categories are now a static enum instead of a table
  return [
    { id: "physical", name: "Physical", slug: "physical" },
    { id: "cognitive", name: "Cognitive", slug: "cognitive" },
    { id: "social", name: "Social", slug: "social" },
    { id: "meta", name: "Meta", slug: "meta" },
  ];
}

// Activity type for frontend components that may still reference it
export type ActivityType =
  | "breakthrough"
  | "setback"
  | "deployment"
  | "research"
  | "funding"
  | "technology";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  url?: string;
  timestamp: string;
  author: {
    username: string;
    avatar?: string;
  };
  upvotes: number;
  comments: number;
  tags: string[];
}

// Stub: Returns empty activities since prediction/comment tables are removed
export async function getActivities(_limit = 10): Promise<Activity[]> {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600 * 24 });
  return [];
}

// Stats type
export interface Stats {
  reports: number;
  experts: number;
  papers: number;
  jobsSafe: number;
}

// Stub: Returns zero stats since tracking/comment tables are removed
export async function getStats(): Promise<Stats> {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600 * 24 });
  return {
    reports: 0,
    experts: 0,
    papers: 0,
    jobsSafe: 0,
  };
}

// AGI Progress type
export interface AGIProgress {
  overall: number;
  lastUpdated: string;
  lastUpdatedBy: string;
  contributors: number;
  expertForecasts: number;
  reports: number;
}

// Get AGI Progress - simplified version using only capability table
export async function getAGIProgress(): Promise<AGIProgress> {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600 * 24 });

  try {
    const result = await db
      .select({
        progressPercentage: capability.progressPercentage,
        updatedAt: capability.updatedAt,
      })
      .from(capability);

    // Calculate average progress
    const avgProgress =
      result.length > 0
        ? Math.round(
            result.reduce((sum, r) => sum + r.progressPercentage, 0) /
              result.length,
          )
        : 0;

    // Get most recent update
    const mostRecent =
      result.length > 0
        ? result.reduce(
            (latest, r) => (r.updatedAt > latest ? r.updatedAt : latest),
            result[0].updatedAt,
          )
        : null;

    return {
      overall: avgProgress,
      lastUpdated: mostRecent ? formatRelativeTime(mostRecent) : "unknown",
      lastUpdatedBy: "community",
      contributors: 0,
      expertForecasts: 0,
      reports: 0,
    };
  } catch (error) {
    console.error("Error fetching AGI progress:", error);
    return {
      overall: 0,
      lastUpdated: "unknown",
      lastUpdatedBy: "community",
      contributors: 0,
      expertForecasts: 0,
      reports: 0,
    };
  }
}

// Helper function to format relative time
function formatRelativeTime(date: Date | null): string {
  if (!date) return "unknown";
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return `${Math.floor(diffDays / 7)}w`;
}
