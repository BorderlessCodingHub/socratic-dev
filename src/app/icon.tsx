import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
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
          borderRadius: 7,
        }}
      >
        <span
          style={{
            fontFamily: 'serif',
            fontStyle: 'italic',
            fontSize: 23,
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
