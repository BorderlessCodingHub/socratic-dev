import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { getLocale } from '@/lib/i18n/server'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

const copy = {
  en: {
    title: 'Page not found',
    description: "This page doesn't exist, or it moved.",
    cta: 'Back to socratic.dev',
  },
  pt: {
    title: 'Página não encontrada',
    description: 'Essa página não existe, ou foi movida.',
    cta: 'Voltar ao socratic.dev',
  },
} as const

export default function NotFound() {
  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <header className='container-main flex h-16 w-full shrink-0 items-center'>
        <Logo />
      </header>
      <main className='flex flex-1 items-center justify-center px-4 pb-16'>
        <Suspense fallback={null}>
          <NotFoundContent />
        </Suspense>
      </main>
    </div>
  )
}

async function NotFoundContent() {
  const locale = await getLocale()
  const t = copy[locale]

  return (
    <Empty>
      <EmptyHeader>
        <span className='eyebrow'>404</span>
        <EmptyTitle className='mt-3'>{t.title}</EmptyTitle>
        <EmptyDescription>{t.description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button render={<Link href='/' />} variant='ink' className='group'>
          {t.cta}
          <ArrowRight className='transition-transform duration-200 group-hover:translate-x-0.5' />
        </Button>
      </EmptyContent>
    </Empty>
  )
}
