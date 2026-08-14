import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../database.types'

// Some browser extensions (antivirus/VPN content scripts) deny the Web Locks
// API, making every auth-js call reject with SecurityError — the app then
// treats a valid session as signed out. Try the native lock first and fall
// back to an in-process queue when acquisition is denied.
const queues = new Map<string, Promise<unknown>>()

async function resilientLock<R>(
  name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>,
): Promise<R> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    let acquired = false
    try {
      return (await navigator.locks.request(name, { mode: 'exclusive' }, () => {
        acquired = true
        return fn()
      })) as R
    } catch (e) {
      // If the callback ran, the failure came from fn itself — propagate it
      // instead of running fn a second time without the lock.
      if (acquired) throw e
    }
  }
  const prev = queues.get(name) ?? Promise.resolve()
  const next = prev.catch(() => {}).then(fn)
  queues.set(
    name,
    next.catch(() => {}),
  )
  return next
}

// Cookie-backed session (via @supabase/ssr) so the server can identify the
// user on the first request — the foundation for Server Components.
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { lock: resilientLock } },
)
