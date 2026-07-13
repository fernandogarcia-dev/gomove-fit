#!/usr/bin/env node
/**
 * Applies pending SQL migrations directly to the remote Supabase database.
 *
 * Connection (first match wins):
 *   POSTGRES_URL_NON_POOLING / POSTGRES_URL (Vercel Supabase integration)
 *   SUPABASE_DB_PASS + SUPABASE_PROJECT_ID (+ optional SUPABASE_PROJECT_REGION)
 *
 * Usage: node scripts/apply-pending-migrations.mjs
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const loadEnvFile = (filename) => {
  try {
    const raw = readFileSync(join(root, filename), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
};

for (const file of [".env.vercel.production", ".env.vercel", ".env"]) {
  loadEnvFile(file);
}

const pending = readdirSync(join(root, "supabase/migrations"))
  .filter((file) => file.endsWith(".sql"))
  .sort();

async function connectClient() {
  const directUrl =
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL;

  if (directUrl) {
    const client = new pg.Client({
      connectionString: directUrl,
      connectionTimeoutMillis: 15000,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    const { rows } = await client.query("select current_database()");
    console.log(`Connected via POSTGRES_URL (${rows[0].current_database})`);
    return client;
  }

  const projectRef = process.env.SUPABASE_PROJECT_ID ?? process.env.VITE_SUPABASE_PROJECT_ID;
  const password = process.env.SUPABASE_DB_PASS;
  const region = process.env.SUPABASE_PROJECT_REGION ?? "sa-east-1";

  if (!projectRef || !password) {
    console.error(
      "Missing database credentials. Set POSTGRES_URL (vercel env pull) or SUPABASE_PROJECT_ID + SUPABASE_DB_PASS.",
    );
    process.exit(1);
  }

  const regionsToTry = [
    region,
    "sa-east-1",
    "us-east-1",
    "us-east-2",
    "eu-west-1",
    "ap-southeast-1",
  ];
  const awsPrefixes = ["aws-1", "aws-0"];

  for (const r of [...new Set(regionsToTry)]) {
    for (const aws of awsPrefixes) {
      const host = `${aws}-${r}.pooler.supabase.com`;
      const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@${host}:5432/postgres`;
      const candidate = new pg.Client({
        connectionString,
        connectionTimeoutMillis: 12000,
        ssl: { rejectUnauthorized: false },
      });
      try {
        await candidate.connect();
        const { rows } = await candidate.query("select current_database()");
        console.log(`Connected via ${host} (${rows[0].current_database})`);
        return candidate;
      } catch (error) {
        console.log(`${host}: ${error.message}`);
        await candidate.end().catch(() => {});
      }
    }

    const directHost = `db.${projectRef}.supabase.co`;
    const directClient = new pg.Client({
      connectionString: `postgresql://postgres:${encodeURIComponent(password)}@${directHost}:5432/postgres`,
      connectionTimeoutMillis: 12000,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await directClient.connect();
      const { rows } = await directClient.query("select current_database()");
      console.log(`Connected via ${directHost} (${rows[0].current_database})`);
      return directClient;
    } catch (error) {
      console.log(`${directHost}: ${error.message}`);
      await directClient.end().catch(() => {});
    }
  }

  console.error("Could not connect to Supabase Postgres.");
  process.exit(1);
}

const client = await connectClient();

try {
  await client.query("CREATE SCHEMA IF NOT EXISTS supabase_migrations").catch(() => {});
  await client.query(`
    CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
      version text PRIMARY KEY,
      name text
    )
  `);

  for (const file of pending) {
    const version = file.replace(/_.*$/, "");
    const { rows } = await client.query(
      "SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = $1",
      [version],
    );
    if (rows.length > 0) {
      console.log(`Skip ${file} (already applied)`);
      continue;
    }

    const sql = readFileSync(join(root, "supabase/migrations", file), "utf8");
    console.log(`Applying ${file}...`);
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query(
        "INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES ($1, $2)",
        [version, file],
      );
      await client.query("COMMIT");
      console.log(`Applied ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }

  console.log("All pending migrations applied.");
} finally {
  await client.end();
}
