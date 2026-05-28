'use client'

import { Backdrop } from '@/components/backdrop'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { signOut, useUser } from '@/lib/auth/use-user'
import { LEVEL_LABEL } from '@/lib/challenge'
import { ArrowRight, Brain, Loader2, LogOut, Target, Trophy } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'

type Profile = {
  email: string
  total_challenges_completed: number
  total_hints_used: number
  created_at: string
  preferred_stack?: string | null
  preferred_level?: string | null
}

type Stats = { independence_score: number }

const STACK_LABEL: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading } = useUser()
  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [stats, setStats] = React.useState<Stats | null>(null)

  React.useEffect(() => {
    if (!loading && !user) router.replace('/login?next=/profile')
  }, [loading, user, router])

  React.useEffect(() => {
    if (!user) return
    let active = true
    ;(async () => {
      const [p, s] = await Promise.all([
        fetch(`/api/profile?user_id=${user.id}`).then((r) => r.json()),
        fetch(`/api/stats?user_id=${user.id}`).then((r) => r.json()),
      ])
      if (!active) return
      if (p && !p.error) setProfile(p)
      if (s && !s.error) setStats(s)
    })()
    return () => {
      active = false
    }
  }, [user])

  if (loading || !user) {
    return (
      <div className='grid min-h-screen flex-1 place-items-center text-sm text-muted-foreground'>
        <span className='flex items-center gap-2'>
          <Loader2 className='size-4 animate-spin' /> Carregando…
        </span>
      </div>
    )
  }

  const stack = profile?.preferred_stack
  const level = profile?.preferred_level

  return (
    <div className='relative flex flex-1 flex-col'>
      <Navbar />
      <Backdrop variant='subtle' />

      <main className='flex-1 pt-28 pb-20'>
        <div className='mx-auto max-w-3xl px-4'>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className='mb-2 font-mono text-[11px] tracking-wider text-muted-foreground/70 uppercase'>
              Seu perfil
            </div>
            <h1 className='font-heading text-4xl leading-tight font-semibold tracking-[-0.03em]'>
              {user.email}
            </h1>
            {profile && (
              <p className='mt-2 text-muted-foreground'>
                Membro desde{' '}
                {new Date(profile.created_at).toLocaleDateString('pt-BR')}
              </p>
            )}
          </motion.div>

          <div className='mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3'>
            <Stat
              icon={Trophy}
              label='Concluídos'
              value={String(profile?.total_challenges_completed ?? 0)}
            />
            <Stat
              icon={Target}
              label='Independência'
              value={`${stats?.independence_score ?? 100}%`}
            />
            <Stat
              icon={Brain}
              label='Hints usados'
              value={String(profile?.total_hints_used ?? 0)}
            />
          </div>

          <div className='mt-3 rounded-2xl border border-[#DFE5E9] bg-white p-6'>
            <div className='mb-4 font-mono text-[11px] tracking-wider text-[#6b6478] uppercase'>
              Preferências
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <Pref
                label='Stack'
                value={stack ? (STACK_LABEL[stack] ?? stack) : 'Não definida'}
              />
              <Pref
                label='Nível'
                value={level ? (LEVEL_LABEL[level] ?? level) : 'Não definido'}
              />
            </div>
            <p className='mt-4 text-[13px] text-[#6b6478]'>
              Suas escolhas no onboarding ficam salvas aqui.
            </p>
          </div>

          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <Button
              size='lg'
              className='group rounded-full border-transparent bg-primary px-5 text-primary-foreground hover:bg-primary/90'
              render={<Link href='/onboarding' />}
            >
              Novo desafio
              <ArrowRight className='size-4 transition-transform group-hover:translate-x-0.5' />
            </Button>
            <Button
              size='lg'
              variant='ghost'
              className='rounded-full text-[#6b6478] hover:text-[#1b1916]'
              render={<Link href='/dashboard' />}
            >
              Ver dashboard
            </Button>
            <button
              type='button'
              onClick={async () => {
                await signOut()
                router.push('/')
              }}
              className='inline-flex items-center justify-center gap-2 rounded-full border border-[#1b1916]/15 px-5 py-2.5 text-sm font-medium text-[#1b1916] transition-colors hover:bg-[#1b1916]/5 sm:ml-auto'
            >
              <LogOut className='size-4' />
              Sair
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className='glass rounded-2xl p-5'>
      <div className='mb-3 grid size-9 place-items-center rounded-xl border border-iris/20 bg-iris/10'>
        <Icon className='size-4 text-iris' />
      </div>
      <div className='font-heading text-3xl font-semibold tracking-tight tabular-nums'>
        {value}
      </div>
      <div className='mt-1 text-[12px] text-muted-foreground'>{label}</div>
    </div>
  )
}

function Pref({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className='font-mono text-[11px] tracking-wider text-[#6b6478] uppercase'>
        {label}
      </div>
      <div className='mt-1 font-heading text-lg font-medium text-[#1b1916]'>
        {value}
      </div>
    </div>
  )
}
