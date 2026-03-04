import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: env.DATABASE_URL,
})

export const db = drizzle({ client: pool })
