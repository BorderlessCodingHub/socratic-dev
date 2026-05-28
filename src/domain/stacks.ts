export type RunnerLanguage = 'js' | 'ts' | 'react'

export type StackId = 'javascript' | 'typescript'
export type StackUiId = 'js' | 'ts'

export type Stack = {
  id: StackId
  uiId: StackUiId
  label: string
  description: string
  runnerLanguage: RunnerLanguage
  iconLabel: string
  gradient: string
}

export const STACKS: readonly Stack[] = [
  {
    id: 'javascript',
    uiId: 'js',
    label: 'JavaScript',
    description: 'Web, Node, full-stack',
    runnerLanguage: 'js',
    iconLabel: 'JS',
    gradient: 'from-amber-400/30 to-orange-500/20',
  },
  {
    id: 'typescript',
    uiId: 'ts',
    label: 'TypeScript',
    description: 'Type safety, tooling moderno',
    runnerLanguage: 'ts',
    iconLabel: 'TS',
    gradient: 'from-blue-500/30 to-iris/20',
  },
] as const

export function stackById(id: string): Stack | undefined {
  return STACKS.find((s) => s.id === id)
}
export function stackByUiId(uiId: string): Stack | undefined {
  return STACKS.find((s) => s.uiId === uiId)
}
