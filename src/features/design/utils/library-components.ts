import systemDesignLib from './system-design.lib.json'
import infraLib from './infra.lib.json'

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
  pressures?: number[]
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

const SD = systemDesignLib.library as RawEl[][]
const INFRA = infraLib.library as RawEl[][]

// db-eng items carry residual captions ('host', 'Very fast Server', ...):
// drop every text except the title.
const DROP_ALL = /[\s\S]*/

const CURATED: Record<
  string,
  { lib: RawEl[][]; index: number; title: string; dropText?: RegExp }
> = {
  service: { lib: INFRA, index: 3, title: 'Server', dropText: DROP_ALL },
  worker: { lib: INFRA, index: 5, title: 'Server', dropText: DROP_ALL },
  database: { lib: INFRA, index: 0, title: 'Database', dropText: DROP_ALL },
  storage: { lib: SD, index: 7, title: 'Object Storage' },
  cache: { lib: SD, index: 13, title: 'Cache', dropText: /^(Key|Value)$/ },
  gateway: { lib: INFRA, index: 2, title: 'Firewall', dropText: DROP_ALL },
  lb: { lib: INFRA, index: 1, title: 'Load\nBalancer', dropText: DROP_ALL },
  queue: { lib: SD, index: 17, title: 'Message Q' },
  cdn: { lib: SD, index: 20, title: 'CDN' },
  client: { lib: SD, index: 23, title: 'Web Application', dropText: /^\S$|^Lorem ipsum/ },
}

const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()

// v1 libs use type 'draw'; 0.18+ renamed it to 'freedraw'.
const typeOf = (el: RawEl) => (el.type === 'draw' ? 'freedraw' : el.type)

const hasPoints = (el: RawEl) => {
  const t = typeOf(el)
  return t === 'line' || t === 'arrow' || t === 'freedraw'
}

function roundnessOf(el: RawEl): { type: number } | null {
  if (el.strokeSharpness !== 'round') return null
  if (el.type === 'rectangle') return { type: 3 }
  if (el.type === 'line' || el.type === 'arrow') return { type: 2 }
  return null
}

// For point-based elements x/y anchor the first point, which may not be the
// top-left corner (points can be negative), so derive the bbox from points.
function bboxOf(el: RawEl): [number, number, number, number] {
  const x = el.x ?? 0
  const y = el.y ?? 0
  if (hasPoints(el) && Array.isArray(el.points) && el.points.length > 0) {
    const xs = el.points.map((p) => p[0] ?? 0)
    const ys = el.points.map((p) => p[1] ?? 0)
    return [
      x + Math.min(...xs),
      y + Math.min(...ys),
      x + Math.max(...xs),
      y + Math.max(...ys),
    ]
  }
  const w = el.width ?? 0
  const h = el.height ?? 0
  return [Math.min(x, x + w), Math.min(y, y + h), Math.max(x, x + w), Math.max(y, y + h)]
}

function sanitize(el: RawEl, dx: number, dy: number, s: number): Record<string, unknown> {
  const type = typeOf(el)
  const out: Record<string, unknown> = {
    type,
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
  if (hasPoints(el)) {
    out.points = (el.points ?? [[0, 0], [el.width ?? 0, el.height ?? 0]]).map(
      (p) => [(p[0] ?? 0) * s, (p[1] ?? 0) * s],
    )
    if (type === 'arrow') {
      out.startArrowhead = el.startArrowhead ?? null
      out.endArrowhead = el.endArrowhead ?? null
    }
    if (type === 'freedraw') {
      out.pressures = el.pressures ?? []
      out.simulatePressure = !el.pressures?.length
    }
  }
  if (type === 'text') {
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
  const item = spec.lib[spec.index]
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
    const [x0, y0, x1, y1] = bboxOf(e)
    minX = Math.min(minX, x0)
    minY = Math.min(minY, y0)
    maxX = Math.max(maxX, x1)
    maxY = Math.max(maxY, y1)
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
