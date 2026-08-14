'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/features/auth/hooks/use-user'
import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import * as React from 'react'

type Props = {
  next: string
  fallback?: React.ReactNode
  children: (user: User) => React.ReactNode
}

const defaultFallback = (
  <div className='grid min-h-dvh place-items-center bg-background'>
    <Spinner className='size-6 text-muted-foreground' />
  </div>
)

export function RequireAuth({ next, fallback, children }: Props) {
  const router = useRouter()
  const { user, loading, error } = useUser()

  React.useEffect(() => {
    if (!loading && !user && !error) {
      router.replace(`/login?next=${encodeURIComponent(next)}`)
    }
  }, [loading, user, error, next, router])

  if (loading) return <>{fallback ?? defaultFallback}</>
  if (error) {
    return (
      <div className='grid min-h-dvh place-items-center bg-background px-4'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <p className='type-body text-muted-foreground'>
            Não foi possível verificar sua sessão.
          </p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }
  if (!user) return <>{fallback ?? defaultFallback}</>
  return <>{children(user)}</>
}
