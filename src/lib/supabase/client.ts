import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'

type BrowserClient = SupabaseClient<Database>

let browserClient: BrowserClient | undefined

/**
 * Next.js only inlines `NEXT_PUBLIC_*` when accessed as a static property
 * (`process.env.NEXT_PUBLIC_FOO`). Dynamic `process.env[name]` stays empty in
 * the browser bundle even when Cloudflare Build Variables are set.
 */
function requirePublicEnv(
  name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  value: string | undefined,
): string {
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
      requirePublicEnv(
        'NEXT_PUBLIC_SUPABASE_URL',
        process.env.NEXT_PUBLIC_SUPABASE_URL,
      ),
      requirePublicEnv(
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ),
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
