import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const REFRESH_MARGIN_MS = 60_000

function tokenExpiry(request: NextRequest): number | null {
  const chunks = request.cookies
    .getAll()
    .filter((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name))
  if (chunks.length === 0) return null
  const whole = chunks.find((c) => !/\.\d+$/.test(c.name))
  const raw = whole
    ? whole.value
    : chunks
        .sort(
          (a, b) =>
            Number(a.name.split('.').pop()) - Number(b.name.split('.').pop()),
        )
        .map((c) => c.value)
        .join('')

  try {
    let json = raw
    if (json.startsWith('base64-')) {
      const b64 = json
        .slice(7)
        .replace(/-/g, '+')
        .replace(/_/g, '/')
      json = atob(b64)
    } else if (!json.startsWith('{')) {
      json = decodeURIComponent(json)
    }
    const parsed = JSON.parse(json) as { expires_at?: number }
    return typeof parsed.expires_at === 'number' ? parsed.expires_at : 0
  } catch {
    return 0
  }
}

export async function middleware(request: NextRequest) {
  const exp = tokenExpiry(request)
  if (exp === null) return NextResponse.next({ request })
  if (exp * 1000 - Date.now() > REFRESH_MARGIN_MS) {
    return NextResponse.next({ request })
  }

  // Token missing an expiry or about to expire: do the real refresh.
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    // Everything except static assets, images and the AI/stripe endpoints
    // (those authenticate via Bearer token / signature, not cookies).
    '/((?!_next/static|_next/image|favicon.ico|monitoring|ingest|api/).*)',
  ],
}
