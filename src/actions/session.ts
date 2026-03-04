import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { getAuth } from '@/lib/auth'

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders()
    const auth = getAuth()
    const session = await auth.api.getSession({ headers })

    return session as
      | (typeof session & {
          user: {
            role: 'admin' | 'observer'
            onboardingCompleted: boolean
          }
        })
      | null
  },
)
