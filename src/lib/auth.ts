// Auth functionality removed - simplified auth config
// Keeping minimal Better Auth setup for potential future use
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { db } from "@/db";
import { authSchema } from "@/db/schema";

import { ac, roles } from "@/lib/permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  plugins: [
    admin({
      ac,
      roles,
      defaultRole: "observer",
      adminRoles: ["admin"],
    }),
    nextCookies(),
  ],
});
