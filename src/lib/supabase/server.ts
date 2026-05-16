import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

/** Per-request server client bound to the user's session cookies. */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Setting cookies in a Server Component throws; safe to ignore
            // because middleware will refresh them on the next request.
          }
        },
      },
    },
  );
}

/**
 * Service-role client. Bypasses RLS. Use ONLY in server-side code paths
 * that need elevated privileges (e.g. bootstrapping the first head coach).
 * Returns null if SUPABASE_SERVICE_ROLE_KEY is not configured.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createServiceClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
