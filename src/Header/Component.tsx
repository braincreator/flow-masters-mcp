import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import { getCurrentLocale } from '@/utilities/getCurrentLocale'

import type { Header } from '@/payload-types'

export async function Header() {
  const locale = await getCurrentLocale()

  const headerData: Header = await getCachedGlobal('header', 1, locale)()

  return <HeaderClient data={headerData} />
}
