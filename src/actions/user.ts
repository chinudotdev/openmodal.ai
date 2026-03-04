import { createServerFn } from '@tanstack/react-start'

import { eq } from 'drizzle-orm'
import z from 'zod'

import { dbClient } from '@/db'
import { user as userTable } from '@/db/schema'
import { authMiddleware } from '@/middleware/server'

export const checkUsernameAvailabilityFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      username: z.string().min(4).max(20),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data: { username } }) => {
    const db = await dbClient()
    const existingUser = await db
      .select({
        username: userTable.username,
      })
      .from(userTable)
      .where(eq(userTable.username, username))
      .limit(1)

    return existingUser.length === 0
  })
