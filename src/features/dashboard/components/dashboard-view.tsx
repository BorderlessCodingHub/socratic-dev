'use client'

import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CustomChallengeDialog } from '@/features/challenges/components/custom-challenge-dialog'
import {
  getNextChallenge,
  listSessionsForUser,
  type SessionRow,
} from '@/features/challenges/actions'
import { getDashboardStats } from '@/features/dashboard/actions'
import { getAccessToken } from '@/lib/api/client'
import type { Stats } from '@/features/dashboard/types'
import { activityLevel } from '@/features/dashboard/utils'
import { useLocale, useT } from '@/lib/i18n'
import type { User } from '@supabase/supabase-js'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Code2,
  Layers,
  Lightbulb,
  Network,
  PenLine,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from 'recharts'

const copy = {
  en: {
    welcome: 'Welcome back',
    youAre: "You're",
    independentSuffix: '% independent',
    keepGoing:
      'Every challenge you solve without copy-paste counts. Socrates would approve.',
    startPrompt: 'Start a challenge to build your progress.',
    custom: 'Custom',
    newChallenge: 'New challenge',
    statStreak: 'Streak',
    statStreakHint: 'days in a row',
    statChallenges: 'Challenges',
    statChallengesHint: 'completed',
    statHintsPer: 'Hints/challenge',
    statHintsPerHint: 'average',
    statTotalHints: 'Total hints',
    statTotalHintsHint: 'used',
    journeyEyebrow: 'Your journey',
    journeyTitle: 'Activity over the past few months',
    dow: ['', 'Mon', '', 'Wed', '', 'Fri', ''],
    challengeOne: 'challenge',
    challengeMany: 'challenges',
    less: 'Less',
    more: 'More',
    scoreEyebrow: 'Current score',
    scoreTitle: 'Total independence',
    scoreCaption: 'how much you solve on your own',
    historyEyebrow: 'History',
    historyTitle: 'Recent challenges',
    of: 'of',
    historyEmpty: "No challenges yet. Start one and it'll show up here.",
    challengeFallback: 'Challenge',
    status: {
      completed: 'Completed',
      in_progress: 'In progress',
      abandoned: 'Failed',
    },
    open: 'Open',
    resume: 'Resume',
    quote:
      'What comes out of your head is worth a thousand times more than what comes out of mine.',
    quoteBy: '— Socratic tutor, just now',
  },
  pt: {
    welcome: 'Bem-vindo de volta',
    youAre: 'Você está',
    independentSuffix: '% independente',
    keepGoing: 'Cada desafio sem cola conta. Sócrates aprovaria.',
    startPrompt: 'Comece um desafio para construir seu progresso.',
    custom: 'Sob medida',
    newChallenge: 'Novo desafio',
    statStreak: 'Streak',
    statStreakHint: 'dias seguidos',
    statChallenges: 'Desafios',
    statChallengesHint: 'concluídos',
    statHintsPer: 'Hints/desafio',
    statHintsPerHint: 'média',
    statTotalHints: 'Hints totais',
    statTotalHintsHint: 'usados',
    journeyEyebrow: 'Sua jornada',
    journeyTitle: 'Atividade dos últimos meses',
    dow: ['', 'Seg', '', 'Qua', '', 'Sex', ''],
    challengeOne: 'desafio',
    challengeMany: 'desafios',
    less: 'Menos',
    more: 'Mais',
    scoreEyebrow: 'Score atual',
    scoreTitle: 'Independência total',
    scoreCaption: 'quanto você resolve sozinho',
    historyEyebrow: 'Histórico',
    historyTitle: 'Desafios recentes',
    of: 'de',
    historyEmpty: 'Nenhum desafio ainda. Comece um para aparecer aqui.',
    challengeFallback: 'Desafio',
    status: {
      completed: 'Concluído',
      in_progress: 'Em andamento',
      abandoned: 'Reprovado',
    },
    open: 'Abrir',
    resume: 'Retomar',
    quote:
      'O que sai da sua cabeça vale mil vezes mais que o que sai da minha.',
    quoteBy: '— Tutor Socrático, agora há pouco',
  },
}

const CELL = [
  'bg-muted',
  'bg-primary/25',
  'bg-primary/45',
  'bg-primary/70',
  'bg-primary',
]

