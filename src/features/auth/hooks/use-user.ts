'use client'

import { identify, resetAnalytics } from '@/lib/analytics'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // Session check failed (e.g. transient error) — distinct from "confirmed
  // logged out", so callers don't bounce an actual session to /login.
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return
        setUser(data.session?.user ?? null)
        setLoading(false)
      })
      .catch(() => {
        if (!mounted) return
        setError(true)
        setLoading(false)
      })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setError(false)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        identify(session.user.id, { email: session.user.email })
      } else if (event === 'SIGNED_OUT') {
        resetAnalytics()
      }
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return { user, loading, error }
}

export async function signOut() {
  await supabase.auth.signOut()
}
