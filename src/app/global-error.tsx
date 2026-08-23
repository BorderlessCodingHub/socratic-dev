'use client'

import * as React from 'react'

const copy = {
  en: {
    htmlLang: 'en',
    title: 'Something went wrong.',
    subtitle: 'The error has been logged.',
    reload: 'Reload',
  },
  pt: {
    htmlLang: 'pt-BR',
    title: 'Algo deu errado.',
    subtitle: 'O erro já foi registrado.',
    reload: 'Recarregar',
  },
}

function detectLocale(): 'en' | 'pt' {
  if (typeof document === 'undefined') return 'pt'
  const fromCookie = document.cookie.match(/(?:^|;\s*)locale=(en|pt)/)?.[1]
  const stored = fromCookie ?? window.localStorage?.getItem('locale')
  return stored === 'en' ? 'en' : 'pt'
}

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  const t = copy[detectLocale()]

  React.useEffect(() => {
    // Sentry is reached through the bridge set up by instrumentation-client —
    // importing @sentry/nextjs here would pull the SDK's multi-MB server
    // build into the SSR bundle.
    window.__captureException?.(error)
  }, [error])

  return (
    <html lang={t.htmlLang}>
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: '#121110',
          color: '#ece9e4',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', padding: 24 }}>
          <p
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              opacity: 0.5,
            }}
          >
            socratic.dev
          </p>
          <h1 style={{ fontWeight: 300, fontSize: 32, margin: '16px 0 8px' }}>
            {t.title}
          </h1>
          <p style={{ opacity: 0.6, fontSize: 14, margin: 0 }}>
            {t.subtitle}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 28,
              padding: '10px 22px',
              borderRadius: 999,
              border: 'none',
              background: '#a6e40e',
              color: '#121110',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {t.reload}
          </button>
        </div>
      </body>
    </html>
  )
}
