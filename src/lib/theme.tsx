'use client'

import * as React from 'react'

export type ThemeSetting = 'light' | 'dark' | 'system'

const THEME_KEY = 'theme'

function systemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function apply(setting: ThemeSetting) {
  const dark = setting === 'dark' || (setting === 'system' && systemDark())
  document.documentElement.classList.toggle('dark', dark)
}

const ThemeContext = React.createContext<{
  theme: ThemeSetting
  setTheme: (t: ThemeSetting) => void
}>({ theme: 'system', setTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeSetting>('system')

  React.useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setThemeState(stored)
      apply(stored)
    } else {
      apply('system')
    }
  }, [])

  React.useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => apply('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = React.useCallback((t: ThemeSetting) => {
    setThemeState(t)
    window.localStorage.setItem(THEME_KEY, t)
    document.cookie = `${THEME_KEY}=${t};path=/;max-age=31536000;samesite=lax`
    apply(t)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return React.useContext(ThemeContext)
}

export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');var d=t==='dark'||((!t||t==='system')&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})()`
