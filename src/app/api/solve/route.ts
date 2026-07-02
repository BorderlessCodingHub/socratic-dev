import type { ChallengeKind } from '@/domain/challenge-kinds'
import { aiErrorResponse, askClaude } from '@/lib/ai/client'
import { parseAiJson } from '@/lib/ai/parse-json'
import { solvePasteSystem } from '@/lib/ai/prompts/solve-paste'
import {
  CAPS,
  jsonError,
  rateLimit,
  requireUser,
  tooLarge,
  tooMany,
} from '@/lib/api/guard'
import { consumeHints, getBalance } from '@/lib/api/hints-server'
import { getLocale } from '@/lib/i18n/server'
import { SOLVE_COST } from '@/features/hints/constants'

function stripFences(raw: string): string {
  const f = raw.match(/```(?:[a-z]*)?\s*([\s\S]*?)```/i)
  return (f ? f[1] : raw).trim()
}


const DESIGN_NODE_TYPES = new Set([
  'client',
  'cdn',
  'lb',
  'gateway',
  'service',
  'worker',
  'queue',
  'cache',
  'database',
  'storage',
  'search',
  'external',
])

type DesignNode = {
  id: string
  label: string
  type: string
  note?: string
  tier?: number
}

type DesignEdge = { from: string; to: string; label?: string; dashed?: boolean }

function sanitizeDesign(rawNodes: unknown[], rawEdges: unknown[]) {
  const nodes: DesignNode[] = []
  const ids = new Set<string>()
  for (const item of rawNodes) {
    if (nodes.length >= 12) break
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const id = typeof o.id === 'string' ? o.id.trim() : ''
    const label = typeof o.label === 'string' ? o.label.trim().slice(0, 24) : ''
    if (!id || !label || ids.has(id)) continue
    ids.add(id)
    const node: DesignNode = {
      id,
      label,
      type: DESIGN_NODE_TYPES.has(o.type as string)
        ? (o.type as string)
        : 'service',
    }
    if (typeof o.note === 'string' && o.note.trim())
      node.note = o.note.trim().slice(0, 40)
    if (typeof o.tier === 'number' && Number.isFinite(o.tier))
      node.tier = Math.min(5, Math.max(0, Math.round(o.tier)))
    nodes.push(node)
  }

  const edges: DesignEdge[] = []
  for (const item of rawEdges) {
    if (edges.length >= 24) break
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const from = typeof o.from === 'string' ? o.from.trim() : ''
    const to = typeof o.to === 'string' ? o.to.trim() : ''
    if (!from || !to || from === to || !ids.has(from) || !ids.has(to)) continue
    const edge: DesignEdge = { from, to }
    if (typeof o.label === 'string' && o.label.trim())
      edge.label = o.label.trim().slice(0, 24)
    if (o.dashed === true) edge.dashed = true
    edges.push(edge)
  }

  return { nodes, edges }
}

export async function POST(req: Request) {
  try {
    const auth = await requireUser(req)
    if (auth instanceof Response) return auth
    const userId = auth.user.id

    if (!rateLimit(`solve:${userId}`, 10, 60_000)) return tooMany()

    const body = await req.json()
    const kind: ChallengeKind = body.kind === 'design' ? 'design' : 'code'
    const work: string = body.work ?? ''
    const tests: string = body.tests ?? ''
    const sessionId: string | undefined = body.session_id

    if (work.length > CAPS.text) return tooLarge()
    if (tests.length > CAPS.text) return tooLarge()
    if (!sessionId) return jsonError('session_id é obrigatório.', 400)

    const balance = await getBalance(userId)
    if (balance.remaining < SOLVE_COST)
      return jsonError('Hints insuficientes para resolver.', 429)

    const codeParts = [
      `Desafio: ${body.title ?? ''}`,
      `Briefing: ${body.briefing ?? ''}`,
      `Código atual do aluno:\n${work}`,
    ]
    if (tests) {
      codeParts.push(
        '',
        'TESTES OBRIGATÓRIOS (sua solução PRECISA passar em todos):',
        '```',
        tests,
        '```',
      )
    }
    const user =
      kind === 'design'
        ? [
            `Desafio: ${body.title ?? ''}`,
            `Briefing: ${body.briefing ?? ''}`,
            `Diagrama atual (resumo): ${work}`,
          ].join('\n')
        : codeParts.join('\n')

    const locale = await getLocale()

    if (kind === 'design') {
      const raw = await askClaude({
        system: solvePasteSystem('design', locale),
        user,
        maxTokens: 3200,
        effort: 'medium',
      })
      const diagramError =
        locale === 'pt'
          ? 'Não consegui montar o diagrama. Tente de novo.'
          : "Couldn't build the diagram. Try again."
      let json: Record<string, unknown>
      try {
        json = parseAiJson(raw)
      } catch {
        return jsonError(diagramError, 502)
      }
      const { nodes, edges } = sanitizeDesign(
        Array.isArray(json.nodes) ? json.nodes : [],
        Array.isArray(json.edges) ? json.edges : [],
      )
      if (nodes.length === 0) return jsonError(diagramError, 502)
      const remaining = await consumeHints(userId, sessionId, 3, SOLVE_COST)
      return Response.json({ nodes, edges, remaining })
    }

    const raw = await askClaude({
      system: solvePasteSystem('code', locale),
      user,
      maxTokens: 2048,
      effort: 'medium',
    })
    const code = stripFences(raw)
    const remaining = await consumeHints(userId, sessionId, 3, SOLVE_COST)
    return Response.json({ code, remaining })
  } catch (e) {
    return aiErrorResponse(e)
  }
}
