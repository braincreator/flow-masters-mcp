'use client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import type { Footer } from '@/payload-types'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import { translations } from './translations'
import { FooterNav } from './Nav'
import { fetchGlobal } from '@/utilities/getGlobalsClient'
import { Logo } from '@/components/Logo/Logo'

interface FooterClientProps {
  data: Footer
  locale: string
}

export function FooterClient({ data: initialData, locale }: FooterClientProps) {
  const [data, setData] = useState(initialData)
  const t = translations[locale as keyof typeof translations] || translations.en
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    const loadData = async () => {
      const newFooterData = await fetchGlobal('footer', 1, locale)
      if (newFooterData) {
        setData(newFooterData)
      }
    }
    loadData()
  }, [locale])

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Logo Section */}
          <div className="md:col-span-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link href={`/${locale}`} className="inline-block">
                <Logo 
                  className="h-8 w-auto" 
                  size="thumbnail"
                />
              </Link>
            </motion.div>
            <p className="mt-4 text-sm text-muted-foreground">
              {t.description}
            </p>
          </div>

          {/* Navigation Section */}
          <nav className="md:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FooterNav data={data} variant="main" />
            </div>
          </nav>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {t.copyright.replace('{year}', currentYear.toString())}
          </p>
          
          <FooterNav data={data} variant="bottom" />
        </div>
      </div>
    </footer>
  )
}
