#!/usr/bin/env node
/**
 * Sets image_url for every exercise in the remote Supabase catalog.
 * Uses admin login (same DB for local, preview, and production).
 *
 * Usage: node scripts/seed-exercise-images.mjs
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public/exercises");

const loadEnv = () => {
  for (const file of [".env.vercel", ".env"]) {
    try {
      const raw = readFileSync(join(root, file), "utf8");
      for (const line of raw.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
      }
    } catch {
      // optional
    }
  }
};

loadEnv();

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
const adminEmail = process.env.ADMIN_EMAIL ?? "admin@gomove.fit";
const adminPassword = process.env.ADMIN_PASSWORD;
const appUrl = (process.env.APP_URL ?? "https://gomove.fit").replace(/\/$/, "");

if (!url || (!serviceRoleKey && !anonKey)) {
  console.error("Missing Supabase URL and credentials (service role or anon key)");
  process.exit(1);
}

/** Unsplash webp URLs — cropped 480×480, free to use per Unsplash license */
const REMOTE_WEBP = {
  "Chin tuck":
    "https://images.unsplash.com/photo-1599901860904-17e06c5560c9?w=480&h=480&fit=crop&fm=webp&q=80",
  "Upper trap stretch":
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e46?w=480&h=480&fit=crop&fm=webp&q=80",
  "Doorway chest stretch":
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=480&h=480&fit=crop&fm=webp&q=80",
  "Wall angels":
    "https://images.unsplash.com/photo-1571019614242-c5c5deeaf784?w=480&h=480&fit=crop&fm=webp&q=80",
  "Band external rotation":
    "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=480&h=480&fit=crop&fm=webp&q=80",
  "Cat-cow":
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=480&h=480&fit=crop&fm=webp&q=80",
  "Child's pose":
    "https://images.unsplash.com/photo-1593811167562-9cef47bfc04e?w=480&h=480&fit=crop&fm=webp&q=80",
  "Bird dog":
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=480&h=480&fit=crop&fm=webp&q=80",
  "Glute bridge":
    "https://images.unsplash.com/photo-1574680096145-d05b474e2153?w=480&h=480&fit=crop&fm=webp&q=80",
  "Figure-four stretch":
    "https://images.unsplash.com/photo-1599901860904-17e06c5560c9?w=480&h=480&fit=crop&fm=webp&q=80",
  Clamshell:
    "https://images.unsplash.com/photo-1574680096145-d05b474e2153?w=480&h=480&fit=crop&fm=webp&q=80",
  "Heel slides":
    "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=480&h=480&fit=crop&fm=webp&q=80",
  "Straight leg raise":
    "https://images.unsplash.com/photo-1571019613454-1cb45761cda3?w=480&h=480&fit=crop&fm=webp&q=80",
  "Sit-to-stand":
    "https://images.unsplash.com/photo-1583454110551-21f2fee2bb61?w=480&h=480&fit=crop&fm=webp&q=80",
  "March in place":
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=480&h=480&fit=crop&fm=webp&q=80",
  "Bodyweight squat":
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=480&h=480&fit=crop&fm=webp&q=80",
};

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

const supabase = createClient(url, serviceRoleKey ?? anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

if (!serviceRoleKey) {
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });
  if (authError) {
    console.error("Admin login failed:", authError.message);
    console.error("Tip: run `vercel env pull .env.vercel` to get SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  console.log("Signed in as admin:", adminEmail);
} else {
  console.log("Using service role key (bypasses RLS)");
}

const { data: exercises, error: listError } = await supabase
  .from("exercises")
  .select("id, name, image_url")
  .order("name");

if (listError) {
  console.error("Failed to list exercises:", listError.message);
  process.exit(1);
}

let updated = 0;
for (const exercise of exercises) {
  const remoteUrl = REMOTE_WEBP[exercise.name];
  if (!remoteUrl) {
    console.warn(`No image mapping for: ${exercise.name}`);
    continue;
  }

  const slug = slugify(exercise.name);
  const localPath = join(publicDir, `${slug}.webp`);

  try {
    const response = await fetch(remoteUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(localPath, buffer);
  } catch (error) {
    console.warn(`Could not cache ${slug}.webp locally:`, error.message);
  }

  const imageUrl = `${appUrl}/exercises/${slug}.webp`;

  const { error: updateError } = await supabase
    .from("exercises")
    .update({ image_url: imageUrl })
    .eq("id", exercise.id);

  if (updateError) {
    console.error(`Failed to update ${exercise.name}:`, updateError.message);
    continue;
  }

  updated += 1;
  console.log(`✓ ${exercise.name} → ${imageUrl}`);
}

console.log(`\nDone. Updated ${updated}/${exercises.length} exercises.`);
