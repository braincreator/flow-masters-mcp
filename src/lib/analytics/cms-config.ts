/**
 * CMS-based Analytics Configuration
 * Позволяет настраивать аналитику через админку CMS
 */

import { AnalyticsConfig } from './types'

// Интерфейс для настроек аналитики в CMS
export interface CMSAnalyticsSettings {
  // Общие настройки
  enabled: boolean
  debug: boolean
  
  // Yandex Metrica
  yandexMetricaEnabled: boolean
  yandexMetricaId?: string
  yandexMetricaClickmap: boolean
  yandexMetricaTrackLinks: boolean
  yandexMetricaWebvisor: boolean
  yandexMetricaAccurateTrackBounce: boolean
  
  // VK Pixel
  vkPixelEnabled: boolean
  vkPixelIds?: string[] // Поддержка нескольких пикселей
  vkPixelTrackPageView: boolean
  
  // Top.Mail.Ru (VK Ads)
  topMailRuEnabled: boolean
  topMailRuId?: string
  topMailRuTrackPageView: boolean
  
  // Дополнительные настройки
  trackingDomains?: string[] // На каких доменах включать
  excludePaths?: string[] // Какие пути исключить
  customEvents?: Array<{
    name: string
    description: string
    enabled: boolean
  }>
}

// Значения по умолчанию
export const defaultAnalyticsSettings: CMSAnalyticsSettings = {
  enabled: true,
  debug: process.env.NODE_ENV === 'development',
  
  yandexMetricaEnabled: true,
  yandexMetricaClickmap: true,
  yandexMetricaTrackLinks: true,
  yandexMetricaWebvisor: false, // По умолчанию выключен для приватности
  yandexMetricaAccurateTrackBounce: true,
  
  vkPixelEnabled: true,
  vkPixelTrackPageView: true,
  
  topMailRuEnabled: true,
  topMailRuTrackPageView: true,
  
  trackingDomains: [],
  excludePaths: ['/admin', '/api'],
  customEvents: []
}

/**
 * Преобразует настройки из CMS в конфигурацию аналитики
 */
export function createAnalyticsConfigFromCMS(
  cmsSettings: Partial<CMSAnalyticsSettings>,
  fallbackToEnv = true
): AnalyticsConfig {
  // Объединяем с настройками по умолчанию
  const settings = { ...defaultAnalyticsSettings, ...cmsSettings }
  
  // Если аналитика отключена в CMS
  if (!settings.enabled) {
    return { enabled: false, debug: settings.debug }
  }
  
  const config: AnalyticsConfig = {
    enabled: true,
    debug: settings.debug
  }
  
  // Yandex Metrica
  if (settings.yandexMetricaEnabled) {
    const counterId = settings.yandexMetricaId || 
      (fallbackToEnv ? process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID : undefined)
    
    if (counterId) {
      config.yandexMetrica = {
        counterId,
        enabled: true,
        options: {
          clickmap: settings.yandexMetricaClickmap,
          trackLinks: settings.yandexMetricaTrackLinks,
          webvisor: settings.yandexMetricaWebvisor,
          accurateTrackBounce: settings.yandexMetricaAccurateTrackBounce,
          defer: false,
          triggerEvent: true
        }
      }
    }
  }
  
  // VK Pixel
  if (settings.vkPixelEnabled) {
    const pixelIds = settings.vkPixelIds?.length ? settings.vkPixelIds :
      (fallbackToEnv && process.env.NEXT_PUBLIC_VK_PIXEL_ID ? 
        [process.env.NEXT_PUBLIC_VK_PIXEL_ID] : [])
    
    if (pixelIds.length > 0) {
      config.vkPixel = pixelIds.map(pixelId => ({
        pixelId,
        enabled: true,
        trackPageView: settings.vkPixelTrackPageView
      }))
    }
  }
  
  // Top.Mail.Ru
  if (settings.topMailRuEnabled) {
    const counterId = settings.topMailRuId || 
      (fallbackToEnv ? process.env.NEXT_PUBLIC_TOP_MAIL_RU_ID : undefined)
    
    if (counterId) {
      config.topMailRu = {
        counterId,
        enabled: true,
        trackPageView: settings.topMailRuTrackPageView
      }
    }
  }
  
  return config
}

/**
 * Проверяет, должна ли аналитика работать на текущей странице
 */
export function shouldTrackPage(
  pathname: string, 
  settings: CMSAnalyticsSettings,
  hostname?: string
): boolean {
  // Проверяем домены
  if (settings.trackingDomains?.length && hostname) {
    const shouldTrackDomain = settings.trackingDomains.some(domain => 
      hostname.includes(domain)
    )
    if (!shouldTrackDomain) return false
  }
  
  // Проверяем исключенные пути
  if (settings.excludePaths?.length) {
    const isExcluded = settings.excludePaths.some(path => 
      pathname.startsWith(path)
    )
    if (isExcluded) return false
  }
  
  return true
}

/**
 * Хук для получения настроек аналитики из CMS
 */
export async function getAnalyticsSettingsFromCMS(): Promise<CMSAnalyticsSettings> {
  try {
    // Здесь будет запрос к вашему CMS API
    // Пример для Payload CMS:
    const response = await fetch('/api/globals/analytics-settings', {
      cache: 'no-store' // Всегда получаем свежие настройки
    })
    
    if (response.ok) {
      const data = await response.json()
      return data
    }
  } catch (error) {
    console.warn('Failed to load analytics settings from CMS:', error)
  }
  
  // Возвращаем настройки по умолчанию если CMS недоступен
  return defaultAnalyticsSettings
}

/**
 * Валидация настроек аналитики
 */
export function validateAnalyticsSettings(settings: Partial<CMSAnalyticsSettings>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Проверяем ID Yandex Metrica
  if (settings.yandexMetricaEnabled && settings.yandexMetricaId) {
    if (!/^\d+$/.test(settings.yandexMetricaId)) {
      errors.push('Yandex Metrica ID должен содержать только цифры')
    }
  }
  
  // Проверяем VK Pixel IDs
  if (settings.vkPixelEnabled && settings.vkPixelIds?.length) {
    settings.vkPixelIds.forEach((id, index) => {
      if (!/^VK-RTRG-\d+-[A-Z0-9]+$/.test(id)) {
        errors.push(`VK Pixel ID #${index + 1} имеет неверный формат (должен быть VK-RTRG-XXXXXX-XXXXX)`)
      }
    })
  }
  
  // Проверяем Top.Mail.Ru ID
  if (settings.topMailRuEnabled && settings.topMailRuId) {
    if (!/^\d+$/.test(settings.topMailRuId)) {
      errors.push('Top.Mail.Ru ID должен содержать только цифры')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
