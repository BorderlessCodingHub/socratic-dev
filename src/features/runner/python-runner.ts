import type { RunRequest, RunResult } from './types'

export type PythonRunner = {
  run: (req: RunRequest, opts?: { timeoutMs?: number }) => Promise<RunResult>
  dispose: () => void
}

export function createPythonRunner(): PythonRunner {
  let worker: Worker | null = null
  let nextId = 0
  const pending = new Map<number, (r: RunResult) => void>()

  function ensureWorker(): Worker {
    if (worker) return worker
    const w = new Worker(new URL('./python-runner.worker.ts', import.meta.url), {
      type: 'module',
    })
    w.onmessage = (e: MessageEvent<{ id: number; result: RunResult }>) => {
      pending.get(e.data.id)?.(e.data.result)
      pending.delete(e.data.id)
    }
    w.onerror = (e) => {
      const message = 'Erro ao carregar o Python: ' + (e.message || 'desconhecido')
      for (const resolve of pending.values()) {
        resolve({ logs: [], tests: [], ok: false, error: message, durationMs: 0 })
      }
      pending.clear()
    }
    worker = w
    return w
  }

  function run(req: RunRequest, opts: { timeoutMs?: number } = {}): Promise<RunResult> {
    const timeoutMs = opts.timeoutMs ?? 15000
    const id = nextId++
    const w = ensureWorker()

    return new Promise((resolve) => {
      let done = false
      const timer = setTimeout(() => {
        if (done) return
        done = true
        pending.delete(id)
        worker?.terminate()
        worker = null
        resolve({
          logs: [],
          tests: [],
          ok: false,
          error: `Tempo excedido (${timeoutMs}ms), possível loop infinito`,
          durationMs: timeoutMs,
        })
      }, timeoutMs)

      pending.set(id, (r) => {
        if (done) return
        done = true
        clearTimeout(timer)
        resolve(r)
      })
      w.postMessage({ id, code: req.code, testsSource: req.testsSource })
    })
  }

  function dispose() {
    worker?.terminate()
    worker = null
    pending.clear()
  }

  return { run, dispose }
}
