import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import { getCurrentLocale } from '@/utilities/getCurrentLocale'
import type { Footer as FooterType } from '@/payload-types'
import { FooterClient } from './Component.client'

export async function Footer() {
  const locale = await getCurrentLocale()
  const footerData: FooterType = await getCachedGlobal('footer', 1, locale)()

  return <FooterClient data={footerData} locale={locale} />
}
