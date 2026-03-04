import { createFileRoute } from '@tanstack/react-router'

import { env } from 'cloudflare:workers'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: async () => {
        const client = new Client({
          connectionString: env.HYPERDRIVE.connectionString,
        })

        // Connect to the database
        await client.connect()

        // Create the Drizzle client with the node-postgres connection
        const db = drizzle(client)

        await db.execute(sql`SELECT 1`)
        return new Response('OK')
      },
    },
  },
})
