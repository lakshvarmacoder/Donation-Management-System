import "server-only"

import { createClient } from "@supabase/supabase-js"

function requireServerEnvironment() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase server credentials are missing. Add them to frontend/.env.local.")
  }

  return { url, serviceRoleKey }
}

export function hasSupabaseServerConfiguration() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = requireServerEnvironment()

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
