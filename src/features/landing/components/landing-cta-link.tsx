'use client'

import { startTransition, type ReactNode, type MouseEvent } from 'react'
import { useRouter } from 'next/navigation'

/** Matches next.config.ts `basePath` — also hardcoded in login OAuth redirect. */
export const APP_BASE_PATH = '/socratic-dev'

export function withBasePath(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`
  if (path === APP_BASE_PATH || path.startsWith(`${APP_BASE_PATH}/`)) return path
  return `${APP_BASE_PATH}${path}`
}

type Props = {
  /** App path without basePath, e.g. `/challenges` */
  href: string
  className?: string
  children: ReactNode
}

/**
 * Landing CTAs: try App Router soft nav, then hard-nav if the transition
 * stalls (observed behind labs-gateway — soft nav can no-op while a normal
 * full document load of the same href works).
 */
export function LandingCtaLink({ href, className, children }: Props) {
  const router = useRouter()
  const fullHref = withBasePath(href)

  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey
    ) {
      return
    }
    e.preventDefault()
    startTransition(() => {
      router.push(href)
    })
    window.setTimeout(() => {
      const here = window.location.pathname.replace(/\/$/, '') || '/'
      const want = fullHref.replace(/\/$/, '') || '/'
      if (here !== want) {
        window.location.assign(fullHref)
      }
    }, 500)
  }

  return (
    <a href={fullHref} className={className} onClick={onClick}>
      {children}
    </a>
  )
}
