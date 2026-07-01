'use client'

import { useT } from '@/lib/i18n'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Reveal } from './reveal'

const copy = {
  en: {
    eyebrow: 'For every kind of challenge',
    title: 'A training ground, not a tutorial.',
    cta: 'Start training',
    soon: 'Coming soon',
    arenas: {
      api: {
        eyebrow: 'REST · GraphQL · Schema',
        title: 'APIs & data modeling',
        desc: 'Design endpoints, queries and schema under the real constraints of a fictional client. The tutor questions every contract decision before accepting — you defend the design, not just the code.',
      },
      ui: {
        eyebrow: 'State · Components · Edge cases',
        title: 'Real-world interfaces',
        desc: 'State, composition and the edge cases no tutorial shows you — without pasting the first answer from a chat.',
      },
      algo: {
        eyebrow: 'Big-O · Structures · Trade-offs',
        title: 'Structures & complexity',
        desc: 'You justify your O(n) choice and your data structure before the tutor accepts the solution.',
      },
      debug: {
        eyebrow: 'Stack trace · Root cause · Hypotheses',
        title: 'Guided bug hunt',
        desc: 'Questions that walk you to the root cause, instead of dumping an already-solved stack trace.',
      },
      design: {
        eyebrow: 'Architecture · Trade-offs · Scale',
        title: 'System design on canvas',
        desc: 'Sketch the architecture in Excalidraw. The AI sees your diagram and interrogates every scaling decision.',
      },
    },
  },
  pt: {
    eyebrow: 'Para todo tipo de desafio',
    title: 'Um campo de treino, não um tutorial.',
    cta: 'Começar a treinar',
    soon: 'Em breve',
    arenas: {
      api: {
        eyebrow: 'REST · GraphQL · Schema',
        title: 'APIs e modelagem de dados',
        desc: 'Projete endpoints, queries e schema sob as restrições reais de um cliente fictício. O tutor questiona cada decisão de contrato antes de aceitar — você defende o design, não só o código.',
      },
      ui: {
        eyebrow: 'Estado · Componentes · Edge-cases',
        title: 'Interfaces de verdade',
        desc: 'Estado, composição e os edge-cases que ninguém mostra no tutorial — sem colar a primeira resposta do chat.',
      },
      algo: {
        eyebrow: 'Big-O · Estruturas · Trade-offs',
        title: 'Estruturas e complexidade',
        desc: 'Você justifica sua escolha de O(n) e a estrutura de dados antes de o tutor aceitar a solução.',
      },
      debug: {
        eyebrow: 'Stack trace · Causa raiz · Hipóteses',
        title: 'Caça ao bug guiada',
        desc: 'Perguntas que te levam à causa raiz, em vez de despejar o stack trace já resolvido.',
      },
      design: {
        eyebrow: 'Arquitetura · Trade-offs · Escala',
        title: 'System design no canvas',
        desc: 'Desenhe a arquitetura no Excalidraw. A IA enxerga seu diagrama e interroga cada decisão de escala.',
      },
    },
  },
} as const

type Shape =
  | { kind: 'path'; d: string; o?: number }
  | { kind: 'dot'; cx: number; cy: number; r: number; o?: number }

type ArenaKey = 'api' | 'ui' | 'algo' | 'debug' | 'design'

type Arena = {
  key: ArenaKey
  href: string
  fill: string
  soon?: boolean
  shapes: Shape[]
}

