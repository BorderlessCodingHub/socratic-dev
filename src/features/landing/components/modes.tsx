'use client'

import { cn } from '@/lib/utils'
import { ArrowRight, Check, Code2, Network, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import * as React from 'react'
import { Reveal } from './reveal'

export function Modes() {
  return (
    <section className='px-6 py-16 sm:px-10 lg:px-16 lg:py-24'>
      <div className='mx-auto max-w-[860px] text-center'>
        <Reveal>
          <span className='text-[13px] font-semibold tracking-[0.08em] text-[#6b6478] uppercase'>
            Dois modos
          </span>
          <h2 className='type-h2 mt-4'>
            Treine o que o mercado cobra.{' '}
            <span className='text-gradient font-serif font-normal italic'>
              Pensando.
            </span>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className='type-body mx-auto mt-5 max-w-[600px]'>
            Código ou system design (arquitetura) — o mesmo princípio
            socrático: a IA nunca entrega pronto, ela te leva até lá.
          </p>
        </Reveal>
      </div>

      <div className='mx-auto mt-12 grid max-w-[980px] gap-4 lg:mt-16 lg:grid-cols-2'>
        <Reveal className='h-full'>
          <ModeCard
            preview={<CodePreview />}
            icon={Code2}
            title='Desafios de código'
            desc='Editor Monaco de verdade, testes escondidos e um tutor que responde pergunta com pergunta. Resolva como no trabalho — sem cola.'
            points={[
              'JavaScript & TypeScript',
              'Do iniciante ao nível big tech',
              'Roda os testes na hora',
            ]}
            cta='Resolver código'
          />
        </Reveal>
        <Reveal delay={0.1} className='h-full'>
          <ModeCard
            preview={<DesignPreview />}
            icon={Network}
            tag='Novo'
            title='Desafios de system design'
            desc='Desenhe a arquitetura num canvas — serviços, bancos, filas e o fluxo dos dados. A IA enxerga seu diagrama e interroga cada decisão.'
            points={[
              'Canvas Excalidraw integrado',
              'IA com visão analisa a arquitetura',
              'Distribuição de dados, escala e trade-offs',
            ]}
            cta='Desenhar arquitetura'
          />
        </Reveal>
      </div>
    </section>
  )
}

function ModeCard({
  preview,
  icon: Icon,
  tag,
  title,
  desc,
  points,
  cta,
}: {
  preview: React.ReactNode
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  tag?: string
  title: string
  desc: string
  points: string[]
  cta: string
}) {
  return (
    <div className='shadow-soft hover:shadow-soft-lg group/card relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#DFE5E9] bg-white transition-shadow'>
      <div className='relative overflow-hidden border-b border-[#DFE5E9] bg-[#F7F9FA]'>
        {preview}
      </div>
      <div className='flex flex-1 flex-col p-7 sm:p-8'>
        {tag && (
          <span className='absolute top-4 right-4 z-10 rounded-full bg-iris/10 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider text-iris uppercase'>
            {tag}
          </span>
        )}
        <div className='grid size-12 place-items-center rounded-xl bg-[#dad8ea]/55 text-[#1b1916]'>
          <Icon className='size-6' strokeWidth={1.5} />
        </div>
        <h3 className='type-h3 mt-5 text-2xl lg:text-[28px]'>{title}</h3>
        <p className='type-body mt-3'>{desc}</p>
        <ul className='mt-5 space-y-2'>
          {points.map((p) => (
            <li
              key={p}
              className='flex items-center gap-2.5 text-sm text-[#2c2330]'
            >
              <span className='size-1.5 shrink-0 rounded-full bg-iris' />
              {p}
            </li>
          ))}
        </ul>
        <Link
          href='/onboarding'
          className='group/cta mt-7 inline-flex cursor-pointer items-center gap-1.5 text-[15px] font-medium text-iris'
        >
          {cta}
          <ArrowRight className='size-4 transition-transform group-hover/cta:translate-x-0.5' />
        </Link>
      </div>
    </div>
  )
}

// ─── Code preview: typing + tests passing ────────────────────────────────────

const CODE_LINES = [
  'export function findActive(users) {',
  '  return users.filter(u =>',
  '    u.lastSeen > Date.now() - DAY',
  '  )',
  '}',
]

const CYCLE_MS = 6800

function CodePreview() {
  const [tick, setTick] = React.useState(0)

  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), CYCLE_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className='relative h-[200px] px-6 pt-6 pb-4'>
      <Window dots>
        <div className='flex h-full flex-col gap-3 px-4 py-3'>
          <div
            key={`code-${tick}`}
            className='flex-1 font-mono text-[11.5px] leading-[1.55] text-[#cdd1dc]'
          >
            {CODE_LINES.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.35 + i * 0.45,
                  duration: 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className='whitespace-pre'
              >
                <span className='mr-3 inline-block w-4 text-right text-[#5b6271]'>
                  {i + 1}
                </span>
                <Highlight line={line} />
              </motion.div>
            ))}
          </div>
          <TestBar key={`bar-${tick}`} />
        </div>
      </Window>
    </div>
  )
}

