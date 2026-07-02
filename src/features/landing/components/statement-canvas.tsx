'use client'

import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const copy = {
  en: {
    shortcut: {
      eyebrow: 'Shortcut',
      title: 'How you use AI today',
      steps: ['ask', 'AI spits it out', 'it works', 'forgot it'],
      footer: 'ship today · empty tomorrow',
    },
    retained: {
      eyebrow: 'Retained',
      title: 'How Socratic teaches you',
      steps: ['ask', 'why?', 'try it', 'got it'],
      footer: '+5 min of thinking · a career of returns',
    },
  },
  pt: {
    shortcut: {
      eyebrow: 'Atalho',
      title: 'Como você usa IA hoje',
      steps: ['pergunta', 'IA cospe', 'funciona', 'esqueci'],
      footer: 'ship hoje · vazio amanhã',
    },
    retained: {
      eyebrow: 'Retido',
      title: 'Como o Sócrates te ensina',
      steps: ['pergunta', 'por quê?', 'tenta', 'entendi'],
      footer: '+5 min de pensar · uma carreira de retorno',
    },
  },
}

export function StatementCanvas() {
  const t = useT(copy)
  return (
    <div className='mx-auto mt-10 grid w-full max-w-[880px] gap-4 px-4 text-left lg:grid-cols-2'>
      <ComparisonCard
        eyebrow={t.shortcut.eyebrow}
        title={t.shortcut.title}
        tone='stone'
        steps={t.shortcut.steps}
        footer={t.shortcut.footer}
      />
      <ComparisonCard
        eyebrow={t.retained.eyebrow}
        title={t.retained.title}
        tone='sage'
        steps={t.retained.steps}
        footer={t.retained.footer}
      />
    </div>
  )
}

function ComparisonCard({
  eyebrow,
  title,
  tone,
  steps,
  footer,
}: {
  eyebrow: string
  title: string
  tone: 'stone' | 'sage'
  steps: readonly string[]
  footer: string
}) {
  const dead = tone === 'stone'
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-lg p-6',
        dead ? 'bg-pastel-stone/60' : 'bg-pastel-sage',
      )}
    >
      {dead ? (
        <p className='eyebrow mb-4'>{eyebrow}</p>
      ) : (
        <p className='bg-lime text-ink mb-4 w-fit rounded-full px-2.5 py-1 font-mono text-[10px] font-medium tracking-[0.14em] uppercase'>
          {eyebrow}
        </p>
      )}
      <h3 className='type-h4 mb-5'>{title}</h3>
      <ol className='flex flex-col gap-2'>
        {steps.map((step, i) => (
          <li
            key={step}
            className={cn(
              'flex items-baseline gap-3 text-[15px]',
              dead ? 'text-aubergine/70' : 'text-aubergine',
            )}
          >
            <span className='font-mono text-[11px] tracking-wider text-muted-foreground'>
              0{i + 1}
            </span>
            <span aria-hidden className={dead ? 'text-ink/25' : 'text-mint'}>
              →
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className='mt-auto pt-5'>
        <p
          className={cn(
            'border-ink/10 border-t pt-4 font-mono text-[11px] tracking-wide',
            dead ? 'text-muted-foreground' : 'text-mint',
          )}
        >
          {footer}
        </p>
      </div>
    </div>
  )
}
