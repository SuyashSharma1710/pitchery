import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";


export function getDatabase() {
  const rawDbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!rawDbUrl || (!rawDbUrl.startsWith("postgres://") && !rawDbUrl.startsWith("postgresql://"))) {
    throw new Error(
      "Database connection failed: DATABASE_URL (or POSTGRES_URL) is not set or invalid. Please configure your DATABASE_URL in Vercel Project Settings > Environment Variables."
    );
  }
  return drizzle(neon(rawDbUrl), { schema });
}

export const db = (function () {
  const rawDbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!rawDbUrl || (!rawDbUrl.startsWith("postgres://") && !rawDbUrl.startsWith("postgresql://"))) {
    return null;
  }
  return drizzle(neon(rawDbUrl), { schema });
})();

export type DatabaseClient = ReturnType<typeof getDatabase>;

