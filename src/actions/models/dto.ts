import { z } from "zod";

// Input DTOs
export const GetModelsInputSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(25),
  search: z.string().optional(),
  inputModalities: z.array(z.string()).optional(),
  outputModalities: z.array(z.string()).optional(),
});

export type GetModelsInput = z.infer<typeof GetModelsInputSchema>;

// Output DTOs
export const ModelStatusSchema = z.object({
  reasoning: z.boolean(),
  experimental: z.boolean(),
  preview: z.boolean(),
});

export const AuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  website: z.string(),
  logo: z.string(),
  description: z.string(),
});

export const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  modelUrl: z.string().nullable().optional(),
  inputModalities: z.array(z.string()),
  outputModalities: z.array(z.string()),
  status: ModelStatusSchema,
  tags: z.array(z.string()),
  createdAt: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorWebsite: z.string(),
  authorLogo: z.string(),
  authorDescription: z.string(),
});

export const ModelsResponseSchema = z.object({
  data: z.array(ModelSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
});

export type ModelStatus = z.infer<typeof ModelStatusSchema>;
export type Author = z.infer<typeof AuthorSchema>;
export type Model = z.infer<typeof ModelSchema>;
export type ModelsResponse = z.infer<typeof ModelsResponseSchema>;

// Error DTOs
export const ActionErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
});

export type ActionError = z.infer<typeof ActionErrorSchema>;
