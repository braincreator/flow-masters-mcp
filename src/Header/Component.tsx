import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import { getCurrentLocale } from '@/utilities/getCurrentLocale'
import type { Header as HeaderType } from '@/payload-types'
import { Locale } from '@/constants'

interface HeaderProps {
  locale?: Locale
}

export async function Header({ locale: propLocale }: HeaderProps = {}): Promise<React.JSX.Element> {
  const locale = propLocale || await getCurrentLocale()
  const headerData = await getCachedGlobal({
    slug: 'header',
    depth: 1,
    locale
  })()

  return <HeaderClient data={headerData} locale={locale} />
}
