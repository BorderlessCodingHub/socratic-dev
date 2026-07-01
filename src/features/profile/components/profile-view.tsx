'use client'

import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { signOut } from '@/features/auth/hooks/use-user'
import { getDashboardStats } from '@/features/dashboard/actions'
import type { Stats } from '@/features/dashboard/types'
import { getProfile, type Profile } from '@/features/profile/actions'
import { getAccessToken } from '@/lib/api/client'
import { useT } from '@/lib/i18n'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import {
  ArrowRight,
  ChevronDown,
  Code2,
  GaugeCircle,
  Layers,
  LogOut,
  Trophy,
} from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'

const STACK_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'react', label: 'React' },
]

const copy = {
  en: {
    dateLocale: 'en-US',
    levelOptions: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
    ],
    trackOptions: [
      { value: 'code', label: 'Code' },
      { value: 'design', label: 'System Design' },
    ],
    avatarAlt: 'Your avatar',
    yourProfile: 'Your profile',
    memberSince: 'Member since',
    statCompleted: 'Completed',
    statIndependence: 'Independence',
    statHints: 'Hints used',
    preferences: 'Preferences',
    trackLabel: 'Track',
    trackPlaceholder: 'Pick a track',
    stackLabel: 'Stack (code)',
    stackPlaceholder: 'Pick a stack',
    difficultyLabel: 'Difficulty',
    levelPlaceholder: 'Pick a level',
    prefsNote:
      'Your next challenges are generated from these choices — saved automatically.',
    newChallenge: 'New challenge',
    viewDashboard: 'View dashboard',
    signOut: 'Sign out',
  },
  pt: {
    dateLocale: 'pt-BR',
    levelOptions: [
      { value: 'beginner', label: 'Iniciante' },
      { value: 'intermediate', label: 'Intermediário' },
      { value: 'advanced', label: 'Avançado' },
    ],
    trackOptions: [
      { value: 'code', label: 'Código' },
      { value: 'design', label: 'System Design' },
    ],
    avatarAlt: 'Seu avatar',
    yourProfile: 'Seu perfil',
    memberSince: 'Membro desde',
    statCompleted: 'Concluídos',
    statIndependence: 'Independência',
    statHints: 'Hints usados',
    preferences: 'Preferências',
    trackLabel: 'Trilha',
    trackPlaceholder: 'Escolher trilha',
    stackLabel: 'Stack (código)',
    stackPlaceholder: 'Escolher stack',
    difficultyLabel: 'Dificuldade',
    levelPlaceholder: 'Escolher nível',
    prefsNote:
      'Os próximos desafios são gerados com base nessas escolhas — salvam automaticamente.',
    newChallenge: 'Novo desafio',
    viewDashboard: 'Ver dashboard',
    signOut: 'Sair',
  },
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function ProfileView({ user }: { user: User }) {
  const router = useRouter()
  const t = useT(copy)
  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [stats, setStats] = React.useState<Stats | null>(null)
  const [loaded, setLoaded] = React.useState(false)
  const [track, setTrack] = React.useState('')
  const [stack, setStack] = React.useState('')
  const [level, setLevel] = React.useState('')
  const [saveState, setSaveState] = React.useState<SaveState>('idle')

  React.useEffect(() => {
    const meta = user?.user_metadata as
      | {
          preferred_track?: string
          preferred_stack?: string
          preferred_level?: string
        }
      | undefined
    if (meta?.preferred_track) setTrack(meta.preferred_track)
    if (meta?.preferred_stack) setStack(meta.preferred_stack)
    if (meta?.preferred_level) setLevel(meta.preferred_level)
  }, [user])

  async function savePrefs(
    nextTrack: string,
    nextStack: string,
    nextLevel: string,
  ) {
    setSaveState('saving')
    const { error } = await supabase.auth.updateUser({
      data: {
        preferred_track: nextTrack,
        preferred_stack: nextStack,
        preferred_level: nextLevel,
      },
    })
    if (error) {
      setSaveState('error')
      return
    }
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 2000)
  }

  React.useEffect(() => {
    if (!user) return
    let active = true
    ;(async () => {
      const token = await getAccessToken()
      const [p, s] = await Promise.all([
        getProfile(token),
        getDashboardStats(token),
      ])
      if (!active) return
      if (p) setProfile(p)
      if (s && !('error' in s)) setStats(s)
      setLoaded(true)
    })()
    return () => {
      active = false
    }
  }, [user])

  const ready = !!user && loaded

  return (
    <div className='relative flex min-h-screen flex-1 flex-col bg-white'>
      <Navbar />

      <main className='flex-1 pt-[88px] pb-20 md:pt-24'>
        <div className='container-main w-full max-w-3xl'>
          <div className='shadow-soft-lg overflow-hidden rounded-lg border border-border bg-white'>
            <div className='border-b border-border bg-pastel-lavender/60 px-6 py-8 sm:px-10 sm:py-10'>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className='flex items-center gap-4'
              >
                {(user?.user_metadata as { avatar_url?: string } | undefined)
                  ?.avatar_url ? (
                  <div className='relative size-14 shrink-0 overflow-hidden rounded-full ring-4 ring-white/50'>
                    <Image
                      src={
                        (user.user_metadata as { avatar_url?: string })
                          .avatar_url!
                      }
                      alt={t.avatarAlt}
                      fill
                      className='object-cover'
                    />
                  </div>
                ) : (
                  <div className='grid size-14 shrink-0 place-items-center rounded-full bg-primary font-mono text-xl font-medium text-primary-foreground uppercase ring-4 ring-white/50'>
                    {(user?.email?.[0] ?? 'u').toUpperCase()}
                  </div>
                )}
                <div className='min-w-0'>
                  <p className='eyebrow mb-1'>{t.yourProfile}</p>
                  <h1 className='type-h3 truncate'>{user?.email ?? '—'}</h1>
                  {ready && profile && (
                    <p className='mt-1 text-sm text-muted-foreground'>
                      {t.memberSince}{' '}
                      {new Date(profile.created_at).toLocaleDateString(
                        t.dateLocale,
                      )}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>

            <div className='px-6 py-7 sm:px-10 sm:py-8'>
              {!ready ? (
                <ProfileSkeleton />
              ) : (
                <>
                  <div className='grid grid-cols-3 gap-3'>
                    <Stat
                      icon={Trophy}
                      label={t.statCompleted}
                      value={String(stats?.total_completed ?? 0)}
                    />
                    <Stat
                      icon={GaugeCircle}
                      label={t.statIndependence}
                      value={`${stats?.independence_score ?? 100}%`}
                    />
                    <Stat
                      icon={Layers}
                      label={t.statHints}
                      value={String(stats?.total_hints ?? 0)}
                    />
                  </div>

                  <div className='mt-3 rounded-md bg-muted p-6'>
                    <div className='mb-4 flex items-center justify-between'>
                      <div className='eyebrow flex items-center gap-2'>
                        <Code2 className='size-3.5' strokeWidth={1.5} />
                        {t.preferences}
                      </div>
                      <SaveBadge state={saveState} />
                    </div>
                    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                      <SelectField
                        label={t.trackLabel}
                        value={track}
                        placeholder={t.trackPlaceholder}
                        options={t.trackOptions}
                        onChange={(v) => {
                          setTrack(v)
                          savePrefs(v, stack, level)
                        }}
                      />
                      {track !== 'design' && (
                        <SelectField
                          label={t.stackLabel}
                          value={stack}
                          placeholder={t.stackPlaceholder}
                          options={STACK_OPTIONS}
                          onChange={(v) => {
                            setStack(v)
                            savePrefs(track, v, level)
                          }}
                        />
                      )}
                      <SelectField
                        label={t.difficultyLabel}
                        value={level}
                        placeholder={t.levelPlaceholder}
                        options={t.levelOptions}
                        onChange={(v) => {
                          setLevel(v)
                          savePrefs(track, stack, v)
                        }}
                      />
                    </div>
                    <p className='mt-4 text-[13px] text-muted-foreground'>
                      {t.prefsNote}
                    </p>
                  </div>

                  <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:items-center'>
                    <Button
                      render={<Link href='/onboarding' />}
                      variant='ink'
                      size='lg'
                      className='group'
                    >
                      {t.newChallenge}
                      <ArrowRight className='size-4 transition-transform group-hover:translate-x-0.5' />
                    </Button>
                    <Button
                      render={<Link href='/dashboard' />}
                      variant='outline'
                      size='lg'
                    >
                      {t.viewDashboard}
                    </Button>
                    <Button
                      variant='ghost'
                      onClick={async () => {
                        await signOut()
                        router.push('/')
                      }}
                      className='sm:ml-auto'
                    >
                      <LogOut className='size-4' /> {t.signOut}
                    </Button>
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

function ProfileSkeleton() {
  return (
    <div>
      <div className='grid grid-cols-3 gap-3'>
        {[0, 1, 2].map((i) => (
          <div key={i} className='rounded-md border border-border p-5'>
            <Skeleton className='mb-3 size-9 rounded-full' />
            <Skeleton className='h-7 w-12' />
            <Skeleton className='mt-2 h-3 w-16' />
          </div>
        ))}
      </div>
      <div className='mt-3 rounded-md border border-border p-6'>
        <Skeleton className='mb-4 h-3 w-40' />
        <div className='grid grid-cols-2 gap-3'>
          <Skeleton className='h-14 rounded-md' />
          <Skeleton className='h-14 rounded-md' />
        </div>
      </div>
      <div className='mt-6 flex gap-3'>
        <Skeleton className='h-11 w-36 rounded-full' />
        <Skeleton className='h-11 w-32 rounded-full' />
      </div>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  value: string
}) {
  return (
    <div className='rounded-md border border-border bg-white p-5'>
      <div className='mb-3 grid size-11 place-items-center rounded-full bg-pastel-lavender text-ink'>
        <Icon className='size-5' strokeWidth={1.5} />
      </div>
      <div className='font-heading text-3xl font-light tracking-tight text-ink tabular-nums'>
        {value}
      </div>
      <div className='mt-1 text-[12px] text-muted-foreground'>{label}</div>
    </div>
  )
}

function SelectField({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className='mb-1.5 block font-mono text-[10px] tracking-wider text-muted-foreground uppercase'>
        {label}
      </label>
      <div className='relative'>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='w-full appearance-none rounded-md border border-border bg-white px-4 py-2.5 pr-10 text-[15px] font-medium text-ink transition-colors outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20'
        >
          <option value='' disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className='pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground' />
      </div>
    </div>
  )
}

const badgeCopy = {
  en: {
    saving: 'Saving…',
    saved: 'Saved ✓',
    error: 'Save failed',
  },
  pt: {
    saving: 'Salvando…',
    saved: 'Salvo ✓',
    error: 'Erro ao salvar',
  },
}

function SaveBadge({ state }: { state: SaveState }) {
  const t = useT(badgeCopy)
  if (state === 'idle') return null
  const map = {
    saving: [t.saving, 'text-muted-foreground'],
    saved: [t.saved, 'text-mint'],
    error: [t.error, 'text-destructive'],
  } as const
  const [text, cls] = map[state]
  return <span className={`font-mono text-[11px] ${cls}`}>{text}</span>
}
