import { supabase } from '@/lib/supabase/client'

const BASE_PATH = '/socratic-dev'

function withBasePath(input: string): string {
  if (!input.startsWith('/') || input.startsWith('//')) return input
  if (input === BASE_PATH || input.startsWith(`${BASE_PATH}/`)) return input
  return `${BASE_PATH}${input}`
}

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
  return fetch(withBasePath(input), { ...init, headers })
}
