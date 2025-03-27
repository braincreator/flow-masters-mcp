import { notFound } from 'next/navigation'
import { ReactNode } from 'react'
import { Header } from '@/Header/Component'
import { Footer } from '@/Footer/Component'
import { AdminBar } from '@/components/AdminBar'
import { draftMode } from 'next/headers'
import { Locale } from '@/constants'
import '@/app/(frontend)/globals.css'
import FloatingCartButtonWrapper from '@/components/FloatingCartButtonWrapper'
import { CartProvider } from '@/providers/CartProvider'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { cn } from '@/utilities/ui'

const locales = ['en', 'ru']

interface LayoutProps {
  children: ReactNode
  params: {
    lang: Locale
  }
}

// Using the params object properly with async Next.js approach
export default async function LangLayout({ children, params }: LayoutProps) {
  // Access lang directly without spreading or awaiting params
  const lang = (await params).lang

  const { isEnabled: isDraftMode } = await draftMode()

  if (!locales.includes(lang)) {
    notFound()
  }

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="preload"
          href="/fonts/geist-sans.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={cn(
          GeistSans.variable,
          GeistMono.variable,
          'min-h-screen bg-background font-sans antialiased',
        )}
        style={{ '--header-height': '4rem' } as React.CSSProperties}
      >
        <CartProvider locale={lang}>
          {/* AI-themed background elements */}
          {/* Removing gradient background as requested */}

          {isDraftMode && <AdminBar />}
          <Header locale={lang} />
          <main className="relative pt-[var(--header-height)]">{children}</main>
          <Footer locale={lang} />
          <FloatingCartButtonWrapper locale={lang} />
        </CartProvider>
      </body>
    </html>
  )
}
