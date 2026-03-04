import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { getAuth } from '@/lib/auth'

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const headers = getRequestHeaders()
    const auth = getAuth()
    const session = await auth.api.getSession({ headers })

    if (!session) {
      throw new Error('Unauthorized')
    }
    return next({
      context: {
        user: session.user as typeof session.user & {
          role:
            | 'admin'
            | 'observer'
            | 'moderator'
            | 'contributor'
            | 'trusted'
            | 'expert'
          onboardingCompleted: boolean
        },
        session: session.session,
      },
    })
  },
)

/**
 * Admin middleware - chains authMiddleware and checks for admin role
 * Use this for server actions that require admin privileges
 */
export const adminMiddleware = createMiddleware({ type: 'function' })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    // Check if user has admin role (authMiddleware already validated user exists)
    if (context.user.role !== 'admin') {
      throw new Error('Forbidden: Admin role required')
    }

    return next({
      context: {
        ...context,
        isAdmin: true,
      },
    })
  })

/**
 * Moderator middleware - chains authMiddleware and checks for moderator or admin role
 * Use this for server actions that require moderation privileges
 */
export const moderatorMiddleware = createMiddleware({ type: 'function' })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    // Check if user has moderator or admin role (authMiddleware already validated user exists)
    if (context.user.role !== 'moderator' && context.user.role !== 'admin') {
      throw new Error('Forbidden: Moderator or admin role required')
    }

    return next({
      context: {
        ...context,
        isModerator: true,
      },
    })
  })

// Simple in-memory rate limiting
// For production, use Redis or Cloudflare KV
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  max: number
  window: number // seconds
}

export const rateLimitMiddleware = (options: RateLimitOptions) => {
  return createMiddleware({ type: 'function' }).server(async ({ next }) => {
    const headers = getRequestHeaders()
    const cfConnectingIp = headers.get('CF-Connecting-IP')
    const xForwardedFor = headers.get('X-Forwarded-For')
    const ip = cfConnectingIp || xForwardedFor || 'unknown'

    const now = Date.now()
    const windowMs = options.window * 1000

    // Clean up old entries
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key)
      }
    }

    // Check rate limit
    const record = rateLimitMap.get(ip)
    if (!record || now > record.resetTime) {
      // First request or window expired
      rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      })
      return next()
    }

    if (record.count >= options.max) {
      throw new Error('Rate limit exceeded')
    }

    // Increment counter
    record.count++
    return next()
  })
}
