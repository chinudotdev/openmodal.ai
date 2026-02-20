import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { user } from '@/db/schema'

export async function getOnboardingStatus(userId: string) {
  try {
    const session = await db
      .select({
        completed: user.onboardingCompleted,
        role: user.role,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (session.length === 0) {
      return { completed: false, role: null }
    }

    return {
      completed: session[0].completed,
      role: session[0].role,
    }
  } catch (error) {
    console.error('Error getting onboarding status:', error)
    return { onboarded: false, role: null }
  }
}
