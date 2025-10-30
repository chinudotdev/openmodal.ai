"use server";

import { db } from "@/db";
import {
  models,
  author,
  modelModalities,
  modalities,
  modelStatus,
  modelTags,
  tags,
} from "@/db/schema";
import { and, desc, eq, like, or, sql, inArray } from "drizzle-orm";
import {
  GetModelsInputSchema,
  ModelsResponseSchema,
  type GetModelsInput,
  type ModelsResponse,
  type ActionError,
} from "./dto";

export async function getModels(
  input: GetModelsInput
): Promise<ModelsResponse | ActionError> {
  try {
    // Validate input
    const validatedInput = GetModelsInputSchema.parse(input);
    const {
      cursor,
      limit,
      search = "",
      inputModalities = [],
      outputModalities = [],
    } = validatedInput;

    // Build where conditions
    const whereConditions = [];

    // Search condition
    if (search) {
      whereConditions.push(
        or(
          like(models.name, `%${search}%`),
          like(models.description, `%${search}%`)
        ) || sql`1=1`
      );
    }

    // Cursor condition for pagination
    if (cursor) {
      whereConditions.push(sql`${models.id} < ${cursor}`);
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count (only on first page)
    let total = 0;
    if (!cursor) {
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(models)
        .where(whereClause);
      total = countResult[0]?.count || 0;
    }

    // First, get all models with basic info and author
    const baseResults = await db
      .select({
        id: models.id,
        name: models.name,
        description: models.description,
        modelUrl: models.modelUrl,
        createdAt: models.createdAt,
        authorId: author.id,
        authorName: author.name,
        authorWebsite: author.website,
        authorLogo: author.logo,
        authorDescription: author.description,
      })
      .from(models)
      .innerJoin(author, eq(models.authorId, author.id))
      .where(whereClause)
      .orderBy(desc(models.createdAt), desc(models.id))
      .limit(limit + 1); // Fetch one extra to determine if there's a next page

    const hasNextPage = baseResults.length > limit;
    const modelData = hasNextPage ? baseResults.slice(0, -1) : baseResults;
    const nextCursor = hasNextPage ? modelData[modelData.length - 1]?.id : null;

    if (modelData.length === 0) {
      return {
        data: [],
        nextCursor: null,
        total,
      };
    }

    const modelIds = modelData.map((m) => m.id);

    // Get modalities for all models
    const modalitiesData = await db
      .select({
        modelId: modelModalities.modelId,
        modalityName: modalities.name,
        modalityType: modalities.type,
      })
      .from(modelModalities)
      .innerJoin(modalities, eq(modelModalities.modalityId, modalities.id))
      .where(inArray(modelModalities.modelId, modelIds));

    // Get status for all models
    const statusData = await db
      .select({
        modelId: modelStatus.modelId,
        isReasoning: modelStatus.isReasoning,
        isExperimental: modelStatus.isExperimental,
        isPreview: modelStatus.isPreview,
      })
      .from(modelStatus)
      .where(inArray(modelStatus.modelId, modelIds));

    // Get tags for all models
    const tagsData = await db
      .select({
        modelId: modelTags.modelId,
        tagName: tags.name,
      })
      .from(modelTags)
      .innerJoin(tags, eq(modelTags.tagId, tags.id))
      .where(inArray(modelTags.modelId, modelIds));

    // Group modalities by model
    const modalitiesByModel = modalitiesData.reduce((acc, item) => {
      if (!acc[item.modelId]) {
        acc[item.modelId] = { input: [], output: [] };
      }
      if (item.modalityType === "input") {
        acc[item.modelId].input.push(item.modalityName);
      } else {
        acc[item.modelId].output.push(item.modalityName);
      }
      return acc;
    }, {} as Record<string, { input: string[]; output: string[] }>);

    // Group status by model
    const statusByModel = statusData.reduce((acc, item) => {
      acc[item.modelId] = {
        reasoning: item.isReasoning,
        experimental: item.isExperimental,
        preview: item.isPreview,
      };
      return acc;
    }, {} as Record<string, { reasoning: boolean; experimental: boolean; preview: boolean }>);

    // Group tags by model
    const tagsByModel = tagsData.reduce((acc, item) => {
      if (!acc[item.modelId]) {
        acc[item.modelId] = [];
      }
      acc[item.modelId].push(item.tagName);
      return acc;
    }, {} as Record<string, string[]>);

    // Apply modality filters
    let filteredModelData = modelData;

    if (inputModalities.length > 0 || outputModalities.length > 0) {
      filteredModelData = modelData.filter((model) => {
        const modelModalities = modalitiesByModel[model.id] || {
          input: [],
          output: [],
        };

        // Check input modalities - must have ALL selected input modalities
        if (inputModalities.length > 0) {
          const hasAllInputModalities = inputModalities.every((modality) =>
            modelModalities.input.includes(modality)
          );
          if (!hasAllInputModalities) return false;
        }

        // Check output modalities - must have ALL selected output modalities
        if (outputModalities.length > 0) {
          const hasAllOutputModalities = outputModalities.every((modality) =>
            modelModalities.output.includes(modality)
          );
          if (!hasAllOutputModalities) return false;
        }

        return true;
      });
    }

    // Build final response
    const data = filteredModelData.map((model) => ({
      id: model.id,
      name: model.name,
      description: model.description,
      modelUrl: model.modelUrl,
      inputModalities: modalitiesByModel[model.id]?.input || [],
      outputModalities: modalitiesByModel[model.id]?.output || [],
      status: statusByModel[model.id] || {
        reasoning: false,
        experimental: false,
        preview: false,
      },
      tags: tagsByModel[model.id] || [],
      createdAt: model.createdAt,
      authorId: model.authorId,
      authorName: model.authorName,
      authorWebsite: model.authorWebsite,
      authorLogo: model.authorLogo,
      authorDescription: model.authorDescription,
    }));

    const result = {
      data,
      nextCursor,
      total,
    };

    // Validate response
    return ModelsResponseSchema.parse(result);
  } catch (error) {
    console.error("Error fetching models:", error);

    if (error instanceof Error) {
      return {
        error: error.message,
        code: "FETCH_MODELS_ERROR",
      };
    }

    return {
      error: "Failed to fetch models",
      code: "UNKNOWN_ERROR",
    };
  }
}
