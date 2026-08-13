'use server'

import { rateLimit } from '@/lib/api/guard'
import { supabaseAdmin } from '@/lib/supabase/server'

// Credentials live on the platform (Borderless Coding) — we never store
// passwords in Supabase. Supabase only hosts the app session and data.
const AUTH_API_URL =
  process.env.AUTH_API_URL ?? 'https://api.borderlesscoding.com'

export type PlatformSignInError =
  | 'invalid-credentials'
  | 'rate-limited'
  | 'unavailable'

export type PlatformSignInResult =
  | { tokenHash: string }
  | { error: PlatformSignInError }

type PlatformUser = {
  id?: string
  email?: string
  name?: string
  username?: string
  careerStage?: string
}

export async function signInWithPlatform(input: {
  email: string
  password: string
}): Promise<PlatformSignInResult> {
  const email = String(input.email ?? '').trim().toLowerCase()
  const password = String(input.password ?? '')
  if (!email || !password) return { error: 'invalid-credentials' }
  if (!(await rateLimit(`signin:${email}`, 10, 600_000))) {
    return { error: 'rate-limited' }
  }

  let res: Response
  try {
    res = await fetch(`${AUTH_API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
  } catch (e) {
    console.error('[signInWithPlatform] fetch', e)
    return { error: 'unavailable' }
  }

  if (res.status === 429) return { error: 'rate-limited' }
  if (!res.ok) {
    // 4xx means the platform rejected the credentials; 5xx is on their side.
    return { error: res.status >= 500 ? 'unavailable' : 'invalid-credentials' }
  }

  let platformUser: PlatformUser | undefined
  try {
    const body = (await res.json()) as { data?: { user?: PlatformUser } }
    platformUser = body?.data?.user
  } catch {
    return { error: 'unavailable' }
  }
  const platformEmail = platformUser?.email?.trim().toLowerCase() || email

  // Bridge into a Supabase session so RLS, action guards and the profiles
  // trigger keep working unchanged. The auth user is created without a
  // password, so signing in directly through Supabase stays impossible.
  const created = await supabaseAdmin.auth.admin.createUser({
    email: platformEmail,
    email_confirm: true,
    user_metadata: {
      full_name: platformUser?.name ?? null,
      platform_username: platformUser?.username ?? null,
      platform_career_stage: platformUser?.careerStage ?? null,
    },
  })
  if (created.error) {
    const exists =
      (created.error as { code?: string }).code === 'email_exists' ||
      /already/i.test(created.error.message)
    if (!exists) {
      console.error('[signInWithPlatform] createUser', created.error)
      return { error: 'unavailable' }
    }
  }

  const link = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: platformEmail,
  })
  const tokenHash = link.data?.properties?.hashed_token
  if (link.error || !tokenHash) {
    console.error('[signInWithPlatform] generateLink', link.error)
    return { error: 'unavailable' }
  }
  return { tokenHash }
}
