import { notFound } from 'next/navigation'
import { ReactNode } from 'react'
import { Header } from '@/globals/Header/Component'
import { Footer } from '@/globals/Footer/Component'
import { AdminBar } from '@/components/AdminBar'
import { draftMode } from 'next/headers'
import { Locale } from '@/constants'
import '@/app/(frontend)/globals.css'
import FloatingCartButtonWrapper from '@/components/FloatingCartButtonWrapper'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { cn } from '@/utilities/ui'
import DefaultPagination from '@/components/DefaultPagination'
import { ThemeProvider } from '@/providers/Theme'
import { I18nProvider } from '@/providers/I18n'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

const locales = ['en', 'ru']

interface LayoutProps {
  children: ReactNode
  params: {
    lang: Locale
  }
}

// Using the params object properly with async Next.js approach
export default async function LangLayout({ children, params }: LayoutProps) {
  // Await params and then access its properties
  const paramsData = await Promise.resolve(params)
  const lang = paramsData.lang

  const { isEnabled: isDraftMode } = await draftMode()

  if (!locales.includes(lang)) {
    notFound()
  }

  return (
    <div lang={lang} className="h-full" suppressHydrationWarning>
      <div
        className={cn(
          GeistSans.variable,
          GeistMono.variable,
          'flex flex-col min-h-full bg-background font-sans antialiased',
        )}
        style={{ '--header-height': '4rem' } as React.CSSProperties}
        data-lang={lang}
      >
        <ThemeProvider lang={lang}>
          <I18nProvider lang={lang}>
            {isDraftMode && <AdminBar />}
            <Header locale={lang} />
            <main className="relative flex-grow pt-[var(--header-height)]">{children}</main>
            <div id="pagination-slot" className="container py-8"></div>
            <Footer locale={lang} />
            <FloatingCartButtonWrapper locale={lang} />
          </I18nProvider>
        </ThemeProvider>
      </div>
    </div>
  )
}
