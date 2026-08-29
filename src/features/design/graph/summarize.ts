import type { DesignGraph } from './types'

export function summarizeGraph(graph: DesignGraph): string {
  if (graph.nodes.length === 0) {
    return 'O canvas está vazio — nada desenhado ainda.'
  }

  const labelOf = new Map(graph.nodes.map((n) => [n.id, n.label]))

  const lines: string[] = ['Componentes:']
  for (const n of graph.nodes) {
    lines.push(`- [${n.kind}] ${n.label}${n.note ? ` — ${n.note}` : ''}`)
  }

  if (graph.edges.length > 0) {
    lines.push('', 'Conexões:')
    for (const e of graph.edges) {
      const from = labelOf.get(e.source) ?? e.source
      const to = labelOf.get(e.target) ?? e.target
      const parts: string[] = []
      if (e.label) parts.push(e.label)
      if (e.dashed) parts.push('assíncrona')
      lines.push(
        `- ${from} → ${to}${parts.length ? ` (${parts.join(', ')})` : ''}`,
      )
    }
  } else {
    lines.push('', '(nenhuma conexão entre os componentes ainda)')
  }

  return lines.join('\n')
}
