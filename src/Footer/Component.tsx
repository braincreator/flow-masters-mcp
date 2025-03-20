import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import { getCurrentLocale } from '@/utilities/getCurrentLocale'
import type { Footer } from '@/payload-types'
import { notFound } from 'next/navigation'
import type { SiteConfig } from '@/payload-types'
import type { PayloadGlobalResponse } from 'payload/types'

import { FooterClient } from './Component.client'

export async function Footer() {
  try {
    const locale = await getCurrentLocale()
    const [footerData, siteConfig] = await Promise.all([
      getCachedGlobal({
        slug: 'footer',
        depth: 1,
        locale,
        tags: ['footer']
      })(),
      getCachedGlobal({
        slug: 'site-config',
        depth: 1,
        locale,
        tags: ['site-config']
      })()
    ])

    if (!footerData || !siteConfig) {
      return notFound()
    }

    return (
      <FooterClient
        data={footerData as PayloadGlobalResponse<Footer>}
        locale={locale}
        siteConfig={siteConfig as PayloadGlobalResponse<SiteConfig>}
      />
    )
  } catch (error) {
    console.error('Error loading footer:', error)
    return null // Or a fallback footer component
  }
}
