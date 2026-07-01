'use client'

import { ArrowRight, Code2, Network } from 'lucide-react'
import Link from 'next/link'
import { useT } from '@/lib/i18n'
import { Reveal } from './reveal'
import { SectionBackdrop } from './section-backdrop'

const copy = {
  en: {
    eyebrow: 'Two modes',
    h2: 'Train what the market demands.',
    h2Accent: 'Thinking.',
    sub: 'Code or system design — same Socratic principle: the AI never hands it to you, it gets you there.',
    modes: [
      {
        icon: Code2,
        tag: null as string | null,
        fill: 'bg-pastel-mist',
        title: 'Code challenges',
        desc: 'A real Monaco editor, hidden tests, and a tutor that answers questions with questions. Solve it like you would at work — no cheating.',
        cta: 'Solve code',
        points: [
          'JavaScript & TypeScript',
          'From beginner to big tech level',
          'Runs the tests on the spot',
        ],
      },
      {
        icon: Network,
        tag: 'New',
        fill: 'bg-pastel-lavender',
        title: 'System design challenges',
        desc: 'Sketch the architecture on a canvas — services, databases, queues, and how the data flows. The AI sees your diagram and interrogates every decision.',
        cta: 'Design architecture',
        points: [
          'Built-in Excalidraw canvas',
          'Vision AI reads your architecture',
          'Data distribution, scale, and trade-offs',
        ],
      },
    ],
  },
  pt: {
    eyebrow: 'Dois modos',
    h2: 'Treine o que o mercado cobra.',
    h2Accent: 'Pensando.',
    sub: 'Código ou system design (arquitetura) — o mesmo princípio socrático: a IA nunca entrega pronto, ela te leva até lá.',
    modes: [
      {
        icon: Code2,
        tag: null as string | null,
        fill: 'bg-pastel-mist',
        title: 'Desafios de código',
        desc: 'Editor Monaco de verdade, testes escondidos e um tutor que responde pergunta com pergunta. Resolva como no trabalho — sem cola.',
        cta: 'Resolver código',
        points: [
          'JavaScript & TypeScript',
          'Do iniciante ao nível big tech',
          'Roda os testes na hora',
        ],
      },
      {
        icon: Network,
        tag: 'Novo',
        fill: 'bg-pastel-lavender',
        title: 'Desafios de system design',
        desc: 'Desenhe a arquitetura num canvas — serviços, bancos, filas e o fluxo dos dados. A IA enxerga seu diagrama e interroga cada decisão.',
        cta: 'Desenhar arquitetura',
        points: [
          'Canvas Excalidraw integrado',
          'IA com visão analisa a arquitetura',
          'Distribuição de dados, escala e trade-offs',
        ],
      },
    ],
  },
}

export function Modes() {
  const t = useT(copy)
  return (
    <section className='relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16 lg:py-24'>
      <SectionBackdrop variant='warm' />
      <div className='relative mx-auto max-w-[860px] text-center'>
        <Reveal>
          <p className='eyebrow'>{t.eyebrow}</p>
          <h2 className='type-h2 mt-4'>
            {t.h2}{' '}
            <span className='text-gradient-iris font-serif font-normal italic'>
              {t.h2Accent}
            </span>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className='type-body mx-auto mt-5 max-w-[600px]'>{t.sub}</p>
        </Reveal>
      </div>

      <div className='relative mx-auto mt-12 grid max-w-[980px] gap-4 lg:mt-16 lg:grid-cols-2'>
        {t.modes.map((m, i) => (
          <Reveal key={m.title} delay={i * 0.1} className='h-full'>
            <div
              className={`hover:shadow-soft-lg relative flex h-full flex-col rounded-lg p-7 transition-all duration-300 ease-out hover:-translate-y-[2px] sm:p-8 ${m.fill}`}
            >
              {m.tag && (
                <span className='absolute top-6 right-6 rounded-full bg-lime px-2.5 py-1 font-mono text-[10px] tracking-wider text-ink uppercase'>
                  {m.tag}
                </span>
              )}
              <div className='grid size-12 place-items-center rounded-full bg-white/60 text-ink'>
                <m.icon className='size-6' strokeWidth={1.5} />
              </div>
              <h3 className='type-h3 mt-5 text-2xl lg:text-[28px]'>{m.title}</h3>
              <p className='type-body mt-3'>{m.desc}</p>
              <ul className='mt-5 space-y-2'>
                {m.points.map((p) => (
                  <li
                    key={p}
                    className='flex items-center gap-2.5 text-sm text-aubergine'
                  >
                    <span className='size-1.5 shrink-0 rounded-full bg-primary' />
                    {p}
                  </li>
                ))}
              </ul>
              <Link
                href='/onboarding'
                className='group/cta mt-7 inline-flex cursor-pointer items-center gap-1.5 text-[15px] font-medium text-ink'
              >
                <span className='link-underline'>{m.cta}</span>
                <ArrowRight className='size-4 transition-transform group-hover/cta:translate-x-0.5' />
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
