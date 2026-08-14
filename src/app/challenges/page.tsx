import { listLibraryChallenges } from '@/features/challenges/queries'
import { getLocale } from '@/lib/i18n/server'
import { Suspense } from 'react'
import { LibraryView } from './library-view'

export default function ChallengesLibraryPage() {
  return (
    <Suspense fallback={null}>
      <Library />
    </Suspense>
  )
}

async function Library() {
  const challenges = await listLibraryChallenges(await getLocale())
  return <LibraryView challenges={challenges} />
}
