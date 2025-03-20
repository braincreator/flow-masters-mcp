import type { Metadata } from 'next'
import React from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { cn } from '@/utilities/ui'
import { getCurrentLocale } from '@/utilities/getCurrentLocale'
import { RootProvider } from '@/providers/RootProvider'
import { getSiteConfig } from '@/utilities/get-site-config'
import { generateThemeVariables } from '@/utilities/theme'
import { getServerSideURL } from '@/utilities/getURL'
import './globals.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getCurrentLocale()
  const siteConfig = await getSiteConfig()
  const themeVariables = generateThemeVariables(siteConfig?.branding)

  return (
    <html 
      lang={lang} 
      className={cn(
        GeistSans.variable, 
        GeistMono.variable,
        'min-h-screen bg-background antialiased'
      )}
      suppressHydrationWarning
      data-theme="light"
      style={themeVariables}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <RootProvider lang={lang} siteConfig={siteConfig}>
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
        </RootProvider>
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
