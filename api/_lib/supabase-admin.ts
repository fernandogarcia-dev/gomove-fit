import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../src/integrations/supabase/types";

let adminClient: SupabaseClient<Database> | null = null;

/** Service-role client for server-side code only. Never expose this key to the browser. */
export const getSupabaseAdmin = (): SupabaseClient<Database> => {
  if (!adminClient) {
    const url = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error("VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not configured");
    }
    adminClient = createClient<Database>(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
};

/** Resolves the authenticated user from a Supabase access token sent by the client. */
export const getUserFromAuthHeader = async (authHeader: string | undefined) => {
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
};
