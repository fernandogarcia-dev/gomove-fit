#!/usr/bin/env node

/**
 * Seeds blog_guides from the long-form static catalog.
 * Uses UPSERT on slug — replaces existing rows, never duplicates.
 *
 * Required:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/seed-blog-guides.mjs
 *   node scripts/seed-blog-guides.mjs --force   # re-upsert even when table has rows
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const force = process.argv.includes("--force");
const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const vite = await createServer({
  root: rootDir,
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

const { LANDING_PAGES } = await vite.ssrLoadModule("/src/lib/seo/landing-pages.ts");
await vite.close();

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { count, error: countError } = await supabase
  .from("blog_guides")
  .select("*", { count: "exact", head: true });

if (countError) {
  console.error("Failed to check blog_guides:", countError.message);
  console.error("Run npm run db:migrate first if the table does not exist.");
  process.exit(1);
}

if ((count ?? 0) > 0 && !force) {
  console.log(
    `blog_guides already has ${count} rows. Existing slugs will be updated on the next forced sync.`,
  );
  console.log("Run with --force to upsert all long-form guides now (replaces content by slug).");
  process.exit(0);
}

const rows = LANDING_PAGES.map((page) => ({
  slug: page.slug,
  title: page.title,
  h1: page.h1,
  meta_description: page.metaDescription,
  keywords: page.keywords,
  hero_subtitle: page.heroSubtitle,
  sections: page.sections,
  faqs: page.faqs,
  related_slugs: page.relatedSlugs,
  published: true,
}));

const BATCH = 20;
let inserted = 0;

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error } = await supabase.from("blog_guides").upsert(batch, { onConflict: "slug" });
  if (error) {
    console.error(`Batch ${i / BATCH + 1} failed:`, error.message);
    process.exit(1);
  }
  inserted += batch.length;
  console.log(`Upserted ${inserted}/${rows.length} guides...`);
}

console.log(`Done. Seeded ${rows.length} blog guides.`);
