'use client'

import { useT } from '@/lib/i18n'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'

const copy = {
  en: {
    eyebrow: 'Code + system design',
    title: 'The AI that never hands you the answer — it makes you find it.',
    sub: 'Solve code challenges in a real editor or sketch architectures on a canvas. The AI acts like a demanding tech lead: it asks questions, gives gradual hints, and makes you actually reason.',
    primary: 'Start a challenge',
    secondary: 'Browse the library',
  },
  pt: {
    eyebrow: 'Código + system design',
    title: 'A IA que nunca te dá a resposta — ela te faz chegar lá.',
    sub: 'Resolva desafios de código no editor ou desenhe arquiteturas de system design no canvas. A IA age como um tech lead exigente: faz perguntas, dá hints graduais e te força a raciocinar de verdade.',
    primary: 'Comece um desafio',
    secondary: 'Explorar a biblioteca',
  },
} as const

const ARCS = [
  'M 640 340 A 300 300 0 0 1 940 40',
  'M 700 340 A 240 240 0 0 1 940 100',
  'M 760 340 A 180 180 0 0 1 940 160',
  'M 820 340 A 120 120 0 0 1 940 220',
]

export function Hero() {
  const t = useT(copy)

  return (
    <section className='p-3 md:p-6'>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className='bg-ink relative flex min-h-[460px] items-center justify-center overflow-hidden rounded-lg lg:min-h-[587px]'
      >
        <div
          aria-hidden
          className='pointer-events-none absolute -top-40 -left-32 size-[520px] rounded-full opacity-25 blur-3xl'
          style={{
            background:
              'radial-gradient(circle, #691df2 0%, transparent 70%)',
          }}
        />
        <div
          aria-hidden
          className='pointer-events-none absolute -right-32 -bottom-48 size-[520px] rounded-full opacity-15 blur-3xl'
          style={{
            background:
              'radial-gradient(circle, #a6e40e 0%, transparent 70%)',
          }}
        />
        <svg
          viewBox='0 0 960 340'
          fill='none'
          aria-hidden
          className='pointer-events-none absolute right-0 bottom-0 hidden h-[340px] w-[960px] lg:block'
        >
          {ARCS.map((d, i) => (
            <motion.path
              key={d}
              d={d}
              stroke='white'
              strokeOpacity={0.1}
              strokeWidth={1.2}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1.6,
                delay: 0.4 + i * 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          ))}
        </svg>

        <div className='relative z-10 mx-auto max-w-[1000px] px-6 py-14 text-center sm:px-10 lg:px-16 lg:py-20'>
          <p className='eyebrow mb-6 text-white/50'>{t.eyebrow}</p>
          <h1 className='font-heading mx-auto mb-6 max-w-[900px] text-[40px] leading-[1.02] font-light tracking-[-0.04em] text-white sm:text-[64px] lg:mb-8 lg:text-[84px]'>
            {t.title}
          </h1>
          <p className='mx-auto mb-9 max-w-[644px] text-[16px] leading-[1.45] tracking-[-0.18px] text-white/75 lg:mb-11 lg:text-[19px]'>
            {t.sub}
          </p>
          <div className='flex flex-col justify-center gap-3 sm:flex-row'>
            <Link
              href='/onboarding'
              className='text-ink hover:bg-paper group inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-base font-medium tracking-tight transition-colors duration-300'
            >
              {t.primary}
              <ArrowRight className='size-4 transition-transform group-hover:translate-x-0.5' />
            </Link>
            <Link
              href='/challenges'
              className='bg-lime text-ink hover:bg-lime-dark inline-flex items-center justify-center rounded-full px-5 py-2.5 text-base font-medium tracking-tight transition-colors duration-300 hover:text-white'
            >
              {t.secondary}
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
