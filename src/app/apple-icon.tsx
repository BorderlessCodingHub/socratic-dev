import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Matches icon.svg: lime brand square, bold ink lowercase "s".
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
          background: '#a6e40e',
        }}
      >
        <span
          style={{
            fontSize: 132,
            fontWeight: 800,
            color: '#1b1916',
            lineHeight: 1,
            marginTop: -14,
          }}
        >
          s
        </span>
      </div>
    ),
    size,
  )
}
