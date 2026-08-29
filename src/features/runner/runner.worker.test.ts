import { beforeAll, describe, expect, it } from 'vitest'
import type { RunResult } from './types'

let onMessage: (e: { data: unknown }) => void
let resolver: ((r: RunResult) => void) | null = null

beforeAll(async () => {
  const g = globalThis as unknown as Record<string, unknown>
  g.self = globalThis
  g.postMessage = (msg: RunResult) => {
    resolver?.(msg)
    resolver = null
  }
  await import('./runner.worker')
  onMessage = g.onmessage as typeof onMessage
})

function run(req: {
  code: string
  language: 'js' | 'ts'
  testsSource?: string
}): Promise<RunResult> {
  return new Promise((resolve) => {
    resolver = resolve
    onMessage({ data: req })
  })
}

describe('runner worker', () => {
  it('runs sync tests as before', async () => {
    const r = await run({
      language: 'ts',
      code: `export function double(n: number) { return n * 2 }`,
      testsSource: `
        test('dobra', () => { expect(exports.double(2)).toBe(4) })
        test('falha', () => { expect(exports.double(2)).toBe(5) })
      `,
    })
    expect(r.tests.map((t) => t.passed)).toEqual([true, false])
    expect(r.ok).toBe(false)
  })

  it('runs async tests (the Promise.all consolidation case)', async () => {
    const r = await run({
      language: 'ts',
      code: `
        type Fetcher = () => Promise<{ productId: string; quantity: number }[]>
        export async function consolidateInventory(fetchers: Fetcher[]) {
          const results = await Promise.all(fetchers.map((f) => f()))
          const out = new Map<string, number>()
          for (const items of results) {
            for (const { productId, quantity } of items) {
              out.set(productId, (out.get(productId) ?? 0) + quantity)
            }
          }
          return out
        }
      `,
      testsSource: `
        test('soma quantidades entre armazéns', async () => {
          const map = await exports.consolidateInventory([
            async () => [{ productId: 'a', quantity: 2 }],
            async () => [{ productId: 'a', quantity: 3 }, { productId: 'b', quantity: 1 }],
          ])
          expect(map.get('a')).toBe(5)
          expect(map.get('b')).toBe(1)
        })
        test('vazio quando não há fetchers', async () => {
          const map = await exports.consolidateInventory([])
          expect(map.size).toBe(0)
        })
      `,
    })
    expect(r.error).toBeUndefined()
    expect(r.tests.map((t) => t.passed)).toEqual([true, true])
    expect(r.ok).toBe(true)
  })

  it('reports a failing async test with its message', async () => {
    const r = await run({
      language: 'js',
      code: `exports.get = async () => 1`,
      testsSource: `
        test('espera 2', async () => { expect(await exports.get()).toBe(2) })
      `,
    })
    expect(r.tests[0].passed).toBe(false)
    expect(r.tests[0].message).toContain('esperado')
  })

  it('keeps results in registration order even when timings differ', async () => {
    const r = await run({
      language: 'js',
      code: `
        exports.slow = () => new Promise((res) => setTimeout(() => res('s'), 40))
        exports.fast = async () => 'f'
      `,
      testsSource: `
        test('lento primeiro', async () => { expect(await exports.slow()).toBe('s') })
        test('rápido depois', async () => { expect(await exports.fast()).toBe('f') })
      `,
    })
    expect(r.tests.map((t) => t.name)).toEqual([
      'lento primeiro',
      'rápido depois',
    ])
    expect(r.ok).toBe(true)
  })
})
