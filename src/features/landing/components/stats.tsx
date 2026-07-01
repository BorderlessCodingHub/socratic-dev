'use client'

import { useLocale, useT } from '@/lib/i18n'
import { AnimatedCount } from './anim/animated-count'
import { Reveal } from './reveal'

type Stat = { value: string; label: string; reverse?: boolean }

const copy: Record<'en' | 'pt', { stats: Stat[] }> = {
  en: {
    stats: [
      { value: '0', label: 'answers given away', reverse: true },
      { value: '3', label: 'gradual hint levels' },
      { value: '100%', label: 'of the reasoning stays yours' },
      { value: '2,400', label: 'years of proven method' },
    ],
  },
  pt: {
    stats: [
      { value: '0', label: 'respostas entregues de graça', reverse: true },
      { value: '3', label: 'níveis de hint graduais' },
      { value: '100%', label: 'do raciocínio continua seu' },
      { value: '2.400', label: 'anos de método comprovado' },
    ],
  },
}

export function Stats() {
  const { locale } = useLocale()
  const t = useT(copy)
  const intlLocale = locale === 'pt' ? 'pt-BR' : 'en-US'

  return (
    <section className='bg-paper px-6 py-14 sm:px-10 lg:px-16 lg:py-16'>
      <div className='grid grid-cols-2 gap-y-10 lg:grid-cols-4'>
        {t.stats.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 0.08}
            className='border-border border-l px-5 first:border-l-0 lg:px-8'
          >
            <AnimatedCount
              value={s.value}
              reverse={s.reverse}
              locale={intlLocale}
              className='font-heading text-ink text-4xl font-light tracking-tight tabular-nums sm:text-5xl'
            />
            <div className='font-mono text-muted-foreground mt-3 max-w-[180px] text-xs leading-snug tracking-wide'>
              {s.label}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
