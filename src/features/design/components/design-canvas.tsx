'use client'

import '@xyflow/react/dist/style.css'

import { useT } from '@/lib/i18n'
import { useIsDark } from '@/lib/theme'
import { cn } from '@/lib/utils'
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  BaseEdge,
  ConnectionMode,
  Controls,
  EdgeLabelRenderer,
  getNodesBounds,
  getSmoothStepPath,
  getViewportForBounds,
  Handle,
  MarkerType,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useInternalNode,
  useNodesInitialized,
  useReactFlow,
  useStore,
  type Connection,
  type Edge,
  type EdgeChange,
  type EdgeProps,
  type Node,
  type NodeChange,
  type NodeProps,
} from '@xyflow/react'
import { toPng } from 'html-to-image'
import {
  ArrowLeftRight,
  Box,
  Cloud,
  Cog,
  Database,
  Globe,
  HardDrive,
  ListOrdered,
  Monitor,
  Search,
  Server,
  Shield,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import * as React from 'react'
import type { DesignGraph, NodeKind } from '../graph/types'
import { NODE_KINDS } from '../graph/types'

const copy = {
  en: {
    kinds: {
      client: 'Client',
      cdn: 'CDN',
      lb: 'Load balancer',
      gateway: 'Gateway',
      service: 'Service',
      worker: 'Worker',
      queue: 'Queue',
      cache: 'Cache',
      database: 'Database',
      storage: 'Storage',
      search: 'Search',
      external: 'External',
      custom: 'Custom',
    } as Record<NodeKind, string>,
    palette: 'Components',
    hint: 'double-click renames · drag from a handle to connect · Delete removes',
    labelPlaceholder: 'name',
    notePlaceholder: 'note (optional)',
    edgePlaceholder: 'action',
    addLabel: '+ label',
  },
  pt: {
    kinds: {
      client: 'Cliente',
      cdn: 'CDN',
      lb: 'Load balancer',
      gateway: 'Gateway',
      service: 'Serviço',
      worker: 'Worker',
      queue: 'Fila',
      cache: 'Cache',
      database: 'Banco',
      storage: 'Storage',
      search: 'Busca',
      external: 'Externo',
      custom: 'Personalizado',
    } as Record<NodeKind, string>,
    palette: 'Componentes',
    hint: 'duplo clique renomeia · arraste de uma alça para conectar · Delete apaga',
    labelPlaceholder: 'nome',
    notePlaceholder: 'nota (opcional)',
    edgePlaceholder: 'ação',
    addLabel: '+ rótulo',
  },
}

const KIND_META: Record<NodeKind, { icon: LucideIcon; fill: string }> = {
  client: { icon: Monitor, fill: 'bg-pastel-mist' },
  cdn: { icon: Globe, fill: 'bg-pastel-stone' },
  lb: { icon: ArrowLeftRight, fill: 'bg-pastel-greige' },
  gateway: { icon: Shield, fill: 'bg-pastel-greige' },
  service: { icon: Server, fill: 'bg-pastel-lavender' },
  worker: { icon: Cog, fill: 'bg-pastel-lavender' },
  queue: { icon: ListOrdered, fill: 'bg-pastel-sand' },
  cache: { icon: Zap, fill: 'bg-pastel-lilac' },
  database: { icon: Database, fill: 'bg-pastel-sage' },
  storage: { icon: HardDrive, fill: 'bg-pastel-sage' },
  search: { icon: Search, fill: 'bg-pastel-sage' },
  external: { icon: Cloud, fill: 'bg-pastel-stone' },
  custom: { icon: Box, fill: 'bg-pastel-greige' },
}

type NodeData = { kind: NodeKind; label: string; note?: string }
type CanvasNode = Node<NodeData, 'design'>
type CanvasEdge = Edge<Record<string, unknown>, 'design'> & {
  data?: { dashed?: boolean }
}

export type DesignCanvasApi = {
  getGraph: () => DesignGraph
  // focus: center the view on that node (walkthrough steps) instead of
  // fitting the whole graph.
  setGraph: (graph: DesignGraph, opts?: { fit?: boolean; focus?: string }) => void
  fitView: () => void
  // Raw base64 PNG (no data: prefix) of the whole diagram, for the review.
  exportPng: () => Promise<string | null>
}

function toFlow(graph: DesignGraph): {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
} {
  return {
    nodes: graph.nodes.map((n) => ({
      id: n.id,
      type: 'design' as const,
      position: { x: n.x, y: n.y },
      data: { kind: n.kind, label: n.label, note: n.note },
    })),
    edges: graph.edges.map((e) => ({
      id: e.id,
      type: 'design' as const,
      source: e.source,
      target: e.target,
      label: e.label,
      data: { dashed: e.dashed },
    })),
  }
}

function toGraph(nodes: CanvasNode[], edges: CanvasEdge[]): DesignGraph {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      kind: n.data.kind,
      label: n.data.label,
      ...(n.data.note ? { note: n.data.note } : {}),
      x: Math.round(n.position.x),
      y: Math.round(n.position.y),
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      ...(typeof e.label === 'string' && e.label ? { label: e.label } : {}),
      ...(e.data?.dashed ? { dashed: true } : {}),
    })),
  }
}

