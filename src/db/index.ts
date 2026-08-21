import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const rawDbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const hasDbUrl = Boolean(
  rawDbUrl && (rawDbUrl.startsWith("postgres://") || rawDbUrl.startsWith("postgresql://"))
);

// Export Drizzle client singleton if valid database URL is configured
export const db = hasDbUrl ? drizzle(neon(rawDbUrl!), { schema }) : null;
export type DatabaseClient = typeof db;

export function getDatabase() {
  if (!db) {
    throw new Error(
      "Database connection failed: DATABASE_URL (or POSTGRES_URL) is not set or invalid. Please configure your DATABASE_URL in Vercel Project Settings > Environment Variables."
    );
  }
  return db;
}

