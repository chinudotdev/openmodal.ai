import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

export function dbClient() {
  console.log({ connection: env.HYPERDRIVE.connectionString })
  const pool = new Pool({
    connectionString: env.HYPERDRIVE.connectionString,
  })
  return drizzle({ client: pool })
}
