'use client'

import {
  DesignCanvas,
  type DesignCanvasApi,
} from '@/features/design/components/design-canvas'
import { layoutAiGraph } from '@/features/design/graph/layout'
import { summarizeGraph } from '@/features/design/graph/summarize'
import { notFound } from 'next/navigation'
import * as React from 'react'


type Fixture = {
  nodes: { id: string; label: string; type?: string; note?: string }[]
  edges: { from: string; to: string; label?: string; dashed?: boolean }[]
}

const FIXTURES: Record<string, Fixture> = {
  bidirectional: {
    nodes: [
      { id: 'web', label: 'Web', type: 'client' },
      { id: 'api', label: 'API', type: 'service' },
      { id: 'pay', label: 'Stripe', type: 'external' },
      { id: 'db', label: 'Postgres', type: 'database' },
    ],
    edges: [
      { from: 'web', to: 'api', label: 'HTTPS' },
      { from: 'api', to: 'pay', label: 'cobra' },
      { from: 'pay', to: 'api', label: 'webhook', dashed: true },
      { from: 'api', to: 'db', label: 'grava' },
      { from: 'db', to: 'api', label: 'lê' },
    ],
  },
  longedge: {
    nodes: [
      { id: 'web', label: 'Web App', type: 'client', note: 'SPA' },
      { id: 'lb', label: 'ALB', type: 'lb' },
      { id: 'api', label: 'API', type: 'service', note: 'réplicas ×3' },
      { id: 'queue', label: 'SQS', type: 'queue' },
      { id: 'worker', label: 'Worker', type: 'worker' },
      { id: 'db', label: 'Aurora', type: 'database' },
      { id: 's3', label: 'S3', type: 'storage', note: 'raw + renditions' },
    ],
    edges: [
      { from: 'web', to: 'lb', label: 'HTTPS' },
      { from: 'lb', to: 'api', label: 'roteia' },
      { from: 'api', to: 'queue', label: 'publica', dashed: true },
      { from: 'queue', to: 'worker', label: 'consome', dashed: true },
      { from: 'worker', to: 'db', label: 'grava' },
      { from: 'worker', to: 's3', label: 'salva' },
      // The complaint case: first node linking to the farthest one.
      { from: 'web', to: 's3', label: 'upload direto' },
    ],
  },
  dense: {
    nodes: [
      { id: 'web', label: 'Web', type: 'client' },
      { id: 'mob', label: 'Mobile', type: 'client' },
      { id: 'cdn', label: 'CloudFront', type: 'cdn', note: 'assets' },
      { id: 'lb', label: 'ALB', type: 'lb' },
      { id: 'auth', label: 'Auth', type: 'gateway' },
      { id: 'api', label: 'API', type: 'service', note: 'réplicas ×3' },
      { id: 'cache', label: 'Redis', type: 'cache' },
      { id: 'queue', label: 'SQS', type: 'queue' },
      { id: 'worker', label: 'Worker', type: 'worker' },
      { id: 'db', label: 'Aurora', type: 'database', note: 'primária' },
      { id: 's3', label: 'S3', type: 'storage' },
    ],
    edges: [
      { from: 'web', to: 'cdn', label: 'GET' },
      { from: 'web', to: 'lb', label: 'HTTPS' },
      { from: 'mob', to: 'lb', label: 'HTTPS' },
      { from: 'lb', to: 'auth', label: 'valida' },
      { from: 'auth', to: 'api', label: 'roteia' },
      { from: 'api', to: 'cache', label: 'lê' },
      { from: 'api', to: 'db', label: 'grava' },
      { from: 'api', to: 'queue', label: 'publica', dashed: true },
      { from: 'queue', to: 'worker', label: 'consome', dashed: true },
      { from: 'worker', to: 's3', label: 'salva' },
      { from: 'worker', to: 'db', label: 'atualiza' },
    ],
  },
  minimal: {
    nodes: [
      { id: 'a', label: 'App', type: 'client' },
      { id: 'b', label: 'API', type: 'service' },
    ],
    edges: [{ from: 'a', to: 'b', label: 'chama' }],
  },
}

declare global {
  interface Window {
    __summary?: string
  }
}

export default function ScenePreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  const apiRef = React.useRef<DesignCanvasApi | null>(null)
  const [fixture, setFixture] = React.useState('bidirectional')
  const [revealed, setRevealed] = React.useState<number | null>(null)
  const [status, setStatus] = React.useState('')

  const load = React.useCallback((name: string, upTo: number | null) => {
    const api = apiRef.current
    if (!api) return
    const f = FIXTURES[name]
    const graph = layoutAiGraph(f.nodes, f.edges)
    const visible =
      upTo === null
        ? graph
        : {
            nodes: graph.nodes.slice(0, upTo),
            edges: graph.edges.filter(
              (e) =>
                graph.nodes.slice(0, upTo).some((n) => n.id === e.source) &&
                graph.nodes.slice(0, upTo).some((n) => n.id === e.target),
            ),
          }
    api.setGraph(visible, {
      focus:
        upTo !== null ? visible.nodes[visible.nodes.length - 1]?.id : undefined,
    })
    window.__summary = summarizeGraph(visible)
    setStatus(
      `${name}: ${visible.nodes.length}/${graph.nodes.length} nós · ${visible.edges.length} conexões`,
    )
  }, [])

  return (
    <div className='flex h-screen flex-col'>
      <div className='border-border flex h-12 shrink-0 items-center gap-2 border-b px-4'>
        <span className='font-mono text-xs'>canvas-preview</span>
        {Object.keys(FIXTURES).map((name) => (
          <button
            key={name}
            type='button'
            data-fixture={name}
            onClick={() => {
              setFixture(name)
              setRevealed(null)
              load(name, null)
            }}
            className={`cursor-pointer rounded-full border px-3 py-1 font-mono text-[11px] ${fixture === name ? 'border-ink bg-ink text-background' : 'border-border text-muted-foreground'}`}
          >
            {name}
          </button>
        ))}
        <button
          type='button'
          data-fixture='reveal-step'
          onClick={() => {
            const total = FIXTURES[fixture].nodes.length
            const next = revealed === null ? 1 : Math.min(total, revealed + 1)
            setRevealed(next)
            load(fixture, next)
          }}
          className='border-primary/40 text-primary ml-2 cursor-pointer rounded-full border px-3 py-1 font-mono text-[11px]'
        >
          reveal +1
        </button>
        <span className='text-muted-foreground ml-auto font-mono text-[11px]'>
          {status}
        </span>
      </div>
      <div className='min-h-0 flex-1'>
        <DesignCanvas
          initialGraph={{ nodes: [], edges: [] }}
          onApi={(api) => {
            apiRef.current = api
            setTimeout(() => load(fixture, null), 100)
          }}
          onChange={() => {}}
        />
      </div>
    </div>
  )
}
