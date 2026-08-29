'use client'

import { getStreak } from '@/features/dashboard/actions'
import { getHintBalance } from '@/features/hints/actions'
import { getMyRank } from '@/features/ranking/actions'
import { apiFetch, getAccessToken } from '@/lib/api/client'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Flame, Lightbulb, Plus, Trophy } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { copy } from './copy'

// The navbar remounts on every route change; without this cache the cluster
// vanished and popped back in on each navigation. Values persist for the
// lifetime of the loaded bundle and are refreshed in the background.
const cache: {
  remaining: number | null
  position: number | null
  streak: number | null
} = { remaining: null, position: null, streak: null }

export function useHints(enabled: boolean) {
  const [remaining, setRemaining] = React.useState<number | null>(
    cache.remaining,
  )
  const [buying, setBuying] = React.useState(false)

  const refresh = React.useCallback(() => {
    if (!enabled) return
    getAccessToken()
      .then((tk) => getHintBalance(tk))
      .then((b) => {
        cache.remaining = b.remaining
        setRemaining(b.remaining)
      })
      .catch(() => {})
  }, [enabled])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  const buy = React.useCallback(async () => {
    if (buying) return
    setBuying(true)
    try {
      const res = await apiFetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: window.location.pathname }),
      })
      const data = (await res.json().catch(() => ({}))) as { url?: string }
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
      refresh()
    } finally {
      setBuying(false)
    }
  }, [buying, refresh])

  return { remaining, buying, buy }
}

export type Hints = ReturnType<typeof useHints>

export function useRank(enabled: boolean) {
  const [position, setPosition] = React.useState<number | null>(
    cache.position,
  )

  React.useEffect(() => {
    if (!enabled) return
    let cancelled = false
    getAccessToken()
      .then((tk) => getMyRank(tk))
      .then((r) => {
        if (!cancelled && r) {
          cache.position = r.position
          setPosition(r.position)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [enabled])

  return position
}

export function useStreak(enabled: boolean) {
  const [streak, setStreak] = React.useState<number>(cache.streak ?? 0)

  React.useEffect(() => {
    if (!enabled) return
    let cancelled = false
    getAccessToken()
      .then((tk) => getStreak(tk))
      .then((s) => {
        if (!cancelled) {
          cache.streak = s
          setStreak(s)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [enabled])

  return streak
}

function SlotSkeleton() {
  return (
    <span className='flex items-center pr-2.5 pl-3'>
      <span className='bg-border h-3 w-9 animate-pulse rounded-full' />
    </span>
  )
}

export function StatusCluster({
  position,
  hints,
  streak,
  loggedIn = true,
}: {
  position: number | null
  hints: Hints
  streak: number
  loggedIn?: boolean
}) {
  const t = useT(copy)
  if (!loggedIn) return null
  // First load of the session (no cached values yet): keep the pill in place
  // with a skeleton so the header doesn't jump when the numbers arrive.
  const loading = position === null && hints.remaining === null
  if (loading) {
    return (
      <div className='border-border bg-background hidden h-9 items-stretch overflow-hidden rounded-full border sm:inline-flex'>
        <SlotSkeleton />
        <span aria-hidden className='bg-border my-2 w-px' />
        <SlotSkeleton />
      </div>
    )
  }
  return (
    <div className='border-border bg-background hidden h-9 items-stretch overflow-hidden rounded-full border sm:inline-flex'>
      {streak > 0 && (
        <span
          title={`${streak} ${t.streakTitle}`}
          className='text-muted-foreground flex items-center gap-1 pr-2.5 pl-3'
        >
          <Flame className='text-ember size-3.5' strokeWidth={1.5} />
          <span className='font-mono text-[12px] tabular-nums'>{streak}</span>
        </span>
      )}
      {streak > 0 && (position !== null || hints.remaining !== null) && (
        <span aria-hidden className='bg-border my-2 w-px' />
      )}
      {position !== null && (
        <Link
          href='/ranking'
          title={t.yourRank}
          className='text-muted-foreground hover:text-ink hover:bg-secondary flex items-center gap-1.5 pr-2.5 pl-3 transition-colors duration-200'
        >
          <Trophy className='text-primary size-3.5' strokeWidth={1.5} />
          <span className='font-mono text-[12px] tabular-nums'>
            #{position}
          </span>
        </Link>
      )}
      {position !== null && hints.remaining !== null && (
        <span aria-hidden className='bg-border my-2 w-px' />
      )}
      {hints.remaining !== null && (
        <div className='flex items-center gap-1.5 pr-1 pl-2.5'>
          <Lightbulb className='text-primary size-3.5' strokeWidth={1.5} />
          <span
            title={t.hintsAvailable}
            className={cn(
              'font-mono text-[12px] tabular-nums',
              hints.remaining <= 0
                ? 'text-destructive'
                : 'text-muted-foreground',
            )}
          >
            {hints.remaining}
          </span>
          <button
            type='button'
            onClick={hints.buy}
            disabled={hints.buying}
            title={t.buyHints}
            aria-label={t.buyHints}
            className='text-primary hover:bg-primary/10 relative grid size-6 cursor-pointer place-items-center rounded-full transition-colors duration-200 before:absolute before:-inset-2 before:content-[""] disabled:opacity-50'
          >
            <Plus className='size-3.5' strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  )
}
