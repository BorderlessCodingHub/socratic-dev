'use client'

type Variant = 'warm' | 'cool' | 'paper' | 'mist'

const BG: Record<Variant, string> = {
  warm: 'radial-gradient(70% 55% at 15% 0%, color-mix(in srgb, var(--pastel-greige) 45%, transparent) 0%, transparent 65%), white',
  cool: 'radial-gradient(70% 50% at 85% 0%, color-mix(in srgb, var(--pastel-lavender) 40%, transparent) 0%, transparent 65%), white',
  paper:
    'linear-gradient(180deg, var(--paper) 0%, white 60%), radial-gradient(60% 40% at 50% 0%, color-mix(in srgb, var(--pastel-lavender) 30%, transparent) 0%, transparent 70%)',
  mist: 'radial-gradient(80% 60% at 50% 100%, color-mix(in srgb, var(--pastel-mist) 50%, transparent) 0%, transparent 65%), white',
}

export function SectionBackdrop({ variant }: { variant: Variant }) {
  return (
    <div
      aria-hidden
      className='pointer-events-none absolute inset-0 overflow-hidden'
    >
      <div className='absolute inset-0' style={{ background: BG[variant] }} />
    </div>
  )
}
