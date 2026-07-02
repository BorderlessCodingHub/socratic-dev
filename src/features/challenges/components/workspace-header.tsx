'use client'

import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Brain, Building, Clock, GitPullRequestArrow } from 'lucide-react'

const copy = {
  en: {
    independenceTitle:
      'Starts at 100. Every hint costs. It measures how much you thought on your own.',
    independence: 'Independence',
    submit: 'Submit',
  },
  pt: {
    independenceTitle:
      'Começa em 100. Cada hint custa. É o quanto você pensou sozinho.',
    independence: 'Independência',
    submit: 'Submeter',
  },
}

export function WorkspaceHeader({
  title,
  elapsed,
  independence,
  submitting,
  onSubmit,
}: {
  title: string
  elapsed: number
  independence: number
  submitting: boolean
  onSubmit: () => void
}) {
  const t = useT(copy)
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const seconds = String(elapsed % 60).padStart(2, '0')

  return (
    <header className='z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl'>
      <div className='flex min-w-0 items-center gap-4'>
        <Logo />
        <div className='hidden min-w-0 items-center gap-2 border-l border-border pl-4 sm:flex'>
          <Building
            className='size-3.5 shrink-0 text-muted-foreground'
            strokeWidth={1.5}
          />
          <span className='truncate text-[13px] font-medium text-ink'>
            {title}
          </span>
        </div>
      </div>
      <div className='flex shrink-0 items-center'>
        <div className='hidden items-center gap-2 px-4 font-mono text-[12px] tabular-nums text-ink md:flex'>
          <Clock className='size-3.5 text-muted-foreground' strokeWidth={1.5} />
          <span>
            {minutes}:{seconds}
          </span>
        </div>
        <div
          className='hidden items-center gap-2 border-l border-border px-4 font-mono md:flex'
          title={t.independenceTitle}
        >
          <Brain className='size-3.5 text-muted-foreground' strokeWidth={1.5} />
          <span className='text-[10px] tracking-wider text-muted-foreground uppercase'>
            {t.independence}
          </span>
          <span
            className={cn(
              'text-[12px] font-medium tabular-nums',
              independence > 70
                ? 'text-mint'
                : independence > 40
                  ? 'text-warning-foreground'
                  : 'text-destructive-foreground',
            )}
          >
            {independence}%
          </span>
        </div>
        <div className='md:border-l md:border-border md:pl-4'>
          <Button
            size='sm'
            variant='ink'
            disabled={submitting}
            onClick={onSubmit}
            className='h-8 gap-1.5 px-3.5'
          >
            <GitPullRequestArrow className='size-3.5' />
            {t.submit}
          </Button>
        </div>
      </div>
    </header>
  )
}
