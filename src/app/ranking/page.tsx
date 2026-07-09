import { leagueForUser, rankingForUser } from '@/features/ranking/queries'
import { getServerUser } from '@/lib/supabase/server-client'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { RankingFallback, RankingView } from './ranking-view'

export default function RankingPage() {
  return (
    <Suspense fallback={<RankingFallback />}>
      <RankingContent />
    </Suspense>
  )
}

async function RankingContent() {
  const user = await getServerUser()
  if (!user) redirect('/login?next=/ranking')

  const [data, league] = await Promise.all([
    rankingForUser(user.id),
    leagueForUser(user.id).catch(() => null),
  ])

  return <RankingView data={data} league={league} />
}