export function DashboardView({ user }: { user: User }) {
  const t = useT(copy)
  const router = useRouter()
  const [stats, setStats] = React.useState<Stats | null>(null)
  const [sessions, setSessions] = React.useState<SessionRow[]>([])
  const [loaded, setLoaded] = React.useState(false)
  const [genDesign, setGenDesign] = React.useState(false)
  const [genCode, setGenCode] = React.useState(false)
  const [customOpen, setCustomOpen] = React.useState(false)

  async function startDesign() {
    if (genDesign || !user) return
    setGenDesign(true)
    try {
      const level =
        (user?.user_metadata?.preferred_level as string | undefined) ??
        'intermediate'
      const data = await getNextChallenge({
        kind: 'design',
        level: level as 'beginner' | 'intermediate' | 'advanced',
        token: await getAccessToken(),
      })
      if (!('error' in data) && data?.id) router.push(`/design?id=${data.id}`)
      else setGenDesign(false)
    } catch {
      setGenDesign(false)
    }
  }

  async function startCode() {
    if (genCode || !user) return
    const meta = user.user_metadata as
      | { preferred_stack?: string; preferred_level?: string }
      | undefined
    if (!meta?.preferred_stack || !meta?.preferred_level) {
      router.push('/onboarding')
      return
    }
    setGenCode(true)
    try {
      const data = await getNextChallenge({
        kind: 'code',
        stack: meta.preferred_stack,
        level: meta.preferred_level as 'beginner' | 'intermediate' | 'advanced',
        token: await getAccessToken(),
      })
      if (!('error' in data) && data?.id)
        router.push(`/challenge?id=${data.id}`)
      else setGenCode(false)
    } catch {
      setGenCode(false)
    }
  }

  React.useEffect(() => {
    if (!user) return
    let active = true
    ;(async () => {
      const token = await getAccessToken()
      const [s, sess] = await Promise.all([
        getDashboardStats(token),
        listSessionsForUser(token),
      ])
      if (!active) return
      if (s && !('error' in s)) setStats(s)
      setSessions(sess)
      setLoaded(true)
    })()
    return () => {
      active = false
    }
  }, [user])

  const score = stats?.independence_score ?? 100

  return (
    <div className='relative flex min-h-screen flex-1 flex-col bg-white'>
      <Navbar />

      <main className='flex-1 pt-[88px] pb-20 md:pt-24'>
        <div className='container-main max-w-6xl'>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className='mb-10 flex flex-col gap-6'
          >
            <div className='min-w-0'>
              <p className='eyebrow mb-2'>{t.welcome}</p>
              {loaded ? (
                <>
                  <h1 className='type-h2'>
                    {t.youAre}{' '}
                    <span className='text-gradient font-serif font-normal italic'>
                      {score}
                      {t.independentSuffix}
                    </span>
                    .
                  </h1>
                  <p className='type-body mt-3'>
                    {stats && stats.total_completed > 0
                      ? t.keepGoing
                      : t.startPrompt}
                  </p>
                </>
              ) : (
                <>
                  <Skeleton className='h-11 w-[22rem] max-w-full lg:h-14' />
                  <Skeleton className='mt-4 h-5 w-64 max-w-full' />
                </>
              )}
            </div>
            <div className='flex flex-col gap-2 self-start sm:flex-row'>
              <Button
                variant='outline'
                size='lg'
                onClick={() => setCustomOpen(true)}
              >
                <PenLine strokeWidth={1.5} />
                {t.custom}
              </Button>
              <Button
                variant='outline'
                size='lg'
                onClick={startDesign}
                loading={genDesign}
              >
                <Network strokeWidth={1.5} />
                System Design
              </Button>
              <Button
                variant='ink'
                size='lg'
                onClick={startCode}
                loading={genCode}
                className='group'
              >
                <Sparkles strokeWidth={1.5} />
                {t.newChallenge}
                <ArrowRight className='transition-transform duration-200 group-hover:translate-x-0.5' />
              </Button>
            </div>
          </motion.div>

          {!loaded ? (
            <DashboardSkeleton />
          ) : (
            <>
              <div className='mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4'>
                <StatCard
                  i={0}
                  icon={TrendingUp}
                  label={t.statStreak}
                  value={String(stats?.streak_days ?? 0)}
                  hint={t.statStreakHint}
                />
                <StatCard
                  i={1}
                  icon={Trophy}
                  label={t.statChallenges}
                  value={String(stats?.total_completed ?? 0)}
                  hint={t.statChallengesHint}
                />
                <StatCard
                  i={2}
                  icon={Lightbulb}
                  label={t.statHintsPer}
                  value={String(stats?.avg_hints_per_session ?? 0)}
                  hint={t.statHintsPerHint}
                />
                <StatCard
                  i={3}
                  icon={Layers}
                  label={t.statTotalHints}
                  value={String(stats?.total_hints ?? 0)}
                  hint={t.statTotalHintsHint}
                />
              </div>

              <div className='mb-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]'>
                <ActivityHeatmap sessions={sessions} />
                <IndependenceRing score={score} />
              </div>

              <RecentChallenges items={sessions} />

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className='mt-3 rounded-lg bg-pastel-lilac/60 px-8 py-12 text-center'
              >
                <div className='mx-auto max-w-xl font-serif text-2xl leading-relaxed text-ink italic sm:text-3xl'>
                  &ldquo;{t.quote}&rdquo;
                </div>
                <div className='mt-3 font-mono text-xs text-muted-foreground'>
                  {t.quoteBy}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>
      <CustomChallengeDialog
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        defaultLevel={
          (user?.user_metadata?.preferred_level as
            | 'beginner'
            | 'intermediate'
            | 'advanced'
            | undefined) ?? 'intermediate'
        }
      />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <div className='mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className='shadow-soft rounded-lg border border-border bg-white p-5'
          >
            <Skeleton className='mb-4 size-11 rounded-full' />
            <Skeleton className='h-8 w-14' />
            <Skeleton className='mt-2 h-3 w-16' />
          </div>
        ))}
      </div>
      <div className='mb-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]'>
        <div className='shadow-soft rounded-lg border border-border bg-white p-6'>
          <Skeleton className='h-3 w-24' />
          <Skeleton className='mt-2 h-5 w-40' />
          <Skeleton className='mt-4 h-64 w-full rounded-lg' />
        </div>
        <div className='shadow-soft rounded-lg border border-border bg-white p-6'>
          <Skeleton className='h-3 w-20' />
          <Skeleton className='mt-2 h-5 w-36' />
          <div className='mt-6 grid place-items-center'>
            <Skeleton className='size-44 rounded-full' />
          </div>
        </div>
      </div>
      <div className='shadow-soft rounded-lg border border-border bg-white p-6'>
        <Skeleton className='h-3 w-20' />
        <Skeleton className='mt-2 h-5 w-44' />
        <div className='mt-5 space-y-2'>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className='h-16 w-full rounded-lg' />
          ))}
        </div>
      </div>
    </>
  )
}

