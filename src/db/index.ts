import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/node-postgres'

// export const db = drizzle(env.HYPERDRIVE.connectionString)

export const dbClient = () => {
  return drizzle(env.HYPERDRIVE.connectionString)
}
