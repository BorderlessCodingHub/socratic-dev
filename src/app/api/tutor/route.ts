import type { ChallengeKind } from '@/domain/challenge-kinds'
import { aiErrorResponse, askClaude } from '@/lib/ai/client'
import { solveSystem, solveTask } from '@/lib/ai/prompts/solve'
import { hintGuide, tutorSystem, tutorTask } from '@/lib/ai/prompts/tutor'
import type { ChatMsg } from '@/lib/ai/types'

type Mode = 'reply' | 'hint' | 'solve'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const kind: ChallengeKind = body.domain === 'design' ? 'design' : 'code'
    const mode: Mode =
      body.mode === 'hint' ? 'hint' : body.mode === 'solve' ? 'solve' : 'reply'
    const messages: ChatMsg[] = Array.isArray(body.messages)
      ? body.messages
      : []
    const work: string = body.code ?? ''
    const title: string = body.title ?? ''
    const briefing: string = body.briefing ?? ''

    const system = mode === 'solve' ? solveSystem(kind) : tutorSystem(kind)

    const transcript = messages
      .map((m) => `${m.role === 'ai' ? 'Tutor' : 'Aluno'}: ${m.text}`)
      .join('\n')

    const task =
      mode === 'solve'
        ? solveTask(kind)
        : mode === 'hint'
          ? hintGuide(kind, (Number(body.hintLevel) || 1) as 1 | 2 | 3)
          : tutorTask(kind)

    const user = [
      `Desafio: ${title}`,
      `Briefing do cliente: ${briefing}`,
      '',
      kind === 'design'
        ? 'Estado atual do diagrama (resumo):'
        : 'Código atual do aluno:',
      kind === 'design'
        ? work || '(canvas vazio)'
        : `\`\`\`\n${work || '(vazio)'}\n\`\`\``,
      '',
      'Conversa até agora:',
      transcript || '(início — primeira interação)',
      '',
      task,
    ].join('\n')

    const text = await askClaude({
      system,
      user,
      maxTokens: mode === 'solve' ? 2048 : 800,
      effort: 'medium',
    })
    return Response.json({ text })
  } catch (e) {
    return aiErrorResponse(e)
  }
}
