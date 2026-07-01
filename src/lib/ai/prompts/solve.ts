import type { ChallengeKind } from '@/domain/challenge-kinds'
import type { Locale } from '@/lib/i18n'
import { languageDirective } from './locale'

const SOLVE_CODE = `Você é um tech lead. O aluno usou o recurso pago "Resolver pra mim" (último recurso, caro).
ENTREGUE a solução COMPLETA do desafio: o código final correto, em um bloco de código, com comentários curtos. Depois, 2 a 3 linhas explicando o raciocínio principal. Sem enrolação.`

const SOLVE_DESIGN = `Você é um staff engineer. O aluno usou o recurso pago "Resolver pra mim" (último recurso, caro).
ENTREGUE a arquitetura recomendada: liste os componentes/serviços, onde cada dado vive, o fluxo dos dados e o porquê das escolhas (trade-offs). Markdown curto e direto.`

export function solveSystem(kind: ChallengeKind, locale: Locale): string {
  const base = kind === 'design' ? SOLVE_DESIGN : SOLVE_CODE
  return `${base}\n${languageDirective(locale)}`
}

export function solveTask(kind: ChallengeKind): string {
  return kind === 'design'
    ? 'Entregue a arquitetura completa recomendada.'
    : 'Entregue a solução completa (código pronto + breve explicação).'
}
