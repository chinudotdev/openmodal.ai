import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/node-postgres'

export const dbClient = () => {
  return drizzle(env.HYPERDRIVE.connectionString)
}
