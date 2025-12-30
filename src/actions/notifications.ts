"use server";

import { generateRandomString } from "better-auth/crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { db } from "@/db";
import {
  type NotificationType,
  notification,
  notificationPreference,
} from "@/db/schema";

/**
 * Create notification
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  actionUrl?: string,
  relatedEntityType?: string,
  relatedEntityId?: string,
) {
  try {
    // Optimized: Single query with conditional INSERT using subquery check
    const notificationId = generateRandomString(32);

    await db.execute(sql`
      INSERT INTO ${notification} (
        id, user_id, type, title, message, action_url,
        related_entity_type, related_entity_id, read
      )
      SELECT 
        ${notificationId},
        ${userId},
        ${type},
        ${title},
        ${message},
        ${actionUrl || null},
        ${relatedEntityType || null},
        ${relatedEntityId || null},
        false
      WHERE NOT EXISTS (
        SELECT 1 FROM ${notificationPreference}
        WHERE user_id = ${userId}
          AND notification_type = ${type}
          AND enabled = false
      )
      RETURNING id
    `);

    // Check if notification was created (if preference was disabled, no row returned)
    const created = await db
      .select({ id: notification.id })
      .from(notification)
      .where(eq(notification.id, notificationId))
      .limit(1);

    if (created.length === 0) {
      return { success: false, error: "Notification type disabled by user" };
    }

    return { success: true, notificationId };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: "Failed to create notification" };
  }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(
  userId: string,
  limit = 20,
  offset = 0,
) {
  "use cache";
  cacheLife({ stale: 60, revalidate: 120 });
  cacheTag(`notifications:${userId}`);
  try {
    const notifications = await db
      .select()
      .from(notification)
      .where(eq(notification.userId, userId))
      .orderBy(desc(notification.createdAt))
      .limit(limit)
      .offset(offset);

    return notifications;
  } catch (error) {
    console.error("Error getting user notifications:", error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(
  notificationId: string,
  userId: string,
) {
  try {
    // Check if notification exists and belongs to user
    const existing = await db
      .select()
      .from(notification)
      .where(
        and(
          eq(notification.id, notificationId),
          eq(notification.userId, userId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return { success: false, error: "Notification not found" };
    }

    // Mark as read
    await db
      .update(notification)
      .set({
        read: true,
        readAt: new Date(),
      })
      .where(eq(notification.id, notificationId));
    revalidateTag(`notifications:${userId}`, "layout");
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(userId: string) {
  try {
    await db
      .update(notification)
      .set({
        read: true,
        readAt: new Date(),
      })
      .where(
        and(eq(notification.userId, userId), eq(notification.read, false)),
      );

    revalidateTag(`notifications:${userId}`, "layout");
    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return {
      success: false,
      error: "Failed to mark all notifications as read",
    };
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string) {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notification)
      .where(
        and(eq(notification.userId, userId), eq(notification.read, false)),
      );

    return Number(result[0]?.count || 0);
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
}
