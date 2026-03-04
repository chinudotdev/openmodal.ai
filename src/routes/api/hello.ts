import { createFileRoute } from '@tanstack/react-router'

import { env } from 'cloudflare:workers'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => {
        const connection_url = env.HYPERDRIVE.connectionString
        return new Response(connection_url)
      },
    },
  },
})
