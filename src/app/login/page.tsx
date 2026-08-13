'use client'

import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import {
  signInWithPlatform,
  type PlatformSignInError,
} from '@/features/auth/actions'
import { track } from '@/lib/analytics'
import { useT } from '@/lib/i18n'
import { supabase } from '@/lib/supabase/client'
import { ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

const copy = {
  en: {
    signIn: 'Sign in',
    loginSubtitle: 'Sign in with your platform account to start a challenge and track your progress.',
    emailPlaceholder: 'you@email.com',
    passwordPlaceholder: 'password',
    backToSite: '← Back to site',
    errors: {
      'invalid-credentials': 'Invalid email or password.',
      'rate-limited': 'Too many attempts. Wait a few minutes.',
      unavailable: 'Sign-in is temporarily unavailable. Try again shortly.',
      authFailed: 'Authentication failed. Try again.',
    },
  },
  pt: {
    signIn: 'Entrar',
    loginSubtitle: 'Entre com sua conta da plataforma para começar um desafio e acompanhar seu progresso.',
    emailPlaceholder: 'seu@email.com',
    passwordPlaceholder: 'senha',
    backToSite: '← Voltar ao site',
    errors: {
      'invalid-credentials': 'E-mail ou senha inválidos.',
      'rate-limited': 'Muitas tentativas. Aguarde alguns minutos.',
      unavailable: 'Login temporariamente indisponível. Tente novamente em instantes.',
      authFailed: 'Falha na autenticação. Tente novamente.',
    },
  },
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className='grid min-h-screen place-items-center bg-background'>
          <Loader2 className='size-5 animate-spin text-muted-foreground' />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const explicitNext = params.get('next')
  const t = useT(copy)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function submit(e: React.SubmitEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setFormError(null)
    try {
      const result = await signInWithPlatform({ email, password })
      if ('error' in result) {
        setFormError(t.errors[result.error as PlatformSignInError])
        return
      }
      // Exchange the one-time token hash for a Supabase session — everything
      // downstream (guards, RLS, profile) still runs on the Supabase token.
      const { data, error } = await supabase.auth.verifyOtp({
        type: 'email',
        token_hash: result.tokenHash,
      })
      if (error || !data.session) {
        setFormError(t.errors.authFailed)
        return
      }
      track('login', { method: 'platform' })
      const onboarded = !!(
        data.session.user.user_metadata as
          | { preferred_level?: string }
          | undefined
      )?.preferred_level
      router.replace(onboarded ? explicitNext || '/dashboard' : '/onboarding')
    } catch {
      setFormError(t.errors.authFailed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className='relative flex min-h-screen flex-1 flex-col bg-background'>
      <header className='flex h-16 shrink-0 items-center px-6 sm:px-10'>
        <Logo />
      </header>

      <main className='flex flex-1 items-center justify-center px-4 pb-16'>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className='w-full max-w-[400px]'
        >
          <h1 className='type-h3 mb-2'>{t.signIn}</h1>
          <p className='type-body mb-8 text-muted-foreground'>
            {t.loginSubtitle}
          </p>

          <form onSubmit={submit} className='flex flex-col gap-3'>
            <input
              type='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className='rounded-lg border border-border bg-background px-4 py-3 text-ink outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20'
            />
            <input
              type='password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              className='rounded-lg border border-border bg-background px-4 py-3 text-ink outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20'
            />
            {formError && <p className='text-sm text-destructive'>{formError}</p>}
            <Button
              type='submit'
              variant='ink'
              size='lg'
              loading={busy}
              className='group mt-2'
            >
              {t.signIn}
              <ArrowRight className='size-4 transition-transform group-hover:translate-x-0.5' />
            </Button>
          </form>

          <div className='mt-8'>
            <Link
              href='/'
              className='text-sm text-muted-foreground transition-colors hover:text-ink'
            >
              {t.backToSite}
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
