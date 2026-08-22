import { askClaude } from '@/lib/ai/client'
import type { Locale } from '@/lib/i18n'
import { supabaseAdmin } from '../supabase/server'
import { parseAiJson } from './parse-json'
import { challengeSystem, levelGuide } from './prompts/challenge-generator'

export type GenLevel = 'beginner' | 'intermediate' | 'advanced'

function parseChallenge(raw: string, locale: Locale): Record<string, unknown> {
  try {
    return parseAiJson(raw)
  } catch {
    throw new Error(
      locale === 'pt'
        ? 'A geração veio incompleta. Tente de novo.'
        : 'The generation came back incomplete. Try again.',
    )
  }
}

async function existingTitles(
  kind: 'code' | 'design',
  level: GenLevel,
  stack: string,
  locale: Locale,
): Promise<string[]> {
  let q = supabaseAdmin
    .from('challenges')
    .select('title')
    .eq('kind', kind)
    .eq('level', level)
    .eq('locale', locale)
  if (kind === 'code') q = q.eq('stack', stack)
  // Only the most recent titles: with a large library, dumping every title
  // into the prompt inflates cost and drowns the "avoid these" instruction.
  const { data } = await q.order('created_at', { ascending: false }).limit(40)
  return (data ?? []).map((c) => String(c.title)).filter(Boolean)
}

// The AI sometimes regenerates an already-existing challenge despite the
// avoid list. Exact-title match (per kind/level/stack/locale) reuses the
// existing row instead of inserting a duplicate into the pool.
async function findDuplicate(opts: {
  kind: 'code' | 'design'
  level: GenLevel
  stack: string
  locale: Locale
  title: string
}) {
  const title = opts.title.trim().replace(/\s+/g, ' ')
  if (!title) return null
  let q = supabaseAdmin
    .from('challenges')
    .select('*')
    .eq('kind', opts.kind)
    .eq('level', opts.level)
    .eq('locale', opts.locale)
    // Escaped so ilike acts as case-insensitive equality, not a pattern.
    .ilike('title', title.replace(/[\\%_]/g, (m) => `\\${m}`))
  if (opts.kind === 'code') q = q.eq('stack', opts.stack)
  const { data } = await q.limit(1).maybeSingle()
  return data ?? null
}

// Titles of every challenge this user already has a session on (same
// kind/level/stack/locale slice) — fed into the avoid list so the AI doesn't
// regenerate something they already did.
async function userSeenTitles(
  userId: string,
  kind: 'code' | 'design',
  level: GenLevel,
  stack: string,
  locale: Locale,
): Promise<string[]> {
  let q = supabaseAdmin
    .from('sessions')
    .select('challenges!inner(title, kind, level, stack, locale)')
    .eq('user_id', userId)
    .eq('challenges.kind', kind)
    .eq('challenges.level', level)
    .eq('challenges.locale', locale)
  if (kind === 'code') q = q.eq('challenges.stack', stack)
  const { data } = await q.limit(60)
  const rows = (data ?? []) as unknown as {
    challenges: { title: string } | null
  }[]
  return [...new Set(rows.map((r) => r.challenges?.title ?? '').filter(Boolean))]
}

async function userHasSession(
  userId: string,
  challengeId: string,
): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .limit(1)
    .maybeSingle()
  return Boolean(data)
}

function parseTopics(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((t) => String(t).toLowerCase().trim().replace(/\s+/g, '-'))
    .filter((t) => t.length > 0 && t.length <= 30)
    .slice(0, 4)
}

function avoidLine(titles: string[]): string {
  if (titles.length === 0) return ''
  return `\n\nESTES desafios JÁ EXISTEM — gere um tema CLARAMENTE diferente (não repita nem só troque o nome):\n- ${titles.join('\n- ')}`
}

