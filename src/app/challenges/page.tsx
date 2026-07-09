import { listLibraryChallenges } from '@/features/challenges/queries'
import { LibraryView } from './library-view'

export default async function ChallengesLibraryPage() {
  const challenges = await listLibraryChallenges()
  return <LibraryView challenges={challenges} />
}
