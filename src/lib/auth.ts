import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { admin, customSession, username } from 'better-auth/plugins'
import { env } from 'cloudflare:workers'
import { getOnboardingStatus } from '@/data-layer/onboarding'
import { db } from '@/db'
import { authSchema } from '@/db/schema'
import { sendEmailVerification } from '@/emails'

import { ac, roles } from '@/lib/permissions'

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmailVerification({ to: user.email, url })
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    modelName: 'user',
    additionalFields: {
      onboardingCompleted: {
        type: 'boolean',
        defaultValue: false,
      },
    },
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 20,
      usernameValidator: (usernameValue) => {
        // Allow only alphanumeric characters and underscores
        return /^[a-zA-Z0-9_]+$/.test(usernameValue)
      },
    }),
    customSession(async ({ user, session }) => {
      // Get onboarding status for the user
      const onboardingStatus = await getOnboardingStatus(user.id)
      return {
        user: {
          ...user,
          onboardingCompleted: onboardingStatus.completed as boolean,
          role: onboardingStatus.role as 'admin' | 'observer',
        },
        session,
      }
    }),
    admin({
      ac,
      roles,
      defaultRole: 'observer',
      adminRoles: ['admin'],
    }),
    tanstackStartCookies(),
  ],
})
