import { createServerFn } from '@tanstack/react-start'

import { and, eq, ne } from 'drizzle-orm'
import z from 'zod'

import { dbClient } from '@/db'
import { user as userTable } from '@/db/schema'
import { authMiddleware } from '@/middleware/server'

export const completeOnboardingFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1, 'Name is required'),
      username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(
          /^[a-zA-Z0-9_]+$/,
          'Username can only contain letters, numbers, and underscores',
        ),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data: { name, username }, context: { user } }) => {
    const userId = user.id
    // Check if username already exists (excluding current user)
    const db = await dbClient()
    const existingUser = await db
      .select({
        id: userTable.id,
      })
      .from(userTable)
      .where(and(eq(userTable.username, username), ne(userTable.id, userId)))
      .limit(1)

    if (existingUser.length > 0) {
      return {
        success: false,
        error: 'Username already taken',
      }
    }

    // Update user with new name, username, and mark onboarding as completed
    await db
      .update(userTable)
      .set({
        name,
        username,
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, userId))

    return {
      success: true,
    }
  })
