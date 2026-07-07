'use server'

import { authActionUser } from '@/lib/api/guard'
import { supabaseAdmin } from '@/lib/supabase/server'
import { revalidatePath, unstable_cache, updateTag } from 'next/cache'

export type RankingEntry = {
  position: number
  name: string
  points: number
  isMe: boolean
}

export type RankingData = {
  entries: RankingEntry[]
  me: { position: number; points: number; hasName: boolean }
}

const TOP_LIMIT = 50

const getTopProfiles = unstable_cache(
  async () => {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, display_name, email, total_points')
      .order('total_points', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(TOP_LIMIT)
    if (error) throw new Error(error.message)
    return data
  },
  ['ranking-top'],
  { revalidate: 60, tags: ['ranking'] },
)

function publicName(
  displayName: string | null,
  email: string | null,
): string {
  if (displayName?.trim()) return displayName.trim()
  const local = (email ?? '').split('@')[0]
  if (!local) return 'anon'
  return local.length <= 3 ? `${local}***` : `${local.slice(0, 3)}***`
}

export async function getRanking(
  token: string,
): Promise<RankingData | { error: string }> {
  const a = await authActionUser(token)
  if ('error' in a) return { error: 'Não autenticado.' }

  let rows: {
    id: string
    display_name: string | null
    email: string | null
    total_points: number
  }[]
  let me: { display_name: string | null; total_points: number } | null
  try {
    const [top, meR] = await Promise.all([
      getTopProfiles(),
      supabaseAdmin
        .from('profiles')
        .select('display_name, total_points')
        .eq('id', a.userId)
        .maybeSingle(),
    ])
    rows = (top ?? []) as unknown as typeof rows
    me = meR.data as unknown as typeof me
  } catch {
    return { error: 'Não foi possível carregar o ranking.' }
  }
  const myPoints = me?.total_points ?? 0

  const { count } = await supabaseAdmin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .gt('total_points', myPoints)
  const myPosition = (count ?? 0) + 1

  return {
    entries: rows.map((r, i) => ({
      position: i + 1,
      name: publicName(r.display_name, r.email),
      points: r.total_points,
      isMe: r.id === a.userId,
    })),
    me: {
      position: myPosition,
      points: myPoints,
      hasName: !!me?.display_name?.trim(),
    },
  }
}

export async function getMyRank(
  token: string,
): Promise<{ position: number; points: number } | null> {
  const a = await authActionUser(token)
  if ('error' in a) return null
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('total_points')
    .eq('id', a.userId)
    .maybeSingle()
  const points =
    (data as unknown as { total_points: number } | null)?.total_points ?? 0
  const { count } = await supabaseAdmin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .gt('total_points', points)
  return { position: (count ?? 0) + 1, points }
}

export async function setDisplayName(args: {
  token: string
  name: string
}): Promise<{ ok: true } | { error: string }> {
  const a = await authActionUser(args.token)
  if ('error' in a) return { error: 'Não autenticado.' }
  const name = args.name.trim().slice(0, 40)
  if (name.length < 2) return { error: 'Nome muito curto.' }
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ display_name: name })
    .eq('id', a.userId)
  if (error) return { error: 'Não foi possível salvar o nome.' }
  updateTag('ranking')
  revalidatePath('/ranking')
  return { ok: true }
}
