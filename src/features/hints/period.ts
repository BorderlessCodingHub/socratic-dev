const BRT_OFFSET_MS = 3 * 3600_000

// The free allowance resets every Sunday 23:59 America/Sao_Paulo (fixed
// UTC-3 — Brazil no longer observes DST). `now` is injectable for tests.
export function currentPeriod(now: number = Date.now()): {
  start: Date
  resetsAt: Date
} {
  const wall = new Date(now - BRT_OFFSET_MS)
  const boundary = new Date(
    Date.UTC(
      wall.getUTCFullYear(),
      wall.getUTCMonth(),
      wall.getUTCDate(),
      23,
      59,
      0,
    ),
  )
  boundary.setUTCDate(boundary.getUTCDate() - boundary.getUTCDay())
  if (boundary.getTime() > wall.getTime()) {
    boundary.setUTCDate(boundary.getUTCDate() - 7)
  }
  const start = new Date(boundary.getTime() + BRT_OFFSET_MS)
  return { start, resetsAt: new Date(start.getTime() + 7 * 24 * 3600_000) }
}
