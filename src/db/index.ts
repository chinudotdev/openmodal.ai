import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/node-postgres'

export function dbClient() {
  return drizzle(env.HYPERDRIVE.connectionString)
}
