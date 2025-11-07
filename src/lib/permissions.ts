import { createAccessControl } from "better-auth/plugins/access";

/**
 * Access control statement defining resources and their available actions
 * Make sure to use `as const` so TypeScript can infer types correctly
 */
export const statement = {
  report: ["create", "verify", "edit", "delete", "moderate"],
  verification: ["create", "delete"],
  moderation: ["approve", "reject", "request_changes"],
  comment: ["create", "edit", "delete"],
} as const;

/**
 * Create access control instance
 */
export const ac = createAccessControl(statement);

/**
 * Role definitions
 * Each role has specific permissions for different resources
 */

// Observer: 0-199 reputation points
// Can create reports, verify reports, create comments
export const observer = ac.newRole({
  report: ["create", "verify"],
  comment: ["create"],
});

// Contributor: 200-999 reputation points
// Can create reports, verify reports, edit own reports, create comments
export const contributor = ac.newRole({
  report: ["create", "verify", "edit"],
  comment: ["create", "edit"],
});

// Trusted: 1000-4999 reputation points
// Can create reports, verify reports, edit own reports, delete own reports (if not verified), create comments, edit own comments
export const trusted = ac.newRole({
  report: ["create", "verify", "edit", "delete"],
  comment: ["create", "edit", "delete"],
});

// Expert: 5000+ reputation points
// Can create reports, verify reports, edit own reports, delete own reports (if not verified), create comments, edit/delete own comments
// Can also moderate reports (approve, reject, request changes)
export const expert = ac.newRole({
  report: ["create", "verify", "edit", "delete", "moderate"],
  verification: ["create", "delete"],
  moderation: ["approve", "reject", "request_changes"],
  comment: ["create", "edit", "delete"],
});

// Moderator: Special role assigned by admins
// Full moderation permissions
export const moderator = ac.newRole({
  report: ["create", "verify", "edit", "delete", "moderate"],
  verification: ["create", "delete"],
  moderation: ["approve", "reject", "request_changes"],
  comment: ["create", "edit", "delete"],
});

// Admin: Full control over all resources
// Can do everything
export const admin = ac.newRole({
  report: ["create", "verify", "edit", "delete", "moderate"],
  verification: ["create", "delete"],
  moderation: ["approve", "reject", "request_changes"],
  comment: ["create", "edit", "delete"],
});

/**
 * Export roles object for use in Better Auth plugin
 */
export const roles = {
  observer,
  contributor,
  trusted,
  expert,
  moderator,
  admin,
};

/**
 * Helper function to get role name from reputation tier
 */
export function getRoleFromTier(
  tier: "observer" | "contributor" | "trusted" | "expert",
): keyof typeof roles {
  return tier;
}

/**
 * Helper function to check if user can perform action
 * This is a type-safe way to check permissions
 */
export function canPerformAction(
  role: keyof typeof roles,
  resource: keyof typeof statement,
  action: string,
): boolean {
  const rolePermissions = roles[role];
  // Type-safe access with fallback to empty array
  const resourceActions =
    (rolePermissions as unknown as Record<string, readonly string[]>)[
      resource
    ] || [];
  return resourceActions.includes(action as never);
}
