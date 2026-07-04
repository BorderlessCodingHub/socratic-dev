export const SOLVE_CAP = 0

export function hintCost(level: 1 | 2 | 3): number {
  return level * 4
}

export function computeIndependence(
  hints: { hint_level: number; is_solve?: boolean }[],
): number {
  if (hints.some((h) => h.is_solve)) return SOLVE_CAP
  const penalty = hints.reduce((sum, h) => sum + h.hint_level * 4, 0)
  return Math.max(0, 100 - penalty)
}

export function applyHintPenalty(score: number, level: 1 | 2 | 3): number {
  return Math.max(0, score - hintCost(level))
}

export function independenceTier(score: number): 'high' | 'mid' | 'low' {
  if (score > 70) return 'high'
  if (score > 40) return 'mid'
  return 'low'
}

// Ranking points: level base × independence%. A challenge only earns points
// once per user (the first completed session); the SQL backfill in migration
// 013 uses the same formula.
export const LEVEL_POINTS: Record<string, number> = {
  beginner: 10,
  intermediate: 25,
  advanced: 50,
}

export function challengePoints(level: string, independence: number): number {
  const base = LEVEL_POINTS[level] ?? LEVEL_POINTS.beginner
  const factor = Math.min(100, Math.max(0, independence)) / 100
  return Math.round(base * factor)
}
