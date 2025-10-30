import { z } from "zod";

// Input DTOs
export const GetAuthorInputSchema = z.object({
  authorId: z.string(),
});

export type GetAuthorInput = z.infer<typeof GetAuthorInputSchema>;

// Output DTOs
export const ModelStatusSchema = z.object({
  reasoning: z.boolean(),
  experimental: z.boolean(),
  preview: z.boolean(),
});

export const AuthorInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  website: z.string(),
  logo: z.string(),
  createdAt: z.string(),
});

export const AuthorModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  modelUrl: z.string().nullable().optional(),
  inputModalities: z.array(z.string()),
  outputModalities: z.array(z.string()),
  status: ModelStatusSchema,
  tags: z.array(z.string()),
  createdAt: z.string(),
});

export const AuthorResponseSchema = z.object({
  author: AuthorInfoSchema,
  models: z.array(AuthorModelSchema),
  modelCount: z.number(),
});

export type ModelStatus = z.infer<typeof ModelStatusSchema>;
export type AuthorInfo = z.infer<typeof AuthorInfoSchema>;
export type AuthorModel = z.infer<typeof AuthorModelSchema>;
export type AuthorResponse = z.infer<typeof AuthorResponseSchema>;

// Error DTOs
export const ActionErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
});

export type ActionError = z.infer<typeof ActionErrorSchema>;