function Highlight({ line }: { line: string }) {
  const tokens = line.split(/(\bexport\b|\bfunction\b|\breturn\b|\(|\)|\{|\})/)
  return (
    <>
      {tokens.map((t, i) => {
        if (t === 'export' || t === 'function' || t === 'return') {
          return (
            <span key={i} className='text-[#c9a4ff]'>
              {t}
            </span>
          )
        }
        if (t === '(' || t === ')' || t === '{' || t === '}') {
          return (
            <span key={i} className='text-[#9aa2b3]'>
              {t}
            </span>
          )
        }
        return <span key={i}>{t}</span>
      })}
    </>
  )
}

function TestBar() {
  const [phase, setPhase] = React.useState<0 | 1 | 2 | 3>(0)
  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 3200)
    const t2 = setTimeout(() => setPhase(2), 4200)
    const t3 = setTimeout(() => setPhase(3), 5200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div className='flex items-center justify-between rounded-md bg-[#0c0e14] px-3 py-2 font-mono text-[10.5px] text-[#9aa2b3]'>
      <span className='flex items-center gap-1.5'>
        <span className='text-[#5b6271]'>›</span> npm test
      </span>
      <div className='flex items-center gap-1.5'>
        {[1, 2, 3].map((i) => (
          <Dot key={i} state={phase >= i ? 'pass' : phase === 0 ? 'idle' : 'run'} />
        ))}
        {phase === 3 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className='ml-2 text-emerald-400'
          >
            3/3 ✓
          </motion.span>
        )}
      </div>
    </div>
  )
}

function Dot({ state }: { state: 'idle' | 'run' | 'pass' }) {
  return (
    <span
      className={cn(
        'size-2 rounded-full transition-colors duration-300',
        state === 'pass'
          ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
          : state === 'run'
            ? 'animate-pulse bg-amber-400'
            : 'bg-[#3a3f4d]',
      )}
    />
  )
}

// ─── Design preview: nodes + arrows + AI analyzing ──────────────────────────

const DESIGN_CYCLE_MS = 7400

function DesignPreview() {
  const [tick, setTick] = React.useState(0)

  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), DESIGN_CYCLE_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className='relative h-[200px] px-6 pt-6 pb-4'>
      <Window theme='light'>
        <div className='relative h-full px-3 py-3'>
          <DesignScene key={tick} />
        </div>
      </Window>
    </div>
  )
}

type NodeDef = {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: string
  emoji: string
  shape: 'rect' | 'ellipse' | 'diamond'
  bg: string
  delay: number
}

const NODES: NodeDef[] = [
  {
    id: 'client',
    x: 32,
    y: 2,
    w: 36,
    h: 22,
    label: 'Cliente',
    emoji: '👤',
    shape: 'ellipse',
    bg: '#e7f0ff',
    delay: 0.3,
  },
  {
    id: 'api',
    x: 32,
    y: 38,
    w: 36,
    h: 22,
    label: 'API',
    emoji: '⚙️',
    shape: 'rect',
    bg: '#f1f0fb',
    delay: 1.0,
  },
  {
    id: 'cache',
    x: 13,
    y: 74,
    w: 22,
    h: 22,
    label: 'Cache',
    emoji: '⚡',
    shape: 'diamond',
    bg: '#fff7d6',
    delay: 1.8,
  },
  {
    id: 'db',
    x: 65,
    y: 74,
    w: 30,
    h: 22,
    label: 'Postgres',
    emoji: '🗄️',
    shape: 'ellipse',
    bg: '#e8f8ee',
    delay: 1.8,
  },
]

