'use client'

import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { RequireAuth } from '@/components/require-auth'
import { Skeleton } from '@/components/ui/skeleton'
import {
  listSessionsForUser,
  type SessionRow,
} from '@/features/challenges/actions'
import { getAccessToken } from '@/lib/api/client'
import { useT } from '@/lib/i18n'
import { ArrowRight, Users } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import * as React from 'react'

const copy = {
  en: {
    eyebrow: 'Community',
    title: 'How others solved it',
    subtitle:
      'Pick a challenge you completed to compare your solution with the community.',
    empty:
      'Complete a code challenge to unlock community solutions — no spoilers before that.',
    emptyCta: 'Start a challenge',
    open: 'View solutions',
  },
  pt: {
    eyebrow: 'Comunidade',
    title: 'Como outros resolveram',
    subtitle:
      'Escolha um desafio que você completou pra comparar sua solução com a da comunidade.',
    empty:
      'Complete um desafio de código pra desbloquear as soluções da comunidade — sem spoiler antes disso.',
    emptyCta: 'Começar um desafio',
    open: 'Ver soluções',
  },
}

type Entry = { challengeId: string; title: string; stack: string }

function SolutionsIndexContent() {
  const t = useT(copy)
  const [entries, setEntries] = React.useState<Entry[] | null>(null)

  React.useEffect(() => {
    let active = true
    ;(async () => {
      const token = await getAccessToken()
      const sessions: SessionRow[] = await listSessionsForUser(token)
      if (!active) return
      const seen = new Set<string>()
      const out: Entry[] = []
      for (const s of sessions) {
        if (s.status !== 'completed') continue
        if (s.challenges?.kind === 'design') continue
        if (seen.has(s.challenge_id)) continue
        seen.add(s.challenge_id)
        out.push({
          challengeId: s.challenge_id,
          title: s.challenges?.title ?? 'Desafio',
          stack: s.challenges?.stack ?? '',
        })
      }
      setEntries(out)
    })().catch(() => {
      if (active) setEntries([])
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className='relative flex min-h-screen flex-1 flex-col bg-background'>
      <Navbar />
      <main className='flex-1 pt-[88px] pb-20 md:pt-24'>
        <div className='container-main max-w-6xl'>
          <p className='eyebrow'>{t.eyebrow}</p>
          <h1 className='type-h2 mt-4'>{t.title}</h1>
          <p className='type-body mt-3 max-w-lg text-muted-foreground'>
            {t.subtitle}
          </p>

          {entries === null ? (
            <div className='mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              <Skeleton className='h-32 w-full rounded-lg' />
              <Skeleton className='h-32 w-full rounded-lg' />
              <Skeleton className='h-32 w-full rounded-lg' />
            </div>
          ) : entries.length === 0 ? (
            <div className='mt-10 flex flex-col items-start gap-5 rounded-lg border border-border bg-card px-6 py-10'>
              <Users className='size-5 text-primary' strokeWidth={1.5} />
              <p className='type-body max-w-lg'>{t.empty}</p>
              <Button variant='ink' render={<Link href='/challenge' />}>
                {t.emptyCta}
              </Button>
            </div>
          ) : (
            <div className='mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {entries.map((e, i) => (
                <motion.div
                  key={e.challengeId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: Math.min(i, 8) * 0.04,
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={`/solutions/${e.challengeId}`}
                    className='shadow-soft hover:shadow-soft-lg group flex h-full flex-col rounded-lg border border-border bg-card p-5 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5'
                  >
                    {e.stack && (
                      <span className='mb-3 w-fit rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] tracking-wider text-muted-foreground uppercase'>
                        {e.stack}
                      </span>
                    )}
                    <h3 className='type-h4 line-clamp-2'>{e.title}</h3>
                    <span className='mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-medium text-primary'>
                      <span className='link-underline'>{t.open}</span>
                      <ArrowRight className='size-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function SolutionsIndexPage() {
  return (
    <RequireAuth next='/solutions'>
      {() => <SolutionsIndexContent />}
    </RequireAuth>
  )
}
