'use client'

import React from 'react'
import YandexMetrikaRobust from '@/components/YandexMetrika/YandexMetrikaRobust'
import VKPixel from './VKPixel'
import TopMailRu from './TopMailRu'

interface AnalyticsProviderProps {
  yandexMetrikaId?: string
  vkPixelId?: string
  topMailRuId?: string
  debug?: boolean
  children?: React.ReactNode
}

export default function AnalyticsProvider({
  yandexMetrikaId,
  vkPixelId,
  topMailRuId,
  debug = false,
  children
}: AnalyticsProviderProps) {
  return (
    <>
      {/* Яндекс.Метрика */}
      {yandexMetrikaId && (
        <YandexMetrikaRobust
          counterId={yandexMetrikaId}
          enableClickmap={true}
          enableTrackLinks={true}
          enableAccurateTrackBounce={true}
          enableWebvisor={false}
          enableEcommerce={true}
          defer={true}
          debug={debug}
        />
      )}

      {/* VK Pixel */}
      {vkPixelId && (
        <VKPixel 
          pixelId={vkPixelId}
          debug={debug}
        />
      )}

      {/* Top.Mail.Ru */}
      {topMailRuId && (
        <TopMailRu 
          counterId={topMailRuId}
          debug={debug}
        />
      )}

      {/* Debug панель */}
      {debug && process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 10000,
          fontFamily: 'monospace'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
            📊 Analytics Debug
          </div>
          <div>Яндекс.Метрика: {yandexMetrikaId ? '✅' : '❌'}</div>
          <div>VK Pixel: {vkPixelId ? '✅' : '❌'}</div>
          <div>Top.Mail.Ru: {topMailRuId ? '✅' : '❌'}</div>
        </div>
      )}

      {children}
    </>
  )
}

