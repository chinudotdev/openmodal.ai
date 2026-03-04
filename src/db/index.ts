import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'

// import { Pool } from 'pg'

export async function dbClient() {
  const client = new Client({
    connectionString: env.HYPERDRIVE.connectionString,
  })
  await client.connect()
  return drizzle({ client })
}
