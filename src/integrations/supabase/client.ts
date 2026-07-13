import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const env = import.meta.env;

// Accept Vite and Next-style env var names (Supabase → Vercel integration may sync either).
const SUPABASE_URL =
  env.VITE_SUPABASE_URL ??
  (env as Record<string, string | undefined>).NEXT_PUBLIC_SUPABASE_URL;

const SUPABASE_PUBLISHABLE_KEY =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  env.VITE_SUPABASE_ANON_KEY ??
  (env as Record<string, string | undefined>).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  (env as Record<string, string | undefined>).NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  (env as Record<string, string | undefined>).SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  if (typeof window !== "undefined") {
    throw new Error(
      "Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY).",
    );
  }
}

const resolvedUrl = SUPABASE_URL ?? "https://placeholder.supabase.co";
const resolvedKey = SUPABASE_PUBLISHABLE_KEY ?? "placeholder-anon-key";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const supabase = createClient<Database>(resolvedUrl, resolvedKey, {
  auth: {
    storage: typeof window !== "undefined" ? localStorage : noopStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
