#!/usr/bin/env node

/**
 * Creates or updates the initial admin user in Supabase.
 *
 * Required env vars (add to .env locally, never commit):
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  — from Supabase Dashboard → Settings → API
 *   ADMIN_EMAIL                — defaults to admin@gomove.fit
 *   ADMIN_PASSWORD             — min 6 characters
 *
 * Usage:
 *   npm run setup:admin
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL ?? "admin@gomove.fit";
const adminPassword = process.env.ADMIN_PASSWORD;

if (!url || !serviceRoleKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

if (!adminPassword || adminPassword.length < 6) {
  console.error("Set ADMIN_PASSWORD (min 6 characters) before running this script.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
if (listError) {
  console.error("Failed to list users:", listError.message);
  process.exit(1);
}

const existing = existingUsers.users.find(
  (user) => user.email?.toLowerCase() === adminEmail.toLowerCase(),
);

let userId = existing?.id;

if (!userId) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });

  if (error) {
    console.error("Failed to create admin user:", error.message);
    process.exit(1);
  }

  userId = data.user.id;
  console.log("Admin user created:", adminEmail);
} else {
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: adminPassword,
    email_confirm: true,
  });

  if (error) {
    console.error("Failed to update admin user:", error.message);
    process.exit(1);
  }

  console.log("Admin user already existed, password updated:", adminEmail);
}

const { error: roleError } = await supabase.from("user_roles").upsert(
  { user_id: userId, role: "admin" },
  { onConflict: "user_id,role" },
);

if (roleError) {
  console.error("Failed to assign admin role:", roleError.message);
  process.exit(1);
}

await supabase
  .from("user_roles")
  .delete()
  .eq("user_id", userId)
  .eq("role", "user");

console.log("Admin role assigned successfully.");
console.log("Sign in at /login with:", adminEmail);
console.log("");
console.log("Tip: disable email confirmation in Supabase Dashboard for faster MVP testing:");
console.log("Authentication → Providers → Email → Confirm email OFF");
