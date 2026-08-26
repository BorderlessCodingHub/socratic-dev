import Anthropic from '@anthropic-ai/sdk'
import { captureException } from '@/lib/report-error'
import { recordAiUsage, type UsageMeta } from '@/lib/ai/usage'

export type { UsageMeta }

let client: Anthropic | null = null

function getClient(): Anthropic {
  client ??= new Anthropic()
  return client
}

export const anthropic = new Proxy({} as Anthropic, {
  get(_target, prop) {
    const c = getClient()
    return Reflect.get(c, prop, c)
  },
})

type Effort = 'low' | 'medium' | 'high'

export const MODELS = {
  default: 'claude-sonnet-5',
  fast: 'claude-haiku-4-5',
} as const

export type TextBlock = {
  type: 'text'
  text: string
  cache_control?: { type: 'ephemeral' }
}

export type ChatTurn = {
  role: 'user' | 'assistant'
  content: string | TextBlock[]
}

function systemBlocks(system: string | TextBlock[]): TextBlock[] {
  if (typeof system !== 'string') return system
  return [
    { type: 'text', text: system, cache_control: { type: 'ephemeral' } },
  ]
}

function modelParams(model: string, effort: Effort) {
  if (model === MODELS.fast) return {}
  return {
    thinking: { type: 'adaptive' },
    output_config: { effort },
  }
}

type AskOpts = {
  system: string | TextBlock[]
  user?: string
  messages?: ChatTurn[]
  maxTokens?: number
  effort?: Effort
  model?: string
  // Passing meta is what puts the call in the ai_usage ledger. Omit it only
  // for calls that cost nothing.
  meta?: UsageMeta
}

function textParams(opts: AskOpts) {
  const model = opts.model ?? MODELS.default
  return {
    model,
    max_tokens: opts.maxTokens ?? 1024,
    system: systemBlocks(opts.system),
    messages: opts.messages ?? [{ role: 'user', content: opts.user ?? '' }],
    ...modelParams(model, opts.effort ?? 'medium'),
  }
}

export async function askClaude(opts: AskOpts): Promise<string> {
  const { text } = await askClaudeChecked(opts)
  return text
}

export async function askClaudeChecked(
  opts: AskOpts,
): Promise<{ text: string; truncated: boolean }> {
  const started = Date.now()
  const res = await anthropic.messages
    .stream(textParams(opts) as never)
    .finalMessage()
  await recordAiUsage(
    opts.meta,
    opts.model ?? MODELS.default,
    res,
    Date.now() - started,
  )
  return {
    text: extractText(res),
    truncated: (res as { stop_reason?: string }).stop_reason === 'max_tokens',
  }
}

export function askClaudeStream(opts: AskOpts) {
  const started = Date.now()
  const stream = anthropic.messages.stream(textParams(opts) as never)
  // Token counts only exist on the final message, and the caller is busy
  // piping this same stream to the student. finalMessage() resolves once the
  // stream ends, so the ledger is written then — fire and forget, because a
  // telemetry failure must never surface as a broken answer.
  void stream
    .finalMessage()
    .then((res: unknown) =>
      recordAiUsage(
        opts.meta,
        opts.model ?? MODELS.default,
        res,
        Date.now() - started,
      ),
    )
    .catch(() => {})
  return stream
}

export async function askClaudeVision(opts: {
  system: string | TextBlock[]
  userText: string
  imageBase64: string
  mediaType?: 'image/png' | 'image/jpeg'
  maxTokens?: number
  effort?: Effort
  model?: string
  meta?: UsageMeta
}): Promise<string> {
  const started = Date.now()
  const model = opts.model ?? MODELS.default
  const params = {
    model,
    max_tokens: opts.maxTokens ?? 1024,
    system: systemBlocks(opts.system),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: opts.mediaType ?? 'image/png',
              data: opts.imageBase64,
            },
          },
          { type: 'text', text: opts.userText },
        ],
      },
    ],
    ...modelParams(model, opts.effort ?? 'medium'),
  }
  const res = await anthropic.messages.stream(params as never).finalMessage()
  await recordAiUsage(opts.meta, model, res, Date.now() - started)
  return extractText(res)
}

function extractText(res: unknown): string {
  const blocks = (res as { content: Array<{ type: string; text?: string }> })
    .content
  return blocks
    .map((b) => (b.type === 'text' ? (b.text ?? '') : ''))
    .join('')
    .trim()
}

export function aiErrorMessage(e: unknown): string {
  captureException(e)
  const msg = e instanceof Error ? e.message : ''
  if (/credit balance|too low|billing/i.test(msg)) {
    return 'A conta da Anthropic está sem créditos. Adicione em console.anthropic.com → Plans & Billing.'
  }
  if (e instanceof Anthropic.RateLimitError) {
    return 'A IA está sobrecarregada. Tente de novo em instantes.'
  }
  if (e instanceof Anthropic.APIError) {
    return 'Erro na IA. Tente novamente.'
  }
  return msg || 'Erro inesperado'
}

export function aiErrorResponse(e: unknown): Response {
  captureException(e)
  if (e instanceof Anthropic.AuthenticationError) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY ausente ou inválida no servidor.' },
      { status: 500 },
    )
  }
  const msg = e instanceof Error ? e.message : ''
  if (/credit balance|too low|billing/i.test(msg)) {
    return Response.json(
      {
        error:
          'A conta da Anthropic está sem créditos. Adicione em console.anthropic.com → Plans & Billing.',
      },
      { status: 402 },
    )
  }
  if (e instanceof Anthropic.RateLimitError) {
    return Response.json(
      { error: 'A IA está sobrecarregada. Tente de novo em instantes.' },
      { status: 429 },
    )
  }
  return Response.json(
    { error: 'Erro na IA. Tente novamente.' },
    { status: 500 },
  )
}
