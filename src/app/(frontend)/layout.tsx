import type { Metadata } from 'next'
import React from 'react'
import { cookies } from 'next/headers'
import { getCurrentLocale } from '@/utilities/getCurrentLocale'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { cn } from '@/utilities/ui'
import { getSiteConfig } from '@/utilities/get-site-config'
import { generateThemeVariables } from '@/utilities/theme'
import { getServerSideURL } from '@/utilities/getURL'
import { RootProvider } from '@/providers'
import './globals.css'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value || 'light'
  const locale = await getCurrentLocale()
  const siteConfig = await getSiteConfig()
  
  return (
    <html 
      lang={locale}
      dir={locale === 'ar' ? 'RTL' : 'LTR'}
      data-theme={theme}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={cn(
        GeistSans.variable, 
        GeistMono.variable,
        'min-h-screen bg-background font-sans antialiased'
      )}>
        <RootProvider lang={locale} siteConfig={siteConfig}>
          {children}
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
