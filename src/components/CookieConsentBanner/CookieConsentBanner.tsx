'use client' // Директива Next.js для клиентских компонентов

import React, { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { useTranslations } from 'next-intl'
import { Locale } from '@/constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const COOKIE_NAME = 'gdpr_consent_status'
const YANDEX_METRIKA_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID

declare global {
  interface Window {
    ym?: (counterId: number, action: string, params?: any) => void
  }
}

interface CookieConsentBannerProps {
  locale: Locale
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ locale }) => {
  const t = useTranslations('CookieConsentBanner')
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consentStatus = Cookies.get(COOKIE_NAME)
    if (!consentStatus) {
      setShowBanner(true)
    }
    // Важно: Не инициализируем отправку хита здесь,
    // если счетчик загружается с отложенной отправкой.
  }, [])

  const sendYandexHit = () => {
    if (YANDEX_METRIKA_ID && typeof window.ym === 'function') {
      try {
        const counterId = parseInt(YANDEX_METRIKA_ID, 10)
        if (!isNaN(counterId)) {
          window.ym(counterId, 'hit', window.location.href)
          console.log(`Yandex Metrika: Sent hit for counter ${counterId}`)
        }
      } catch (error) {
        console.error('Error sending Yandex Metrika hit:', error)
      }
    }
  }

  const handleAccept = () => {
    Cookies.set(COOKIE_NAME, 'all', { expires: 365, path: '/', sameSite: 'Lax' })
    setShowBanner(false)
    console.log('Cookie Consent: Accepted all')
    // Отправляем первый хит в Метрику
    sendYandexHit()
    // Здесь можно инициализировать другие скрипты, требующие согласия
  }

  const handleNecessary = () => {
    Cookies.set(COOKIE_NAME, 'necessary', { expires: 365, path: '/', sameSite: 'Lax' })
    setShowBanner(false)
    console.log('Cookie Consent: Accepted necessary only')
    // НЕ отправляем хит в Метрику
    // Здесь НЕ инициализируем другие скрипты, требующие согласия
  }

  if (!showBanner) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 w-full',
        'bg-card text-card-foreground shadow-lg border-t',
        'p-4 md:px-6',
        'flex flex-col md:flex-row md:items-center md:justify-between gap-4',
      )}
    >
      <div className="text-sm md:flex-grow md:mr-4">
        <p className="leading-relaxed">
          {t.rich('message', {
            a: (chunks) => (
              <a
                href={`/${locale}/privacy`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
      </div>
      <div className="flex flex-shrink-0 gap-3 flex-wrap md:flex-nowrap">
        <Button variant="outline" size="sm" onClick={handleNecessary}>
          {t('necessaryButton')}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleAccept}
          className="bg-green-600 hover:bg-green-700"
        >
          {t('acceptAllButton')}
        </Button>
      </div>
    </div>
  )
}

export default CookieConsentBanner
