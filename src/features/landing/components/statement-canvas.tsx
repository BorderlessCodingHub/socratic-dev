'use client'

import { cn } from '@/lib/utils'
import { ArrowRight, Brain, Zap } from 'lucide-react'

export function StatementCanvas() {
  return (
    <div className='mx-auto mt-14 grid w-full max-w-[940px] gap-4 px-4 lg:mt-16 lg:grid-cols-2'>
      <ComparisonCard
        eyebrow='Atalho'
        eyebrowAccent='red'
        icon={<Zap className='size-4' strokeWidth={1.5} />}
        title='Como você usa IA hoje'
        steps={[
          { emoji: '🤔', label: 'pergunta' },
          { emoji: '🤖', label: 'IA cospe' },
          { emoji: '✓', label: 'funciona' },
          { emoji: '💤', label: 'esqueci', accent: 'red' },
        ]}
        footer='ship hoje · vazio amanhã'
      />
      <ComparisonCard
        eyebrow='Retido'
        eyebrowAccent='emerald'
        icon={<Brain className='size-4' strokeWidth={1.5} />}
        title='Como o Sócrates te ensina'
        steps={[
          { emoji: '🤔', label: 'pergunta' },
          { emoji: '❓', label: 'por quê?' },
          { emoji: '💭', label: 'tenta' },
          { emoji: '💡', label: 'entendi', accent: 'emerald' },
        ]}
        footer='+5 min de pensar · uma carreira de retorno'
      />
    </div>
  )
}

type Step = {
  emoji: string
  label: string
  accent?: 'red' | 'emerald'
}

function ComparisonCard({
  eyebrow,
  eyebrowAccent,
  icon,
  title,
  steps,
  footer,
}: {
  eyebrow: string
  eyebrowAccent: 'red' | 'emerald'
  icon: React.ReactNode
  title: string
  steps: Step[]
  footer: string
}) {
  return (
    <div className='shadow-soft relative flex h-full flex-col rounded-2xl border border-[#DFE5E9] bg-white p-6 text-left sm:p-7'>
      <div className='mb-5 flex items-center justify-between'>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wider uppercase',
            eyebrowAccent === 'red'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700',
          )}
        >
          {eyebrow}
        </span>
        <span className='grid size-9 place-items-center rounded-xl bg-[#dad8ea]/55 text-[#1b1916]'>
          {icon}
        </span>
      </div>

      <h3 className='font-heading mb-5 text-[18px] font-medium tracking-tight text-[#1b1916]'>
        {title}
      </h3>

      <div className='flex flex-wrap items-center gap-x-1.5 gap-y-2'>
        {steps.map((s, i) => (
          <span key={i} className='inline-flex items-center gap-1.5'>
            <Pill accent={s.accent}>
              <span className='text-[15px] leading-none'>{s.emoji}</span>
              <span>{s.label}</span>
            </Pill>
            {i < steps.length - 1 && (
              <ArrowRight className='size-3.5 shrink-0 text-[#6b6478]' />
            )}
          </span>
        ))}
      </div>

      <p className='mt-auto pt-6 font-mono text-[11px] tracking-wide text-[#6b6478]'>
        {footer}
      </p>
    </div>
  )
}

function Pill({
  children,
  accent,
}: {
  children: React.ReactNode
  accent?: 'red' | 'emerald'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 text-[13px] text-[#1b1916]',
        accent === 'red'
          ? 'border-red-200 bg-red-50/60 text-red-800'
          : accent === 'emerald'
            ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800'
            : 'border-[#DFE5E9]',
      )}
    >
      {children}
    </span>
  )
}
