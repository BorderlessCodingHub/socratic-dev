import dagre from '@dagrejs/dagre'
import { kindOf, type DesignEdge, type DesignGraph, type DesignNode } from './types'

const NODE_W = 208
const NODE_H = 92

type AiNode = {
  id: string
  label?: string
  type?: string
  note?: string
}
type AiEdge = { from: string; to: string; label?: string; dashed?: boolean }

export function layoutAiGraph(
  rawNodes: AiNode[],
  rawEdges: AiEdge[],
): DesignGraph {
  const seen = new Set<string>()
  const nodes: Omit<DesignNode, 'x' | 'y'>[] = []
  for (const n of rawNodes) {
    const id = String(n.id ?? '').trim()
    if (!id || seen.has(id)) continue
    seen.add(id)
    nodes.push({
      id,
      kind: kindOf(n.type),
      label: String(n.label ?? id).slice(0, 40),
      ...(n.note?.trim() ? { note: n.note.trim().slice(0, 60) } : {}),
    })
  }

  const edges: DesignEdge[] = []
  const edgeSeen = new Set<string>()
  for (const e of rawEdges) {
    const source = String(e.from ?? '').trim()
    const target = String(e.to ?? '').trim()
    if (!seen.has(source) || !seen.has(target) || source === target) continue
    const key = `${source}->${target}`
    if (edgeSeen.has(key)) continue
    edgeSeen.add(key)
    edges.push({
      id: `e-${key}`,
      source,
      target,
      ...(e.label?.trim() ? { label: e.label.trim().slice(0, 30) } : {}),
      ...(e.dashed === true ? { dashed: true } : {}),
    })
  }

  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', nodesep: 56, ranksep: 80, marginx: 20, marginy: 20 })
  g.setDefaultEdgeLabel(() => ({}))
  for (const n of nodes) g.setNode(n.id, { width: NODE_W, height: NODE_H })
  for (const e of edges) g.setEdge(e.source, e.target)
  dagre.layout(g)

  return {
    nodes: nodes.map((n) => {
      const pos = g.node(n.id)
      // dagre positions are centers; React Flow positions are top-left.
      return { ...n, x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 }
    }),
    edges,
  }
}
