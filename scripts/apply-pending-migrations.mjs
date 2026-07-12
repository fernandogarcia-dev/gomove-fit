#!/usr/bin/env node
/**
 * Applies pending SQL migrations directly to the remote Supabase database.
 * Requires SUPABASE_DB_PASS in .env (or environment).
 *
 * Usage: node scripts/apply-pending-migrations.mjs
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const loadEnv = () => {
  try {
    const raw = readFileSync(join(root, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env optional if vars already exported
  }
};

loadEnv();

const projectRef = process.env.SUPABASE_PROJECT_ID ?? process.env.VITE_SUPABASE_PROJECT_ID;
const password = process.env.SUPABASE_DB_PASS;
const region = process.env.SUPABASE_PROJECT_REGION ?? "sa-east-1";

if (!projectRef || !password) {
  console.error("Missing SUPABASE_PROJECT_ID and SUPABASE_DB_PASS in .env");
  process.exit(1);
}

const pending = [
  "20260712210000_add_pro_subscriptions.sql",
  "20260712211000_add_referrals.sql",
];

const regionsToTry = [
  region,
  "us-east-1",
  "us-east-2",
  "eu-west-1",
  "ap-southeast-1",
  "sa-east-1",
];

let client;

for (const r of [...new Set(regionsToTry)]) {
  const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-${r}.pooler.supabase.com:5432/postgres`;
  const candidate = new pg.Client({ connectionString, connectionTimeoutMillis: 8000 });
  try {
    await candidate.connect();
    const { rows } = await candidate.query("select current_database()");
    console.log(`Connected via aws-0-${r}.pooler (${rows[0].current_database})`);
    client = candidate;
    break;
  } catch (error) {
    console.log(`aws-0-${r}.pooler: ${error.message}`);
    await candidate.end().catch(() => {});
  }
}

if (!client) {
  console.error("Could not connect to Supabase Postgres via any pooler region.");
  process.exit(1);
}

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
      version text PRIMARY KEY,
      name text
    )
  `).catch(async () => {
    await client.query("CREATE SCHEMA IF NOT EXISTS supabase_migrations");
    await client.query(`
      CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
        version text PRIMARY KEY,
        name text
      )
    `);
  });

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
