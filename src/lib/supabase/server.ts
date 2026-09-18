import { createClient } from "@supabase/supabase-js";

function getServerSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.NEXT_PRIVATE_SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Supabase server environment variables are missing.");
  }

  return { url, secretKey };
}

/**
 * Server-only elevated Supabase client.
 * Never import this module from a Client Component and never expose the key
 * through a NEXT_PUBLIC_* environment variable.
 */
export function createServerSupabaseClient() {
  const { url, secretKey } = getServerSupabaseConfig();
  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
