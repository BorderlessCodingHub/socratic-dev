import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'

let client: SupabaseClient<Database> | null = null

function getAdmin(): SupabaseClient<Database> {
  client ??= createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  return client
}

// Use this ONLY in server-side code (API routes, server actions).
// Never expose the service role key to the client.
// Lazy proxy: env vars are read on first use, not at module load
// (required for the OpenNext build and the Workers runtime).
export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop, _receiver) {
    const admin = getAdmin()
    return Reflect.get(admin, prop, admin)
  },
})
