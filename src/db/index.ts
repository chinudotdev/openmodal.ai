import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/postgres-js'

export function dbClient() {
  return drizzle(env.HYPERDRIVE.connectionString)
}
