import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'

type AdminClient = SupabaseClient<Database>

const BUILD_PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const BUILD_PLACEHOLDER_KEY = 'placeholder-service-role-key'

let adminClient: AdminClient | undefined

function isNextProductionBuild(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build'
}

function envOrBuildPlaceholder(
  name: string,
  value: string | undefined,
  placeholder: string,
): string {
  if (value) return value
  // Allow `next build` / OpenNext page collection & SSG without real secrets.
  // Runtime requests still throw when env is missing.
  if (isNextProductionBuild()) return placeholder
  throw new Error(
    `${name} is required. Set it in the runtime environment (Cloudflare Workers secrets / Variables).`,
  )
}

/**
 * Service-role admin client. Lazy so importing this module during `next build`
 * does not throw. First use creates the client; during production build only,
 * missing env falls back to placeholders so SSG can finish (queries fail open).
 * At runtime, missing env throws.
 *
 * Use ONLY in server-side code (API routes, server actions).
 * Never expose the service role key to the client.
 */
export function getSupabaseAdmin(): AdminClient {
  if (!adminClient) {
    adminClient = createClient<Database>(
      envOrBuildPlaceholder(
        'NEXT_PUBLIC_SUPABASE_URL',
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        BUILD_PLACEHOLDER_URL,
      ),
      envOrBuildPlaceholder(
        'SUPABASE_SERVICE_ROLE_KEY',
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        BUILD_PLACEHOLDER_KEY,
      ),
    )
  }
  return adminClient
}

/** Lazy proxy — preserves `supabaseAdmin.from(...)` call sites. */
export const supabaseAdmin: AdminClient = new Proxy({} as AdminClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdmin()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
