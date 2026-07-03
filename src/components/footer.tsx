'use client'

import { useLocale, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Logo } from './logo'

const copy = {
  en: {
    taglinePre: 'The AI that makes you ',
    taglineWord: 'think',
    cta: 'Start a challenge',
    product: 'Product',
    resources: 'Resources',
    language: 'Language',
    productLinks: [
      { href: '/onboarding', label: 'Start a challenge' },
      { href: '/challenges', label: 'Library' },
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/#metodo', label: 'How it works' },
      { href: '/#problema', label: 'The problem' },
    ],
  },
  pt: {
    taglinePre: 'A IA que te faz ',
    taglineWord: 'pensar',
    cta: 'Comece um desafio',
    product: 'Produto',
    resources: 'Recursos',
    language: 'Idioma',
    productLinks: [
      { href: '/onboarding', label: 'Comece um desafio' },
      { href: '/challenges', label: 'Biblioteca' },
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/#metodo', label: 'Como funciona' },
      { href: '/#problema', label: 'O problema' },
    ],
  },
}

function FooterLink({
  href,
  label,
  external,
}: {
  href: string
  label: string
  external?: boolean
}) {
  const cls =
    'text-sm text-muted-foreground transition-colors duration-200 hover:text-ink'
  return external ? (
    <a href={href} target='_blank' rel='noopener noreferrer' className={cls}>
      <span className='link-underline'>{label}</span>
    </a>
  ) : (
    <Link href={href} className={cls}>
      <span className='link-underline'>{label}</span>
    </Link>
  )
}

export function Footer() {
  const t = useT(copy)
  const { locale, setLocale } = useLocale()

  return (
    <footer className='border-border bg-paper mt-16 overflow-hidden border-t'>
      <div className='container-main grid gap-12 py-14 md:grid-cols-[1fr_auto] md:gap-20'>
        <div className='flex max-w-sm flex-col items-start gap-5'>
          <Logo />
          <p className='text-muted-foreground text-sm'>
            {t.taglinePre}
            <span className='font-serif italic'>{t.taglineWord}</span>.
          </p>
          <Link
            href='/onboarding'
            className='bg-ink hover:bg-primary text-background group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300'
          >
            {t.cta}
            <ArrowRight className='size-3.5 transition-transform group-hover:translate-x-0.5' />
          </Link>
        </div>

        <div className='grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16'>
          <div className='space-y-4'>
            <p className='eyebrow'>{t.product}</p>
            <ul className='space-y-2.5'>
              {t.productLinks.map((l) => (
                <li key={l.href}>
                  <FooterLink href={l.href} label={l.label} />
                </li>
              ))}
            </ul>
          </div>

          <div className='space-y-4'>
            <p className='eyebrow'>{t.resources}</p>
            <ul className='space-y-2.5'>
              <li>
                <FooterLink
                  href='https://github.com/ProgramadoresSemPatria/HB01-2026_socratic-dev'
                  label='GitHub'
                  external
                />
              </li>
            </ul>
          </div>

          <div className='space-y-4'>
            <p className='eyebrow'>{t.language}</p>
            <div className='flex gap-1.5'>
              {(['en', 'pt'] as const).map((l) => (
                <button
                  key={l}
                  type='button'
                  onClick={() => setLocale(l)}
                  aria-pressed={locale === l}
                  className={cn(
                    'cursor-pointer rounded-full border px-3 py-1 font-mono text-[11px] uppercase transition-colors duration-200',
                    locale === l
                      ? 'border-ink bg-ink text-background'
                      : 'border-border text-muted-foreground hover:text-ink',
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className='container-main pointer-events-none -mb-[2vw] select-none'
      >
        <p className='font-heading text-ink/[0.07] text-center text-[13.5vw] leading-[0.8] font-light tracking-[-0.05em] whitespace-nowrap'>
          socratic.dev
        </p>
      </div>

      <div className='border-border bg-background/40 relative border-t'>
        <div className='container-main flex flex-col items-center gap-2 py-5 sm:flex-row sm:justify-between'>
          <span className='text-muted-foreground text-[13px]'>
            © 2026 Socratic.dev
          </span>
          <span className='text-muted-foreground font-mono text-[11px] tracking-[0.1em] uppercase'>
            A product from Borderless Coding Labs
          </span>
        </div>
      </div>
    </footer>
  )
}
