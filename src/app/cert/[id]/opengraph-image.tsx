import { ImageResponse } from 'next/og'
import { getCertData } from './cert-data'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Certificado Socrático — socratic.dev'

export default async function OgImage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cert = await getCertData(id).catch(() => null)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#1b1916',
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 34, color: '#ffffff' }}>
          socratic
          <span style={{ color: '#a6e40e', fontStyle: 'italic' }}>.dev</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              color: 'rgba(255,255,255,0.45)',
              textTransform: 'uppercase',
            }}
          >
            Certificado Socrático
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 72,
              fontWeight: 300,
              color: '#ffffff',
            }}
          >
            {cert?.name ?? 'socratic.dev'}
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 30,
              color: 'rgba(255,255,255,0.65)',
              display: 'flex',
            }}
          >
            {cert
              ? `${cert.completed} desafios · `
              : 'Aprenda pensando — '}
            <span style={{ color: '#a6e40e', marginLeft: 8 }}>
              {cert
                ? `${cert.independence}% de independência`
                : 'a IA nunca dá a resposta'}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 22,
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          <span>A IA nunca dá a resposta. Ela te leva até ela.</span>
          {cert && <span>#{cert.position} no ranking</span>}
        </div>
      </div>
    ),
    size,
  )
}
