import { pgEnum, pgTable, text, integer, timestamp, index } from "drizzle-orm/pg-core";

// ============================================
// ENUMS
// ============================================

export const industryStatusEnum = pgEnum("industry_status", [
  "active",
  "hidden",
]);

// Type exports
export type IndustryStatus = "active" | "hidden";

// ============================================
// INDUSTRY TABLE
// ============================================

export const industry = pgTable(
  "industry",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    icon: text("icon"), // Emoji or icon identifier
    shortDescription: text("short_description"), // 1-2 sentences
    longDescription: text("long_description"), // 3-5 paragraphs
    parentIndustryId: text("parent_industry_id").references(
      // biome-ignore lint/suspicious/noExplicitAny: self-reference
      (): any => industry.id,
      { onDelete: "set null" },
    ), // For sub-industries
    displayOrder: integer("display_order").notNull().default(0),
    status: industryStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_industry_slug").on(table.slug),
    index("idx_industry_name").on(table.name),
    index("idx_industry_status").on(table.status),
  ],
);

