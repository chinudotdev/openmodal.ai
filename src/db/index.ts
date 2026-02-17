// import "server-only";
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { env } from 'cloudflare:workers'
// Use connection pooling for better performance
// Neon HTTP connections automatically use connection pooling
const sql = neon(env.DATABASE_URL)

export const db = drizzle(sql)
