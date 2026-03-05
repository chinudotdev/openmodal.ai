import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/node-postgres'

const connection_string = env.HYPERDRIVE.connectionString

export function dbClient() {
  return drizzle(connection_string)
}
