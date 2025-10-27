"use server";

import { db } from "@/db";
import { models, author, modalities } from "@/db/schema";
import { sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export interface PlatformStats {
  totalModels: number;
  totalProviders: number;
  totalModalities: number;
  modalityTypes: Array<{
    name: string;
    type: "input" | "output";
    count: number;
  }>;
}

export const getPlatformStats = unstable_cache(
  async (): Promise<PlatformStats> => {
    try {
      // Get total models count
      const modelsCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(models);
      const totalModels = modelsCountResult[0]?.count || 0;

      // Get total providers (authors) count
      const providersCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(author);
      const totalProviders = providersCountResult[0]?.count || 0;

      // Get total modalities count
      const modalitiesCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(modalities);
      const totalModalities = modalitiesCountResult[0]?.count || 0;

      // Get modality types with counts
      const modalityTypesResult = await db
        .select({
          name: modalities.name,
          type: modalities.type,
          count: sql<number>`count(*)`,
        })
        .from(modalities)
        .groupBy(modalities.name, modalities.type)
        .orderBy(modalities.name, modalities.type);

      return {
        totalModels,
        totalProviders,
        totalModalities,
        modalityTypes: modalityTypesResult.map((row) => ({
          name: row.name,
          type: row.type as "input" | "output",
          count: row.count,
        })),
      };
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      // Return fallback stats in case of error
      return {
        totalModels: 0,
        totalProviders: 0,
        totalModalities: 0,
        modalityTypes: [],
      };
    }
  },
  ["platform-stats"],
  {
    revalidate: 3600, // 1 hour cache
    tags: ["stats", "models", "providers", "modalities"],
  }
);
