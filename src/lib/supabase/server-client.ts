import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../database.types'

// Cookie-aware client for Server Components, server actions and route
// handlers. Reads the session the browser client stores in cookies.
export async function createSupabaseServer() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