const EDGES: { from: string; to: string; delay: number }[] = [
  { from: 'client', to: 'api', delay: 0.95 },
  { from: 'api', to: 'cache', delay: 1.95 },
  { from: 'api', to: 'db', delay: 2.1 },
]

function DesignScene() {
  const [analyzed, setAnalyzed] = React.useState(false)

  React.useEffect(() => {
    const t = setTimeout(() => setAnalyzed(true), 4400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className='absolute inset-0'>
      <svg
        viewBox='0 0 100 100'
        preserveAspectRatio='none'
        className='absolute inset-0 h-full w-full'
      >
        {EDGES.map((e, i) => {
          const a = NODES.find((n) => n.id === e.from)!
          const b = NODES.find((n) => n.id === e.to)!
          const x1 = a.x + a.w / 2
          const y1 = a.y + a.h
          const x2 = b.x + b.w / 2
          const y2 = b.y
          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke='#a89df0'
              strokeWidth='0.6'
              strokeLinecap='round'
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: e.delay, duration: 0.55, ease: 'easeOut' }}
            />
          )
        })}
      </svg>

      {NODES.map((n) => (
        <motion.div
          key={n.id}
          initial={{ opacity: 0, y: 6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: n.delay,
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={cn(
            'absolute flex flex-col items-center justify-center border border-black/10 text-[8px] text-[#1b1916]',
            n.shape === 'rect' && 'rounded-sm',
            n.shape === 'ellipse' && 'rounded-full',
            n.shape === 'diamond' && 'rotate-45 rounded-sm',
          )}
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            width: `${n.w}%`,
            height: `${n.h}%`,
            backgroundColor: n.bg,
          }}
        >
          <div className={cn('flex flex-col items-center', n.shape === 'diamond' && '-rotate-45')}>
            <span className='text-[11px] leading-none'>{n.emoji}</span>
            <span className='mt-0.5 text-[7.5px] leading-tight font-medium'>
              {n.label}
            </span>
          </div>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.2, duration: 0.35 }}
        className='absolute right-2 bottom-1 flex items-center gap-1 rounded-full border border-iris/30 bg-white px-2 py-0.5 font-mono text-[9px] text-iris shadow-sm'
      >
        {analyzed ? (
          <>
            <Check className='size-2.5' />
            IA analisou
          </>
        ) : (
          <>
            <Sparkles className='size-2.5 animate-pulse' />
            Analisando…
          </>
        )}
      </motion.div>
    </div>
  )
}

// ─── Shared window chrome ────────────────────────────────────────────────────

function Window({
  dots,
  theme = 'dark',
  children,
}: {
  dots?: boolean
  theme?: 'dark' | 'light'
  children: React.ReactNode
}) {
  const dark = theme === 'dark'
  return (
    <div
      className={cn(
        'shadow-soft relative h-full overflow-hidden rounded-xl border',
        dark
          ? 'border-[#DFE5E9] bg-[#10131a]'
          : 'border-[#DFE5E9] bg-white',
      )}
    >
      <div
        className={cn(
          'flex h-6 items-center gap-1.5 border-b px-3',
          dark
            ? 'border-white/5 bg-[#0c0e14]'
            : 'border-[#DFE5E9] bg-[#F7F9FA]',
        )}
      >
        {dots && (
          <>
            <span className='size-2 rounded-full bg-[#ff5f57]/70' />
            <span className='size-2 rounded-full bg-[#febc2e]/70' />
            <span className='size-2 rounded-full bg-[#28c840]/70' />
          </>
        )}
      </div>
      <div className='h-[calc(100%-1.5rem)]'>{children}</div>
    </div>
  )
}
