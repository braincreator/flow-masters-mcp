'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { fetchGlobal } from '@/utilities/getGlobalsClient'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data: initialData }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const [data, setData] = useState<Header>(initialData)
  const currentLocale = pathname.split('/')[1] || 'ru'

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  useEffect(() => {
    const loadData = async () => {
      const newData = await fetchGlobal('header', 1, currentLocale)
      if (newData) {
        setData(newData)
      }
    }
    loadData()
  }, [currentLocale])

  return (
    <header className="container relative z-20" {...(theme ? { 'data-theme': theme } : {})}>
      <div className="py-8 flex justify-between items-center">
        <Link href={`/${currentLocale}`}>
          <Logo loading="eager" priority="high" className="invert dark:invert-0" />
        </Link>
        <div className="flex items-center gap-8">
          <HeaderNav data={data} />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
