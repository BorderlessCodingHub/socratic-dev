'use client'

import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { levelById, levelByUiId } from '@/domain/levels'
import { stackById, stackByUiId } from '@/domain/stacks'
import { getNextChallenge } from '@/features/challenges/actions'
import { getAccessToken } from '@/lib/api/client'
import { useT } from '@/lib/i18n'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Code2,
  Info,
  Loader2,
  Network,
  Sparkles,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'

const copy = {
  en: {
    stacks: [
      {
        id: 'js',
        name: 'JavaScript',
        desc: 'Web, Node, full-stack',
        icon: 'JS',
        chip: 'bg-pastel-sand',
      },
      {
        id: 'ts',
        name: 'TypeScript',
        desc: 'Type safety, modern tooling',
        icon: 'TS',
        chip: 'bg-pastel-mist',
      },
      {
        id: 'py',
        name: 'Python',
        desc: 'Backend, data, scripts',
        icon: 'PY',
        chip: 'bg-pastel-sage',
      },
      {
        id: 'react',
        name: 'React',
        desc: 'Components, hooks, state',
        icon: 'RX',
        chip: 'bg-pastel-lavender',
      },
    ],
    levels: [
      {
        id: 'starter',
        name: 'Beginner',
        tag: 'Just starting out',
        desc: 'Variables, conditionals, loops, arrays. No pressure.',
        intensity: 1,
      },
      {
        id: 'junior',
        name: 'Junior',
        tag: 'Built a few projects',
        desc: 'Functions, objects, fetch, async/await. Comfortable reading docs.',
        intensity: 2,
      },
      {
        id: 'mid',
        name: 'Intermediate',
        tag: 'Ready to level up',
        desc: 'Patterns, architecture, performance. Tougher code reviews.',
        intensity: 3,
      },
      {
        id: 'advanced',
        name: 'Advanced',
        tag: 'Big tech ambitions',
        desc: 'Algorithms, optimal complexity, edge cases. FAANG interview energy.',
        intensity: 4,
      },
    ],
    tracks: [
      {
        id: 'code',
        name: 'Code',
        desc: 'Solve a real problem in the editor, with tests.',
        Icon: Code2,
      },
      {
        id: 'design',
        name: 'System Design',
        desc: 'Architect systems on a canvas; the AI reviews it.',
        Icon: Network,
      },
    ],
    stepMeta: [
      {
        eyebrow: '01 · Track',
        title: 'How do you want to train today?',
        subtitle: 'Code or system design (architecture) — pick your track.',
      },
      {
        eyebrow: '02 · Level',
        title: 'Radical honesty: where are you?',
        subtitle: 'The more honest you are, the better the AI calibrates the challenge.',
      },
      {
        eyebrow: '03 · Ready',
        title: 'Time to think.',
        subtitle: "I'll generate a real challenge, with a fictional client. No copy-paste.",
      },
    ],
    stepLabels: ['Track', 'Level', 'Ready'],
    backToSite: 'Back to site',
    generatingEyebrow: 'Generating',
    generatingTitle: 'Almost there.',
    generatingSubtitle: 'Building a challenge based on your choices.',
    language: 'Language',
    designNotePre: "System design has no language — you'll ",
    designNoteBold: 'sketch the system architecture',
    designNotePost: ' (services, data, flow) on a canvas and the AI reviews it.',
    trackLabel: 'Track',
    levelLabel: 'Level',
    designValue: 'System Design',
    codeValue: 'Code',
    genError: "The AI couldn't generate a challenge right now. Try again.",
    connError: "Couldn't reach the AI. Check your connection and try again.",
    back: 'Back',
    next: 'Continue',
    retry: 'Try again',
    generate: 'Generate my challenge',
  },
  pt: {
    stacks: [
      {
        id: 'js',
        name: 'JavaScript',
        desc: 'Web, Node, full-stack',
        icon: 'JS',
        chip: 'bg-pastel-sand',
      },
      {
        id: 'ts',
        name: 'TypeScript',
        desc: 'Type safety, tooling moderno',
        icon: 'TS',
        chip: 'bg-pastel-mist',
      },
      {
        id: 'py',
        name: 'Python',
        desc: 'Backend, dados, scripts',
        icon: 'PY',
        chip: 'bg-pastel-sage',
      },
      {
        id: 'react',
        name: 'React',
        desc: 'Componentes, hooks, estado',
        icon: 'RX',
        chip: 'bg-pastel-lavender',
      },
    ],
    levels: [
      {
        id: 'starter',
        name: 'Iniciante',
        tag: 'Comecei agora',
        desc: 'Variáveis, condicionais, loops, arrays. Sem traumas.',
        intensity: 1,
      },
      {
        id: 'junior',
        name: 'Júnior',
        tag: 'Já fiz alguns projetos',
        desc: 'Funções, objetos, fetch, async/await. Confortável com docs.',
        intensity: 2,
      },
      {
        id: 'mid',
        name: 'Intermediário',
        tag: 'Quero crescer',
        desc: 'Padrões, arquitetura, performance. Code review mais duro.',
        intensity: 3,
      },
      {
        id: 'advanced',
        name: 'Avançado',
        tag: 'Quero nível big tech',
        desc: 'Algoritmos, complexidade ótima, edge cases. Pegada de entrevista FAANG.',
        intensity: 4,
      },
    ],
    tracks: [
      {
        id: 'code',
        name: 'Código',
        desc: 'Resolva um problema real no editor, com testes.',
        Icon: Code2,
      },
      {
        id: 'design',
        name: 'System Design',
        desc: 'Arquitete sistemas num canvas; a IA analisa.',
        Icon: Network,
      },
    ],
    stepMeta: [
      {
        eyebrow: '01 · Trilha',
        title: 'Como você quer treinar hoje?',
        subtitle: 'Código ou system design (arquitetura) — escolha a trilha.',
      },
      {
        eyebrow: '02 · Nível',
        title: 'Honestidade radical: onde você está?',
        subtitle: 'Quanto mais real você for, melhor a IA calibra o desafio.',
      },
      {
        eyebrow: '03 · Pronto',
        title: 'Hora de pensar.',
        subtitle: 'Vou gerar um desafio real, com cliente fictício. Sem cópia.',
      },
    ],
    stepLabels: ['Trilha', 'Nível', 'Pronto'],
    backToSite: 'Voltar ao site',
    generatingEyebrow: 'Gerando',
    generatingTitle: 'Quase lá.',
    generatingSubtitle: 'Montando um desafio com base nas suas escolhas.',
    language: 'Linguagem',
    designNotePre: 'System design não tem linguagem — você vai ',
    designNoteBold: 'desenhar a arquitetura do sistema',
    designNotePost: ' (serviços, dados, fluxo) num canvas e a IA analisa.',
    trackLabel: 'Trilha',
    levelLabel: 'Nível',
    designValue: 'Design System',
    codeValue: 'Código',
    genError: 'A IA não conseguiu gerar o desafio agora. Tente de novo.',
    connError: 'Falha ao falar com a IA. Verifique a conexão e tente de novo.',
    back: 'Voltar',
    next: 'Continuar',
    retry: 'Tentar de novo',
    generate: 'Gerar meu desafio',
  },
}

