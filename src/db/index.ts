import { neon } from '@neondatabase/serverless'

import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/neon-http'

export function dbClient() {
  const client = neon(env.DATABASE_URL)
  return drizzle({ client })
}
