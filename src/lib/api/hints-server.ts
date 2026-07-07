import { FREE_WEEKLY_HINTS } from '@/features/hints/constants'
import { currentPeriod } from '@/features/hints/period'
import type { HintBalance } from '@/features/hints/types'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function getBalance(userId: string): Promise<HintBalance> {
  const { start, resetsAt } = currentPeriod()

  const { count } = await supabaseAdmin
    .from('hints_used')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('used_at', start.toISOString())
  const usedThisWeek = count ?? 0

  const { data: prof } = await supabaseAdmin
    .from('profiles')
    .select('bonus_hints')
    .eq('id', userId)
    .single()
  const bonus = Number((prof as { bonus_hints?: number } | null)?.bonus_hints ?? 0)

  const freeRemaining = Math.max(0, FREE_WEEKLY_HINTS - usedThisWeek)
  return {
    usedThisWeek,
    freeLimit: FREE_WEEKLY_HINTS,
    bonus,
    remaining: freeRemaining + bonus,
    resetsAt: resetsAt.toISOString(),
  }
}

export async function consumeHints(
  userId: string,
  sessionId: string,
  level: 1 | 2 | 3,
  cost: number,
  isSolve = false,
): Promise<number | null> {
  const { start } = currentPeriod()
  const { data, error } = await supabaseAdmin.rpc(
    'consume_hints' as never,
    {
      p_user: userId,
      p_session: sessionId,
      p_level: level,
      p_cost: cost,
      p_is_solve: isSolve,
      p_free_limit: FREE_WEEKLY_HINTS,
      p_week_start: start.toISOString(),
    } as never,
  )
  if (error || data === null || data === undefined) return null
  return data as number
}

export async function addBonus(
  userId: string,
  amount: number,
): Promise<number | null> {
  const { data, error } = await supabaseAdmin.rpc(
    'add_bonus_hints' as never,
    { p_user: userId, p_amount: amount } as never,
  )
  if (error) return null
  return data as number
}