const HANDLE_CLASS =
  '!size-2 !rounded-full !border !border-background !bg-ink/40 transition-colors hover:!bg-primary'

function DesignNodeView({ id, data, selected }: NodeProps<CanvasNode>) {
  const t = useT(copy)
  const { setNodes } = useReactFlow()
  const [editing, setEditing] = React.useState(false)
  const meta = KIND_META[data.kind]
  const Icon = meta.icon

  const commit = (label: string, note: string) => {
    setEditing(false)
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === id
          ? {
              ...n,
              data: {
                ...n.data,
                label: label.trim().slice(0, 40) || data.label,
                note: note.trim().slice(0, 60) || undefined,
              },
            }
          : n,
      ),
    )
  }

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      className={cn(
        'shadow-soft min-w-[176px] max-w-[260px] rounded-lg border px-4 py-3 transition-shadow',
        meta.fill,
        selected
          ? 'border-primary ring-2 ring-primary/30'
          : 'border-ink/15 hover:shadow-soft-lg',
      )}
    >
      <Handle type='target' position={Position.Top} className={HANDLE_CLASS} />
      <Handle type='target' position={Position.Left} id='l' className={HANDLE_CLASS} />

      <div className='flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-ink/50 uppercase'>
        <Icon className='size-3.5' strokeWidth={1.5} />
        {t.kinds[data.kind]}
      </div>

      {editing ? (
        <NodeEditor
          label={data.label}
          note={data.note ?? ''}
          onCommit={commit}
        />
      ) : (
        <>
          <div className='mt-1 text-[15px] leading-snug font-medium break-words text-ink'>
            {data.label}
          </div>
          {data.note && (
            <div className='mt-0.5 font-mono text-[11.5px] leading-snug break-words text-ink/60'>
              {data.note}
            </div>
          )}
        </>
      )}

      <Handle type='source' position={Position.Bottom} className={HANDLE_CLASS} />
      <Handle type='source' position={Position.Right} id='r' className={HANDLE_CLASS} />
    </div>
  )
}

function NodeEditor({
  label,
  note,
  onCommit,
}: {
  label: string
  note: string
  onCommit: (label: string, note: string) => void
}) {
  const t = useT(copy)
  const [l, setL] = React.useState(label)
  const [n, setN] = React.useState(note)
  const lRef = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    lRef.current?.focus()
    lRef.current?.select()
  }, [])
  const commit = () => onCommit(l, n)
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') onCommit(label, note)
    e.stopPropagation()
  }
  return (
    <div
      className='nodrag mt-1 flex flex-col gap-1'
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) commit()
      }}
    >
      <input
        ref={lRef}
        value={l}
        onChange={(e) => setL(e.target.value)}
        onKeyDown={onKey}
        placeholder={t.labelPlaceholder}
        className='w-full rounded border border-ink/20 bg-background/80 px-1.5 py-0.5 text-[13px] text-ink outline-none'
      />
      <input
        value={n}
        onChange={(e) => setN(e.target.value)}
        onKeyDown={onKey}
        placeholder={t.notePlaceholder}
        className='w-full rounded border border-ink/20 bg-background/80 px-1.5 py-0.5 font-mono text-[10.5px] text-ink outline-none'
      />
    </div>
  )
}

