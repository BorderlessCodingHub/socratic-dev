'use client'

import { DesignCanvas } from '@/features/design/components/design-canvas'
import {
  buildSceneElements,
  summarizeElements,
  type ExcalidrawApi,
} from '@/features/design/utils/scene'
import { notFound } from 'next/navigation'
import * as React from 'react'

type Fixture = {
  nodes: { id: string; label: string; type?: string; note?: string; tier?: number }[]
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
  cycle: {
    nodes: [
      { id: 'client', label: 'App', type: 'client' },
      { id: 'api', label: 'API', type: 'service' },
      { id: 'queue', label: 'Kafka', type: 'queue' },
      { id: 'worker', label: 'Worker', type: 'worker' },
      { id: 'db', label: 'Postgres', type: 'database' },
    ],
    edges: [
      { from: 'client', to: 'api', label: 'pedido' },
      { from: 'api', to: 'queue', label: 'publica', dashed: true },
      { from: 'queue', to: 'worker', label: 'consome', dashed: true },
      { from: 'worker', to: 'api', label: 'status', dashed: true },
      { from: 'worker', to: 'db', label: 'grava' },
    ],
  },
  skiplayer: {
    nodes: [
      { id: 'web', label: 'Web', type: 'client' },
      { id: 'lb', label: 'NGINX', type: 'lb' },
      { id: 'api', label: 'API', type: 'service' },
      { id: 'db', label: 'Postgres', type: 'database' },
    ],
    edges: [
      { from: 'web', to: 'lb', label: 'HTTPS' },
      { from: 'lb', to: 'api', label: 'roteia' },
      { from: 'api', to: 'db', label: 'grava' },
      { from: 'web', to: 'db', label: 'direto?' },
    ],
  },
  samelayer: {
    nodes: [
      { id: 'gw', label: 'Gateway', type: 'gateway' },
      { id: 'svc1', label: 'Orders', type: 'service' },
      { id: 'svc2', label: 'Users', type: 'service' },
      { id: 'svc3', label: 'Billing', type: 'service' },
      { id: 'db', label: 'Postgres', type: 'database' },
    ],
    edges: [
      { from: 'gw', to: 'svc1', label: 'roteia' },
      { from: 'gw', to: 'svc2', label: 'roteia' },
      { from: 'gw', to: 'svc3', label: 'roteia' },
      { from: 'svc1', to: 'svc3', label: 'cobra' },
      { from: 'svc1', to: 'db', label: 'grava' },
      { from: 'svc3', to: 'db', label: 'grava' },
    ],
  },
  dense: {
    nodes: [
      { id: 'web', label: 'Web', type: 'client' },
      { id: 'mob', label: 'Mobile', type: 'client' },
      { id: 'cdn', label: 'CloudFront', type: 'cdn', note: 'assets' },
      { id: 'lb', label: 'ALB', type: 'lb' },
      { id: 'api', label: 'API', type: 'service', note: 'réplicas ×3' },
      { id: 'auth', label: 'Auth', type: 'gateway' },
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
      { from: 'cache', to: 'api', label: 'hit' },
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
    __scene?: readonly unknown[]
    __summary?: string
  }
}

export default function ScenePreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  const apiRef = React.useRef<ExcalidrawApi | null>(null)
  const [fixture, setFixture] = React.useState('bidirectional')
  const [status, setStatus] = React.useState('')

  const load = React.useCallback(async (name: string) => {
    const api = apiRef.current
    if (!api) return
    const f = FIXTURES[name]
    const elements = await buildSceneElements(f.nodes, f.edges)
    api.updateScene({ elements })
    window.__scene = elements
    window.__summary = summarizeElements(elements)
    setTimeout(() => {
      api.scrollToContent(elements, { fitToContent: true, animate: false })
    }, 60)
    setStatus(`${name}: ${elements.length} elementos`)
  }, [])

  return (
    <div className='flex h-screen flex-col'>
      <div className='border-border flex h-12 shrink-0 items-center gap-2 border-b px-4'>
        <span className='font-mono text-xs'>scene-preview</span>
        {Object.keys(FIXTURES).map((name) => (
          <button
            key={name}
            type='button'
            data-fixture={name}
            onClick={() => {
              setFixture(name)
              load(name)
            }}
            className={`cursor-pointer rounded-full border px-3 py-1 font-mono text-[11px] ${fixture === name ? 'border-ink bg-ink text-background' : 'border-border text-muted-foreground'}`}
          >
            {name}
          </button>
        ))}
        <span className='text-muted-foreground ml-auto font-mono text-[11px]'>
          {status}
        </span>
      </div>
      <div className='min-h-0 flex-1'>
        <DesignCanvas
          onApi={(api) => {
            apiRef.current = api
            setTimeout(() => load(fixture), 300)
          }}
          onChange={() => {}}
        />
      </div>
    </div>
  )
}
