'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { fetchGlobal } from '@/utilities/getGlobalsClient'
import { motion } from 'framer-motion'
import type { Header } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { cn } from '@/utilities/ui'

interface HeaderClientProps {
  data: Header
}

export function HeaderClient({ data: initialData }: HeaderClientProps) {
  const [data, setData] = useState(initialData)
  const { theme } = useHeaderTheme()
  const pathname = usePathname()
  const currentLocale = pathname?.split('/')[1] || 'en'

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
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 h-16 bg-background/60 backdrop-blur-md border-b border-white/10 z-50"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container h-full">
        <div className="flex justify-between items-center h-full">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="hover:text-warning transition-colors duration-300"
          >
            <Link href={`/${currentLocale}`}>
              <Logo 
                loading="eager" 
                priority="high" 
                className="invert dark:invert-0 transition-all duration-300 hover:opacity-80" 
                logo={data.logo} 
                size="small"
              />
            </Link>
          </motion.div>
          <div className="flex items-center gap-4">
            <HeaderNav data={data} />
            <div className="flex items-center gap-2">
              <ThemeSelector />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
