import { supabase } from '@/lib/supabase/client'

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export async function getAccessToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? ''
}

export async function apiFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers = new Headers(init.headers)
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }
  const url = input.startsWith('/') ? `${BASE_PATH}${input}` : input
  return fetch(url, { ...init, headers })
}
