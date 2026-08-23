import { describe, expect, it } from 'vitest'
import { usageRow } from './usage'

// Shaped like a real Anthropic final message: the SDK names the cache fields
// cache_read_input_tokens / cache_creation_input_tokens, which do NOT match
// our column names. That rename is what these tests guard.
const message = {
  usage: {
    input_tokens: 1200,
    output_tokens: 340,
    cache_read_input_tokens: 9800,
    cache_creation_input_tokens: 150,
  },
}

const meta = {
  route: 'tutor' as const,
  mode: 'hint',
  userId: '11111111-2222-3333-4444-555555555555',
  sessionId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
}

describe('usageRow', () => {
  it('maps every SDK usage field onto its column', () => {
    const row = usageRow(meta, 'claude-sonnet-5', message, 1500)
    expect(row).toEqual({
      user_id: meta.userId,
      session_id: meta.sessionId,
      route: 'tutor',
      mode: 'hint',
      model: 'claude-sonnet-5',
      input_tokens: 1200,
      output_tokens: 340,
      cache_read_tokens: 9800,
      cache_write_tokens: 150,
      latency_ms: 1500,
    })
  })

  it('defaults missing token counters to zero instead of null', () => {
    const row = usageRow(meta, 'claude-haiku-4-5', { usage: {} }, 10)
    expect(row?.input_tokens).toBe(0)
    expect(row?.output_tokens).toBe(0)
    expect(row?.cache_read_tokens).toBe(0)
    expect(row?.cache_write_tokens).toBe(0)
  })

  it('drops a session_id that is not a uuid', () => {
    const row = usageRow(
      { ...meta, sessionId: 'not-a-uuid' },
      'claude-sonnet-5',
      message,
      10,
    )
    expect(row?.session_id).toBeNull()
    // the rest of the row must still be recorded — cost data is not optional
    expect(row?.input_tokens).toBe(1200)
  })

  it('records a call with no user or session (challenge generation)', () => {
    const row = usageRow(
      { route: 'generate-challenge' },
      'claude-sonnet-5',
      message,
      10,
    )
    expect(row?.user_id).toBeNull()
    expect(row?.session_id).toBeNull()
    expect(row?.mode).toBeNull()
    expect(row?.route).toBe('generate-challenge')
  })

  it('returns null when there is nothing to record', () => {
    expect(usageRow(undefined, 'claude-sonnet-5', message, 10)).toBeNull()
    expect(usageRow(meta, 'claude-sonnet-5', {}, 10)).toBeNull()
    expect(usageRow(meta, 'claude-sonnet-5', null, 10)).toBeNull()
  })

  it('never writes a negative or fractional latency', () => {
    expect(usageRow(meta, 'claude-sonnet-5', message, -5)?.latency_ms).toBe(0)
    expect(usageRow(meta, 'claude-sonnet-5', message, 12.7)?.latency_ms).toBe(13)
  })
})
