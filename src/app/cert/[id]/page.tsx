import { independenceTier } from '@/domain/scoring'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCertData } from './cert-data'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const cert = await getCertData(id).catch(() => null)
  if (!cert) return { title: 'Certificado — socratic.dev' }
  return {
    title: `${cert.name} — Certificado Socrático`,
    description: `${cert.completed} desafios completados com ${cert.independence}% de independência média em socratic.dev.`,
  }
}

const TIER_LABEL = {
  high: 'Alta independência',
  mid: 'Independência em construção',
  low: 'Jornada iniciada',
} as const

export default async function CertPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cert = await getCertData(id).catch(() => null)
  if (!cert) notFound()

  const tier = TIER_LABEL[independenceTier(cert.independence)]
  const date = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className='grid min-h-screen place-items-center bg-ink px-4 py-16'>
      <div className='w-full max-w-2xl'>
        <div className='overflow-hidden rounded-2xl border border-white/10 bg-[#211e1a] shadow-2xl'>
          <div className='border-b border-white/10 px-8 py-6 sm:px-12'>
            <span className='font-heading text-[18px] font-medium tracking-tight text-white/90'>
              socratic
              <span className='font-serif font-normal text-lime italic'>
                .dev
              </span>
            </span>
          </div>

          <div className='px-8 py-12 sm:px-12'>
            <p className='font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase'>
              Certificado Socrático
            </p>
            <h1 className='font-heading mt-4 text-4xl font-light tracking-tight text-white sm:text-5xl'>
              {cert.name}
            </h1>
            <p className='mt-5 max-w-md text-[15px] leading-relaxed text-white/60'>
              completou{' '}
              <strong className='font-medium text-white'>
                {cert.completed}{' '}
                {cert.completed === 1 ? 'desafio' : 'desafios'}
              </strong>{' '}
              com{' '}
              <span className='font-serif text-lime italic'>
                {cert.independence}% de independência
              </span>{' '}
              — pensando por conta própria, sem receber a resposta pronta.
            </p>

            <div className='mt-10 grid grid-cols-3 gap-6'>
              <div>
                <p className='font-mono text-2xl text-white tabular-nums'>
                  {cert.completed}
                </p>
                <p className='mt-1 font-mono text-[10px] tracking-wider text-white/40 uppercase'>
                  desafios
                </p>
              </div>
              <div>
                <p className='font-mono text-2xl text-lime tabular-nums'>
                  {cert.independence}%
                </p>
                <p className='mt-1 font-mono text-[10px] tracking-wider text-white/40 uppercase'>
                  independência
                </p>
              </div>
              <div>
                <p className='font-mono text-2xl text-white tabular-nums'>
                  #{cert.position}
                </p>
                <p className='mt-1 font-mono text-[10px] tracking-wider text-white/40 uppercase'>
                  no ranking
                </p>
              </div>
            </div>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-8 py-5 sm:px-12'>
            <span className='font-mono text-[11px] text-white/40'>
              {tier} · {date}
            </span>
            <Link
              href='/'
              className='group flex items-center gap-1.5 text-[13px] font-medium text-lime transition-opacity hover:opacity-80'
            >
              Treine você também
              <ArrowRight className='size-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
            </Link>
          </div>
        </div>

        <p className='mt-6 text-center font-mono text-[11px] text-white/30'>
          A IA nunca dá a resposta. Ela te leva até ela.
        </p>
      </div>
    </div>
  )
}
