'use client'

import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
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

export function FinalCta() {
  const t = useT(copy)

  return (
    <section className='p-3 md:p-6'>
      <Reveal>
        <div className='from-pastel-greige/50 via-pastel-mist/40 to-pastel-lavender/60 flex min-h-[400px] items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b px-6 py-16 text-center sm:px-10 lg:min-h-[520px] lg:py-24'>
          <div className='mx-auto max-w-[720px]'>
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
