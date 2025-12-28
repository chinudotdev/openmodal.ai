"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { platformSettings } from "@/db/schema";

export async function getPlatformSettings() {
  try {
    const settings = await db.select().from(platformSettings);

    // Convert to object format
    const settingsObj: Record<string, unknown> = {};
    settings.forEach((setting) => {
      settingsObj[setting.key] = setting.value;
    });

    return settingsObj;
  } catch (error) {
    console.error("Error getting platform settings:", error);
    return {};
  }
}

export async function updatePlatformSetting(
  key: string,
  value: unknown,
  category: string,
  description?: string,
) {
  try {
    const existing = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(platformSettings)
        .set({
          value,
          updatedAt: new Date(),
        })
        .where(eq(platformSettings.key, key));
    } else {
      await db.insert(platformSettings).values({
        id: crypto.randomUUID(),
        key,
        value,
        category,
        description,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating platform setting:", error);
    return { success: false, error: "Failed to update setting" };
  }
}
