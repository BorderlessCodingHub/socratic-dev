import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: '/socratic-dev',
  reactCompiler: true,
  cacheComponents: true,
  skipTrailingSlashRedirect: true,
  async rewrites() {
    // With basePath, Next prefixes rewrite sources automatically, so these
    // match /socratic-dev/ingest/* — keep PostHog api_host in sync.
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  disableLogger: true,
  // Sentry prefixes tunnelRoute with nextConfig.basePath automatically —
  // keep this as /monitoring (not /socratic-dev/monitoring) to avoid doubling.
  tunnelRoute: '/monitoring',
})

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

initOpenNextCloudflareForDev()