type Step = 0 | 1 | 2

export function OnboardingFlow({ user }: { user: User }) {
  const router = useRouter()
  const t = useT(copy)
  const [step, setStep] = React.useState<Step>(0)
  const [track, setTrack] = React.useState<string | null>(null)
  const [stack, setStack] = React.useState<string | null>(null)
  const [level, setLevel] = React.useState<string | null>(null)
  const [starting, setStarting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const meta = user.user_metadata as
      | {
          preferred_track?: string
          preferred_stack?: string
          preferred_level?: string
        }
      | undefined

    const onboarded =
      !!meta?.preferred_level &&
      (meta?.preferred_track === 'design' || !!meta?.preferred_stack)
    if (onboarded) {
      router.replace('/dashboard')
      return
    }

    if (meta?.preferred_track) setTrack(meta.preferred_track)
    const restoredStack = meta?.preferred_stack
      ? stackById(meta.preferred_stack)?.uiId
      : undefined
    if (restoredStack) setStack(restoredStack)
    const restoredLevel = meta?.preferred_level
      ? levelById(meta.preferred_level)?.uiId
      : undefined
    if (restoredLevel) setLevel(restoredLevel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const canNext =
    (step === 0 && track && (track === 'design' || stack)) ||
    (step === 1 && level) ||
    step === 2

  async function generate(dbStack: string, dbLevel: string, trk: string) {
    setError(null)
    setStarting(true)
    await supabase.auth.updateUser({
      data: {
        preferred_track: trk,
        preferred_stack: dbStack,
        preferred_level: dbLevel,
      },
    })
    try {
      const token = await getAccessToken()
      const result = await getNextChallenge(
        trk === 'design'
          ? {
              kind: 'design',
              level: dbLevel as 'beginner' | 'intermediate' | 'advanced',
              token,
            }
          : {
              kind: 'code',
              stack: dbStack,
              level: dbLevel as 'beginner' | 'intermediate' | 'advanced',
              token,
            },
      )
      if ('error' in result || !result?.id) {
        setError(('error' in result && result.error) || t.genError)
        setStarting(false)
        return
      }
      router.push(
        trk === 'design'
          ? `/design?id=${result.id}`
          : `/challenge?id=${result.id}`,
      )
    } catch {
      setError(t.connError)
      setStarting(false)
    }
  }

  function start() {
    if (starting) return
    // Registry lookups replace LEVEL_TO_DB / STACK_TO_DB
    const dbLevel = levelByUiId(level ?? 'starter')?.id ?? 'beginner'
    if (track === 'design') {
      generate('design', dbLevel, 'design')
      return
    }
    const dbStack = stackByUiId(stack ?? 'js')?.id ?? 'javascript'
    generate(dbStack, dbLevel, 'code')
  }

  const meta = t.stepMeta[step]

  return (
    <div className='relative flex min-h-screen flex-1 flex-col bg-white'>
      <header className='container-main flex h-16 w-full max-w-3xl shrink-0 items-center justify-between'>
        <Logo />
        <Link
          href='/'
          className='text-sm text-muted-foreground transition-colors hover:text-ink'
        >
          {t.backToSite}
        </Link>
      </header>

      <main className='flex flex-1 items-start py-6 md:items-center md:py-10'>
        <div className='container-main w-full max-w-3xl'>
          <div className='shadow-soft-lg overflow-hidden rounded-lg border border-border bg-white'>
            <div className='border-b border-border bg-pastel-lilac/60 px-6 py-8 sm:px-10 sm:py-10'>
              <div>
                {starting ? (
                  <div>
                    <p className='eyebrow mb-2'>{t.generatingEyebrow}</p>
                    <h1 className='type-h2'>{t.generatingTitle}</h1>
                    <p className='type-body mt-3 max-w-[44ch]'>
                      {t.generatingSubtitle}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className='mb-6 flex items-center gap-2'>
                      {[0, 1, 2].map((i) => (
                        <div key={i} className='flex-1'>
                          <div
                            className={cn(
                              'h-1 rounded-full transition-all duration-500',
                              step >= i ? 'bg-primary' : 'bg-border',
                            )}
                          />
                          <div className='mt-2 font-mono text-[10px] tracking-wider text-muted-foreground uppercase'>
                            {t.stepLabels[i]}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className='eyebrow mb-2'>{meta.eyebrow}</p>
                    <h1 className='type-h2'>{meta.title}</h1>
                    <p className='type-body mt-3 max-w-[44ch]'>
                      {meta.subtitle}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className='px-6 py-7 sm:px-10 sm:py-8'>
              {starting ? (
                <GeneratingChallenge />
              ) : (
                <>
                  {step === 0 && (
                    <div className='space-y-4'>
                      <div className='grid gap-3 sm:grid-cols-2'>
                        {t.tracks.map((tk) => (
                          <Tile
                            key={tk.id}
                            selected={track === tk.id}
                            onClick={() => setTrack(tk.id)}
                          >
                            <div className='grid size-12 place-items-center rounded-full bg-pastel-lavender text-ink'>
                              <tk.Icon className='size-6' strokeWidth={1.5} />
                            </div>
                            <div className='flex-1'>
                              <div className='font-heading text-lg font-medium tracking-tight text-ink'>
                                {tk.name}
                              </div>
                              <div className='text-sm text-muted-foreground'>
                                {tk.desc}
                              </div>
                            </div>
                          </Tile>
                        ))}
                      </div>

                      {track === 'code' && (
                        <div>
                          <p className='eyebrow mb-2'>{t.language}</p>
                          <div className='grid gap-3 sm:grid-cols-2'>
                            {t.stacks.map((s) => (
                              <Tile
                                key={s.id}
                                selected={stack === s.id}
                                onClick={() => setStack(s.id)}
                              >
                                <div
                                  className={cn(
                                    'grid size-12 place-items-center rounded-full font-mono text-sm font-medium text-ink',
                                    s.chip,
                                  )}
                                >
                                  {s.icon}
                                </div>
                                <div className='flex-1'>
                                  <div className='font-heading text-lg font-medium tracking-tight text-ink'>
                                    {s.name}
                                  </div>
                                  <div className='text-sm text-muted-foreground'>
                                    {s.desc}
                                  </div>
                                </div>
                              </Tile>
                            ))}
                          </div>
                        </div>
                      )}

                      {track === 'design' && (
                        <div className='rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground'>
                          {t.designNotePre}
                          <span className='font-medium text-ink'>
                            {t.designNoteBold}
                          </span>
                          {t.designNotePost}
                        </div>
                      )}
                    </div>
                  )}

                  {step === 1 && (
                    <div className='space-y-3'>
                      {t.levels.map((l) => (
                        <Tile
                          key={l.id}
                          selected={level === l.id}
                          onClick={() => setLevel(l.id)}
                        >
                          <div className='flex items-center gap-1'>
                            {Array.from({ length: 4 }).map((_, idx) => (
                              <span
                                key={idx}
                                className={cn(
                                  'h-2 w-5 rounded-full',
                                  idx < l.intensity ? 'bg-primary' : 'bg-border',
                                )}
                              />
                            ))}
                          </div>
                          <div className='flex-1'>
                            <div className='flex flex-wrap items-center gap-2'>
                              <div className='font-heading text-lg font-medium tracking-tight text-ink'>
                                {l.name}
                              </div>
                              <span className='rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-[10px] tracking-wider text-muted-foreground uppercase'>
                                {l.tag}
                              </span>
                            </div>
                            <div className='mt-0.5 text-sm text-muted-foreground'>
                              {l.desc}
                            </div>
                          </div>
                        </Tile>
                      ))}
                    </div>
                  )}

                  {step === 2 && (
                    <div className='grid gap-3 sm:grid-cols-2'>
                      <SummaryItem
                        label={t.trackLabel}
                        value={
                          track === 'design'
                            ? t.designValue
                            : (t.stacks.find((s) => s.id === stack)?.name ??
                              t.codeValue)
                        }
                      />
                      <SummaryItem
                        label={t.levelLabel}
                        value={t.levels.find((l) => l.id === level)?.name ?? '—'}
                      />
                    </div>
                  )}

                  {error && (
                    <div className='mt-6 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive'>
                      {error}
                    </div>
                  )}

                  <div className='mt-7 flex items-center justify-between'>
                    <Button
                      variant='ghost'
                      onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
                      className={cn(step === 0 && 'invisible')}
                    >
                      <ArrowLeft className='size-4' /> {t.back}
                    </Button>

                    {step < 2 ? (
                      <Button
                        variant='ink'
                        size='lg'
                        disabled={!canNext}
                        onClick={() =>
                          setStep((s) => Math.min(2, s + 1) as Step)
                        }
                        className='group'
                      >
                        {t.next}
                        <ArrowRight className='size-4 transition-transform group-hover:translate-x-0.5' />
                      </Button>
                    ) : (
                      <Button
                        variant='ink'
                        size='lg'
                        onClick={start}
                        className='group'
                      >
                        <Sparkles className='size-4' />
                        {error ? t.retry : t.generate}
                        <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const genCopy = {
  en: {
    messages: [
      'Inventing a fictional client…',
      'Defining the input data format…',
      'Writing the hidden tests…',
      'Calibrating difficulty to your level…',
      "Preparing the tutor's first question…",
    ],
    title: 'The AI is building your challenge',
    notePre: 'Generating with the stack and level saved to your profile. Want to change them?',
    noteLink: 'Update your profile',
  },
  pt: {
    messages: [
      'Inventando um cliente fictício…',
      'Definindo o formato dos dados de entrada…',
      'Escrevendo os testes escondidos…',
      'Calibrando a dificuldade pro seu nível…',
      'Preparando a primeira pergunta do tutor…',
    ],
    title: 'A IA está criando seu desafio',
    notePre: 'Gerando com a stack e o nível salvos no seu perfil. Quer mudar?',
    noteLink: 'Ajuste no perfil',
  },
}

function GeneratingChallenge() {
  const t = useT(genCopy)
  const [i, setI] = React.useState(0)
  React.useEffect(() => {
    const timer = setInterval(
      () => setI((v) => (v + 1) % t.messages.length),
      1900,
    )
    return () => clearInterval(timer)
  }, [t.messages.length])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className='py-2'
    >
      <div className='flex items-center gap-3'>
        <div className='grid size-11 shrink-0 place-items-center rounded-full bg-pastel-lavender text-ink'>
          <Sparkles className='size-5' strokeWidth={1.5} />
        </div>
        <div className='min-w-0'>
          <div className='font-heading text-lg font-medium tracking-tight text-ink'>
            {t.title}
          </div>
          <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
            <Loader2 className='size-3.5 shrink-0 animate-spin' />
            <AnimatePresence mode='wait'>
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
              >
                {t.messages[i]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className='mt-7 space-y-3'>
        <Skeleton className='h-4 w-3/4 rounded' />
        <Skeleton className='h-4 w-full rounded' />
        <Skeleton className='h-4 w-5/6 rounded' />
        <Skeleton className='mt-5 h-28 w-full rounded-md' />
      </div>

      <div className='mt-6 flex items-start gap-2 rounded-md border border-border bg-muted px-3.5 py-2.5 text-[12px] text-muted-foreground'>
        <Info className='mt-0.5 size-3.5 shrink-0' />
        <span>
          {t.notePre}{' '}
          <Link
            href='/profile'
            className='font-medium text-primary hover:underline'
          >
            {t.noteLink}
          </Link>
          .
        </span>
      </div>
    </motion.div>
  )
}

function Tile({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'shadow-soft flex w-full cursor-pointer items-center gap-4 rounded-md border bg-white p-5 text-left transition-colors duration-300 ease-out',
        selected
          ? 'border-primary ring-2 ring-primary/25'
          : 'border-border hover:border-ink/20',
      )}
    >
      {children}
      <div
        className={cn(
          'grid size-6 shrink-0 place-items-center rounded-full border transition-colors',
          selected ? 'border-primary bg-primary' : 'border-border bg-white',
        )}
      >
        {selected && <Check className='size-3.5 text-white' />}
      </div>
    </button>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-md border border-border bg-white p-4'>
      <div className='mb-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase'>
        {label}
      </div>
      <div className='font-heading text-base font-medium tracking-tight text-ink'>
        {value}
      </div>
    </div>
  )
}