const arenas: Arena[] = [
  {
    key: 'api',
    href: '/onboarding',
    fill: 'bg-pastel-greige',
    shapes: [
      { kind: 'path', d: 'M120 80h180M120 140h180M120 200h180', o: 0.5 },
      { kind: 'dot', cx: 120, cy: 80, r: 7, o: 0.4 },
      { kind: 'dot', cx: 120, cy: 140, r: 7, o: 0.4 },
      { kind: 'dot', cx: 120, cy: 200, r: 7, o: 0.4 },
      { kind: 'path', d: 'M300 56h150a14 14 0 0 1 14 14v160a14 14 0 0 1-14 14H300a14 14 0 0 1-14-14V70a14 14 0 0 1 14-14Z', o: 0.55 },
      { kind: 'path', d: 'M330 96h90M330 126h64M330 156h78M330 186h50', o: 0.4 },
      { kind: 'path', d: 'M464 140h106', o: 0.5 },
      { kind: 'path', d: 'M622 140a26 26 0 1 1-52 0 26 26 0 0 1 52 0Z', o: 0.55 },
      { kind: 'path', d: 'M588 140h16M596 132v16', o: 0.5 },
    ],
  },
  {
    key: 'ui',
    href: '/onboarding',
    fill: 'bg-pastel-sage',
    shapes: [
      { kind: 'path', d: 'M104 60h272a14 14 0 0 1 14 14v172a14 14 0 0 1-14 14H104a14 14 0 0 1-14-14V74a14 14 0 0 1 14-14Z', o: 0.55 },
      { kind: 'path', d: 'M90 104h300', o: 0.45 },
      { kind: 'dot', cx: 116, cy: 82, r: 5, o: 0.5 },
      { kind: 'dot', cx: 138, cy: 82, r: 5, o: 0.5 },
      { kind: 'path', d: 'M128 136h94a8 8 0 0 1 8 8v48a8 8 0 0 1-8 8h-94a8 8 0 0 1-8-8v-48a8 8 0 0 1 8-8Z', o: 0.45 },
      { kind: 'path', d: 'M258 136h94a8 8 0 0 1 8 8v78a8 8 0 0 1-8 8h-94a8 8 0 0 1-8-8v-78a8 8 0 0 1 8-8Z', o: 0.45 },
      { kind: 'path', d: 'M434 120h152a14 14 0 0 1 14 14v92a14 14 0 0 1-14 14H434a14 14 0 0 1-14-14v-92a14 14 0 0 1 14-14Z', o: 0.55 },
      { kind: 'path', d: 'M450 156h120M450 184h84', o: 0.4 },
      { kind: 'path', d: 'M520 268l14 34 10-14 17 8', o: 0.6 },
    ],
  },
  {
    key: 'algo',
    href: '/onboarding',
    fill: 'bg-pastel-mist',
    shapes: [
      { kind: 'path', d: 'M110 280V70M110 280h480', o: 0.55 },
      { kind: 'path', d: 'M110 278c140 0 260-8 470-180', o: 0.6 },
      { kind: 'path', d: 'M110 278c90-6 180-70 240-200', o: 0.35 },
      { kind: 'path', d: 'M110 278c180-2 360-24 470-60', o: 0.35 },
      { kind: 'dot', cx: 350, cy: 196, r: 6, o: 0.45 },
      { kind: 'path', d: 'M470 90h96M470 120h64', o: 0.4 },
    ],
  },
  {
    key: 'debug',
    href: '/onboarding',
    fill: 'bg-pastel-sand',
    soon: true,
    shapes: [
      { kind: 'path', d: 'M100 90l90 60-50 60 110 30-40 60', o: 0.55 },
      { kind: 'path', d: 'M490 170a70 70 0 1 1-140 0 70 70 0 0 1 140 0Z', o: 0.5 },
      { kind: 'path', d: 'M456 170a36 36 0 1 1-72 0 36 36 0 0 1 72 0Z', o: 0.4 },
      { kind: 'path', d: 'M420 84v40M420 216v40M334 170h40M466 170h40', o: 0.5 },
      { kind: 'dot', cx: 420, cy: 170, r: 7, o: 0.5 },
    ],
  },
  {
    key: 'design',
    href: '/onboarding',
    fill: 'bg-pastel-lavender',
    shapes: [
      { kind: 'path', d: 'M120 70h100a10 10 0 0 1 10 10v44a10 10 0 0 1-10 10H120a10 10 0 0 1-10-10V80a10 10 0 0 1 10-10Z', o: 0.55 },
      { kind: 'path', d: 'M120 210h100a10 10 0 0 1 10 10v44a10 10 0 0 1-10 10H120a10 10 0 0 1-10-10v-44a10 10 0 0 1 10-10Z', o: 0.55 },
      { kind: 'path', d: 'M330 140h100a10 10 0 0 1 10 10v44a10 10 0 0 1-10 10H330a10 10 0 0 1-10-10v-44a10 10 0 0 1 10-10Z', o: 0.55 },
      { kind: 'path', d: 'M612 150a52 20 0 1 1-104 0 52 20 0 0 1 104 0Z', o: 0.55 },
      { kind: 'path', d: 'M508 150v60c0 11 23 20 52 20s52-9 52-20v-60', o: 0.45 },
      { kind: 'path', d: 'M230 102c40 10 60 40 90 56M230 242c40-10 60-40 90-56M440 172h68', o: 0.5 },
    ],
  },
]

