'use client'

import { RequireAuth } from '@/components/require-auth'
import { ChallengeSkeleton } from '@/features/challenges/components/challenge-skeleton'
import { DesignChallengeWorkspace } from '@/features/design/components/design-challenge-workspace'
import { Suspense } from 'react'

export default function DesignPage() {
  return (
    <Suspense fallback={<ChallengeSkeleton />}>
      <RequireAuth next='/design' fallback={<ChallengeSkeleton />}>
        {(user) => <DesignChallengeWorkspace user={user} />}
      </RequireAuth>
    </Suspense>
  )
}
