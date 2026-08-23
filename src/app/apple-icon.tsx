import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1b1916',
        }}
      >
        <span
          style={{
            fontFamily: 'serif',
            fontStyle: 'italic',
            fontSize: 128,
            color: '#a6e40e',
            lineHeight: 1,
          }}
        >
          s
        </span>
      </div>
    ),
    size,
  )
}
