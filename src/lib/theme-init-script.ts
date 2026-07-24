/** Shared theme key — used by client ThemeProvider and the inline init script. */
export const THEME_KEY = 'socratic-theme'

/** Inline IIFE for layout.tsx — must live in a server-safe module (no 'use client'). */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');var d=t?(t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches)):true;if(d)document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}})()`
