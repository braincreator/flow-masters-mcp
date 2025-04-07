import type { Metadata } from 'next'
import React, { Suspense, lazy } from 'react'
import { cookies } from 'next/headers'
import { getCurrentLocale } from '@/utilities/getCurrentLocale'
import { getServerSideURL } from '@/utilities/getURL'
import './globals.css'
import { getCachedGlobal, getGlobal } from '@/utilities/getGlobals'

// Lazy load non-critical components
const RootProvider = lazy(() =>
  import('@/providers').then((mod) => ({
    default: mod.RootProvider,
  })),
)

export default async function FrontendRootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const locale = await getCurrentLocale()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RootProvider lang={locale}>{children}</RootProvider>
    </Suspense>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    template: '%s | Your Site Name',
    default: 'Your Site Name',
  },
  description: 'Your site description',
}

// For regular use with caching
const header = await getCachedGlobal({
  slug: 'header',
  depth: 2,
  locale: 'en',
})

// For admin or when fresh data is needed
const footer = await getGlobal({
  slug: 'footer',
  depth: 2,
  locale: 'en',
})

// Force fresh data even with caching
const navigation = await getCachedGlobal({
  slug: 'navigation',
  depth: 1,
  locale: 'en',
  forceFresh: true,
})

// Invalidate cache when needed
import { invalidateGlobalCache } from '@/utilities/getGlobals'

// Invalidate specific global in all locales
invalidateGlobalCache('header')

// Invalidate specific global in specific locale
invalidateGlobalCache('footer', 'en')
