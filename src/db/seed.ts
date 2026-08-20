import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { SAMPLE_STARTUPS, SAMPLE_USERS } from "./sample-data";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function seed() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.log("ℹ️  No DATABASE_URL found in .env.local. In-memory store is already active with sample data.");
    return;
  }

  console.log("🌱 Seeding Neon PostgreSQL database...");

  const sql = neon(dbUrl);
  const db = drizzle(sql, { schema });

  try {
    // 1. Seed Users
    console.log("Inserting users...");
    for (const user of SAMPLE_USERS) {
      await db
        .insert(schema.users)
        .values({
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          image: user.image,
          bio: user.bio,
        })
        .onConflictDoNothing();
    }

    // 2. Seed Startups
    console.log("Inserting startups...");
    for (const startup of SAMPLE_STARTUPS) {
      await db
        .insert(schema.startups)
        .values({
          id: startup.id,
          title: startup.title,
          slug: startup.slug,
          description: startup.description,
          category: startup.category,
          image: startup.image,
          pitch: startup.pitch,
          views: startup.views,
          authorId: startup.authorId,
        })
        .onConflictDoNothing();
    }

    console.log("✅ Neon Database seeded successfully!");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
}

seed();
