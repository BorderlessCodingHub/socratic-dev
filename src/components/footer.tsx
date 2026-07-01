'use client'

import { useT } from '@/lib/i18n'
import Link from 'next/link'
import { Logo } from './logo'

const copy = {
  en: {
    taglinePre: 'The AI that makes you ',
    taglineWord: 'think',
    product: 'Product',
    resources: 'Resources',
    productLinks: [
      { href: '/challenges', label: 'Library' },
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/#metodo', label: 'How it works' },
    ],
  },
  pt: {
    taglinePre: 'A IA que te faz ',
    taglineWord: 'pensar',
    product: 'Produto',
    resources: 'Recursos',
    productLinks: [
      { href: '/challenges', label: 'Desafios' },
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/#metodo', label: 'Como funciona' },
    ],
  },
}

export function Footer() {
  const t = useT(copy)

  return (
    <footer className='mt-16 border-t border-border bg-paper'>
      <div className='container-main flex flex-col gap-12 py-14 md:flex-row md:justify-between'>
        <div className='max-w-xs space-y-3'>
          <Logo />
          <p className='text-sm text-muted-foreground'>
            {t.taglinePre}
            <span className='font-serif italic'>{t.taglineWord}</span>.
          </p>
        </div>

        <div className='grid grid-cols-2 gap-10 sm:gap-20'>
          <div className='space-y-4'>
            <p className='eyebrow'>{t.product}</p>
            <ul className='space-y-2.5'>
              {t.productLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className='text-sm text-muted-foreground transition-colors duration-200 hover:text-ink'
                  >
                    <span className='link-underline'>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className='space-y-4'>
            <p className='eyebrow'>{t.resources}</p>
            <ul className='space-y-2.5'>
              <li>
                <a
                  href='https://github.com/ProgramadoresSemPatria/HB01-2026_socratic-dev'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm text-muted-foreground transition-colors duration-200 hover:text-ink'
                >
                  <span className='link-underline'>GitHub</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className='border-t border-border'>
        <div className='container-main flex flex-col items-center gap-2 py-5 sm:flex-row sm:justify-between'>
          <span className='text-[13px] text-muted-foreground'>
            © 2026 Socratic.dev
          </span>
          <span className='font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase'>
            Hackathon Borderless — HB01
          </span>
        </div>
      </div>
    </footer>
  )
}
