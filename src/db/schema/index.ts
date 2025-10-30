import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export * from "./auth";

// Helper function for timestamp columns
const timestamp = (columnName: string) =>
  text(columnName)
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`);

// Core Tables
export const author = sqliteTable("author", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  website: text("website").notNull(),
  logo: text("logo").notNull(),
  createdAt: timestamp("created_at"),
});

export const models = sqliteTable(
  "models",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    modelUrl: text("model_url"),
    authorId: text("author_id")
      .references(() => author.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at"),
  },
  (table) => [index("models_author_idx").on(table.authorId)]
);

// Modalities lookup table
export const modalities = sqliteTable(
  "modalities",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(), // 'text', 'image', 'audio', 'video', etc.
    type: text("type", { enum: ["input", "output"] }).notNull(),
    createdAt: timestamp("created_at"),
  },
  (table) => [index("modalities_name_type_idx").on(table.name, table.type)]
);

// Many-to-many: models <-> modalities
export const modelModalities = sqliteTable(
  "model_modalities",
  {
    modelId: text("model_id")
      .references(() => models.id, { onDelete: "cascade" })
      .notNull(),
    modalityId: text("modality_id")
      .references(() => modalities.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.modelId, table.modalityId] }),
    index("model_modalities_model_idx").on(table.modelId),
    index("model_modalities_modality_idx").on(table.modalityId),
  ]
);

// Status flags as separate table
export const modelStatus = sqliteTable(
  "model_status",
  {
    modelId: text("model_id")
      .primaryKey()
      .references(() => models.id, { onDelete: "cascade" }),
    isReasoning: integer("is_reasoning", { mode: "boolean" })
      .default(false)
      .notNull(),
    isExperimental: integer("is_experimental", { mode: "boolean" })
      .default(false)
      .notNull(),
    isPreview: integer("is_preview", { mode: "boolean" })
      .default(false)
      .notNull(),
  },
  (table) => [
    index("model_status_reasoning_idx").on(table.isReasoning),
    index("model_status_experimental_idx").on(table.isExperimental),
    index("model_status_preview_idx").on(table.isPreview),
  ]
);

// Tags
export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at"),
});

export const modelTags = sqliteTable(
  "model_tags",
  {
    modelId: text("model_id")
      .references(() => models.id, { onDelete: "cascade" })
      .notNull(),
    tagId: text("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.modelId, table.tagId] }),
    index("model_tags_model_idx").on(table.modelId),
    index("model_tags_tag_idx").on(table.tagId),
  ]
);

// Model Requests
export const modelRequests = sqliteTable(
  "model_requests",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    modelKey: text("model_key").notNull(),
    description: text("description").notNull(),
    // Author reference - nullable since author might not exist yet
    authorId: text("author_id").references(() => author.id, {
      onDelete: "set null",
    }),
    // Denormalized author data for when authorId is null
    authorName: text("author_name").notNull(),
    authorWebsite: text("author_website"),
    authorDescription: text("author_description"),
    authorLogo: text("author_logo"),
    modelDocLink: text("model_doc_link"),
    requestStatus: text("request_status", {
      enum: ["pending", "approved", "rejected"],
    })
      .default("pending")
      .notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    index("model_requests_author_idx").on(table.authorId),
    index("model_requests_status_idx").on(table.requestStatus),
    index("model_requests_created_idx").on(table.createdAt),
  ]
);

// Model Request Modalities (separate from approved models)
export const modelRequestModalities = sqliteTable(
  "model_request_modalities",
  {
    requestId: text("request_id")
      .references(() => modelRequests.id, { onDelete: "cascade" })
      .notNull(),
    modalityId: text("modality_id")
      .references(() => modalities.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.requestId, table.modalityId] }),
    index("model_request_modalities_request_idx").on(table.requestId),
    index("model_request_modalities_modality_idx").on(table.modalityId),
  ]
);

// Model Request Status
export const modelRequestStatus = sqliteTable(
  "model_request_status",
  {
    requestId: text("request_id")
      .primaryKey()
      .references(() => modelRequests.id, { onDelete: "cascade" }),
    isReasoning: integer("is_reasoning", { mode: "boolean" })
      .default(false)
      .notNull(),
    isExperimental: integer("is_experimental", { mode: "boolean" })
      .default(false)
      .notNull(),
    isPreview: integer("is_preview", { mode: "boolean" })
      .default(false)
      .notNull(),
  },
  (table) => [index("model_request_status_reasoning_idx").on(table.isReasoning)]
);
