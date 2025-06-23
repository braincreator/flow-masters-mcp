'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

const COOKIE_NAME = 'gdpr_consent_status'
const DETAILED_COOKIE_NAME = 'gdpr_detailed_consent'

export interface DetailedConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

export interface CookieConsentHook {
  consent: string | null
  detailedConsent: DetailedConsent | null
  hasConsent: boolean
  hasAnalytics: boolean
  hasMarketing: boolean
  hasPreferences: boolean
  updateConsent: (consent: DetailedConsent, status: string) => void
  clearConsent: () => void
}

/**
 * Хук для работы с согласием на cookies
 * Предоставляет доступ к текущему состоянию согласия и методы для его обновления
 */
export function useCookieConsent(): CookieConsentHook {
  const [consent, setConsent] = useState<string | null>(null)
  const [detailedConsent, setDetailedConsent] = useState<DetailedConsent | null>(null)

  useEffect(() => {
    // Загружаем согласие из cookies
    const consentStatus = Cookies.get(COOKIE_NAME)
    const detailedConsentData = Cookies.get(DETAILED_COOKIE_NAME)
    
    setConsent(consentStatus || null)
    
    if (detailedConsentData) {
      try {
        const parsed = JSON.parse(detailedConsentData)
        setDetailedConsent(parsed)
      } catch (error) {
        console.error('Error parsing detailed consent:', error)
        setDetailedConsent(null)
      }
    }
  }, [])

  const updateConsent = (newDetailedConsent: DetailedConsent, status: string) => {
    Cookies.set(COOKIE_NAME, status, { expires: 365, path: '/', sameSite: 'Lax' })
    Cookies.set(DETAILED_COOKIE_NAME, JSON.stringify(newDetailedConsent), { expires: 365, path: '/', sameSite: 'Lax' })
    
    setConsent(status)
    setDetailedConsent(newDetailedConsent)
  }

  const clearConsent = () => {
    Cookies.remove(COOKIE_NAME)
    Cookies.remove(DETAILED_COOKIE_NAME)
    setConsent(null)
    setDetailedConsent(null)
  }

  return {
    consent,
    detailedConsent,
    hasConsent: !!consent,
    hasAnalytics: detailedConsent?.analytics || false,
    hasMarketing: detailedConsent?.marketing || false,
    hasPreferences: detailedConsent?.preferences || false,
    updateConsent,
    clearConsent,
  }
}

/**
 * Хук для проверки конкретного типа согласия
 */
export function useConsentCheck() {
  const { detailedConsent } = useCookieConsent()

  const checkConsent = (type: keyof DetailedConsent): boolean => {
    if (!detailedConsent) return false
    return detailedConsent[type]
  }

  return {
    canUseAnalytics: checkConsent('analytics'),
    canUseMarketing: checkConsent('marketing'),
    canUsePreferences: checkConsent('preferences'),
    checkConsent,
  }
}
