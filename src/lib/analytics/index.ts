/**
 * Modern Analytics Library for Next.js App Directory
 * 
 * This library provides a modern, type-safe way to integrate Yandex Metrica
 * and VK Ads Pixel with Next.js 15 App Directory.
 * 
 * Features:
 * - TypeScript support with full type safety
 * - React hooks for easy integration
 * - Automatic page tracking for App Router
 * - Support for multiple VK pixels
 * - Debug mode for development
 * - Health monitoring and error handling
 * - SSR-safe implementation
 * 
 * @example
 * ```tsx
 * // In your root layout or app component
 * import { AnalyticsProvider } from '@/lib/analytics'
 * 
 * const analyticsConfig = {
 *   yandexMetrica: {
 *     counterId: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID!,
 *     options: {
 *       clickmap: true,
 *       trackLinks: true,
 *       webvisor: true
 *     }
 *   },
 *   vkPixel: {
 *     pixelId: process.env.NEXT_PUBLIC_VK_PIXEL_ID!
 *   },
 *   debug: process.env.NODE_ENV === 'development',
 *   enabled: true
 * }
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <AnalyticsProvider config={analyticsConfig}>
 *       {children}
 *     </AnalyticsProvider>
 *   )
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // In your components
 * import { useAnalytics, useYandexMetrica, useVKPixel } from '@/lib/analytics'
 * 
 * function MyComponent() {
 *   const analytics = useAnalytics()
 *   const ym = useYandexMetrica()
 *   const vk = useVKPixel()
 * 
 *   const handleButtonClick = () => {
 *     // Track with all services
 *     analytics.trackEvent('button_click', { button: 'cta' })
 *     
 *     // Or track with specific services
 *     ym.goal('cta_clicked')
 *     vk.event('button_click', { type: 'cta' })
 *   }
 * 
 *   return <button onClick={handleButtonClick}>Click me</button>
 * }
 * ```
 */

// Main exports
export { AnalyticsProvider, useAnalytics } from './provider'

// CMS integration
export {
  createAnalyticsConfigFromCMS,
  getAnalyticsSettingsFromCMS,
  shouldTrackPage,
  validateAnalyticsSettings,
  defaultAnalyticsSettings
} from './cms-config'
export type { CMSAnalyticsSettings } from './cms-config'

// Specialized hooks
export {
  useYandexMetrica,
  useVKPixel,
  useTopMailRu,
  useAnalyticsHook,
  usePageTracking,
  useEventTracking,
  useEcommerceTracking,
  useUserTracking,
  useAnalyticsDebug
} from './hooks'

// Services (for advanced usage)
export { YandexMetricaService } from './yandex-metrica'
export { VKPixelService } from './vk-pixel'
export { TopMailRuService } from './top-mail-ru'

// Types
export type {
  AnalyticsConfig,
  AnalyticsContextType,
  AnalyticsEvent,
  AnalyticsHealth,
  YandexMetricaConfig,
  YandexMetricaEcommerce,
  VKPixelConfig,
  TopMailRuConfig,
  TopMailRuEvent,
  UseYandexMetricaReturn,
  UseVKPixelReturn,
  UseTopMailRuReturn,
  UseAnalyticsReturn
} from './types'

// Error class
export { AnalyticsError } from './types'

// Utility functions
export const createAnalyticsConfig = (options: {
  yandexMetricaId?: string
  vkPixelId?: string | string[]
  topMailRuId?: string
  debug?: boolean
  enabled?: boolean
}): AnalyticsConfig => {
  const config: AnalyticsConfig = {
    debug: options.debug ?? process.env.NODE_ENV === 'development',
    enabled: options.enabled ?? true
  }

  if (options.yandexMetricaId) {
    config.yandexMetrica = {
      counterId: options.yandexMetricaId,
      options: {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
        defer: false,
        triggerEvent: true
      },
      enabled: true
    }
  }

  if (options.vkPixelId) {
    const pixelIds = Array.isArray(options.vkPixelId) ? options.vkPixelId : [options.vkPixelId]
    config.vkPixel = pixelIds.map(pixelId => ({
      pixelId,
      enabled: true,
      trackPageView: true
    }))
  }

  if (options.topMailRuId) {
    config.topMailRu = {
      counterId: options.topMailRuId,
      enabled: true,
      trackPageView: true
    }
  }

  return config
}

// Environment-based config helper
export const createAnalyticsConfigFromEnv = (): AnalyticsConfig => {
  return createAnalyticsConfig({
    yandexMetricaId: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID,
    vkPixelId: process.env.NEXT_PUBLIC_VK_PIXEL_ID,
    topMailRuId: process.env.NEXT_PUBLIC_TOP_MAIL_RU_ID,
    debug: process.env.NODE_ENV === 'development',
    enabled: process.env.NODE_ENV !== 'test'
  })
}
