#!/usr/bin/env node

/**
 * Seeds blog_guides via direct Postgres (no service role key required).
 * Uses UPSERT on slug — replaces existing rows, never duplicates.
 *
 * Usage:
 *   node scripts/seed-blog-guides-pg.mjs
 *   node scripts/seed-blog-guides-pg.mjs --force
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const loadEnvFile = (filename) => {
  try {
    const raw = readFileSync(path.join(rootDir, filename), "utf8");
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

const force = process.argv.includes("--force");
const projectRef = process.env.SUPABASE_PROJECT_ID ?? process.env.VITE_SUPABASE_PROJECT_ID;
const password = process.env.SUPABASE_DB_PASS;

if (!projectRef || !password) {
  console.error("Missing SUPABASE_PROJECT_ID and SUPABASE_DB_PASS in .env");
  process.exit(1);
}

const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-1-sa-east-1.pooler.supabase.com:5432/postgres`;

const vite = await createServer({
  root: rootDir,
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

const { LANDING_PAGES } = await vite.ssrLoadModule("/src/lib/seo/landing-pages.ts");
await vite.close();

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();

const { rows: countRows } = await client.query("SELECT count(*)::int AS count FROM public.blog_guides");
const count = countRows[0]?.count ?? 0;

if (count > 0 && !force) {
  console.log(`blog_guides already has ${count} rows. Run with --force to upsert all guides.`);
  await client.end();
  process.exit(0);
}

const upsertSql = `
  INSERT INTO public.blog_guides (
    slug, title, h1, meta_description, keywords, hero_subtitle,
    sections, faqs, related_slugs, published
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    h1 = EXCLUDED.h1,
    meta_description = EXCLUDED.meta_description,
    keywords = EXCLUDED.keywords,
    hero_subtitle = EXCLUDED.hero_subtitle,
    sections = EXCLUDED.sections,
    faqs = EXCLUDED.faqs,
    related_slugs = EXCLUDED.related_slugs,
    published = EXCLUDED.published,
    updated_at = now()
`;

let inserted = 0;
for (const page of LANDING_PAGES) {
  await client.query(upsertSql, [
    page.slug,
    page.title,
    page.h1,
    page.metaDescription,
    page.keywords,
    page.heroSubtitle,
    JSON.stringify(page.sections),
    JSON.stringify(page.faqs),
    page.relatedSlugs,
    true,
  ]);
  inserted += 1;
  if (inserted % 20 === 0 || inserted === LANDING_PAGES.length) {
    console.log(`Upserted ${inserted}/${LANDING_PAGES.length} guides...`);
  }
}

await client.end();
console.log(`Done. Seeded ${LANDING_PAGES.length} long-form blog guides.`);