function Motif({ shapes, active }: { shapes: Shape[]; active: boolean }) {
  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out ${active ? 'opacity-60' : 'opacity-[0.13]'}`}
      animate={active ? { y: [0, -6, 0] } : { y: 0 }}
      transition={
        active
          ? { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }
          : { duration: 0.3 }
      }
    >
      <svg
        key={active ? 'draw' : 'idle'}
        viewBox='0 0 700 360'
        fill='none'
        aria-hidden
        className='text-ink absolute -top-6 left-0 h-[300px] w-[640px] max-w-none mix-blend-multiply'
        strokeWidth='1.2'
        stroke='currentColor'
      >
        {shapes.map((s, i) =>
          s.kind === 'path' ? (
            <motion.path
              key={i}
              d={s.d}
              opacity={s.o ?? 0.5}
              initial={active ? { pathLength: 0 } : false}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1.1,
                delay: 0.15 + i * 0.09,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          ) : (
            <motion.circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill='currentColor'
              stroke='none'
              opacity={s.o ?? 0.5}
              initial={active ? { scale: 0, opacity: 0 } : false}
              animate={{ scale: 1, opacity: s.o ?? 0.5 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.09 }}
            />
          ),
        )}
      </svg>
    </motion.div>
  )
}

function Arrow() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      aria-hidden
      className='shrink-0 transition-transform duration-200 group-hover/link:translate-x-0.5'
    >
      <path
        d='M3 8h10M9 4l4 4-4 4'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export function UseCases() {
  const t = useT(copy)
  const [active, setActive] = useState(0)

  const columns = arenas
    .map((_, i) => (i === active ? '4fr' : '1fr'))
    .join(' ')

  return (
    <section className='relative overflow-hidden px-6 py-16 sm:px-10 lg:px-16 lg:py-24'>
      <Reveal>
        <p className='eyebrow'>{t.eyebrow}</p>
        <h2 className='type-h2 mt-4 max-w-[680px]'>{t.title}</h2>
      </Reveal>

      <Reveal>
        <div
          className='mt-[60px] hidden gap-4 transition-[grid-template-columns] duration-500 ease-out lg:grid'
          style={{ gridTemplateColumns: columns }}
        >
          {arenas.map((arena, i) => {
            const isActive: boolean = i === active
            const at = t.arenas[arena.key]
            const cardClass = `group group/link focus-visible:ring-ink/30 relative block h-[460px] overflow-hidden rounded-lg transition-all duration-500 ease-out focus:outline-none focus-visible:ring-2 ${arena.fill}`
            const inner = (
              <>
                <Motif shapes={arena.shapes} active={isActive} />

                <div
                  className={`pointer-events-none absolute bottom-[14px] left-[42px] transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-100'}`}
                  style={{
                    transformOrigin: 'left bottom',
                    transform: 'rotate(-90deg)',
                  }}
                >
                  <h3 className='text-ink font-heading text-[26px] font-light whitespace-nowrap xl:text-[30px]'>
                    {at.title}
                  </h3>
                </div>

                <div
                  className={`absolute bottom-6 left-6 flex w-[min(500px,calc(100%-48px))] flex-col gap-[14px] transition-opacity duration-300 ${
                    isActive
                      ? 'opacity-100 delay-200'
                      : 'pointer-events-none opacity-0'
                  }`}
                >
                  <p className='eyebrow text-ink/60'>{at.eyebrow}</p>
                  <h3 className='text-ink font-heading text-[28px] leading-[1.05] font-light xl:text-[36px]'>
                    {at.title}
                  </h3>
                  <p className='text-ink max-w-[480px] text-[16px] leading-[1.34] tracking-[-0.18px] xl:text-[17px]'>
                    {at.desc}
                  </p>
                  {arena.soon ? (
                    <span className='bg-ink/8 text-ink mt-1 w-fit rounded-full px-3 py-1.5 font-mono text-[11px] font-medium tracking-[0.14em] uppercase'>
                      {t.soon}
                    </span>
                  ) : (
                    <span className='text-ink -mt-1 inline-flex w-fit items-center gap-1.5 py-2 text-base font-medium tracking-[-0.12px]'>
                      <span className='link-underline'>{t.cta}</span>
                      <Arrow />
                    </span>
                  )}
                </div>
              </>
            )

            return arena.soon ? (
              <div
                key={arena.key}
                onMouseEnter={() => setActive(i)}
                className={`${cardClass} cursor-default`}
              >
                {inner}
              </div>
            ) : (
              <Link
                key={arena.key}
                href={arena.href}
                aria-label={at.title}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={cardClass}
              >
                {inner}
              </Link>
            )
          })}
        </div>
      </Reveal>

      <div className='mt-10 flex flex-col gap-4 lg:hidden'>
        {arenas.map((arena) => {
          const at = t.arenas[arena.key]
          const body = (
            <>
              <div className='opacity-[0.12]'>
                <Motif shapes={arena.shapes} active={false} />
              </div>
              <div className='relative flex flex-col gap-3'>
                <p className='eyebrow text-ink/60'>{at.eyebrow}</p>
                <h3 className='text-ink font-heading text-[24px] leading-[1.1] font-light'>
                  {at.title}
                </h3>
                <p className='text-ink text-[15px] leading-[1.4] tracking-[-0.18px]'>
                  {at.desc}
                </p>
                {arena.soon ? (
                  <span className='bg-ink/8 text-ink w-fit rounded-full px-3 py-1.5 font-mono text-[10px] font-medium tracking-[0.14em] uppercase'>
                    {t.soon}
                  </span>
                ) : (
                  <span className='text-ink inline-flex w-fit items-center gap-1.5 py-1 text-[15px] font-medium'>
                    <span className='link-underline'>{t.cta}</span>
                    <Arrow />
                  </span>
                )}
              </div>
            </>
          )
          return arena.soon ? (
            <div
              key={arena.key}
              className={`relative block overflow-hidden rounded-lg p-6 ${arena.fill}`}
            >
              {body}
            </div>
          ) : (
            <Reveal key={arena.key}>
              <Link
                href={arena.href}
                className={`group group/link relative block overflow-hidden rounded-lg p-6 ${arena.fill}`}
              >
                {body}
              </Link>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
