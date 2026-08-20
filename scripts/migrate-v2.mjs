import { neon } from "@neondatabase/serverless";

const databaseUrl = "postgresql://neondb_owner:npg_VIpiQXqd2xU0@ep-royal-hat-az3bminf.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(databaseUrl);

async function migrate() {
  console.log("🚀 Starting database migration v2 on Neon PostgreSQL...");

  // 1. Update users table with password_hash & updated_at
  console.log("Adding password_hash and updated_at to users table...");
  await sql`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS password_hash TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
  `;

  // 2. Create comments table (Public Discussion)
  console.log("Creating comments table...");
  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      startup_id TEXT NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS comment_startup_idx ON comments (startup_id);`;
  await sql`CREATE INDEX IF NOT EXISTS comment_user_idx ON comments (user_id);`;

  // 3. Create reachouts table (Private Inbox Messages)
  console.log("Creating reachouts table for private founder messages...");
  await sql`
    CREATE TABLE IF NOT EXISTS reachouts (
      id TEXT PRIMARY KEY,
      sender_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      startup_id TEXT REFERENCES startups(id) ON DELETE SET NULL,
      sender_name VARCHAR(255) NOT NULL,
      sender_email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS reachout_receiver_idx ON reachouts (receiver_id);`;
  await sql`CREATE INDEX IF NOT EXISTS reachout_sender_idx ON reachouts (sender_id);`;
  await sql`CREATE INDEX IF NOT EXISTS reachout_read_idx ON reachouts (is_read);`;

  // 4. Seed initial sample comment and reach-out message for realistic demo
  console.log("Seeding sample comment and inbox message...");
  await sql`
    INSERT INTO comments (id, startup_id, user_id, content, created_at)
    VALUES (
      'comment-1',
      'startup-1',
      'user_steven_smith',
      'Love the emphasis on real-world projects! Are you planning to add support for Next.js 15 Server Actions and Neon DB modules in the upcoming cohort?',
      NOW() - INTERVAL '2 hours'
    )
    ON CONFLICT (id) DO NOTHING;
  `;

  await sql`
    INSERT INTO reachouts (id, sender_id, receiver_id, startup_id, sender_name, sender_email, subject, message, is_read, created_at)
    VALUES (
      'reachout-1',
      'user_elena_rostova',
      'user_nathan_smith',
      'startup-6',
      'Elena Rostova',
      'elena@example.com',
      'Partnership Inquiry for DevFlow Studio',
      'Hi Nathan, I saw your DevFlow Studio pitch on YC Directory. We are developing asynchronous AI agents at Osmo AI and would love to discuss a potential integration or partnership with your cloud IDE environment. Let me know if you are open to a brief conversation!',
      FALSE,
      NOW() - INTERVAL '1 day'
    )
    ON CONFLICT (id) DO NOTHING;
  `;

  console.log("✅ Neon Migration v2 completed successfully!");
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
