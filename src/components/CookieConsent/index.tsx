'use client'

import { useState, useEffect } from 'react'
import { X, Settings, Check, Shield } from 'lucide-react'

interface CookieConsentProps {
  onConsentChange?: (consent: CookieConsent) => void
}

interface CookieConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

const defaultConsent: CookieConsent = {
  necessary: true, // Всегда true, нельзя отключить
  analytics: false,
  marketing: false,
  preferences: false,
}

/**
 * Компонент для управления согласием на cookies (GDPR)
 * Интегрируется с системой пикселей для соблюдения требований GDPR
 */
export default function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    // Проверяем, есть ли сохраненное согласие
    const savedConsent = localStorage.getItem('cookie-consent')
    const savedTimestamp = localStorage.getItem('cookie-consent-timestamp')
    
    if (savedConsent && savedTimestamp) {
      // Проверяем, не истекло ли согласие (например, через год)
      const consentAge = Date.now() - parseInt(savedTimestamp)
      const oneYear = 365 * 24 * 60 * 60 * 1000
      
      if (consentAge < oneYear) {
        const parsedConsent = JSON.parse(savedConsent)
        setConsent(parsedConsent)
        setHasInteracted(true)
        onConsentChange?.(parsedConsent)
        return
      }
    }
    
    // Показываем баннер если согласие не дано или истекло
    setIsVisible(true)
  }, [onConsentChange])

  const saveConsent = (newConsent: CookieConsent) => {
    localStorage.setItem('cookie-consent', JSON.stringify(newConsent))
    localStorage.setItem('cookie-consent-timestamp', Date.now().toString())
    setConsent(newConsent)
    setHasInteracted(true)
    setIsVisible(false)
    onConsentChange?.(newConsent)
  }

  const handleAcceptAll = () => {
    const fullConsent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    }
    saveConsent(fullConsent)
  }

  const handleAcceptNecessary = () => {
    saveConsent(defaultConsent)
  }

  const handleSavePreferences = () => {
    saveConsent(consent)
  }

  const updateConsentCategory = (category: keyof CookieConsent, value: boolean) => {
    if (category === 'necessary') return // Нельзя отключить необходимые cookies
    
    setConsent(prev => ({
      ...prev,
      [category]: value
    }))
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Настройки конфиденциальности
            </h2>
          </div>
          <button
            onClick={handleAcceptNecessary}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Мы используем cookies для улучшения вашего опыта на сайте, анализа трафика и персонализации контента. 
            Вы можете выбрать, какие типы cookies разрешить.
          </p>

          {!showDetails ? (
            /* Simple view */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Все cookies</h3>
                  <p className="text-sm text-gray-600">
                    Разрешить все типы cookies для полной функциональности
                  </p>
                </div>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Принять все
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Только необходимые</h3>
                  <p className="text-sm text-gray-600">
                    Разрешить только технически необходимые cookies
                  </p>
                </div>
                <button
                  onClick={handleAcceptNecessary}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Принять
                </button>
              </div>

              <button
                onClick={() => setShowDetails(true)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Settings className="w-4 h-4" />
                <span>Настроить детально</span>
              </button>
            </div>
          ) : (
            /* Detailed view */
            <div className="space-y-4">
              {/* Necessary cookies */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Необходимые cookies</h3>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Всегда активны</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Эти cookies необходимы для работы сайта и не могут быть отключены. 
                  Они обычно устанавливаются в ответ на ваши действия.
                </p>
              </div>

              {/* Analytics cookies */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Аналитические cookies</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={(e) => updateConsentCategory('analytics', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Помогают нам понимать, как посетители взаимодействуют с сайтом, 
                  собирая и сообщая информацию анонимно.
                </p>
              </div>

              {/* Marketing cookies */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Маркетинговые cookies</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent.marketing}
                      onChange={(e) => updateConsentCategory('marketing', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Используются для отслеживания посетителей на веб-сайтах для показа 
                  релевантной рекламы и измерения эффективности кампаний.
                </p>
              </div>

              {/* Preferences cookies */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Функциональные cookies</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent.preferences}
                      onChange={(e) => updateConsentCategory('preferences', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Позволяют сайту запоминать ваши предпочтения и обеспечивать 
                  расширенную функциональность и персонализацию.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Сохранить настройки
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Назад
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <p className="text-xs text-gray-500">
            Подробнее о том, как мы используем cookies, читайте в нашей{' '}
            <a href="/privacy-policy" className="text-blue-600 hover:underline">
              Политике конфиденциальности
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Хук для получения текущего согласия на cookies
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null)

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie-consent')
    if (savedConsent) {
      setConsent(JSON.parse(savedConsent))
    }
  }, [])

  const updateConsent = (newConsent: CookieConsent) => {
    setConsent(newConsent)
  }

  return { consent, updateConsent }
}
