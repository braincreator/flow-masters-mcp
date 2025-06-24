'use client'

/**
 * Гибкий провайдер аналитики
 * Поддерживает настройку через CMS, переменные окружения или прямую конфигурацию
 */

import React, { ReactNode, useEffect, useState } from 'react'
import { AnalyticsProvider, AnalyticsConfig } from '@/lib/analytics'
import { 
  createAnalyticsConfigFromCMS, 
  getAnalyticsSettingsFromCMS,
  CMSAnalyticsSettings,
  defaultAnalyticsSettings 
} from '@/lib/analytics/cms-config'

interface FlexibleAnalyticsProviderProps {
  children: ReactNode
  // Приоритет источников конфигурации
  configSource?: 'cms' | 'env' | 'manual'
  // Ручная конфигурация (если configSource = 'manual')
  manualConfig?: AnalyticsConfig
  // Настройки из CMS (если уже загружены на сервере)
  cmsSettings?: CMSAnalyticsSettings
  // Fallback к переменным окружения если CMS недоступен
  fallbackToEnv?: boolean
}

export function FlexibleAnalyticsProvider({
  children,
  configSource = 'cms', // По умолчанию используем CMS
  manualConfig,
  cmsSettings,
  fallbackToEnv = true
}: FlexibleAnalyticsProviderProps) {
  const [config, setConfig] = useState<AnalyticsConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        let finalConfig: AnalyticsConfig

        switch (configSource) {
          case 'manual':
            if (!manualConfig) {
              throw new Error('Manual config required when configSource is "manual"')
            }
            finalConfig = manualConfig
            break

          case 'env':
            // Используем только переменные окружения
            finalConfig = {
              enabled: process.env.NODE_ENV !== 'test',
              debug: process.env.NODE_ENV === 'development',
              yandexMetrica: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID ? {
                counterId: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID,
                enabled: true,
                options: {
                  clickmap: true,
                  trackLinks: true,
                  accurateTrackBounce: true,
                  webvisor: false,
                  defer: false,
                  triggerEvent: true
                }
              } : undefined,
              vkPixel: process.env.NEXT_PUBLIC_VK_PIXEL_ID ? [{
                pixelId: process.env.NEXT_PUBLIC_VK_PIXEL_ID,
                enabled: true,
                trackPageView: true
              }] : undefined,
              topMailRu: process.env.NEXT_PUBLIC_TOP_MAIL_RU_ID ? {
                counterId: process.env.NEXT_PUBLIC_TOP_MAIL_RU_ID,
                enabled: true,
                trackPageView: true
              } : undefined
            }
            break

          case 'cms':
          default:
            // Загружаем настройки из CMS
            let settings = cmsSettings
            
            if (!settings) {
              try {
                settings = await getAnalyticsSettingsFromCMS()
              } catch (error) {
                console.warn('Failed to load CMS analytics settings:', error)
                if (fallbackToEnv) {
                  console.log('Falling back to environment variables')
                  settings = defaultAnalyticsSettings
                } else {
                  throw error
                }
              }
            }

            finalConfig = createAnalyticsConfigFromCMS(settings, fallbackToEnv)
            break
        }

        setConfig(finalConfig)
      } catch (error) {
        console.error('Failed to load analytics config:', error)
        
        // Fallback к базовой конфигурации
        if (fallbackToEnv) {
          setConfig({
            enabled: false,
            debug: process.env.NODE_ENV === 'development'
          })
        }
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [configSource, manualConfig, cmsSettings, fallbackToEnv])

  // Показываем загрузку только если это критично
  if (loading && configSource === 'cms') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Загрузка настроек аналитики...</p>
        </div>
      </div>
    )
  }

  // Если конфигурация не загружена, рендерим детей без аналитики
  if (!config) {
    console.warn('Analytics not configured, running without tracking')
    return <>{children}</>
  }

  return (
    <AnalyticsProvider config={config}>
      {children}
    </AnalyticsProvider>
  )
}

// Хелперы для разных сценариев использования

/**
 * Провайдер только с переменными окружения
 */
export function EnvAnalyticsProvider({ children }: { children: ReactNode }) {
  return (
    <FlexibleAnalyticsProvider configSource="env" fallbackToEnv={false}>
      {children}
    </FlexibleAnalyticsProvider>
  )
}

/**
 * Провайдер с ручной конфигурацией
 */
export function ManualAnalyticsProvider({ 
  children, 
  config 
}: { 
  children: ReactNode
  config: AnalyticsConfig 
}) {
  return (
    <FlexibleAnalyticsProvider configSource="manual" manualConfig={config}>
      {children}
    </FlexibleAnalyticsProvider>
  )
}

/**
 * Провайдер с настройками из CMS (для SSR)
 */
export function CMSAnalyticsProvider({ 
  children, 
  settings 
}: { 
  children: ReactNode
  settings: CMSAnalyticsSettings 
}) {
  return (
    <FlexibleAnalyticsProvider configSource="cms" cmsSettings={settings}>
      {children}
    </FlexibleAnalyticsProvider>
  )
}
