/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'
import { RootProvider } from '@/providers/RootProvider'
import { cookies } from 'next/headers'
import { getCurrentLocale } from '@/utilities/getCurrentLocale'

import { importMap } from './admin/importMap.js'
import './custom.scss'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = async ({ children }: Args) => {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value || 'light'
  const locale = await getCurrentLocale()

  return (
    <html 
      lang={locale}
      dir={locale === 'ar' ? 'RTL' : 'LTR'}
      data-theme={theme}
      className="min-h-screen bg-background antialiased"
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
          <RootProvider lang={locale} siteConfig={null}>
            <main className="relative flex min-h-screen flex-col">
              {children}
            </main>
          </RootProvider>
        </RootLayout>
      </body>
    </html>
  )
}

export default Layout
