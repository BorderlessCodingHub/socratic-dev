import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { FormattedText } from '@/features/challenges/components/formatted-text'
import { getLocale } from '@/lib/i18n/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import {
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  GitPullRequestArrow,
  Lightbulb,
  Network,
  Sparkles,
  XCircle,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const PERSONA_RE = /^Cliente:\s*([^()]+?)\s*\(([^)]+)\)\s*—\s*(.+)$/

const copy = {
  en: {
    levels: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
    trainToo: 'Start training',
    publicSession: 'Public session · socratic.dev',
    completed: 'Completed',
    failed: 'Failed',
    dateLocale: 'en-US',
    independence: 'Independence',
    independenceHint:
      '100 minus the hint penalty. Shows how much you thought on your own.',
    hintsUsed: 'Hints used',
    time: 'Time',
    clientRequest: 'Client request',
    howHints: 'How hints were used',
    hintLevel: (n: number) => `Level ${n}`,
    finalCode: 'Final submitted code',
    socraticReview: 'Socratic review',
    proofTitle: 'Proof without shortcuts',
    proofBodyPre:
      'This session was AI-generated, with hidden tests running in the browser. The tutor never hands over the answer — it only asks questions. Every hint costs independence. ',
    proofBodyStrong: 'Want to try?',
    startMyOwn: 'Start my own',
    sessionId: 'Session ID:',
  },
  pt: {
    levels: {
      beginner: 'Iniciante',
      intermediate: 'Intermediário',
      advanced: 'Avançado',
    },
    trainToo: 'Treinar também',
    publicSession: 'Sessão pública · socratic.dev',
    completed: 'Concluído',
    failed: 'Reprovado',
    dateLocale: 'pt-BR',
    independence: 'Independência',
    independenceHint:
      '100 menos a penalidade de hints. Mostra o quanto pensou sozinho.',
    hintsUsed: 'Hints usados',
    time: 'Tempo',
    clientRequest: 'Pedido do cliente',
    howHints: 'Como pediu hints',
    hintLevel: (n: number) => `Nível ${n}`,
    finalCode: 'Código final submetido',
    socraticReview: 'Review socrático',
    proofTitle: 'Prova sem cola',
    proofBodyPre:
      'Essa sessão foi gerada por IA, com testes escondidos rodando no browser. O tutor nunca entrega a resposta — só pergunta. Cada hint custa independência. ',
    proofBodyStrong: 'Quer tentar?',
    startMyOwn: 'Começar meu próprio',
    sessionId: 'ID da sessão:',
  },
} as const

type Copy = (typeof copy)['en' | 'pt']

function parsePersona(brief: string) {
  const [first, ...rest] = brief.split('\n')
  const m = first?.match(PERSONA_RE)
  if (!m) return { persona: null as null, body: brief }
  return {
    persona: { name: m[1].trim(), role: m[2].trim(), company: m[3].trim() },
    body: rest.join('\n').trim(),
  }
}

function levelLabel(level: string, t: Copy): string {
  return level === 'beginner'
    ? t.levels.beginner
    : level === 'intermediate'
      ? t.levels.intermediate
      : level === 'advanced'
        ? t.levels.advanced
        : level
}

function stackLabel(stack: string | null, kind: string | null): string {
  if (kind === 'design') return 'System Design'
  if (stack === 'javascript') return 'JavaScript'
  if (stack === 'typescript') return 'TypeScript'
  if (stack === 'react') return 'React'
  if (stack === 'python') return 'Python'
  return stack ?? ''
}

