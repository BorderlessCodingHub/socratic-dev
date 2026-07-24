import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'

type BrowserClient = SupabaseClient<Database>

let browserClient: BrowserClient | undefined

function requirePublicEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `${name} is required. Set it as a Cloudflare Workers build Variable (NEXT_PUBLIC_* must be present at build) or in .env.local for local dev.`,
    )
  }
  return value
}

/**
 * Cookie-backed browser client (via @supabase/ssr). Lazy so module import
 * during `next build` does not throw when env is unset; first real use throws
 * if URL/anon key are missing.
 */
export function getSupabaseBrowser(): BrowserClient {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      requirePublicEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requirePublicEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    )
  }
  return browserClient
}

/** Lazy proxy — preserves `supabase.auth` / `supabase.from` call sites. */
export const supabase: BrowserClient = new Proxy({} as BrowserClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseBrowser()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
