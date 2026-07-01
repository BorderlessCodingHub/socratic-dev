'use client'

import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Challenge } from '@/features/challenges/types'
import { levelLabel } from '@/features/challenges/utils'
import { useT } from '@/lib/i18n'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Code2,
  Network,
} from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import * as React from 'react'

type Filter = 'all' | 'code' | 'design'

const FILTERS: Filter[] = ['all', 'code', 'design']

const copy = {
  en: {
    eyebrow: 'Library',
    headline: 'Every challenge.',
    flourish: 'Recycled.',
    intro:
      'Every challenge the AI creates lands here and joins the shared pool — less waiting, lower cost.',
    challengeOne: 'challenge',
    challengeMany: 'challenges',
    filters: { all: 'All', code: 'Code', design: 'System Design' },
    empty: 'No challenges under this filter yet.',
    levels: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
    open: 'Open',
  },
  pt: {
    eyebrow: 'Biblioteca',
    headline: 'Todos os desafios.',
    flourish: 'Reaproveitados.',
    intro:
      'Cada desafio que a IA cria entra aqui e vira pool pra todo mundo — menos espera, menos custo.',
    challengeOne: 'desafio',
    challengeMany: 'desafios',
    filters: { all: 'Todos', code: 'Código', design: 'System Design' },
    empty: 'Nenhum desafio nesse filtro ainda.',
    levels: {
      beginner: 'Iniciante',
      intermediate: 'Intermediário',
      advanced: 'Avançado',
    },
    open: 'Abrir',
  },
}

function stackLabel(c: Challenge): string {
  if (c.kind === 'design') return 'System Design'
  if (c.stack === 'javascript') return 'JavaScript'
  return 'TypeScript'
}

const STOP = new Set([
  'de',
  'da',
  'do',
  'dos',
  'das',
  'a',
  'o',
  'e',
  'que',
  'com',
  'um',
  'uma',
  'em',
  'no',
  'na',
  'os',
  'as',
  'para',
  'pra',
])

function titleSig(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w))
    .map((w) => w.slice(0, 4))
    .sort()
    .join('-')
}

function dedupe(list: Challenge[]): Challenge[] {
  const seen = new Set<string>()
  return list.filter((c) => {
    const key = `${c.kind}|${c.stack}|${c.level}|${titleSig(c.title)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export default function ChallengesLibraryPage() {
  const t = useT(copy)
  const [challenges, setChallenges] = React.useState<Challenge[] | null>(null)
  const [filter, setFilter] = React.useState<Filter>('all')
  const [page, setPage] = React.useState(0)
  const PAGE = 9

  React.useEffect(() => {
    let active = true
    ;(async () => {
      const { data } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false })
      if (active) setChallenges((data as unknown as Challenge[]) ?? [])
    })()
    return () => {
      active = false
    }
  }, [])

  const unique = dedupe(challenges ?? [])
  const visible = unique.filter((c) =>
    filter === 'all' ? true : c.kind === filter,
  )
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE))
  const pageItems = visible.slice(page * PAGE, page * PAGE + PAGE)

  return (
    <div className='relative flex min-h-screen flex-1 flex-col bg-white'>
      <Navbar />

      <main className='flex-1 pt-[88px] pb-20 md:pt-24'>
        <div className='container-main max-w-6xl'>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className='eyebrow mb-2'>{t.eyebrow}</p>
            <h1 className='type-h2'>
              {t.headline}{' '}
              <span className='text-gradient font-serif font-normal italic'>
                {t.flourish}
              </span>
            </h1>
            <p className='type-body mt-3 max-w-[560px]'>
              {t.intro}{' '}
              {challenges && (
                <span className='font-medium text-ink'>
                  {unique.length}{' '}
                  {unique.length === 1 ? t.challengeOne : t.challengeMany}.
                </span>
              )}
            </p>
          </motion.div>

          <div className='mt-8 flex flex-wrap gap-2'>
            {FILTERS.map((f) => (
              <button
                key={f}
                type='button'
                onClick={() => {
                  setFilter(f)
                  setPage(0)
                }}
                className={cn(
                  'cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200',
                  filter === f
                    ? 'border-ink bg-ink text-white'
                    : 'border-border text-muted-foreground hover:border-ink hover:text-ink',
                )}
              >
                {t.filters[f]}
              </button>
            ))}
          </div>

          <div className='mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {!challenges ? (
              [0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className='h-44 rounded-lg' />
              ))
            ) : visible.length === 0 ? (
              <p className='col-span-full text-sm text-muted-foreground'>
                {t.empty}
              </p>
            ) : (
              pageItems.map((c, i) => {
                const isDesign = c.kind === 'design'
                const href = `${isDesign ? '/design' : '/challenge'}?id=${c.id}`
                const Icon = isDesign ? Network : Code2
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(i, 8) * 0.04,
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link
                      href={href}
                      className='shadow-soft hover:shadow-soft-lg group flex h-full flex-col rounded-lg border border-border bg-white p-5 transition-shadow duration-300 ease-out'
                    >
                      <div className='mb-3 flex items-center gap-2'>
                        <div className='grid size-9 place-items-center rounded-full bg-pastel-lavender text-ink'>
                          <Icon className='size-4.5' strokeWidth={1.5} />
                        </div>
                        <span className='rounded-full border border-border bg-white px-2 py-0.5 font-mono text-[10px] tracking-wider text-muted-foreground uppercase'>
                          {stackLabel(c)}
                        </span>
                        <span className='rounded-full border border-border bg-white px-2 py-0.5 font-mono text-[10px] tracking-wider text-muted-foreground uppercase'>
                          {(t.levels as Record<string, string>)[c.level] ??
                            levelLabel(c.level)}
                        </span>
                      </div>
                      <h3 className='font-heading text-lg font-light tracking-tight text-ink'>
                        {c.title}
                      </h3>
                      <p className='mt-1.5 line-clamp-2 text-sm text-muted-foreground'>
                        {c.description}
                      </p>
                      <span className='mt-auto inline-flex items-center gap-1 pt-4 text-[14px] font-medium text-primary'>
                        <span className='link-underline'>{t.open}</span>
                        <ArrowRight
                          size={16}
                          className='transition-transform duration-200 group-hover:translate-x-0.5'
                        />
                      </span>
                    </Link>
                  </motion.div>
                )
              })
            )}
          </div>

          {visible.length > PAGE && (
            <div className='mt-8 flex items-center justify-center gap-2 font-mono text-[12px] text-muted-foreground'>
              <Button
                variant='outline'
                size='icon-sm'
                className='size-8 sm:size-8'
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className='size-4' />
              </Button>
              <span>
                {page + 1} / {totalPages}
              </span>
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
      </main>
    </div>
  )
}
