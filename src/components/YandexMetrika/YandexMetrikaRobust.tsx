'use client'

import React, { useEffect, useState } from 'react'
import Script from 'next/script'

interface YandexMetrikaRobustProps {
  counterId: string
  enableClickmap?: boolean
  enableTrackLinks?: boolean
  enableAccurateTrackBounce?: boolean
  enableWebvisor?: boolean
  enableEcommerce?: boolean
  defer?: boolean
  debug?: boolean
}

declare global {
  interface Window {
    ym: any
    yaCounter: any
  }
}

export default function YandexMetrikaRobust({
  counterId,
  enableClickmap = true,
  enableTrackLinks = true,
  enableAccurateTrackBounce = true,
  enableWebvisor = false,
  enableEcommerce = false,
  defer = false,
  debug = false
}: YandexMetrikaRobustProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  // Fallback функция для инициализации метрики без внешнего скрипта
  const initFallbackMetrika = () => {
    if (debug && process.env.NODE_ENV === 'development') {
      console.log('🔄 Initializing fallback Yandex Metrika (local mode)')
    }

    // Создаем заглушку для ym функции
    window.ym = window.ym || function(...args: any[]) {
      if (debug && process.env.NODE_ENV === 'development') {
        console.log('📊 Yandex Metrika (fallback):', args)
      }
      // Сохраняем вызовы для возможной отправки позже
      window.ym.queue = window.ym.queue || []
      window.ym.queue.push(args)
    }

    // Инициализируем счетчик
    window.ym(counterId, 'init', {
      clickmap: enableClickmap,
      trackLinks: enableTrackLinks,
      accurateTrackBounce: enableAccurateTrackBounce,
      webvisor: enableWebvisor,
      ecommerce: enableEcommerce
    })

    setIsLoaded(true)
  }

  // Инициализация метрики
  const initMetrika = () => {
    if (typeof window !== 'undefined') {
      window.ym = window.ym || function(...args: any[]) {
        (window.ym.a = window.ym.a || []).push(args)
      }
      window.ym.l = +new Date()

      window.ym(counterId, 'init', {
        clickmap: enableClickmap,
        trackLinks: enableTrackLinks,
        accurateTrackBounce: enableAccurateTrackBounce,
        webvisor: enableWebvisor,
        ecommerce: enableEcommerce,
        defer
      })

      if (debug && process.env.NODE_ENV === 'development') {
        console.log('✅ Yandex Metrika initialized successfully')
      }
      setIsLoaded(true)
    }
  }

  // Обработка успешной загрузки
  const handleLoad = () => {
    initMetrika()
    setLoadError(false)
  }

  // Обработка ошибки загрузки
  const handleError = async () => {
    if (debug && process.env.NODE_ENV === 'development') {
      console.warn(`❌ Failed to load Yandex Metrika (attempt ${retryCount + 1}/${maxRetries})`)
    }

    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1)
      // Пауза перед повторной попыткой
      setTimeout(() => {
        setLoadError(false)
      }, 1000 * (retryCount + 1))
    } else {
      setLoadError(true)
      // Используем fallback режим
      initFallbackMetrika()
    }
  }

  // Noscript fallback для пользователей без JavaScript
  const noscriptContent = `
    <div>
      <img src="https://mc.yandex.ru/watch/${counterId}" 
           style="position:absolute; left:-9999px;" 
           alt="" />
    </div>
  `

  if (loadError && retryCount >= maxRetries) {
    return (
      <>
        {debug && (
          <div style={{ 
            position: 'fixed', 
            top: '10px', 
            right: '10px', 
            background: '#ff9800', 
            color: 'white', 
            padding: '8px', 
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 9999
          }}>
            📊 Metrika: Fallback mode
          </div>
        )}
        <noscript dangerouslySetInnerHTML={{ __html: noscriptContent }} />
      </>
    )
  }

  return (
    <>
      <Script
        id={`yandex-metrika-${counterId}`}
        src="https://mc.yandex.ru/metrika/tag.js"
        strategy={defer ? 'lazyOnload' : 'afterInteractive'}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {debug && isLoaded && (
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          background: '#4caf50', 
          color: 'white', 
          padding: '8px', 
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          📊 Metrika: Active
        </div>
      )}
      
      <noscript dangerouslySetInnerHTML={{ __html: noscriptContent }} />
    </>
  )
}

// Хук для использования Яндекс.Метрики в компонентах
export function useYandexMetrika(counterId: string) {
  const trackEvent = (action: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.ym) {
      window.ym(counterId, 'reachGoal', action, params)
    }
  }

  const trackPageView = (url?: string) => {
    if (typeof window !== 'undefined' && window.ym) {
      window.ym(counterId, 'hit', url || window.location.href)
    }
  }

  const setUserParams = (params: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.ym) {
      window.ym(counterId, 'userParams', params)
    }
  }

  return {
    trackEvent,
    trackPageView,
    setUserParams
  }
}
