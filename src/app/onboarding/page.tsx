'use client'

import { RequireAuth } from '@/components/require-auth'
import { Spinner } from '@/components/ui/spinner'
import { OnboardingFlow } from '@/features/onboarding/components/onboarding-flow'
import { Suspense } from 'react'

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className='grid min-h-dvh place-items-center bg-background'>
          <Spinner className='size-6 text-muted-foreground' />
        </div>
      }
    >
      <RequireAuth next='/onboarding'>
        {(user) => <OnboardingFlow user={user} />}
      </RequireAuth>
    </Suspense>
  )
}
