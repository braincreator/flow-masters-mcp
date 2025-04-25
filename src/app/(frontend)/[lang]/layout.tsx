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
import { ThemeProvider } from '@/providers/Theme'
import { I18nProvider } from '@/providers/I18n'
import { setRequestLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
// Define locales directly in this file
const locales = ['en', 'ru'] as const

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

  // Устанавливаем локаль для next-intl
  setRequestLocale(lang)

  // Загружаем сообщения для текущей локали вручную
  let messages = {}

  // Проверяем, что локаль действительно поддерживается и не содержит специальных путей
  if (
    locales.includes(lang as (typeof locales)[number]) &&
    !lang.includes('/') &&
    !lang.includes('fonts')
  ) {
    try {
      // Загружаем файл локализации для текущей локали
      messages = (await import(`../../../../messages/${lang}.json`)).default
    } catch (error) {
      console.warn(`Could not load messages for locale: ${lang}`, error)
      messages = {}
    }
  }

  const { isEnabled: isDraftMode } = await draftMode()

  // Перенаправляем на страницу 404 только если путь не содержит специальные пути
  if (
    !locales.includes(lang as (typeof locales)[number]) &&
    !lang.includes('/') &&
    !lang.startsWith('_next') &&
    !lang.startsWith('fonts')
  ) {
    notFound()
  }

  return (
    <NextIntlClientProvider locale={lang} messages={messages}>
      <div lang={lang} className="h-full" suppressHydrationWarning>
        <div
          className={cn(
            GeistSans.variable,
            GeistMono.variable,
            'flex flex-col min-h-screen bg-background font-sans antialiased',
          )}
          style={{ '--header-height': '4rem', '--footer-height': '12rem' } as React.CSSProperties}
          data-lang={lang}
        >
          <ThemeProvider>
            <I18nProvider defaultLang={lang}>
              {isDraftMode && <AdminBar />}
              <Header locale={lang} />
              <main className="relative flex-grow flex flex-col pt-[var(--header-height)]">
                {children}
              </main>
              <div id="pagination-slot" className="container py-8"></div>
              <Footer locale={lang} />
              <FloatingCartButtonWrapper locale={lang} />
            </I18nProvider>
          </ThemeProvider>
        </div>
      </div>
    </NextIntlClientProvider>
  )
}
