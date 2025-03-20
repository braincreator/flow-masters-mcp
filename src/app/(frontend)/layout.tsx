import type { Metadata } from 'next'
import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'
import { RootProvider } from '@/providers/RootProvider'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getSiteConfig } from '@/utilities/get-site-config'
import { generateThemeVariables } from '@/utilities/theme'
import { getCurrentLocale } from '@/utilities/getCurrentLocale'
import { getServerSideURL } from '@/utilities/getURL'
import './globals.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getCurrentLocale()
  const siteConfig = await getSiteConfig()
  const themeVariables = generateThemeVariables(siteConfig?.branding)

  return (
    <html 
      lang={lang} 
      className={cn(GeistSans.variable, GeistMono.variable)}
      suppressHydrationWarning
      style={themeVariables}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <RootProvider lang={lang} siteConfig={siteConfig}>
          {children}
        </RootProvider>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