function StatCard({
  i,
  icon: Icon,
  label,
  value,
  hint,
}: {
  i: number
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  value: string
  hint: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className='shadow-soft hover:shadow-soft-lg rounded-lg border border-border bg-white p-5 transition-shadow duration-300 ease-out'
    >
      <div className='mb-4 flex items-center justify-between'>
        <div className='grid size-11 place-items-center rounded-full bg-pastel-lavender text-ink'>
          <Icon className='size-5' strokeWidth={1.5} />
        </div>
        <div className='font-mono text-[10px] tracking-wider text-muted-foreground uppercase'>
          {label}
        </div>
      </div>
      <div className='font-heading text-3xl font-light tracking-tight text-ink tabular-nums'>
        {value}
      </div>
      <div className='mt-1 text-[12px] text-muted-foreground'>{hint}</div>
    </motion.div>
  )
}

const WEEKS = 18

function localDateKey(input: Date | string): string {
  const d = typeof input === 'string' ? new Date(input) : input
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function ActivityHeatmap({ sessions }: { sessions: SessionRow[] }) {
  const t = useT(copy)
  const counts: Record<string, number> = {}
  for (const s of sessions) {
    if (!s.started_at) continue
    const key = localDateKey(s.started_at)
    counts[key] = (counts[key] ?? 0) + 1
  }
  const max = Math.max(1, ...Object.values(counts))

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(today.getDate() - today.getDay() - (WEEKS - 1) * 7)

  const days: { key: string; count: number; future: boolean }[] = []
  for (let i = 0; i < WEEKS * 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push({
      key: localDateKey(d),
      count: counts[localDateKey(d)] ?? 0,
      future: d > today,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className='shadow-soft hover:shadow-soft-lg flex flex-col rounded-lg border border-border bg-white p-6 transition-shadow duration-300 ease-out'
    >
      <div className='mb-1'>
        <p className='eyebrow'>{t.journeyEyebrow}</p>
        <h3 className='type-h4 mt-1'>{t.journeyTitle}</h3>
      </div>
      <div className='mt-6 flex gap-2 overflow-x-auto'>
        <div className='grid grid-rows-7 gap-1 pr-1'>
          {t.dow.map((l, i) => (
            <span
              key={i}
              className='flex h-3 items-center font-mono text-[9px] text-muted-foreground'
            >
              {l}
            </span>
          ))}
        </div>
        <div className='grid grid-flow-col grid-rows-7 gap-1'>
          {days.map((d) => (
            <div
              key={d.key}
              title={`${d.key}: ${d.count} ${d.count === 1 ? t.challengeOne : t.challengeMany}`}
              className={
                d.future
                  ? 'size-3 opacity-0'
                  : `size-3 rounded-[2px] border border-border ${CELL[activityLevel(d.count, max)]}`
              }
            />
          ))}
        </div>
      </div>
      <div className='mt-6 flex items-center justify-end gap-1.5 font-mono text-[10px] text-muted-foreground'>
        <span>{t.less}</span>
        {CELL.map((c, l) => (
          <span
            key={l}
            className={`size-3 rounded-[3px] border border-border ${c}`}
          />
        ))}
        <span>{t.more}</span>
      </div>
    </motion.div>
  )
}

function IndependenceRing({ score }: { score: number }) {
  const t = useT(copy)
  const data = [{ name: 'indep', value: score, fill: 'var(--chart-1)' }]
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className='shadow-soft hover:shadow-soft-lg flex flex-col rounded-lg border border-border bg-white p-6 transition-shadow duration-300 ease-out'
    >
      <p className='eyebrow'>{t.scoreEyebrow}</p>
      <h3 className='type-h4 mt-1'>{t.scoreTitle}</h3>
      <div className='relative grid min-h-[200px] flex-1 place-items-center'>
        <ResponsiveContainer width='100%' height='100%'>
          <RadialBarChart
            innerRadius='70%'
            outerRadius='100%'
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type='number' domain={[0, 100]} tick={false} />
            <RadialBar
              background={{ fill: 'var(--pastel-mist)' }}
              dataKey='value'
              fill='var(--chart-1)'
              cornerRadius={20}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className='pointer-events-none absolute inset-0 grid place-items-center'>
          <div className='text-center'>
            <div className='font-heading text-5xl font-light tracking-tight text-ink tabular-nums'>
              {score}%
            </div>
            <div className='mt-1 font-mono text-[11px] text-muted-foreground'>
              {t.scoreCaption}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function RecentChallenges({ items }: { items: SessionRow[] }) {
  const t = useT(copy)
  const { locale } = useLocale()
  const PAGE_SIZE = 6
  const [page, setPage] = React.useState(0)
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const start = page * PAGE_SIZE
  const pageItems = items.slice(start, start + PAGE_SIZE)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className='shadow-soft hover:shadow-soft-lg rounded-lg border border-border bg-white p-6 transition-shadow duration-300 ease-out'
    >
      <div className='mb-5 flex items-end justify-between gap-4'>
        <div>
          <p className='eyebrow'>{t.historyEyebrow}</p>
          <h3 className='type-h4 mt-1'>{t.historyTitle}</h3>
        </div>
        {items.length > PAGE_SIZE && (
          <div className='flex items-center gap-2 font-mono text-[11px] text-muted-foreground'>
            <span className='hidden sm:inline'>
              {start + 1}–{Math.min(start + PAGE_SIZE, items.length)} {t.of}{' '}
              {items.length}
            </span>
            <Button
              variant='outline'
              size='icon-sm'
              className='size-8 sm:size-8'
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className='size-4' />
            </Button>
            <Button
              variant='outline'
              size='icon-sm'
              className='size-8 sm:size-8'
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              <ChevronRight className='size-4' />
            </Button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          {t.historyEmpty}
        </p>
      ) : (
        <div className='space-y-2'>
          {pageItems.map((c) => {
            const isDesign = c.challenges?.kind === 'design'
            const href = `${isDesign ? '/design' : '/challenge'}?id=${c.challenge_id}`
            return (
              <Link
                key={c.id}
                href={href}
                className='group flex items-start gap-3 rounded-lg bg-muted p-3.5 transition-colors duration-300 ease-out hover:bg-paper'
              >
                <div className='grid size-9 shrink-0 place-items-center rounded-full bg-pastel-lavender text-ink'>
                  <Code2 className='size-4' strokeWidth={1.5} />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='truncate text-[14px] font-medium text-ink'>
                      {c.challenges?.title ?? t.challengeFallback}
                    </div>
                    <div className='shrink-0 font-mono text-[11px] text-muted-foreground'>
                      {new Date(c.started_at).toLocaleDateString(
                        locale === 'pt' ? 'pt-BR' : 'en-US',
                      )}
                    </div>
                  </div>
                  <div className='mt-2 flex items-center gap-3 font-mono text-[11px]'>
                    <span className='rounded-full border border-border bg-white px-2 py-0.5 text-muted-foreground'>
                      {isDesign
                        ? 'System Design'
                        : c.challenges?.stack === 'javascript'
                          ? 'JavaScript'
                          : 'TypeScript'}
                    </span>
                    <span className='text-muted-foreground'>
                      {(t.status as Record<string, string>)[c.status] ??
                        c.status}
                    </span>
                    <span className='ml-auto inline-flex items-center gap-1 text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                      {c.status === 'completed' ? t.open : t.resume}
                      <ArrowRight className='size-3' />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
