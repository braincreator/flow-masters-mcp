import type { Metadata } from 'next'
import React, { Suspense, lazy } from 'react'
import { cookies } from 'next/headers'
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

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getCurrentLocale()

  const YANDEX_METRIKA_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID

  // --- Fetch global data inside the component ---
  try {
    const header = await getCachedGlobal({ slug: 'header', depth: 2, locale })
    const footer = await getGlobal({ slug: 'footer', depth: 2, locale })
    const navigation = await getCachedGlobal({
      slug: 'navigation',
      depth: 1,
      locale,
      forceFresh: true,
    })

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
          {YANDEX_METRIKA_ID && (
            <>
              <Script id="yandex-metrika" strategy="afterInteractive">
                {`
                  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                  (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

                  ym(${YANDEX_METRIKA_ID}, "init", {
                      clickmap:true,
                      trackLinks:true,
                      accurateTrackBounce:true,
                      webvisor:true,
                      triggerEvent: true
                  });
                `}
              </Script>
              <noscript>
                <div>
                  <img
                    src={`https://mc.yandex.ru/watch/${YANDEX_METRIKA_ID}`}
                    style={{ position: 'absolute', left: '-9999px' }}
                    alt=""
                  />
                </div>
              </noscript>
            </>
          )}
        </head>
        <body>
          <Suspense fallback={<div>Loading...</div>}>
            {/* Pass fetched data to provider if needed */}
            <RootProvider lang={locale} /* header={header} footer={footer} etc */>
              {children}
            </RootProvider>
          </Suspense>
        </body>
      </html>
    )
  } catch (error) {
    // Handle error fetching globals
    console.error('Failed to fetch globals for RootLayout:', error)
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
    template: '%s | Your Site Name',
    default: 'Your Site Name',
  },
  description: 'Your site description',
}

// --- REMOVED global data fetching and cache invalidation from module scope ---
// const header = await getCachedGlobal(...)
// const footer = await getGlobal(...)
// const navigation = await getCachedGlobal(...)

// import { invalidateGlobalCache } from '@/utilities/getGlobals'
// invalidateGlobalCache('header')
// invalidateGlobalCache('footer', 'en')