function floatingAnchors(
  src: { x: number; y: number; w: number; h: number },
  tgt: { x: number; y: number; w: number; h: number },
): {
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: Position
  targetPosition: Position
} {
  const scx = src.x + src.w / 2
  const scy = src.y + src.h / 2
  const tcx = tgt.x + tgt.w / 2
  const tcy = tgt.y + tgt.h / 2
  const dx = tcx - scx
  const dy = tcy - scy

  if (Math.abs(dy) >= Math.abs(dx)) {
    const down = dy > 0
    return {
      sourceX: scx,
      sourceY: down ? src.y + src.h : src.y,
      sourcePosition: down ? Position.Bottom : Position.Top,
      targetX: tcx,
      targetY: down ? tgt.y : tgt.y + tgt.h,
      targetPosition: down ? Position.Top : Position.Bottom,
    }
  }
  const right = dx > 0
  return {
    sourceX: right ? src.x + src.w : src.x,
    sourceY: scy,
    sourcePosition: right ? Position.Right : Position.Left,
    targetX: right ? tgt.x : tgt.x + tgt.w,
    targetY: tcy,
    targetPosition: right ? Position.Left : Position.Right,
  }
}

function DesignEdgeView({
  id,
  source,
  target,
  sourceX: propSourceX,
  sourceY: propSourceY,
  targetX: propTargetX,
  targetY: propTargetY,
  sourcePosition: propSourcePosition,
  targetPosition: propTargetPosition,
  selected,
  label,
  data,
  markerEnd,
}: EdgeProps<CanvasEdge>) {
  const t = useT(copy)
  const { setEdges } = useReactFlow()
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(String(label ?? ''))

  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)
  const hasReverse = useStore((s) =>
    s.edges.some((e) => e.source === target && e.target === source),
  )

  let anchors = {
    sourceX: propSourceX,
    sourceY: propSourceY,
    targetX: propTargetX,
    targetY: propTargetY,
    sourcePosition: propSourcePosition,
    targetPosition: propTargetPosition,
  }
  if (sourceNode?.measured?.width && targetNode?.measured?.width) {
    anchors = floatingAnchors(
      {
        x: sourceNode.internals.positionAbsolute.x,
        y: sourceNode.internals.positionAbsolute.y,
        w: sourceNode.measured.width,
        h: sourceNode.measured.height ?? 0,
      },
      {
        x: targetNode.internals.positionAbsolute.x,
        y: targetNode.internals.positionAbsolute.y,
        w: targetNode.measured.width,
        h: targetNode.measured.height ?? 0,
      },
    )
  }

  if (hasReverse) {
    const dx = anchors.targetX - anchors.sourceX
    const dy = anchors.targetY - anchors.sourceY
    const len = Math.hypot(dx, dy) || 1
    const off = 14
    const px = (-dy / len) * off
    const py = (dx / len) * off
    anchors = {
      ...anchors,
      sourceX: anchors.sourceX + px,
      sourceY: anchors.sourceY + py,
      targetX: anchors.targetX + px,
      targetY: anchors.targetY + py,
    }
  }

  const [path, labelX, labelY] = getSmoothStepPath({
    ...anchors,
    borderRadius: 14,
  })

  const commit = () => {
    setEditing(false)
    setEdges((edges) =>
      edges.map((e) =>
        e.id === id
          ? { ...e, label: draft.trim().slice(0, 30) || undefined }
          : e,
      ),
    )
  }

  const showChip = editing || !!label || selected

  return (
    <>
      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        className={cn(
          selected ? '!stroke-primary' : '!stroke-ink/60',
        )}
        style={{
          strokeWidth: 1.75,
          ...(data?.dashed ? { strokeDasharray: '7 5' } : {}),
        }}
      />
      {showChip && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            className='nodrag nopan pointer-events-auto absolute'
            onDoubleClick={() => {
              setDraft(String(label ?? ''))
              setEditing(true)
            }}
          >
            {editing ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commit()
                  if (e.key === 'Escape') setEditing(false)
                  e.stopPropagation()
                }}
                placeholder={t.edgePlaceholder}
                className='w-24 rounded-full border border-primary/40 bg-background px-2 py-0.5 text-center font-mono text-[10px] text-ink outline-none'
              />
            ) : label ? (
              <span
                className={cn(
                  'block rounded-full border px-2 py-0.5 font-mono text-[10px]',
                  selected
                    ? 'border-primary/40 bg-background text-primary'
                    : 'border-border bg-background text-muted-foreground',
                )}
              >
                {label}
              </span>
            ) : (
              <button
                type='button'
                onClick={() => {
                  setDraft('')
                  setEditing(true)
                }}
                className='block cursor-pointer rounded-full border border-dashed border-primary/50 bg-background px-2 py-0.5 font-mono text-[10px] text-primary'
              >
                {t.addLabel}
              </button>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

const nodeTypes = { design: DesignNodeView }
const edgeTypes = { design: DesignEdgeView }

const DEFAULT_EDGE_OPTIONS = {
  type: 'design' as const,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: 'var(--ink)',
  },
}

