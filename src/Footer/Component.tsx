import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import { getCurrentLocale } from '@/utilities/getCurrentLocale'
import type { Footer } from '@/payload-types'
import { FooterClient } from './Component.client'

export async function Footer() {
  const locale = await getCurrentLocale()
  const footerData = await getCachedGlobal({
    slug: 'footer',
    depth: 1,
    locale
  })()

  return (
    <FooterClient 
      data={footerData} 
      locale={locale} 
    />
  )
}
