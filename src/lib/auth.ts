import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, customSession, username } from "better-auth/plugins";
import { getOnboardingStatus } from "@/actions/onboarding";
import { db } from "@/db";
import { authSchema } from "@/db/schema";
import { sendEmailVerification } from "@/emails";

import { ac, roles } from "@/lib/permissions";

export const auth = betterAuth({
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmailVerification({ to: user.email, url });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 20,
      usernameValidator: (username) => {
        // Allow only alphanumeric characters and underscores
        return /^[a-zA-Z0-9_]+$/.test(username);
      },
    }),
    customSession(async ({ user, session }) => {
      // Get onboarding status for the user
      const onboardingStatus = await getOnboardingStatus(user.id);
      return {
        user: {
          ...user,
          onboardingCompleted: onboardingStatus.completed,
          role: onboardingStatus.role,
        },
        session,
      };
    }),
    admin({
      ac,
      roles,
      defaultRole: "observer",
      adminRoles: ["admin"],
    }),
    nextCookies(),
  ],
});
