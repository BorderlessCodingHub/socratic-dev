import type { ChallengeKind } from '@/domain/challenge-kinds'
import { aiErrorResponse, askClaude } from '@/lib/ai/client'
import { solvePasteSystem } from '@/lib/ai/prompts/solve-paste'

function stripFences(raw: string): string {
  const f = raw.match(/```(?:[a-z]*)?\s*([\s\S]*?)```/i)
  return (f ? f[1] : raw).trim()
}

function parseJson(raw: string): Record<string, unknown> {
  const f = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  return JSON.parse((f ? f[1] : raw).trim())
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const kind: ChallengeKind = body.kind === 'design' ? 'design' : 'code'
    const work: string = body.work ?? ''

    const user = [
      `Desafio: ${body.title ?? ''}`,
      `Briefing: ${body.briefing ?? ''}`,
      kind === 'design'
        ? `Diagrama atual (resumo): ${work}`
        : `Código atual do aluno:\n${work}`,
    ].join('\n')

    if (kind === 'design') {
      const raw = await askClaude({
        system: solvePasteSystem('design'),
        user,
        maxTokens: 1500,
        effort: 'medium',
      })
      const json = parseJson(raw)
      return Response.json({
        nodes: Array.isArray(json.nodes) ? json.nodes : [],
        edges: Array.isArray(json.edges) ? json.edges : [],
      })
    }

    const raw = await askClaude({
      system: solvePasteSystem('code'),
      user,
      maxTokens: 2048,
      effort: 'medium',
    })
    return Response.json({ code: stripFences(raw) })
  } catch (e) {
    return aiErrorResponse(e)
  }
}
