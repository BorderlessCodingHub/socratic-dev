export type NodeKind =
  | 'client'
  | 'cdn'
  | 'lb'
  | 'gateway'
  | 'service'
  | 'worker'
  | 'queue'
  | 'cache'
  | 'database'
  | 'storage'
  | 'search'
  | 'external'
  | 'custom'

export type DesignNode = {
  id: string
  kind: NodeKind
  label: string
  note?: string
  x: number
  y: number
}

export type DesignEdge = {
  id: string
  source: string
  target: string
  label?: string
  dashed?: boolean
}

export type DesignGraph = {
  nodes: DesignNode[]
  edges: DesignEdge[]
}

export const EMPTY_GRAPH: DesignGraph = { nodes: [], edges: [] }

export const NODE_KINDS: NodeKind[] = [
  'client',
  'cdn',
  'lb',
  'gateway',
  'service',
  'worker',
  'queue',
  'cache',
  'database',
  'storage',
  'search',
  'external',
  'custom',
]

const KIND_SET = new Set<string>(NODE_KINDS)

// The AI (and older prompts) use looser type names — normalize anything
// recognizable onto the canonical kinds instead of failing.
const KIND_ALIAS: Record<string, NodeKind> = {
  user: 'client', users: 'client', mobile: 'client', web: 'client',
  frontend: 'client', browser: 'client', app: 'client',
  loadbalancer: 'lb', 'load-balancer': 'lb', nginx: 'lb',
  proxy: 'gateway', 'api-gateway': 'gateway', apigateway: 'gateway',
  api: 'service', server: 'service', backend: 'service',
  microservice: 'service',
  'third-party': 'external', saas: 'external',
  broker: 'queue', kafka: 'queue', rabbitmq: 'queue', sqs: 'queue',
  pubsub: 'queue', 'message-queue': 'queue',
  redis: 'cache', memcached: 'cache',
  db: 'database', sql: 'database', postgres: 'database', mysql: 'database',
  mongo: 'database', mongodb: 'database', nosql: 'database',
  s3: 'storage', blob: 'storage', bucket: 'storage', files: 'storage',
  'object-storage': 'storage',
  elasticsearch: 'search', elastic: 'search', opensearch: 'search',
  solr: 'search', 'search-engine': 'search',
  job: 'worker', cron: 'worker', consumer: 'worker', batch: 'worker',
}

export function kindOf(type: unknown): NodeKind {
  const k = String(type ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
  if (KIND_SET.has(k)) return k as NodeKind
  return KIND_ALIAS[k] ?? 'service'
}

export function coerceGraph(raw: unknown): DesignGraph {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return EMPTY_GRAPH
  const o = raw as { nodes?: unknown; edges?: unknown }
  if (!Array.isArray(o.nodes)) return EMPTY_GRAPH

  const nodes: DesignNode[] = []
  const ids = new Set<string>()
  for (const item of o.nodes) {
    if (!item || typeof item !== 'object') continue
    const n = item as Record<string, unknown>
    const id = typeof n.id === 'string' ? n.id : ''
    const label = typeof n.label === 'string' ? n.label.trim() : ''
    if (!id || !label || ids.has(id)) continue
    ids.add(id)
    nodes.push({
      id,
      kind: kindOf(n.kind),
      label: label.slice(0, 40),
      ...(typeof n.note === 'string' && n.note.trim()
        ? { note: n.note.trim().slice(0, 60) }
        : {}),
      x: Number.isFinite(n.x) ? (n.x as number) : 0,
      y: Number.isFinite(n.y) ? (n.y as number) : 0,
    })
  }

  const edges: DesignEdge[] = []
  const edgeIds = new Set<string>()
  for (const item of Array.isArray(o.edges) ? o.edges : []) {
    if (!item || typeof item !== 'object') continue
    const e = item as Record<string, unknown>
    const id = typeof e.id === 'string' ? e.id : ''
    const source = typeof e.source === 'string' ? e.source : ''
    const target = typeof e.target === 'string' ? e.target : ''
    if (!id || edgeIds.has(id)) continue
    if (!ids.has(source) || !ids.has(target) || source === target) continue
    edgeIds.add(id)
    edges.push({
      id,
      source,
      target,
      ...(typeof e.label === 'string' && e.label.trim()
        ? { label: e.label.trim().slice(0, 30) }
        : {}),
      ...(e.dashed === true ? { dashed: true } : {}),
    })
  }

  return { nodes, edges }
}
