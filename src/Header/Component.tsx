import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import { getCurrentLocale } from '@/utilities/getCurrentLocale'
import type { Header as HeaderType } from '@/payload-types'

export async function Header(): Promise<React.JSX.Element> {
  const locale = await getCurrentLocale()
  const headerData = await getCachedGlobal({
    slug: 'header',
    depth: 1,
    locale
  })()

  return <HeaderClient data={headerData} />
}
