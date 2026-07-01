'use client'

import { useT } from '@/lib/i18n'

const copy = {
  en: { label: 'Built with' },
  pt: { label: 'Construído com' },
} as const

const stack = [
  'Claude',
  'TypeScript',
  'Next.js',
  'React',
  'Monaco',
  'Node.js',
  'Tailwind',
  'Supabase',
  'Vercel',
]

function Row() {
  return (
    <div className='flex shrink-0 items-center'>
      {stack.map((name) => (
        <span
          key={name}
          className='font-heading text-ink/30 px-8 text-xl font-medium tracking-tight whitespace-nowrap transition-colors duration-300 hover:text-ink/70 sm:px-10 sm:text-2xl'
        >
          {name}
        </span>
      ))}
    </div>
  )
}

export function LogoCloud() {
  const t = useT(copy)

  return (
    <section className='py-8'>
      <p className='eyebrow mb-6 text-center'>{t.label}</p>
      <div className='relative overflow-hidden'>
        <div className='from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r to-transparent' />
        <div className='from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l to-transparent' />
        <div className='animate-marquee flex w-max hover:[animation-play-state:paused] motion-reduce:[animation-play-state:paused]'>
          <Row />
          <Row />
        </div>
      </div>
    </section>
  )
}
