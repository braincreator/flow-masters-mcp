'use client'
import Link from 'next/link'
import React from 'react'
import type { Footer } from '@/payload-types'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import { translations } from './translations'
import { FooterNav } from './Nav'
import { Logo } from '@/components/Logo/Logo'
import { Locale } from '@/constants'
import { RSSLinks } from '@/components/RSS/RSSDiscovery'

type FooterProps = {
  data: PayloadGlobalResponse<Footer>
  locale: Locale
}

export const FooterClient: React.FC<FooterProps> = ({ data, locale }) => {
  const t = translations[locale as keyof typeof translations] || translations.en
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Logo Section */}
          {/* Removing the logo section */}

          {/* Main Navigation Section */}
          <nav className="md:col-span-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FooterNav data={data} variant="main" />
            </div>
          </nav>
        </div>

        {/* Legal Information Section */}
        <div className="mt-8 inline-block">
          <div className="p-4 bg-muted/30 rounded-lg border border-border/50 w-fit">
            <h4 className="text-sm font-semibold text-foreground mb-2">{t.legalInfo.title}</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>{t.legalInfo.legalName}</p>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <span>{t.legalInfo.inn}</span>
                <span>{t.legalInfo.ogrnip}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {t.copyright.replace('{year}', currentYear.toString())}
            </p>
            <RSSLinks className="hidden md:block" />
          </div>

          <FooterNav data={data} variant="bottom" />
        </div>

        {/* RSS Links for mobile */}
        <div className="md:hidden mt-4 pt-4 border-t border-border/50">
          <RSSLinks className="flex justify-center" />
        </div>
      </div>
    </footer>
  )
}