const EXPORT_W = 1400
const EXPORT_H = 900

function CanvasInner({
  initialGraph,
  onApi,
  onChange,
}: {
  initialGraph: DesignGraph
  onApi: (api: DesignCanvasApi) => void
  onChange: (graph: DesignGraph) => void
}) {
  const t = useT(copy)
  const dark = useIsDark()
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const flow = useReactFlow()

  const initial = React.useMemo(() => toFlow(initialGraph), [initialGraph])
  const [nodes, setNodes] = React.useState<CanvasNode[]>(initial.nodes)
  const [edges, setEdges] = React.useState<CanvasEdge[]>(initial.edges)

  const nodesInitialized = useNodesInitialized()
  const [fitQueued, setFitQueued] = React.useState<
    false | { focus?: string }
  >(false)
  React.useEffect(() => {
    if (!fitQueued) return
    const ready =
      nodesInitialized && flow.getNodes().every((n) => n.measured?.width)
    if (!ready) return
    const focus = fitQueued.focus
    setFitQueued(false)
    const id = window.requestAnimationFrame(() => {
      const node = focus
        ? flow.getNodes().find((n) => n.id === focus)
        : undefined
      if (node) {
        // Camera-follow for the walkthrough: center on the component this
        // step explains, at a readable zoom (fitView's `nodes` filter proved
        // unreliable here, so center manually).
        const w = node.measured?.width ?? 200
        const h = node.measured?.height ?? 90
        void flow.setCenter(
          node.position.x + w / 2,
          node.position.y + h / 2,
          { zoom: 0.95, duration: 350 },
        )
      } else {
        void flow.fitView({ padding: 0.18, duration: 350 })
      }
    })
    return () => window.cancelAnimationFrame(id)
  }, [fitQueued, nodesInitialized, flow])

  const onNodesChange = React.useCallback(
    (changes: NodeChange<CanvasNode>[]) =>
      setNodes((ns) => applyNodeChanges(changes, ns)),
    [],
  )
  const onEdgesChange = React.useCallback(
    (changes: EdgeChange<CanvasEdge>[]) =>
      setEdges((es) => applyEdgeChanges(changes, es)),
    [],
  )
  const onConnect = React.useCallback(
    (conn: Connection) =>
      setEdges((es) =>
        addEdge<CanvasEdge>(
          {
            ...conn,
            id: `e-${crypto.randomUUID().slice(0, 8)}`,
            type: 'design',
            data: {},
          },
          es,
        ),
      ),
    [],
  )

  const mounted = React.useRef(false)
  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    onChange(toGraph(nodes, edges))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges])

  const addNode = React.useCallback(
    (kind: NodeKind) => {
      const rect = wrapperRef.current?.getBoundingClientRect()
      const center = rect
        ? flow.screenToFlowPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          })
        : { x: 0, y: 0 }
      const jitter = () => Math.round((Math.random() - 0.5) * 60)
      setNodes((ns) => [
        ...ns,
        {
          id: `n-${crypto.randomUUID().slice(0, 8)}`,
          type: 'design',
          position: { x: center.x + jitter(), y: center.y + jitter() },
          data: { kind, label: t.kinds[kind] },
        },
      ])
    },
    [flow, t],
  )

  React.useEffect(() => {
    onApi({
      getGraph: () => toGraph(flow.getNodes() as CanvasNode[], flow.getEdges() as CanvasEdge[]),
      setGraph: (graph, opts) => {
        const next = toFlow(graph)
        setNodes(next.nodes)
        setEdges(next.edges)
        if (opts?.fit !== false) setFitQueued({ focus: opts?.focus })
      },
      fitView: () => flow.fitView({ padding: 0.15, duration: 300 }),
      exportPng: async () => {
        const el = wrapperRef.current?.querySelector<HTMLElement>(
          '.react-flow__viewport',
        )
        const allNodes = flow.getNodes()
        if (!el || allNodes.length === 0) return null
        const bounds = getNodesBounds(allNodes)
        const vp = getViewportForBounds(
          bounds,
          EXPORT_W,
          EXPORT_H,
          0.3,
          1.5,
          0.08,
        )
        try {
          const dataUrl = await toPng(el, {
            backgroundColor: dark ? '#121110' : '#ffffff',
            width: EXPORT_W,
            height: EXPORT_H,
            style: {
              width: `${EXPORT_W}px`,
              height: `${EXPORT_H}px`,
              transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})`,
            },
          })
          return dataUrl.split(',')[1] ?? null
        } catch {
          return null
        }
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow, dark])

  return (
    <div ref={wrapperRef} className='h-full w-full'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        colorMode={dark ? 'dark' : 'light'}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={1.35}
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} />
        <Controls showInteractive={false} position='bottom-right' />
        <MiniMap
          position='bottom-left'
          pannable
          zoomable
          className='!h-24 !w-36'
        />
        <Panel position='top-left'>
          <div className='shadow-soft max-w-[300px] rounded-lg border border-border bg-background/95 p-2 backdrop-blur'>
            <div className='px-1 pb-1.5 font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase'>
              {t.palette}
            </div>
            <div className='grid grid-cols-3 gap-1'>
              {NODE_KINDS.map((kind) => {
                const Icon = KIND_META[kind].icon
                return (
                  <button
                    key={kind}
                    type='button'
                    onClick={() => addNode(kind)}
                    title={t.kinds[kind]}
                    className='flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-transparent px-1.5 py-1.5 text-[10px] text-muted-foreground transition-colors hover:border-border hover:bg-secondary hover:text-ink'
                  >
                    <Icon className='size-3.5' strokeWidth={1.5} />
                    <span className='w-full truncate text-center'>
                      {t.kinds[kind]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </Panel>
        <Panel position='top-right'>
          <div className='rounded-full border border-border bg-background/90 px-3 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur'>
            {t.hint}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export function DesignCanvas({
  initialGraph,
  onApi,
  onChange,
}: {
  initialGraph: DesignGraph
  onApi: (api: DesignCanvasApi) => void
  onChange: (graph: DesignGraph) => void
}) {
  return (
    <ReactFlowProvider>
      <CanvasInner
        initialGraph={initialGraph}
        onApi={onApi}
        onChange={onChange}
      />
    </ReactFlowProvider>
  )
}
