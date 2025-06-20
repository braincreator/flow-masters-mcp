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
import { cn } from '@/utilities/ui'
import { ThemeProvider } from '@/providers/Theme'
import { I18nProvider } from '@/providers/I18n'
import { LocaleProvider } from '@/providers/LocaleProvider'
import { DropdownProvider } from '@/providers/DropdownContext'
import { setRequestLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { LoadingProvider } from '@/providers/LoadingProvider'
import { LoadingConfigProvider } from '@/providers/LoadingConfigProvider'
import { SmartLoading } from '@/components/ui/smart-loading'
import { YandexMetrikaTracker } from '@/components/YandexMetrika/YandexMetrikaTracker'
// Define locales directly in this file
const locales = ['en', 'ru'] as const

// Добавляем функцию generateStaticParams из удаленного .js файла
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ lang: locale }))
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

  // Получаем ID Яндекс.Метрики
  const YANDEX_METRIKA_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID

  // Debug log
  console.log('Layout: YANDEX_METRIKA_ID =', YANDEX_METRIKA_ID)

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
      console.warn(`Could not load messages for locale: ${validLang}`, error)
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
                  <LoadingConfigProvider>
                    <LoadingProvider>
                      {/* Add our smart loading component */}
                      <SmartLoading />

                      {isDraftMode && <AdminBar />}
                      <Header locale={validLang} />
                      <main className="relative flex-grow flex flex-col pt-[var(--header-height)]">
                        {children}
                      </main>
                      <div id="pagination-slot" className="container py-8"></div>
                      <Footer locale={validLang} />
                      <FloatingCartButtonWrapper locale={validLang} />
                      <CartModal locale={validLang} />
                      <CookieConsentBanner locale={validLang} />

                      {/* Трекер SPA-переходов для Яндекс.Метрики */}
                      {YANDEX_METRIKA_ID && (
                        <YandexMetrikaTracker counterId={YANDEX_METRIKA_ID} />
                      )}
                    </LoadingProvider>
                  </LoadingConfigProvider>
                </I18nProvider>
              </LocaleProvider>
            </DropdownProvider>
          </ThemeProvider>

          {/* Яндекс.Метрика */}
          {YANDEX_METRIKA_ID && (
            <>
              <Script id="yandex-metrika" strategy="afterInteractive">
                {`
                  console.log('Yandex Metrika: Initializing with ID ${YANDEX_METRIKA_ID}');

                  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                  (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

                  ym(${YANDEX_METRIKA_ID}, "init", {
                      clickmap:true,
                      trackLinks:true,
                      accurateTrackBounce:true,
                      webvisor:true,
                      triggerEvent: true
                  });

                  console.log('Yandex Metrika: Script loaded and initialized');

                  // Проверка загрузки через событие
                  window.addEventListener('load', function() {
                    if (typeof ym !== 'undefined') {
                      console.log('Yandex Metrika: Successfully loaded and ready');
                      // Отправляем тестовое событие
                      ym(${YANDEX_METRIKA_ID}, 'reachGoal', 'page_loaded');
                      console.log('Yandex Metrika: Test event "page_loaded" sent');
                    } else {
                      console.error('Yandex Metrika: Failed to load');
                    }
                  });
                `}
              </Script>
              <noscript>
                <div>
                  <img
                    src={`https://mc.yandex.ru/watch/${YANDEX_METRIKA_ID}`}
                    style={{ position: 'absolute', left: '-9999px' }}
                    alt=""
                  />
                </div>
              </noscript>
            </>
          )}
        </div>
      </div>
    </NextIntlClientProvider>
  )
}
