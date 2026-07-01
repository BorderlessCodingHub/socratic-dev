'use client'

import { useT, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { ArrowRight, Check } from 'lucide-react'
import { motion } from 'motion/react'
import * as React from 'react'
import { Reveal } from './reveal'

const copy = {
  en: {
    loopEyebrow: 'The Socratic loop',
    loopTitle: 'You get stuck. It asks. You think.',
    loopBody:
      'Instead of dumping the solution, the tutor returns the right question at the right time — nudging you to the next step without giving away the destination.',
    bullets: [
      'Questions aimed at the concept, not the syntax',
      'Hints that escalate only when you ask',
      'Every bit of help recorded in your score',
    ],
    file: 'bakery-api.ts',
    tutorTab: 'Socratic tutor',
    placeholder: 'Think first, then ask',
    scoreEyebrow: 'Measurable independence',
    scoreTitle: 'How much you solved on your own — as a number.',
    scoreBody:
      'Every challenge ends with an independence score. Asked for three hints? It drops. Solved it cold? It climbs. Progress you cannot outsource to the AI.',
    scoreLabel: 'Independence score',
    trend: '▲ 12 this week',
    bars: ['APIs', 'Front-end', 'Algorithms', 'Debugging'],
    sessions: 'last 30 days · 14 sessions',
  },
  pt: {
    loopEyebrow: 'O loop socrático',
    loopTitle: 'Você trava. Ele pergunta. Você pensa.',
    loopBody:
      'Em vez de despejar a solução, o tutor devolve a pergunta certa no momento certo — te empurrando para o próximo passo sem entregar o destino.',
    bullets: [
      'Perguntas que miram o conceito, não a sintaxe',
      'Hints que escalam só quando você pede',
      'Cada ajuda registrada no seu score',
    ],
    file: 'api-padaria.ts',
    tutorTab: 'Tutor socrático',
    placeholder: 'Pense, depois pergunte',
    scoreEyebrow: 'Independência medível',
    scoreTitle: 'O quanto você resolveu sozinho, em número.',
    scoreBody:
      'Cada desafio fecha com um score de independência. Pediu três hints? O número cai. Resolveu no seco? Ele sobe. Progresso que você não consegue terceirizar para a IA.',
    scoreLabel: 'Score de independência',
    trend: '▲ 12 esta semana',
    bars: ['APIs', 'Front-end', 'Algoritmos', 'Debugging'],
    sessions: 'últimos 30 dias · 14 sessões',
  },
} as const

const CHAT: Record<
  Locale,
  { from: 'user' | 'tutor'; text: React.ReactNode }[]
> = {
  en: [
    { from: 'user', text: 'How do I filter only products expiring in 3 days?' },
    {
      from: 'tutor',
      text: (
        <>
          Before you code — what data structure does{' '}
          <code className='text-primary font-mono'>findAll()</code> return?
        </>
      ),
    },
    { from: 'user', text: 'an array of objects' },
    {
      from: 'tutor',
      text: 'Exactly. And which array method filters by a condition?',
    },
  ],
  pt: [
    { from: 'user', text: 'Como filtro só os produtos que vencem em 3 dias?' },
    {
      from: 'tutor',
      text: (
        <>
          Antes de codar — que estrutura de dados o{' '}
          <code className='text-primary font-mono'>findAll()</code> te devolve?
        </>
      ),
    },
    { from: 'user', text: 'um array de objetos' },
    {
      from: 'tutor',
      text: 'Exato. E qual método de array filtra por uma condição?',
    },
  ],
}

export function Showcase() {
  const t = useT(copy)

  return (
    <section className='space-y-4 p-3 md:space-y-6 md:p-6'>
      <Reveal>
        <div className='bg-pastel-lilac/45 rounded-lg px-5 pt-10 pb-5 sm:px-8 sm:pt-12 lg:px-12 lg:pt-14 lg:pb-8'>
          <div className='mb-10 grid gap-6 lg:mb-12 lg:grid-cols-[1fr_420px] lg:items-end lg:gap-16'>
            <div>
              <p className='eyebrow'>{t.loopEyebrow}</p>
              <h2 className='type-h2 mt-4 max-w-[560px]'>{t.loopTitle}</h2>
            </div>
            <div>
              <p className='type-body'>{t.loopBody}</p>
              <ul className='mt-5 space-y-2.5'>
                {t.bullets.map((b) => (
                  <li
                    key={b}
                    className='text-aubergine flex items-start gap-2.5 text-[15px] tracking-[-0.18px]'
                  >
                    <span className='bg-ink mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full text-white'>
                      <Check className='size-2.5' strokeWidth={3} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <WorkspaceWindow />
        </div>
      </Reveal>

      <Reveal>
        <div className='bg-pastel-mist/50 rounded-lg px-5 pt-10 pb-5 sm:px-8 sm:pt-12 lg:px-12 lg:pt-14 lg:pb-8'>
          <div className='mb-10 grid gap-6 lg:mb-12 lg:grid-cols-[1fr_420px] lg:items-end lg:gap-16'>
            <div>
              <p className='eyebrow'>{t.scoreEyebrow}</p>
              <h2 className='type-h2 mt-4 max-w-[620px]'>{t.scoreTitle}</h2>
            </div>
            <p className='type-body'>{t.scoreBody}</p>
          </div>
          <ScoreBoard />
        </div>
      </Reveal>
    </section>
  )
}

const CODE: { indent: number; parts: [string, string][] }[] = [
  { indent: 0, parts: [['kw', 'const'], ['pl', ' products = '], ['kw', 'await'], ['pl', ' repo.findAll()']] },
  { indent: 0, parts: [['cm', '// TODO: only items expiring in 3 days']] },
  { indent: 0, parts: [['kw', 'const'], ['pl', ' soon = products.'], ['fn', 'filter'], ['pl', '((p) => {']] },
  { indent: 1, parts: [['kw', 'const'], ['pl', ' days = daysUntil(p.'], ['pl', 'expiresAt'], ['pl', ')']] },
  { indent: 1, parts: [['kw', 'return'], ['pl', ' days <= '], ['nm', '3']] },
  { indent: 0, parts: [['pl', '})']] },
]

const TONE: Record<string, string> = {
  kw: 'text-primary',
  fn: 'text-mint',
  nm: 'text-ember',
  cm: 'text-muted-foreground/70',
  pl: 'text-aubergine',
}

const CHAT_CYCLE_MS = 9000

function WorkspaceWindow() {
  const t = useT(copy)
  const chat = useT(CHAT)
  const [tick, setTick] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), CHAT_CYCLE_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className='shadow-soft-lg border-border overflow-hidden rounded-lg border bg-white'>
      <div className='border-border bg-muted flex items-center gap-2 border-b px-4 py-3'>
        <span className='bg-pastel-stone size-2.5 rounded-full' />
        <span className='bg-pastel-sand size-2.5 rounded-full' />
        <span className='bg-pastel-sage size-2.5 rounded-full' />
        <span className='text-muted-foreground flex-1 text-center font-mono text-[11px]'>
          {t.file}
        </span>
      </div>
      <div className='grid lg:grid-cols-[1fr_380px]'>
        <div className='border-border hidden border-r p-5 font-mono text-[12.5px] leading-[1.9] lg:block'>
          {CODE.map((line, i) => (
            <div key={i} className='flex'>
              <span className='text-muted-foreground/40 w-7 shrink-0 select-none'>
                {i + 1}
              </span>
              <span style={{ paddingLeft: line.indent * 16 }}>
                {line.parts.map(([tone, text], j) => (
                  <span key={j} className={TONE[tone]}>
                    {text}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
        <div className='flex flex-col'>
          <div className='border-border text-muted-foreground border-b px-4 py-2 font-mono text-[10px] tracking-[0.14em] uppercase'>
            {t.tutorTab}
          </div>
          <div key={tick} className='flex-1 space-y-3 p-4 text-[13px]'>
            {chat.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3 + i * 1.05,
                  duration: 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={cn(
                  'flex',
                  m.from === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'rounded-2xl px-3 py-2',
                    m.from === 'user'
                      ? 'bg-ink max-w-[80%] rounded-br-md text-white'
                      : 'border-primary/20 bg-pastel-lilac/50 text-aubergine max-w-[88%] rounded-bl-md border',
                  )}
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + chat.length * 1.05, duration: 0.4 }}
            className='flex items-center gap-2 p-4 pt-0'
          >
            <div className='border-border bg-muted text-muted-foreground flex h-9 flex-1 items-center gap-1 rounded-full border px-3.5 text-[12px]'>
              {t.placeholder}
              <span className='bg-ink/40 ml-0.5 inline-block h-3.5 w-[1.5px] animate-pulse' />
            </div>
            <div className='bg-primary grid size-9 shrink-0 place-items-center rounded-full'>
              <ArrowRight className='size-3.5 text-white' />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function ScoreBoard() {
  const t = useT(copy)
  const bars = [82, 64, 48, 71]

  return (
    <div className='shadow-soft-lg border-border overflow-hidden rounded-lg border bg-white'>
      <div className='grid lg:grid-cols-[380px_1fr]'>
        <div className='border-border flex flex-col justify-between gap-8 border-b p-6 sm:p-8 lg:border-r lg:border-b-0'>
          <div>
            <div className='eyebrow'>{t.scoreLabel}</div>
            <div className='font-heading text-ink mt-3 text-[88px] leading-none font-light tracking-[-4px] sm:text-[112px]'>
              73
              <span className='text-muted-foreground text-[32px] tracking-[-1px] sm:text-[40px]'>
                /100
              </span>
            </div>
          </div>
          <div className='flex items-center gap-3'>
            <span className='bg-lime text-ink rounded-full px-3 py-1 font-mono text-[11px] font-medium'>
              {t.trend}
            </span>
            <span className='text-muted-foreground font-mono text-[11px]'>
              {t.sessions}
            </span>
          </div>
        </div>
        <div className='space-y-5 p-6 sm:p-8'>
          {t.bars.map((label, i) => (
            <div key={label}>
              <div className='text-muted-foreground mb-1.5 flex justify-between font-mono text-[11px]'>
                <span className='tracking-[0.1em] uppercase'>{label}</span>
                <span>{bars[i]}%</span>
              </div>
              <div className='bg-muted h-2 overflow-hidden rounded-full'>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${bars[i]}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.9,
                    delay: i * 0.1,
                    ease: 'easeOut',
                  }}
                  className='bg-primary h-full rounded-full'
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
