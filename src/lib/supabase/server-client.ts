import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../database.types'

const BUILD_PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const BUILD_PLACEHOLDER_ANON = 'placeholder-anon-key'

function isNextProductionBuild(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build'
}

function envOrBuildPlaceholder(name: string, placeholder: string): string {
  const value = process.env[name]
  if (value) return value
  if (isNextProductionBuild()) return placeholder
  throw new Error(
    `${name} is required. Set it in the runtime environment (Cloudflare Workers Variables / secrets).`,
  )
}

// Cookie-aware client for Server Components, server actions and route
// handlers. Reads the session the browser client stores in cookies.
// Env is read only when called (safe to import during `next build`).
export async function createSupabaseServer() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    envOrBuildPlaceholder('NEXT_PUBLIC_SUPABASE_URL', BUILD_PLACEHOLDER_URL),
    envOrBuildPlaceholder(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      BUILD_PLACEHOLDER_ANON,
    ),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component: cookie writes are not allowed
            // there. The proxy refreshes sessions, so this is safe to ignore.
          }
        },
      },
    },
  )
}

export type ServerUser = { id: string; email: string | null }

export async function getServerUser(): Promise<ServerUser | null> {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase.auth.getClaims()
  const claims = data?.claims as
    | { sub?: string; email?: string }
    | undefined
  if (error || !claims?.sub) return null
  return { id: claims.sub, email: claims.email ?? null }
}
