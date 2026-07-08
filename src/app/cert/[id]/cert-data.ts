import { supabaseAdmin } from '@/lib/supabase/server'

export type CertData = {
  name: string
  completed: number
  independence: number
  points: number
  position: number
  since: string
}

function certName(displayName: string | null, email: string | null): string {
  if (displayName?.trim()) return displayName.trim()
  const local = (email ?? '').split('@')[0]
  if (!local) return 'anon'
  return local.length <= 3 ? `${local}***` : `${local.slice(0, 3)}***`
}

export async function getCertData(userId: string): Promise<CertData | null> {
  const { data: prof, error } = await supabaseAdmin
    .from('profiles')
    .select('display_name, email, total_points, created_at')
    .eq('id', userId)
    .maybeSingle()
  if (error || !prof) return null

  const p = prof as unknown as {
    display_name: string | null
    email: string | null
    total_points: number
    created_at: string
  }

  const [{ data: sessions }, { count: above }] = await Promise.all([
    supabaseAdmin
      .from('sessions')
      .select('challenge_id, independence')
      .eq('user_id', userId)
      .eq('status', 'completed'),
    supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gt('total_points', p.total_points ?? 0),
  ])

  const rows = (sessions ?? []) as unknown as {
    challenge_id: string
    independence: number | null
  }[]
  const completed = new Set(rows.map((r) => r.challenge_id)).size
  const scored = rows.filter((r) => typeof r.independence === 'number')
  const independence = scored.length
    ? Math.round(
        scored.reduce((sum, r) => sum + (r.independence ?? 0), 0) /
          scored.length,
      )
    : 100

  return {
    name: certName(p.display_name, p.email),
    completed,
    independence,
    points: p.total_points ?? 0,
    position: (above ?? 0) + 1,
    since: p.created_at,
  }
}
