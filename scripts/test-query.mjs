import { neon } from "@neondatabase/serverless";

const databaseUrl = "postgresql://neondb_owner:npg_VIpiQXqd2xU0@ep-royal-hat-az3bminf.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(databaseUrl);

async function test() {
  const users = await sql`SELECT count(*) FROM users`;
  const startups = await sql`SELECT count(*) FROM startups`;
  const latest = await sql`SELECT id, title, category, views FROM startups LIMIT 3`;

  console.log("Users count in Neon:", users[0].count);
  console.log("Startups count in Neon:", startups[0].count);
  console.log("Sample startups in Neon:", latest);
}

test();
