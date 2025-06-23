import 'react-day-picker/dist/style.css'
import type { Metadata } from 'next'
import React, { Suspense, lazy } from 'react'
import { cookies } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import { getCurrentLocale } from '@/utilities/getCurrentLocale'
import { getServerSideURL } from '@/utilities/getURL'
import './globals.css'
import { getCachedGlobal, getGlobal } from '@/utilities/getGlobals'
import Script from 'next/script'

// Lazy load non-critical components
const RootProvider = lazy(() =>
  import('@/providers').then((mod) => ({
    default: mod.RootProvider,
  })),
)

const AnalyticsLayout = lazy(() =>
  import('@/components/Layout/AnalyticsLayout').then((mod) => ({
    default: mod.default,
  })),
)

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getCurrentLocale()

  // --- Fetch global data inside the component ---
  try {
    let messages
    try {
      // Corrected path to messages directory from src/app/(frontend)/
      messages = (await import(`../../../messages/${locale}.json`)).default
    } catch (error) {
      console.error(`Failed to load messages for locale ${locale}:`, error)
      // Fallback to 'en' messages or handle error as appropriate
      try {
        messages = (await import(`../../../messages/en.json`)).default
      } catch (fallbackError) {
        console.error('Failed to load fallback messages for en:', fallbackError)
        messages = {} // or throw an error / provide minimal messages
      }
    }

    console.log('Fetching header...')
    const header = await getCachedGlobal({ slug: 'header', depth: 2, locale })
    console.log('Header fetched:', header)

    console.log('Fetching footer...')
    const footer = await getGlobal({ slug: 'footer', depth: 2, locale })
    console.log('Footer fetched:', footer)

    console.log('Fetching navigation...')
    const navigation = await getCachedGlobal({
      slug: 'navigation',
      depth: 1,
      locale,
      forceFresh: true,
    })
    console.log('Navigation fetched:', navigation)

    // TODO: Pass header, footer, navigation to RootProvider or use them here
    // Example: <RootProvider lang={locale} header={header} footer={footer} navigation={navigation}>{children}</RootProvider>

    console.log('Successfully fetched globals for RootLayout') // Add logging

    return (
      <html lang={locale} className="h-full">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link
            rel="preload"
            href="/fonts/geist-sans.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        </head>
        <body>
          <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Moscow">
            <Suspense fallback={<div>Loading...</div>}>
              {/* Pass fetched data to provider if needed */}
              <RootProvider lang={locale} /* header={header} footer={footer} etc */>
                <Suspense fallback={null}>
                  <AnalyticsLayout>
                    {children}
                  </AnalyticsLayout>
                </Suspense>
              </RootProvider>
            </Suspense>
          </NextIntlClientProvider>
        </body>
      </html>
    )
  } catch (error) {
    // Handle error fetching globals
    console.error('Failed to fetch globals for RootLayout:', error)
    console.error(error) // Log the full error object
    // Render a fallback or error state
    return (
      <html lang={locale} className="h-full">
        <head>
          {/* ... minimal head ... */}
          <title>Error</title>
        </head>
        <body>
          <div>Error loading site layout. Please try again later.</div>
        </body>
      </html>
    )
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    template: '%s | Flow Masters',
    default: 'Flow Masters',
  },
  description: 'Flow Masters - AI-powered solutions for your business',
}

// --- REMOVED global data fetching and cache invalidation from module scope ---
// const header = await getCachedGlobal(...)
// const footer = await getGlobal(...)
// const navigation = await getCachedGlobal(...)

// import { invalidateGlobalCache } from '@/utilities/getGlobals'
// invalidateGlobalCache('header')
// invalidateGlobalCache('footer', 'en')