function formatTime(s: number | null): string {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}m ${sec.toString().padStart(2, '0')}s`
}

function calcIndependence(hints: { hint_level: number }[]): number {
  const penalty = hints.reduce((sum, h) => sum + h.hint_level * 4, 0)
  return Math.max(0, 100 - penalty)
}

async function fetchReplay(id: string) {
  const session = await supabaseAdmin
    .from('sessions')
    .select(
      'id, status, started_at, completed_at, duration_seconds, challenge_id, user_id, challenges(*)',
    )
    .eq('id', id)
    .maybeSingle()
  if (!session.data) return null

  const submission = await supabaseAdmin
    .from('code_submissions')
    .select('code, review_response, submitted_at')
    .eq('session_id', id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const hints = await supabaseAdmin
    .from('hints_used')
    .select('hint_level, used_at')
    .eq('session_id', id)

  return {
    session: session.data as Awaited<
      ReturnType<typeof supabaseAdmin.from>
    > extends { data: infer T }
      ? T
      : unknown,
    submission: submission.data,
    hints: (hints.data ?? []) as { hint_level: number; used_at: string }[],
  }
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await props.params
  const data = await fetchReplay(id)
  if (!data) return { title: 'Replay not found · socratic.dev' }
  const session = data.session as {
    challenges: { title?: string } | null
    status: string
  }
  const title = session.challenges?.title ?? 'Challenge'
  const score = calcIndependence(data.hints)
  return {
    title: `${title} · ${score}% independent · socratic.dev`,
    description: `Public session: ${title} solved with ${score}% independence. No cheating, no AI spitting out the answer.`,
    openGraph: {
      title: `${title} — ${score}% independent`,
      description: 'Verifiable social proof. Solved on socratic.dev.',
      type: 'article',
    },
  }
}

export default async function ReplayPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const locale = await getLocale()
  const t = copy[locale]
  const data = await fetchReplay(id)
  if (!data) notFound()

  const session = data.session as {
    id: string
    status: string
    started_at: string
    completed_at: string | null
    duration_seconds: number | null
    challenges: {
      title: string
      description: string
      stack: string
      level: string
      kind: string | null
      client_briefing: string
      initial_code?: string
    } | null
  }
  const c = session.challenges
  if (!c) notFound()

  const { persona, body } = parsePersona(c.client_briefing)
  const independence = calcIndependence(data.hints)
  const passed = session.status === 'completed'
  const isDesign = c.kind === 'design'
  const date = new Date(session.completed_at ?? session.started_at)

  return (
    <div className='relative flex min-h-screen flex-col bg-white'>
      <header className='sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur'>
        <div className='container-main flex h-16 items-center justify-between'>
          <Logo />
          <Button render={<Link href='/onboarding' />} variant='ink' size='sm'>
            {t.trainToo}
          </Button>
        </div>
      </header>

      <main className='flex-1 pt-10 pb-20'>
        <div className='container-main max-w-3xl'>
          <div className='mb-3 inline-flex items-center gap-2 rounded-full bg-pastel-lilac px-3 py-1 font-mono text-[11px] text-primary'>
            <Sparkles className='size-3' strokeWidth={1.5} />
            {t.publicSession}
          </div>

          <h1 className='font-heading text-4xl leading-tight font-light tracking-tight text-ink sm:text-5xl'>
            {c.title}
          </h1>

          <div className='mt-4 flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground'>
            <span className='rounded-full border border-border bg-white px-2 py-0.5'>
              {isDesign ? (
                <Network className='mr-1 inline size-3' strokeWidth={1.5} />
              ) : (
                <Code2 className='mr-1 inline size-3' strokeWidth={1.5} />
              )}
              {stackLabel(c.stack, c.kind)}
            </span>
            <span className='rounded-full border border-border bg-white px-2 py-0.5'>
              {levelLabel(c.level, t)}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
                passed
                  ? 'bg-mint/10 text-mint'
                  : 'bg-warning/10 text-warning-foreground',
              )}
            >
              {passed ? (
                <CheckCircle2 className='size-3' strokeWidth={1.5} />
              ) : (
                <XCircle className='size-3' strokeWidth={1.5} />
              )}
              {passed ? t.completed : t.failed}
            </span>
            <span className='inline-flex items-center gap-1'>
              <Calendar className='size-3' strokeWidth={1.5} />
              {date.toLocaleDateString(t.dateLocale, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className='mt-8 grid grid-cols-3 gap-3'>
            <Metric
              label={t.independence}
              icon='brain'
              value={`${independence}%`}
              accent='mint'
              hint={t.independenceHint}
            />
            <Metric
              label={t.hintsUsed}
              icon='lightbulb'
              value={String(data.hints.length)}
            />
            <Metric
              label={t.time}
              icon='clock'
              value={formatTime(session.duration_seconds)}
              accent='primary'
            />
          </div>

          <Section
            title={t.clientRequest}
            icon={<Sparkles className='size-3.5' strokeWidth={1.5} />}
          >
            {persona && (
              <div className='mb-4 flex items-center gap-3 rounded-lg border border-border bg-white p-3'>
                <div className='grid size-11 shrink-0 place-items-center rounded-full bg-pastel-lavender font-heading text-sm font-medium text-ink'>
                  {persona.name
                    .split(/\s+/)
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <div className='min-w-0'>
                  <div className='truncate font-heading text-[15px] font-medium text-ink'>
                    {persona.name}
                  </div>
                  <div className='truncate text-[12px] text-muted-foreground'>
                    {persona.role} · {persona.company}
                  </div>
                </div>
              </div>
            )}
            <p className='whitespace-pre-line text-[14px] leading-relaxed text-aubergine'>
              {persona ? body : c.client_briefing}
            </p>
          </Section>

          {data.hints.length > 0 && (
            <Section
              title={t.howHints}
              icon={<Lightbulb className='size-3.5' strokeWidth={1.5} />}
            >
              <div className='grid grid-cols-3 gap-2 text-center text-sm'>
                {([1, 2, 3] as const).map((lvl) => {
                  const n = data.hints.filter((h) => h.hint_level === lvl).length
                  return (
                    <div
                      key={lvl}
                      className='rounded-lg border border-border bg-white p-3'
                    >
                      <div className='font-mono text-[10px] tracking-wider text-muted-foreground uppercase'>
                        {t.hintLevel(lvl)}
                      </div>
                      <div className='mt-1 font-heading text-xl font-light tabular-nums text-ink'>
                        {n}
                      </div>
                      <div className='text-[11px] text-muted-foreground'>
                        −{n * lvl * 4} indep.
                      </div>
                    </div>
                  )
                })}
              </div>
            </Section>
          )}

          {!isDesign && data.submission?.code && (
            <Section
              title={t.finalCode}
              icon={<Code2 className='size-3.5' strokeWidth={1.5} />}
            >
              <pre className='overflow-x-auto rounded-lg bg-ink p-5 font-mono text-[12.5px] leading-relaxed text-white/80'>
                <code>{data.submission.code}</code>
              </pre>
            </Section>
          )}

          {data.submission?.review_response && (
            <Section
              title={t.socraticReview}
              icon={<GitPullRequestArrow className='size-3.5' strokeWidth={1.5} />}
            >
              <div className='rounded-lg bg-muted p-5 text-[14px] leading-relaxed text-aubergine'>
                <FormattedText text={data.submission.review_response} />
              </div>
            </Section>
          )}

          <div className='mt-12 rounded-lg bg-pastel-greige p-6 text-center'>
            <div className='mb-1.5 font-mono text-[11px] tracking-wider text-muted-foreground uppercase'>
              {t.proofTitle}
            </div>
            <p className='text-[14px] text-aubergine'>
              {t.proofBodyPre}
              <strong>{t.proofBodyStrong}</strong>
            </p>
            <Button
              render={<Link href='/onboarding' />}
              variant='ink'
              className='mt-4'
            >
              {t.startMyOwn}
            </Button>
          </div>

          <div className='mt-8 text-center font-mono text-[10px] text-muted-foreground'>
            {t.sessionId} <span className='text-ink'>{session.id}</span>
          </div>
        </div>
      </main>
    </div>
  )
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className='mt-10'>
      <div className='mb-3 inline-flex items-center gap-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase'>
        {icon}
        {title}
      </div>
      {children}
    </section>
  )
}

function Metric({
  label,
  icon,
  value,
  accent,
  hint,
}: {
  label: string
  icon?: 'brain' | 'clock' | 'lightbulb'
  value: string
  accent?: 'mint' | 'primary'
  hint?: string
}) {
  return (
    <div
      title={hint}
      className='rounded-lg border border-border bg-white p-3.5'
    >
      <div className='mb-1 inline-flex items-center gap-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase'>
        {icon === 'brain' && <Brain className='size-3' strokeWidth={1.5} />}
        {icon === 'clock' && <Clock className='size-3' strokeWidth={1.5} />}
        {icon === 'lightbulb' && (
          <Lightbulb className='size-3' strokeWidth={1.5} />
        )}
        {label}
      </div>
      <div
        className={cn(
          'font-heading text-2xl font-light tabular-nums text-ink',
          accent === 'mint' && 'text-mint',
          accent === 'primary' && 'text-primary',
        )}
      >
        {value}
      </div>
    </div>
  )
}
