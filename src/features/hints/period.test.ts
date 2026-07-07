import { describe, expect, it } from 'vitest'
import { currentPeriod } from './period'

// Sunday 2026-07-05 23:59 BRT == 2026-07-06T02:59:00Z
const RESET = Date.parse('2026-07-06T02:59:00Z')

describe('currentPeriod', () => {
  it('anchors a mid-week date to the previous Sunday 23:59 BRT', () => {
    const tuesday = Date.parse('2026-07-07T18:00:00Z')
    const { start, resetsAt } = currentPeriod(tuesday)
    expect(start.toISOString()).toBe('2026-07-06T02:59:00.000Z')
    expect(resetsAt.toISOString()).toBe('2026-07-13T02:59:00.000Z')
  })

  it('still belongs to the previous week right before the Sunday reset', () => {
    const { start } = currentPeriod(RESET - 60_000)
    expect(start.toISOString()).toBe('2026-06-29T02:59:00.000Z')
  })

  it('rolls into the new week right after the Sunday reset', () => {
    const { start } = currentPeriod(RESET + 30_000)
    expect(start.toISOString()).toBe('2026-07-06T02:59:00.000Z')
  })

  it('always spans exactly seven days', () => {
    const { start, resetsAt } = currentPeriod(Date.parse('2026-01-01T12:00:00Z'))
    expect(resetsAt.getTime() - start.getTime()).toBe(7 * 24 * 3600_000)
  })
})
