import { notFound } from 'next/navigation'
import { ReactNode } from 'react'
import Script from 'next/script'
import { Header } from '@/globals/Header/Component'
import { Footer } from '@/globals/Footer/Component'
import { AdminBar } from '@/components/AdminBar'
import { draftMode } from 'next/headers'
import { Locale, SUPPORTED_LOCALES } from '@/constants'
import '@/app/(frontend)/globals.css'
import FloatingCartButtonWrapper from '@/components/FloatingCartButtonWrapper'
import { CartModal } from '@/components/Cart/CartModal'
import CookieConsentBanner from '@/components/CookieConsentBanner/CookieConsentBanner'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/providers/Theme'
import { I18nProvider } from '@/providers/I18n'
import { LocaleProvider } from '@/providers/LocaleProvider'
import { DropdownProvider } from '@/providers/DropdownContext'
import { setRequestLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { LoadingProvider } from '@/providers/LoadingProvider'
import { LoadingConfigProvider } from '@/providers/LoadingConfigProvider'
import { SmartLoading } from '@/components/ui/smart-loading'
import { FlexibleAnalyticsProvider } from '@/providers/FlexibleAnalyticsProvider'
import { AnalyticsDebugPanel } from '@/components/analytics/AnalyticsDebugPanel'
import { generateSEOMetadata, structuredDataGenerators } from '@/components/seo/SEOHead'
import { StructuredData } from '@/components/seo/StructuredData'
import { SkipLinks } from '@/components/Accessibility/SkipLinks'
import { Metadata } from 'next'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Define locales directly in this file
const locales = ['en', 'ru'] as const

// Добавляем функцию generateStaticParams из удаленного .js файла
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ lang: locale }))
}

// Generate metadata for the layout
export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const paramsData = await Promise.resolve(params)
  const lang = paramsData.lang || 'ru'

  return generateSEOMetadata({
    locale: lang,
    alternateLocales: SUPPORTED_LOCALES.map(locale => ({
      locale,
      url: `https://flow-masters.ru/${locale}`
    }))
  })
}

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
  const lang = paramsData.lang || 'ru'

  // Ensure lang is a valid string and supported locale
  const validLang = typeof lang === 'string' && lang ? lang : 'ru'

  // Устанавливаем локаль для next-intl
  setRequestLocale(validLang)

  // Analytics configuration is now handled by ModernAnalyticsProvider

  // Загружаем сообщения для текущей локали вручную
  let messages = {}

  // Проверяем, что локаль действительно поддерживается и не содержит специальных путей
  if (
    locales.includes(validLang as (typeof locales)[number]) &&
    !validLang.includes('/') &&
    !validLang.includes('fonts')
  ) {
    try {
      // Загружаем файл локализации для текущей локали
      messages = (await import(`../../../../messages/${validLang}.json`)).default
    } catch (error) {
      logWarn(`Could not load messages for locale: ${validLang}`, error)
      messages = {}
    }
  }

  const { isEnabled: isDraftMode } = await draftMode()

  // Перенаправляем на страницу 404 только если путь не содержит специальные пути
  if (
    !locales.includes(validLang as (typeof locales)[number]) &&
    !validLang.includes('/') &&
    !validLang.startsWith('_next') &&
    !validLang.startsWith('fonts')
  ) {
    notFound()
  }

  return (
    <NextIntlClientProvider locale={validLang} messages={messages}>
      <div lang={validLang} className="h-full" suppressHydrationWarning>
        <div
          className={cn(
            GeistSans.variable,
            GeistMono.variable,
            'flex flex-col min-h-screen bg-background font-sans antialiased',
          )}
          style={{ '--header-height': '4rem', '--footer-height': '12rem' } as React.CSSProperties}
          data-lang={validLang}
        >
          <ThemeProvider>
            <DropdownProvider>
              <LocaleProvider initialLocale={validLang}>
                <I18nProvider defaultLang={validLang}>
                  <FlexibleAnalyticsProvider configSource="cms">
                    <LoadingConfigProvider>
                      <LoadingProvider>
                      {/* Skip links for accessibility */}
                      <SkipLinks />

                      {/* Add our smart loading component */}
                      <SmartLoading />

                      {isDraftMode && <AdminBar />}
                      <Header locale={validLang} id="navigation" />
                      <main
                        id="main-content"
                        className="relative flex-grow flex flex-col pt-[var(--header-height)]"
                        tabIndex={-1}
                      >
                        {children}
                      </main>
                      <div id="pagination-slot" className="container py-8"></div>
                      <Footer locale={validLang} id="footer" />
                      <FloatingCartButtonWrapper locale={validLang} />
                      <CartModal locale={validLang} />
                      <CookieConsentBanner locale={validLang} />

                      {/* Modern Analytics Debug Panel (only in development) */}
                      <AnalyticsDebugPanel />

                      {/* Структурированные данные */}
                      <StructuredData
                        type="Organization"
                        data={{
                          name: 'FlowMasters',
                          url: 'https://flow-masters.ru',
                          logo: 'https://flow-masters.ru/images/logo.png',
                          description: 'Автоматизация бизнес-процессов с помощью ИИ',
                          contactPoint: {
                            '@type': 'ContactPoint',
                            contactType: 'customer service',
                            availableLanguage: ['Russian', 'English'],
                          },
                        }}
                      />
                      <StructuredData
                        type="WebSite"
                        data={{
                          name: 'FlowMasters',
                          url: `https://flow-masters.ru/${validLang}`,
                          potentialAction: {
                            '@type': 'SearchAction',
                            target: `https://flow-masters.ru/${validLang}/search?q={search_term_string}`,
                            'query-input': 'required name=search_term_string',
                          },
                        }}
                      />
                      </LoadingProvider>
                    </LoadingConfigProvider>
                  </FlexibleAnalyticsProvider>
                </I18nProvider>
              </LocaleProvider>
            </DropdownProvider>
          </ThemeProvider>
        </div>
      </div>
    </NextIntlClientProvider>
  )
}
