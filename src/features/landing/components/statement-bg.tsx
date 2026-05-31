'use client'

export function StatementBg() {
  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden'>
      <div
        className='absolute inset-0'
        style={{
          background:
            'radial-gradient(95% 80% at 50% 0%, rgba(252,243,235,0.7) 0%, transparent 60%), radial-gradient(60% 60% at 90% 100%, rgba(220,215,253,0.4) 0%, transparent 65%), #ffffff',
        }}
      />
      <svg className='absolute inset-0 h-full w-full' aria-hidden>
        <defs>
          <pattern
            id='statement-dots'
            width='28'
            height='28'
            patternUnits='userSpaceOnUse'
          >
            <circle cx='14' cy='14' r='0.9' fill='#1b1916' opacity='0.06' />
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill='url(#statement-dots)' />
      </svg>
    </div>
  )
}
