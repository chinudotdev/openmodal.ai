import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/postgres-js'

export const db = drizzle(env.HYPERDRIVE.connectionString)
