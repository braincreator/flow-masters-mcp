'use client'

import React from 'react'
import { HeaderClient } from '@/globals/Header/Component.client'
import { FooterClient } from '@/Footer/Component.client'
import { usePathname } from 'next/navigation'

interface PageRootComponentProps {
  children: React.ReactNode
  header: any
  footer: any
}

export default function PageRootComponent({ children, header, footer }: PageRootComponentProps) {
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'en'

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full">
        {header ? (
          <HeaderClient data={header} locale={locale} />
        ) : (
          <div className="container py-4">Header Not Available</div>
        )}
      </header>
      <main className="flex-1 pt-[var(--header-height)]">{children}</main>
      <footer className="bg-background">
        {footer ? (
          <FooterClient data={footer} locale={locale} />
        ) : (
          <div className="container py-4">Footer Not Available</div>
        )}
      </footer>
    </div>
  )
}
