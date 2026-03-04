import { createFileRoute } from '@tanstack/react-router'

import { getAuth } from '@/lib/auth'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const auth = getAuth()
        return await auth.handler(request)
      },
      POST: async ({ request }: { request: Request }) => {
        const auth = getAuth()
        return await auth.handler(request)
      },
    },
  },
})