// Хук для использования всех аналитических сервисов
export function useAnalytics() {
  const trackEvent = (event: string, params?: Record<string, any>) => {
    // Яндекс.Метрика
    if (typeof window !== 'undefined' && window.ym) {
      const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
      if (metrikaId) {
        window.ym(parseInt(metrikaId), 'reachGoal', event, params)
      }
    }

    // VK Pixel
    if (typeof window !== 'undefined' && window.VK && window.VK.Retargeting) {
      window.VK.Retargeting.Event(event)
    }

    // Top.Mail.Ru
    if (typeof window !== 'undefined' && window._tmr) {
      const topMailRuId = process.env.NEXT_PUBLIC_TOP_MAILRU_ID
      if (topMailRuId) {
        window._tmr.push({
          id: topMailRuId,
          type: 'reachGoal',
          goal: event,
          ...params
        })
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics event tracked across all services:', event, params)
    }
  }

  const trackPageView = (url?: string) => {
    // Яндекс.Метрика
    if (typeof window !== 'undefined' && window.ym) {
      const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
      if (metrikaId) {
        window.ym(parseInt(metrikaId), 'hit', url || window.location.href)
      }
    }

    // VK Pixel
    if (typeof window !== 'undefined' && window.VK && window.VK.Retargeting) {
      window.VK.Retargeting.Hit()
    }

    // Top.Mail.Ru
    if (typeof window !== 'undefined' && window._tmr) {
      const topMailRuId = process.env.NEXT_PUBLIC_TOP_MAILRU_ID
      if (topMailRuId) {
        window._tmr.push({
          id: topMailRuId,
          type: 'pageView',
          start: (new Date()).getTime()
        })
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Page view tracked across all services:', url || window.location.href)
    }
  }

  const trackPurchase = (orderId: string, amount: number, currency: string = 'RUB', items?: any[]) => {
    // Яндекс.Метрика ecommerce
    if (typeof window !== 'undefined' && window.ym) {
      const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
      if (metrikaId) {
        // Отправляем цель конверсии
        window.ym(parseInt(metrikaId), 'reachGoal', 'purchase', {
          order_id: orderId,
          revenue: amount,
          currency: currency
        })

        // Отправляем ecommerce данные если включен ecommerce
        if (items && items.length > 0) {
          window.ym(parseInt(metrikaId), 'ecommerce', 'purchase', {
            currencyCode: currency,
            purchase: {
              actionField: {
                id: orderId,
                revenue: amount,
                currencyCode: currency
              },
              products: items.map(item => ({
                id: item.id || item.sku,
                name: item.name,
                category: item.category,
                quantity: item.quantity || 1,
                price: item.price,
                brand: item.brand,
                variant: item.variant
              }))
            }
          })
        }
      }
    }

    // VK Pixel конверсия
    if (typeof window !== 'undefined' && window.VK && window.VK.Retargeting) {
      window.VK.Retargeting.Event('purchase')
    }

    // Top.Mail.Ru конверсия
    if (typeof window !== 'undefined' && window._tmr) {
      const topMailRuId = process.env.NEXT_PUBLIC_TOP_MAILRU_ID
      if (topMailRuId) {
        window._tmr.push({
          id: topMailRuId,
          type: 'reachGoal',
          goal: 'purchase',
          value: amount
        })
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Purchase tracked across all services:', { orderId, amount, currency })
    }
  }

  const trackAddToCart = (item: any) => {
    // Яндекс.Метрика
    if (typeof window !== 'undefined' && window.ym) {
      const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
      if (metrikaId) {
        window.ym(parseInt(metrikaId), 'reachGoal', 'add_to_cart')

        // Ecommerce событие
        window.ym(parseInt(metrikaId), 'ecommerce', 'add', {
          currencyCode: 'RUB',
          add: {
            products: [{
              id: item.id || item.sku,
              name: item.name,
              category: item.category,
              quantity: item.quantity || 1,
              price: item.price
            }]
          }
        })
      }
    }

    // VK Pixel
    if (typeof window !== 'undefined' && window.VK && window.VK.Retargeting) {
      window.VK.Retargeting.Event('add_to_cart')
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Add to cart tracked:', item)
    }
  }

  const trackViewItem = (item: any) => {
    // Яндекс.Метрика
    if (typeof window !== 'undefined' && window.ym) {
      const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
      if (metrikaId) {
        window.ym(parseInt(metrikaId), 'reachGoal', 'view_item')

        // Ecommerce событие
        window.ym(parseInt(metrikaId), 'ecommerce', 'detail', {
          currencyCode: 'RUB',
          detail: {
            products: [{
              id: item.id || item.sku,
              name: item.name,
              category: item.category,
              price: item.price
            }]
          }
        })
      }
    }

    // VK Pixel
    if (typeof window !== 'undefined' && window.VK && window.VK.Retargeting) {
      window.VK.Retargeting.Event('view_content')
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 View item tracked:', item)
    }
  }

  const trackFormStart = (formName: string, formType?: string) => {
    // Яндекс.Метрика
    if (typeof window !== 'undefined' && window.ym) {
      const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
      if (metrikaId) {
        window.ym(parseInt(metrikaId), 'reachGoal', 'form_start', {
          form_name: formName,
          form_type: formType
        })
      }
    }

    // VK Pixel
    if (typeof window !== 'undefined' && window.VK && window.VK.Retargeting) {
      window.VK.Retargeting.Event('form_start')
    }

    // Top.Mail.Ru
    if (typeof window !== 'undefined' && window._tmr) {
      const topMailRuId = process.env.NEXT_PUBLIC_TOP_MAILRU_ID
      if (topMailRuId) {
        window._tmr.push({
          id: topMailRuId,
          type: 'reachGoal',
          goal: 'form_start',
          form_name: formName
        })
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Form start tracked:', { formName, formType })
    }
  }

  const trackFormSubmit = (formName: string, formType?: string, success: boolean = true) => {
    const goalName = success ? 'form_submit' : 'form_error'

    // Яндекс.Метрика
    if (typeof window !== 'undefined' && window.ym) {
      const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
      if (metrikaId) {
        window.ym(parseInt(metrikaId), 'reachGoal', goalName, {
          form_name: formName,
          form_type: formType,
          success: success
        })
      }
    }

    // VK Pixel
    if (typeof window !== 'undefined' && window.VK && window.VK.Retargeting) {
      window.VK.Retargeting.Event(success ? 'lead' : 'form_error')
    }

    // Top.Mail.Ru
    if (typeof window !== 'undefined' && window._tmr) {
      const topMailRuId = process.env.NEXT_PUBLIC_TOP_MAILRU_ID
      if (topMailRuId) {
        window._tmr.push({
          id: topMailRuId,
          type: 'reachGoal',
          goal: goalName,
          form_name: formName,
          success: success
        })
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Form submit tracked:', { formName, formType, success })
    }
  }

  const trackFormFieldFocus = (formName: string, fieldName: string) => {
    // Яндекс.Метрика
    if (typeof window !== 'undefined' && window.ym) {
      const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
      if (metrikaId) {
        window.ym(parseInt(metrikaId), 'reachGoal', 'form_field_focus', {
          form_name: formName,
          field_name: fieldName
        })
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Form field focus tracked:', { formName, fieldName })
    }
  }

  return {
    trackEvent,
    trackPageView,
    trackPurchase,
    trackAddToCart,
    trackViewItem,
    trackFormStart,
    trackFormSubmit,
    trackFormFieldFocus
  }
}
