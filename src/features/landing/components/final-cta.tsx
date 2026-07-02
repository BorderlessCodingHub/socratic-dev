'use client'

import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Halftone, type Painter } from './halftone'
import { Reveal } from './reveal'

const copy = {
  en: {
    eyebrow: 'Start now',
    title: "Code like AI doesn't exist. Learn like it's your mentor.",
    body: 'Start a challenge in 30 seconds. No credit card, no tedious onboarding.',
    cta: 'Challenge me',
  },
  pt: {
    eyebrow: 'Comece agora',
    title:
      'Programe como se a IA não existisse. Aprenda como se ela fosse seu mentor.',
    body: 'Comece um desafio em 30 segundos. Sem cartão, sem onboarding chato.',
    cta: 'Quero ser desafiado',
  },
}

const paintCtaField: Painter = (ctx, w, h) => {
  const blob = (x: number, y: number, r: number, a: number) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(0,0,0,${a})`)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }
  blob(w * 0.08, h * 0.85, w * 0.3, 0.85)
  blob(w * 0.94, h * 0.8, w * 0.34, 0.9)
  blob(w * 0.5, h * 1.05, w * 0.4, 0.55)
  blob(w * 0.02, h * 0.1, w * 0.14, 0.4)
  blob(w * 0.97, h * 0.06, w * 0.14, 0.4)
}

export function FinalCta() {
  const t = useT(copy)

  return (
    <section className='p-3 md:p-6'>
      <Reveal>
        <div className='from-pastel-greige/50 via-pastel-mist/40 to-pastel-lavender/60 relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b px-6 py-16 text-center sm:px-10 lg:min-h-[480px] lg:py-20'>
          <div className='pointer-events-none absolute inset-0 opacity-45 mix-blend-multiply dark:mix-blend-screen'>
            <Halftone
              draw={paintCtaField}
              active
              interactive
              spacing={10}
              flow={16}
              className='absolute inset-0'
            />
          </div>
          <div className='relative z-10 mx-auto max-w-[720px]'>
            <p className='eyebrow'>{t.eyebrow}</p>
            <h2 className='type-h2 mx-auto mt-4 max-w-[640px] text-balance'>
              {t.title}
            </h2>
            <p className='text-aubergine mx-auto mt-6 max-w-[480px] text-base lg:text-[20px]'>
              {t.body}
            </p>
            <div className='mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row'>
              <Button
                variant='ink'
                size='lg'
                className='group'
                render={<Link href='/onboarding' />}
              >
                {t.cta}
                <ArrowRight className='transition-transform duration-200 group-hover:translate-x-0.5' />
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
