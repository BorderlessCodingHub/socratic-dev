import { cn } from '@/lib/utils'
import Link from 'next/link'

interface LogoProps {
  className?: string
  asLink?: boolean
  showText?: boolean
  size?: 'default' | 'lg'
}

export function Logo({
  className,
  asLink = true,
  showText = true,
  size = 'default',
}: LogoProps) {
  const lg = size === 'lg'
  const content = (
    <div
      className={cn('flex items-center', lg ? 'gap-3' : 'gap-2.5', className)}
    >
      {showText && (
        <span
          className={cn(
            'font-heading font-medium tracking-tight text-[#1b1916]',
            lg ? 'text-[20px]' : 'text-[17px]',
          )}
        >
          socratic
          <span className='text-gradient font-serif font-normal italic'>
            .dev
          </span>
        </span>
      )}
    </div>
  )
  if (asLink) {
    return (
      <Link href='/' className='group'>
        {content}
      </Link>
    )
  }
  return content
}
