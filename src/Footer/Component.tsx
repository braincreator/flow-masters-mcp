import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import { getCurrentLocale } from '@/utilities/getCurrentLocale'
import type { Footer } from '@/payload-types'
import { notFound } from 'next/navigation'
import type { PayloadGlobalResponse } from 'payload/types'

import { FooterClient } from './Component.client'

export async function Footer() {
  try {
    const locale = await getCurrentLocale()
    const [footerData] = await Promise.all([
      getCachedGlobal({
        slug: 'footer',
        depth: 1,
        locale,
        tags: ['footer']
      })(),
    ])

    if (!footerData) {
      return notFound()
    }

    return (
      <FooterClient
        data={footerData as PayloadGlobalResponse<Footer>}
        locale={locale}
      />
    )
  } catch (error) {
    console.error('Error loading footer:', error)
    return null // Or a fallback footer component
  }
}
