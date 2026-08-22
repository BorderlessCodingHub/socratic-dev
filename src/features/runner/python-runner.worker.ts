import type { RunLog, RunResult } from './types'

;(globalThis as { importScripts?: unknown }).importScripts = undefined

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<{ id: number; code: string; testsSource?: string }>) => void) | null
  postMessage: (msg: { id: number; result: RunResult }) => void
}

const PYODIDE_VERSION = '314.0.5'
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

interface PyodideInterface {
  setStdout(opts: { batched: (msg: string) => void }): void
  setStderr(opts: { batched: (msg: string) => void }): void
  runPythonAsync(code: string, opts?: { globals?: unknown }): Promise<unknown>
  globals: { get(name: string): () => unknown }
}

let pyodidePromise: Promise<PyodideInterface> | null = null

function getPyodide(): Promise<PyodideInterface> {
  pyodidePromise ??= (async () => {
    const mod = (await import(
      /* webpackIgnore: true */ `${PYODIDE_CDN}pyodide.mjs`
    )) as { loadPyodide: (opts: { indexURL: string }) => Promise<PyodideInterface> }
    return mod.loadPyodide({ indexURL: PYODIDE_CDN })
  })()
  return pyodidePromise
}

const HARNESS = `
_test_results = []

def _format(v):
    if isinstance(v, str):
        return v
    try:
        import json as _json
        return _json.dumps(v)
    except Exception:
        return str(v)

class _Expect:
    def __init__(self, actual):
        self.actual = actual
    def to_be(self, expected):
        if self.actual != expected:
            raise AssertionError(f"esperado {_format(expected)}, recebido {_format(self.actual)}")
    def to_equal(self, expected):
        if self.actual != expected:
            raise AssertionError(f"esperado {_format(expected)}, recebido {_format(self.actual)}")
    def to_be_truthy(self):
        if not self.actual:
            raise AssertionError(f"esperado valor truthy, recebido {_format(self.actual)}")

def expect(actual):
    return _Expect(actual)

def test(name, fn):
    try:
        fn()
        _test_results.append({"name": name, "passed": True, "message": None})
    except Exception as e:
        _test_results.append({"name": name, "passed": False, "message": str(e)})
`.trim()

function buildSource(code: string, testsSource?: string): string {
  const parts = [HARNESS, code]
  if (testsSource) parts.push(testsSource)
  // Final expression's value is what runPythonAsync resolves to — a plain
  // JSON string sidesteps any PyProxy/dict conversion ambiguity entirely.
  parts.push('import json as _json\n_json.dumps(_test_results)')
  return parts.join('\n\n')
}

function cleanError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  const lines = msg.trim().split('\n').filter(Boolean)
  return lines[lines.length - 1] || msg
}

ctx.onmessage = async (e) => {
  const { id, code, testsSource } = e.data
  const started = performance.now()
  const logs: RunLog[] = []

  try {
    const pyodide = await getPyodide()
    pyodide.setStdout({ batched: (msg) => logs.push({ level: 'log', text: msg }) })
    pyodide.setStderr({ batched: (msg) => logs.push({ level: 'error', text: msg }) })

    const scope = pyodide.globals.get('dict')()
    let error: string | undefined
    let testsJson = '[]'
    try {
      testsJson = (await pyodide.runPythonAsync(buildSource(code, testsSource), {
        globals: scope,
      })) as string
    } catch (err) {
      error = cleanError(err)
    }

    const tests = error ? [] : (JSON.parse(testsJson) as RunResult['tests'])
    const ok = !error && tests.length > 0 && tests.every((t) => t.passed)
    ctx.postMessage({
      id,
      result: { logs, error, tests, ok, durationMs: Math.round(performance.now() - started) },
    })
  } catch (err) {
    ctx.postMessage({
      id,
      result: {
        logs,
        error: cleanError(err),
        tests: [],
        ok: false,
        durationMs: Math.round(performance.now() - started),
      },
    })
  }
}
