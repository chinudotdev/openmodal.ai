import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(env.HYPERDRIVE.connectionString, { max: 1 })
export const db = drizzle({ client })
