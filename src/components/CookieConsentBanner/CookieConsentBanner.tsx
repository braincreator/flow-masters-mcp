'use client' // Директива Next.js для клиентских компонентов

import React, { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { useTranslations } from 'next-intl'
import { Locale } from '@/constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Shield, Settings, ChevronUp, ChevronDown, Cookie, BarChart3, Target, Palette } from 'lucide-react'

const COOKIE_NAME = 'gdpr_consent_status'
const DETAILED_COOKIE_NAME = 'gdpr_detailed_consent'
const YANDEX_METRIKA_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID

declare global {
  interface Window {
    ym?: (counterId: number, action: string, params?: any) => void
  }
}

interface CookieConsentBannerProps {
  locale: Locale
}

interface DetailedConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ locale }) => {
  const t = useTranslations('CookieConsentBanner')
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [detailedConsent, setDetailedConsent] = useState<DetailedConsent>({
    necessary: true, // Всегда true, нельзя отключить
    analytics: false,
    marketing: false,
    preferences: false,
  })

  useEffect(() => {
    const consentStatus = Cookies.get(COOKIE_NAME)
    const detailedConsentData = Cookies.get(DETAILED_COOKIE_NAME)

    if (!consentStatus) {
      setShowBanner(true)
      // Добавляем отступ снизу для body, чтобы контент не перекрывался
      document.body.style.paddingBottom = showDetails ? '400px' : '160px'
    }

    // Загружаем сохраненные детальные настройки
    if (detailedConsentData) {
      try {
        const parsed = JSON.parse(detailedConsentData)
        setDetailedConsent(parsed)
      } catch (error) {
        console.error('Error parsing detailed consent:', error)
      }
    }
    // Важно: Не инициализируем отправку хита здесь,
    // если счетчик загружается с отложенной отправкой.
  }, [])

  // Убираем отступ при скрытии баннера и обновляем при изменении размера
  useEffect(() => {
    if (!showBanner) {
      document.body.style.paddingBottom = '0'
    } else {
      document.body.style.paddingBottom = showDetails ? '400px' : '160px'
    }
  }, [showBanner, showDetails])

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

  const saveConsent = (consent: DetailedConsent, status: string) => {
    Cookies.set(COOKIE_NAME, status, { expires: 365, path: '/', sameSite: 'Lax' })
    Cookies.set(DETAILED_COOKIE_NAME, JSON.stringify(consent), { expires: 365, path: '/', sameSite: 'Lax' })
    setShowBanner(false)
    document.body.style.paddingBottom = '0'

    // Отправляем хит в Метрику только если разрешена аналитика
    if (consent.analytics) {
      sendYandexHit()
    }

    console.log('Cookie Consent:', status, consent)
  }

  const handleAccept = () => {
    const fullConsent: DetailedConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    }
    saveConsent(fullConsent, 'all')
  }

  const handleNecessary = () => {
    const necessaryConsent: DetailedConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    }
    saveConsent(necessaryConsent, 'necessary')
  }

  const handleSavePreferences = () => {
    const hasAnyOptional = detailedConsent.analytics || detailedConsent.marketing || detailedConsent.preferences
    const status = hasAnyOptional ? 'custom' : 'necessary'
    saveConsent(detailedConsent, status)
  }

  const updateConsentCategory = (category: keyof DetailedConsent, value: boolean) => {
    if (category === 'necessary') return // Нельзя отключить необходимые cookies

    setDetailedConsent(prev => ({
      ...prev,
      [category]: value
    }))
  }

  if (!showBanner) {
    return null
  }

  const cookieCategories = [
    {
      key: 'necessary' as keyof DetailedConsent,
      icon: Shield,
      title: 'Необходимые',
      description: 'Обеспечивают базовую функциональность сайта',
      required: true,
    },
    {
      key: 'analytics' as keyof DetailedConsent,
      icon: BarChart3,
      title: 'Аналитические',
      description: 'Помогают понять, как посетители используют сайт',
      required: false,
    },
    {
      key: 'marketing' as keyof DetailedConsent,
      icon: Target,
      title: 'Маркетинговые',
      description: 'Используются для персонализации рекламы',
      required: false,
    },
    {
      key: 'preferences' as keyof DetailedConsent,
      icon: Palette,
      title: 'Предпочтения',
      description: 'Запоминают ваши настройки и предпочтения',
      required: false,
    },
  ]

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 w-full',
        'bg-gradient-to-t from-background/95 to-background/90 backdrop-blur-md',
        'border-t border-border/50 shadow-2xl',
        'transition-all duration-300 ease-in-out',
      )}
    >
      {/* Main Banner Content */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          {/* Icon and Message */}
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              <Cookie className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Настройки конфиденциальности
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t.rich('message', {
                  a: (chunks) => (
                    <a
                      href={`/${locale}/privacy`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 underline font-medium"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Настроить
              {showDetails ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleNecessary}>
              Только необходимые
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Принять все
            </Button>
          </div>
        </div>
      </div>

      {/* Detailed Settings */}
      {showDetails && (
        <div className="border-t border-border/50 bg-muted/30 p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {cookieCategories.map((category) => {
              const Icon = category.icon
              return (
                <div
                  key={category.key}
                  className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-border/50"
                >
                  <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{category.title}</h4>
                      <Switch
                        checked={detailedConsent[category.key]}
                        onCheckedChange={(checked) => updateConsentCategory(category.key, checked)}
                        disabled={category.required}
                        className="ml-2"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                    {category.required && (
                      <span className="text-xs text-primary font-medium">Обязательно</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowDetails(false)}>
              Отмена
            </Button>
            <Button size="sm" onClick={handleSavePreferences} className="bg-primary">
              Сохранить настройки
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CookieConsentBanner
