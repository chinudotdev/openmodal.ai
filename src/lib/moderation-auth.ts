"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export interface ModerationAuthResult {
  authorized: boolean;
  userId?: string;
  error?: string;
}

/**
 * Verify user has moderation permissions
 * Checks for: Expert (5000+ rep), Moderator role, or Admin role
 */
export async function verifyModerationPermission(): Promise<ModerationAuthResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        authorized: false,
        error: "Not authenticated",
      };
    }

    // Check if user has moderation permissions using Better Auth access control
    const canModerate = await auth.api.userHasPermission({
      headers: await headers(),
      body: {
        permissions: {
          moderation: ["approve", "reject", "request_changes"],
        },
      },
    });

    if (!canModerate) {
      return {
        authorized: false,
        error: "Insufficient permissions to moderate",
      };
    }

    return {
      authorized: true,
      userId: session.user.id,
    };
  } catch (error) {
    console.error("Error verifying moderation permission:", error);
    return {
      authorized: false,
      error: "Failed to verify permissions",
    };
  }
}

/**
 * Verify user has admin permissions
 */
export async function verifyAdminPermission(): Promise<ModerationAuthResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        authorized: false,
        error: "Not authenticated",
      };
    }

    // Check if user role is admin
    const userRole = (session.user as { role?: string }).role;
    if (userRole !== "admin") {
      return {
        authorized: false,
        error: "Admin role required",
      };
    }

    return {
      authorized: true,
      userId: session.user.id,
    };
  } catch (error) {
    console.error("Error verifying admin permission:", error);
    return {
      authorized: false,
      error: "Failed to verify admin permissions",
    };
  }
}
