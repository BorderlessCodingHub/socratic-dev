import systemDesignLib from './system-design.lib.json'

type RawEl = {
  type?: string
  isDeleted?: boolean
  x?: number
  y?: number
  width?: number
  height?: number
  angle?: number
  strokeColor?: string
  backgroundColor?: string
  fillStyle?: string
  strokeWidth?: number
  strokeStyle?: string
  roughness?: number
  opacity?: number
  strokeSharpness?: string
  points?: number[][]
  startArrowhead?: string | null
  endArrowhead?: string | null
  text?: string
  fontSize?: number
  fontFamily?: number
  textAlign?: string
  verticalAlign?: string
}

export type LibraryComponent = {
  width: number
  height: number
  /** index in `elements` of the invisible full-size rect used as arrow bind target */
  bindIndex: number
  /** index in `elements` of the title text element (text to replace with node label) */
  titleIndex: number
  elements: Record<string, unknown>[]
}

const TARGET_W = 210
const MAX_H = 180

const CURATED: Record<string, { index: number; title: string; dropText?: RegExp }> = {
  service: { index: 1, title: 'Application\nserver' },
  worker: { index: 3, title: 'server' },
  database: { index: 6, title: 'Relational DB' },
  storage: { index: 7, title: 'Object Storage' },
  cache: { index: 13, title: 'Cache', dropText: /^(Key|Value)$/ },
  gateway: { index: 14, title: 'Auth &\n IAM' },
  lb: { index: 16, title: 'Load\nBalancer' },
  queue: { index: 17, title: 'Message Q' },
  external: { index: 19, title: 'cloud' },
  cdn: { index: 20, title: 'CDN' },
  client: { index: 23, title: 'Web Application', dropText: /^\S$|^Lorem ipsum/ },
}

const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()

function roundnessOf(el: RawEl): { type: number } | null {
  if (el.strokeSharpness !== 'round') return null
  if (el.type === 'rectangle') return { type: 3 }
  if (el.type === 'line' || el.type === 'arrow') return { type: 2 }
  return null
}

function sanitize(el: RawEl, dx: number, dy: number, s: number): Record<string, unknown> {
  const out: Record<string, unknown> = {
    type: el.type,
    x: ((el.x ?? 0) - dx) * s,
    y: ((el.y ?? 0) - dy) * s,
    width: (el.width ?? 0) * s,
    height: (el.height ?? 0) * s,
    angle: el.angle ?? 0,
    strokeColor: el.strokeColor ?? '#1b1916',
    backgroundColor: el.backgroundColor ?? 'transparent',
    fillStyle: el.fillStyle ?? 'solid',
    strokeWidth: el.strokeWidth ?? 1,
    strokeStyle: el.strokeStyle ?? 'solid',
    roughness: el.roughness ?? 1,
    opacity: el.opacity ?? 100,
    roundness: roundnessOf(el),
  }
  if (el.type === 'line' || el.type === 'arrow') {
    out.points = (el.points ?? [[0, 0], [el.width ?? 0, el.height ?? 0]]).map(
      (p) => [(p[0] ?? 0) * s, (p[1] ?? 0) * s],
    )
    if (el.type === 'arrow') {
      out.startArrowhead = el.startArrowhead ?? null
      out.endArrowhead = el.endArrowhead ?? null
    }
  }
  if (el.type === 'text') {
    out.text = el.text ?? ''
    out.fontSize = Math.max(8, (el.fontSize ?? 16) * s)
    out.fontFamily = el.fontFamily ?? 1
    out.textAlign = el.textAlign ?? 'center'
    out.verticalAlign = el.verticalAlign ?? 'top'
  }
  return out
}

const cache = new Map<string, LibraryComponent | null>()

export function getLibraryComponent(type: string): LibraryComponent | null {
  if (cache.has(type)) return cache.get(type)!
  const comp = build(type)
  cache.set(type, comp)
  return comp
}

function build(type: string): LibraryComponent | null {
  const spec = CURATED[type]
  if (!spec) return null
  const item = (systemDesignLib.library as RawEl[][])[spec.index]
  if (!Array.isArray(item)) return null

  const els = item.filter((e) => {
    if (e.isDeleted) return false
    if (e.type === 'text' && spec.dropText) {
      const txt = (e.text ?? '').trim()
      if (norm(txt) !== norm(spec.title) && spec.dropText.test(txt)) return false
    }
    return true
  })
  if (els.length === 0) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const e of els) {
    const x = e.x ?? 0
    const y = e.y ?? 0
    const w = e.width ?? 0
    const h = e.height ?? 0
    minX = Math.min(minX, x, x + w)
    minY = Math.min(minY, y, y + h)
    maxX = Math.max(maxX, x, x + w)
    maxY = Math.max(maxY, y, y + h)
  }
  const rawW = maxX - minX
  const rawH = maxY - minY
  if (!(rawW > 0) || !(rawH > 0)) return null

  const s = Math.min(TARGET_W / rawW, MAX_H / rawH)
  const width = rawW * s
  const height = rawH * s

  const elements = els.map((e) => sanitize(e, minX, minY, s))

  const titleIndex = els.findIndex(
    (e) => e.type === 'text' && norm(e.text ?? '') === norm(spec.title),
  )
  if (titleIndex < 0) return null

  // Invisible full-size rect: stable arrow bind target covering the whole
  // component (curated items' largest bindable shape can be tiny, e.g. queue).
  const bindIndex = elements.length
  elements.push({
    type: 'rectangle',
    x: 0,
    y: 0,
    width,
    height,
    angle: 0,
    strokeColor: 'transparent',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    roundness: null,
  })

  return { width, height, bindIndex, titleIndex, elements }
}
