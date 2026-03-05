import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/node-postgres'

const connectionString = env.HYPERDRIVE.connectionString

export function dbClient() {
  return drizzle(connectionString)
}
