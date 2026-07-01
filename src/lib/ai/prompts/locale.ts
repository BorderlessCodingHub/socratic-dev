import type { Locale } from '@/lib/i18n'

export function languageDirective(locale: Locale): string {
  return locale === 'pt'
    ? 'IDIOMA: escreva TODO o texto visível ao usuário em português do Brasil.'
    : 'LANGUAGE: write ALL user-facing text in natural English.'
}
