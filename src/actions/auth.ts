import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { z } from 'zod'

import { getUserByEmail } from '@/data-layer/users'
import { auth } from '@/lib/auth'
import { rateLimitMiddleware } from '@/middleware/server'

/**
 * Unified login/signup action
 * - If user exists: attempts sign in
 * - If user doesn't exist: creates account
 * - On successful signup: returns email for redirect to verify email
 */
export const loginOrSignupFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
  )
  .middleware([rateLimitMiddleware({ max: 10, window: 60 })])
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const { email, password } = data

    // First, check if user exists
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      // Check if user's email is verified
      if (!existingUser.emailVerified) {
        return {
          success: false,
          error: 'EMAIL_NOT_VERIFIED',
          message:
            'Email not verified. Please check your email for a verification link.',
        }
      }

      // User exists and email is verified, try to sign in
      try {
        await auth.api.signInEmail({
          body: {
            email,
            password,
            rememberMe: true,
            callbackURL: '/',
          },
          headers,
        })

        return {
          success: true,
          existingUser: true,
        }
      } catch (error) {
        return {
          success: false,
          error: 'INVALID_PASSWORD',
          message: 'Invalid password',
        }
      }
    }

    // User doesn't exist, create new account
    const name = email.split('@')[0] // Use email prefix as default name

    try {
      await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
          callbackURL: '/',
        },
        headers,
      })
    } catch (error) {
      return {
        success: false,
        error: 'SIGNUP_FAILED',
        message: 'Failed to create account',
      }
    }

    return {
      success: true,
      existingUser: false,
      email,
    }
  })
