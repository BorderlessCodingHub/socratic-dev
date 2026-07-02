'use client'

import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

function CallbackHandler() {
  const router = useRouter()
  const params = useSearchParams()
  const rawNext = params.get('next') ?? '/onboarding'
  const next = rawNext.startsWith('/') ? rawNext : '/onboarding'

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        subscription.unsubscribe()
        router.replace(next)
      }
    })
    return () => subscription.unsubscribe()
  }, [next, router])

  return (
    <div className='grid min-h-screen place-items-center bg-background'>
      <Loader2 className='size-5 animate-spin text-muted-foreground' />
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className='grid min-h-screen place-items-center bg-background'>
          <Loader2 className='size-5 animate-spin text-muted-foreground' />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  )
}
