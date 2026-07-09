import { supabaseAdmin } from '@/lib/supabase/server'
import { cacheLife, cacheTag } from 'next/cache'

export type LibraryChallenge = {
  id: string
  title: string
  description: string
  stack: string
  level: string
  kind: 'code' | 'design'
  topics: string[] | null
  created_at: string
}

export type DailyChallenge = {
  id: string
  title: string
  stack: string
  level: string
  kind: string | null
}

export async function listLibraryChallenges(): Promise<LibraryChallenge[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('challenges')
  const { data, error } = await supabaseAdmin
    .from('challenges')
    .select('id, title, description, stack, level, kind, topics, created_at')
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as unknown as LibraryChallenge[]
}

export async function dailyChallengeFor(
  day: string,
): Promise<DailyChallenge | null> {
  'use cache'
  cacheLife('hours')
  cacheTag('challenges')
  const { count } = await supabaseAdmin
    .from('challenges')
    .select('id', { count: 'exact', head: true })
  if (!count) return null
  const dayNumber = Math.floor(Date.parse(day) / (24 * 3600_000))
  const idx = dayNumber % count
  const { data } = await supabaseAdmin
    .from('challenges')
    .select('id, title, stack, level, kind')
    .order('created_at', { ascending: true })
    .range(idx, idx)
  return (data?.[0] as DailyChallenge | undefined) ?? null
}
