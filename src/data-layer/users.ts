import { eq } from 'drizzle-orm'

import { dbClient } from '@/db'
import { user } from '@/db/schema'

export async function getUserByEmail(email: string) {
  try {
    const db = await dbClient()
    const result = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1)

    return result[0] ?? null
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
}
