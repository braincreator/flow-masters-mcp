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

  return (
    <html lang="en" className="h-full">
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
          <RootProvider lang={locale}>{children}</RootProvider>
        </Suspense>
      </body>
    </html>
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
