import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL;
const hasDbUrl = Boolean(
  dbUrl && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))
);

// Export Drizzle client singleton if valid database URL is configured
export const db = hasDbUrl ? drizzle(neon(dbUrl!), { schema }) : null;
export type DatabaseClient = typeof db;
