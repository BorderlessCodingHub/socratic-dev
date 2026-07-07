import { describe, expect, it } from 'vitest'
import {
  applyHintPenalty,
  challengePoints,
  computeIndependence,
  hintCost,
  independenceTier,
  SOLVE_CAP,
} from './scoring'

describe('computeIndependence', () => {
  it('starts at 100 with no hints', () => {
    expect(computeIndependence([])).toBe(100)
  })

  it('subtracts 4 points per hint level', () => {
    expect(computeIndependence([{ hint_level: 1 }, { hint_level: 3 }])).toBe(84)
  })

  it('caps at SOLVE_CAP when a solve was used, regardless of other hints', () => {
    expect(computeIndependence([{ hint_level: 1, is_solve: true }])).toBe(
      SOLVE_CAP,
    )
    expect(
      computeIndependence([{ hint_level: 1 }, { hint_level: 3, is_solve: true }]),
    ).toBe(SOLVE_CAP)
  })

  it('never goes below zero', () => {
    const many = Array.from({ length: 10 }, () => ({ hint_level: 3 }))
    expect(computeIndependence(many)).toBe(0)
  })
})

describe('challengePoints', () => {
  it('awards the full level base at 100% independence', () => {
    expect(challengePoints('beginner', 100)).toBe(10)
    expect(challengePoints('intermediate', 100)).toBe(25)
    expect(challengePoints('advanced', 100)).toBe(50)
  })

  it('scales with independence and rounds', () => {
    expect(challengePoints('advanced', 50)).toBe(25)
    expect(challengePoints('beginner', 55)).toBe(6)
  })

  it('falls back to beginner for unknown levels', () => {
    expect(challengePoints('weird', 100)).toBe(10)
  })

  it('clamps independence to 0..100', () => {
    expect(challengePoints('beginner', 150)).toBe(10)
    expect(challengePoints('beginner', -10)).toBe(0)
  })
})

describe('independenceTier', () => {
  it('splits at 70 and 40 (exclusive)', () => {
    expect(independenceTier(71)).toBe('high')
    expect(independenceTier(70)).toBe('mid')
    expect(independenceTier(41)).toBe('mid')
    expect(independenceTier(40)).toBe('low')
    expect(independenceTier(0)).toBe('low')
  })
})

describe('hint penalties', () => {
  it('costs 4 points per level', () => {
    expect(hintCost(2)).toBe(8)
  })

  it('applyHintPenalty floors at zero', () => {
    expect(applyHintPenalty(10, 3)).toBe(0)
    expect(applyHintPenalty(50, 1)).toBe(46)
  })
})
