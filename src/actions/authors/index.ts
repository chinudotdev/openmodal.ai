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
import { desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import {
  GetAuthorInputSchema,
  AuthorResponseSchema,
  type GetAuthorInput,
  type AuthorResponse,
} from "./dto";

export async function getAuthor(
  input: GetAuthorInput
): Promise<AuthorResponse | null> {
  "use cache";
  cacheLife("hours"); // Cache for 1 hour (same as previous revalidate: 3600)
  cacheTag(`author-${input.authorId}`, "author", "max");
  try {
    // Validate input
    const validatedInput = GetAuthorInputSchema.parse(input);
    const { authorId } = validatedInput;

    // Single query to get author info and all related data
    const result = await db
      .select({
        // Author fields
        authorId: author.id,
        authorName: author.name,
        authorDescription: author.description,
        authorWebsite: author.website,
        authorLogo: author.logo,
        authorCreatedAt: author.createdAt,
        // Model fields
        modelId: models.id,
        modelName: models.name,
        modelDescription: models.description,
        modelUrl: models.modelUrl,
        modelCreatedAt: models.createdAt,
        // Modality fields
        modalityName: modalities.name,
        modalityType: modalities.type,
        // Status fields
        isReasoning: modelStatus.isReasoning,
        isExperimental: modelStatus.isExperimental,
        isPreview: modelStatus.isPreview,
        // Tag fields
        tagName: tags.name,
      })
      .from(author)
      .leftJoin(models, eq(models.authorId, author.id))
      .leftJoin(modelModalities, eq(modelModalities.modelId, models.id))
      .leftJoin(modalities, eq(modelModalities.modalityId, modalities.id))
      .leftJoin(modelStatus, eq(modelStatus.modelId, models.id))
      .leftJoin(modelTags, eq(modelTags.modelId, models.id))
      .leftJoin(tags, eq(modelTags.tagId, tags.id))
      .where(eq(author.id, authorId))
      .orderBy(desc(models.createdAt), desc(models.id));

    if (result.length === 0) {
      return null;
    }

    // Extract author info from first row
    const firstRow = result[0];
    const authorInfo = {
      id: firstRow.authorId,
      name: firstRow.authorName,
      description: firstRow.authorDescription,
      website: firstRow.authorWebsite,
      logo: firstRow.authorLogo,
      createdAt: firstRow.authorCreatedAt,
    };

    // Group data by model
    const modelsMap = new Map<
      string,
      {
        id: string;
        name: string;
        description: string;
        modelUrl?: string | null;
        createdAt: string;
        inputModalities: string[];
        outputModalities: string[];
        status: {
          reasoning: boolean;
          experimental: boolean;
          preview: boolean;
        };
        tags: string[];
      }
    >();

    for (const row of result) {
      if (!row.modelId) continue; // Skip if no model

      if (!modelsMap.has(row.modelId)) {
        if (!row.modelName || !row.modelDescription || !row.modelCreatedAt) {
          continue; // Skip if required model fields are missing
        }

        modelsMap.set(row.modelId, {
          id: row.modelId,
          name: row.modelName,
          description: row.modelDescription,
          modelUrl: row.modelUrl,
          createdAt: row.modelCreatedAt,
          inputModalities: [],
          outputModalities: [],
          status: {
            reasoning: row.isReasoning || false,
            experimental: row.isExperimental || false,
            preview: row.isPreview || false,
          },
          tags: [],
        });
      }

      const model = modelsMap.get(row.modelId);
      if (!model) continue;

      // Add modality if it exists
      if (row.modalityName && row.modalityType) {
        if (
          row.modalityType === "input" &&
          !model.inputModalities.includes(row.modalityName)
        ) {
          model.inputModalities.push(row.modalityName);
        } else if (
          row.modalityType === "output" &&
          !model.outputModalities.includes(row.modalityName)
        ) {
          model.outputModalities.push(row.modalityName);
        }
      }

      // Add tag if it exists
      if (row.tagName && !model.tags.includes(row.tagName)) {
        model.tags.push(row.tagName);
      }
    }

    const modelsData = Array.from(modelsMap.values());

    const response = {
      author: authorInfo,
      models: modelsData,
      modelCount: modelsData.length,
    };

    // Validate response
    return AuthorResponseSchema.parse(response);
  } catch (error) {
    console.error("Error fetching author:", error);
    return null;
  }
}
// Get all authors for static generation
export async function getAllAuthors() {
  "use cache";
  cacheLife("hours"); // Cache for 1 hour (same as previous revalidate: 3600)
  cacheTag("authors", "all-authors", "max");
  try {
    const authors = await db
      .select({
        id: author.id,
        name: author.name,
      })
      .from(author)
      .orderBy(desc(author.createdAt));
    return authors;
  } catch (error) {
    console.error("Error fetching all authors:", error);
    return [];
  }
}
