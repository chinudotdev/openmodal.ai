import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

export function dbClient() {
  const pool = new Pool({
    connectionString: env.HYPERDRIVE.connectionString,
  })
  return drizzle({ client: pool })
}
