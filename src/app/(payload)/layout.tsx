/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'
import { RootProvider } from '@/providers/RootProvider'
import { cookies, headers } from 'next/headers'
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
  // Get theme from cookies on the server side
  const cookieStore = cookies()
  const theme = cookieStore.get('theme')?.value || 'light'
  
  // Get current locale
  const locale = await getCurrentLocale()

  return (
    <html 
      lang={locale}
      dir={locale === 'ar' ? 'RTL' : 'LTR'} // Add RTL support if needed
      data-theme={theme}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
          <RootProvider lang={locale} siteConfig={null}>
            {children}
          </RootProvider>
        </RootLayout>
      </body>
    </html>
  )
}

export default Layout
