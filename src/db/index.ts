// import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Use connection pooling for better performance
// Neon HTTP connections automatically use connection pooling
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, {
  // logger: process.env.NODE_ENV === "development",
});
