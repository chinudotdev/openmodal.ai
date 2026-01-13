"use server";

import { generateRandomString } from "better-auth/crypto";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { type ModerationAction, moderationAuditLog } from "@/db/schema";

interface LogModerationActionParams {
  moderatorId: string;
  action: ModerationAction;
  targetType: string;
  targetId: string;
  reason?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log a moderation action to the audit trail
 */
export async function logModerationAction(
  params: LogModerationActionParams,
): Promise<void> {
  try {
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    await db.insert(moderationAuditLog).values({
      id: generateRandomString(32),
      moderatorId: params.moderatorId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      reason: params.reason || null,
      notes: params.notes || null,
      metadata: params.metadata || null,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error("Failed to log moderation action:", error);
  }
}

/**
 * Get audit log entries for a specific target
 */
export async function getAuditLogForTarget(
  targetType: string,
  targetId: string,
) {
  try {
    const logs = await db
      .select()
      .from(moderationAuditLog)
      .where(
        and(
          eq(moderationAuditLog.targetType, targetType),
          eq(moderationAuditLog.targetId, targetId),
        ),
      )
      .orderBy(desc(moderationAuditLog.createdAt));

    return logs;
  } catch (error) {
    console.error("Failed to get audit log:", error);
    return [];
  }
}

/**
 * Get audit log entries for a specific moderator
 */
export async function getAuditLogForModerator(
  moderatorId: string,
  limit = 50,
  offset = 0,
) {
  try {
    const logs = await db
      .select()
      .from(moderationAuditLog)
      .where(eq(moderationAuditLog.moderatorId, moderatorId))
      .orderBy(desc(moderationAuditLog.createdAt))
      .limit(limit)
      .offset(offset);

    return logs;
  } catch (error) {
    console.error("Failed to get moderator audit log:", error);
    return [];
  }
}
