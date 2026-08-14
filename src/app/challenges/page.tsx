import { listLibraryChallenges } from '@/features/challenges/queries'
import { getLocale } from '@/lib/i18n/server'
import { LibraryView } from './library-view'

export default async function ChallengesLibraryPage() {
  const challenges = await listLibraryChallenges(await getLocale())
  return <LibraryView challenges={challenges} />
}