// Generates a fresh challenge with the AI and persists it. Returns the
// Supabase insert result ({ data, error }). May throw on AI errors — callers
// should wrap with aiErrorResponse. Passes the existing titles so the AI
// avoids generating near-duplicates.
export async function generateChallenge(opts: {
  kind: 'code' | 'design'
  stack?: string
  level: GenLevel
  userPrompt?: string
  locale?: Locale
  userId?: string
}) {
  const locale: Locale = opts.locale ?? 'en'
  const stackMap: Record<string, string> = {
    javascript: 'javascript',
    typescript: 'typescript',
    react: 'react',
    python: 'python',
  }
  const stack = stackMap[opts.stack ?? ''] ?? 'typescript'
  const dupStack = opts.kind === 'design' ? 'design' : stack
  const [poolTitles, seenTitles] = await Promise.all([
    existingTitles(opts.kind, opts.level, stack, locale),
    opts.userId
      ? userSeenTitles(opts.userId, opts.kind, opts.level, dupStack, locale)
      : Promise.resolve([]),
  ])
  const avoidTitles = [...new Set([...seenTitles, ...poolTitles])]
  const userTheme = opts.userPrompt?.trim()
    ? `\n\nO ALUNO PEDIU especificamente um desafio sobre o seguinte tema (siga isto à risca, é o coração do pedido):\n"""\n${opts.userPrompt.trim().slice(0, 800)}\n"""`
    : ''
  const stackNote =
    stack === 'react'
      ? '\n\nIMPORTANTE: tests_source deve ser "" (string vazia). initial_code deve ser um componente TSX com "export default function App()". Sem testes automáticos — o aluno vê o resultado no preview visual.'
      : stack === 'python'
        ? '\n\nIMPORTANTE: para Python, tests_source usa sintaxe Python, não o formato JS descrito acima. Formato: test("nome descritivo", lambda: expect(NOME_DA_FUNCAO(args)).to_be(valor)). Chame a função do aluno DIRETAMENTE pelo nome, sem prefixo "exports." — ela já está no mesmo escopo dos testes. Métodos de expect: .to_be(valor) e .to_equal(valor) (comparam por igualdade — já funciona para listas e dicts) e .to_be_truthy(). Para um teste com mais de um passo, defina uma função antes do test() e passe pelo nome em vez de usar lambda. initial_code deve ser Python 3 válido (def + pass, sem export, sem imports de bibliotecas externas).'
        : ''

  const generateOnce = async (avoid: string[]) => {
    const raw =
      opts.kind === 'design'
        ? await askClaude({
            system: challengeSystem('design', locale),
            user: `Gere um desafio de system design (arquitetura) novo. nível: ${opts.level}.\n\n${levelGuide('design', opts.level)}${userTheme}${avoidLine(avoid)}`,
            maxTokens: 2600,
            effort: 'medium',
          })
        : await askClaude({
            system: challengeSystem('code', locale),
            user: `Gere um desafio novo. stack: ${stack}. nível: ${opts.level}.\n\n${levelGuide('code', opts.level)}${userTheme}${avoidLine(avoid)}${stackNote}`,
            maxTokens: opts.level === 'advanced' ? 8000 : 4500,
            effort: opts.level === 'advanced' ? 'high' : 'medium',
          })
    return parseChallenge(raw, locale)
  }

  const insertChallenge = (json: Record<string, unknown>, title: string) =>
    supabaseAdmin
      .from('challenges')
      .insert(
        opts.kind === 'design'
          ? {
              title,
              description: String(json.description ?? ''),
              stack: 'design',
              level: opts.level,
              client_briefing: String(json.client_briefing ?? ''),
              intro: String(json.intro ?? ''),
              kind: 'design',
              topics: parseTopics(json.topics),
              locale,
            }
          : {
              title,
              description: String(json.description ?? ''),
              stack,
              level: opts.level,
              client_briefing: String(json.client_briefing ?? ''),
              intro: String(json.intro ?? ''),
              initial_code: String(json.initial_code ?? ''),
              tests_source: String(json.tests_source ?? ''),
              topics: parseTopics(json.topics),
              locale,
            },
      )
      .select()
      .single()

  const fallbackTitle =
    opts.kind === 'design' ? 'Desafio de Design System' : 'Desafio'
  let json: Record<string, unknown> = {}
  let title = fallbackTitle

  // Dedup reuse must never hand back a challenge the requesting user already
  // has a session on — that's how "completed it, got the same one again"
  // happens. One retry with the repeated title forced into the avoid list;
  // if the AI insists, insert the fresh copy instead of re-serving.
  for (let attempt = 0; attempt < 2; attempt++) {
    json = await generateOnce(avoidTitles)
    title = String(json.title ?? fallbackTitle)
    const dup = await findDuplicate({
      kind: opts.kind,
      level: opts.level,
      stack: dupStack,
      locale,
      title,
    })
    if (!dup) return insertChallenge(json, title)
    const alreadySeen = opts.userId
      ? await userHasSession(opts.userId, (dup as { id: string }).id)
      : false
    if (!alreadySeen) return { data: dup, error: null }
    avoidTitles.unshift(title)
  }
  return insertChallenge(json, title)
}
