"use server";

import { db } from "@/db";
import {
  author,
  modalities,
  modelModalities,
  models,
  modelStatus,
  modelTags,
  tags,
} from "@/db/schema";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import {
  GetModelsInputSchema,
  ModelsResponseSchema,
  type ActionError,
  type GetModelsInput,
  type ModelsResponse,
} from "./dto";

export async function getModels(
  input: GetModelsInput
): Promise<ModelsResponse | ActionError> {
  try {
    // Validate input
    const validatedInput = GetModelsInputSchema.parse(input);
    const {
      page,
      limit,
      search = "",
      inputModalities = [],
      outputModalities = [],
    } = validatedInput;

    // Calculate offset
    const offset = (page - 1) * limit;

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

    // Input modality filter - must have ALL selected input modalities
    if (inputModalities.length > 0) {
      whereConditions.push(
        sql`(
          SELECT COUNT(DISTINCT m.name) 
          FROM model_modalities mm
          JOIN modalities m ON mm.modality_id = m.id
          WHERE mm.model_id = ${models.id}
            AND m.type = 'input'
            AND m.name IN (${sql.join(
              inputModalities.map((m) => sql`${m}`),
              sql`, `
            )})
        ) = ${inputModalities.length}`
      );
    }

    // Output modality filter - must have ALL selected output modalities
    if (outputModalities.length > 0) {
      whereConditions.push(
        sql`(
          SELECT COUNT(DISTINCT m.name) 
          FROM model_modalities mm
          JOIN modalities m ON mm.modality_id = m.id
          WHERE mm.model_id = ${models.id}
            AND m.type = 'output'
            AND m.name IN (${sql.join(
              outputModalities.map((m) => sql`${m}`),
              sql`, `
            )})
        ) = ${outputModalities.length}`
      );
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count - includes all filters
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(models)
      .where(whereClause);
    const total = countResult[0]?.count || 0;

    // Optimized query using GROUP_CONCAT for SQLite to aggregate related data
    const results = await db
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
        // Aggregate modalities
        inputModalities: sql<string>`GROUP_CONCAT(DISTINCT CASE WHEN ${modalities.type} = 'input' THEN ${modalities.name} END)`,
        outputModalities: sql<string>`GROUP_CONCAT(DISTINCT CASE WHEN ${modalities.type} = 'output' THEN ${modalities.name} END)`,
        // Status flags
        isReasoning: sql<number>`COALESCE(${modelStatus.isReasoning}, 0)`,
        isExperimental: sql<number>`COALESCE(${modelStatus.isExperimental}, 0)`,
        isPreview: sql<number>`COALESCE(${modelStatus.isPreview}, 0)`,
        // Tags
        tagsList: sql<string>`GROUP_CONCAT(DISTINCT ${tags.name})`,
      })
      .from(models)
      .innerJoin(author, eq(models.authorId, author.id))
      .leftJoin(modelModalities, eq(models.id, modelModalities.modelId))
      .leftJoin(modalities, eq(modelModalities.modalityId, modalities.id))
      .leftJoin(modelStatus, eq(models.id, modelStatus.modelId))
      .leftJoin(modelTags, eq(models.id, modelTags.modelId))
      .leftJoin(tags, eq(modelTags.tagId, tags.id))
      .where(whereClause)
      .groupBy(
        models.id,
        models.name,
        models.description,
        models.modelUrl,
        models.createdAt,
        author.id,
        author.name,
        author.website,
        author.logo,
        author.description,
        modelStatus.isReasoning,
        modelStatus.isExperimental,
        modelStatus.isPreview
      )
      .orderBy(desc(models.createdAt), desc(models.id))
      .limit(limit)
      .offset(offset);

    // Transform results
    const data = results.map((model) => ({
      id: model.id,
      name: model.name,
      description: model.description,
      modelUrl: model.modelUrl,
      inputModalities: model.inputModalities
        ? model.inputModalities.split(",").filter(Boolean)
        : [],
      outputModalities: model.outputModalities
        ? model.outputModalities.split(",").filter(Boolean)
        : [],
      status: {
        reasoning: Boolean(model.isReasoning),
        experimental: Boolean(model.isExperimental),
        preview: Boolean(model.isPreview),
      },
      tags: model.tagsList ? model.tagsList.split(",").filter(Boolean) : [],
      createdAt: model.createdAt,
      authorId: model.authorId,
      authorName: model.authorName,
      authorWebsite: model.authorWebsite,
      authorLogo: model.authorLogo,
      authorDescription: model.authorDescription,
    }));

    // Calculate if there are more pages
    const hasMore = offset + data.length < total;

    const result = {
      data,
      total,
      page,
      limit,
      hasMore,
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
