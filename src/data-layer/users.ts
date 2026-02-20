import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { user } from '@/db/schema'

export async function getUserByEmail(email: string) {
  try {
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
