import { createFileRoute } from '@tanstack/react-router'

import { sql } from 'drizzle-orm'

import { dbClient } from '@/db'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: async () => {
        const db = dbClient()
        await db.execute(sql`SELECT 1`)
        return new Response('OK')
      },
    },
  },
})
