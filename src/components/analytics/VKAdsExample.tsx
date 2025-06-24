'use client'

/**
 * VK Ads (Top.Mail.Ru) Integration Example
 * Демонстрирует адаптированный код VK Ads для Next.js
 */

import React from 'react'
import { useTopMailRu } from '@/lib/analytics'

export function VKAdsExample() {
  const tmr = useTopMailRu()

  // Пример отслеживания просмотра страницы
  const handlePageView = () => {
    tmr.pageView({
      source: 'manual_trigger',
      page: window.location.pathname,
      timestamp: Date.now()
    })
  }

  // Пример отслеживания цели (конверсии)
  const handleGoalTracking = () => {
    tmr.goal('purchase_intent', {
      product_category: 'services',
      value: 1000,
      currency: 'RUB'
    })
  }

  // Пример отслеживания кастомного события
  const handleCustomEvent = () => {
    tmr.event({
      type: 'reachGoal',
      goal: 'newsletter_signup',
      params: {
        source: 'homepage',
        method: 'email',
        timestamp: Date.now()
      }
    })
  }

  // Пример отслеживания события покупки
  const handlePurchaseEvent = () => {
    tmr.event({
      type: 'reachGoal',
      goal: 'purchase_completed',
      params: {
        order_id: 'order_' + Date.now(),
        amount: 5000,
        currency: 'RUB',
        payment_method: 'card'
      }
    })
  }

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        VK Ads (Top.Mail.Ru) Integration
      </h2>
      
      <div className="mb-4 p-4 bg-white rounded border-l-4 border-blue-500">
        <h3 className="font-semibold text-gray-700 mb-2">Service Status</h3>
        <div className="flex items-center">
          <span className={`w-3 h-3 rounded-full mr-2 ${tmr.isReady ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm">
            Top.Mail.Ru: {tmr.isReady ? 'Ready ✅' : 'Not Ready ❌'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Page View Tracking */}
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2 text-gray-700">Page View Tracking</h3>
          <p className="text-sm text-gray-600 mb-3">
            Отслеживание просмотров страниц (аналог оригинального кода VK Ads)
          </p>
          <button
            onClick={handlePageView}
            disabled={!tmr.isReady}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Track Page View
          </button>
        </div>

        {/* Goal Tracking */}
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2 text-gray-700">Goal Tracking</h3>
          <p className="text-sm text-gray-600 mb-3">
            Отслеживание целей и конверсий
          </p>
          <button
            onClick={handleGoalTracking}
            disabled={!tmr.isReady}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            Track Goal
          </button>
        </div>

        {/* Custom Event Tracking */}
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2 text-gray-700">Custom Events</h3>
          <p className="text-sm text-gray-600 mb-3">
            Кастомные события с дополнительными параметрами
          </p>
          <div className="space-x-2">
            <button
              onClick={handleCustomEvent}
              disabled={!tmr.isReady}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-300"
            >
              Newsletter Signup
            </button>
            <button
              onClick={handlePurchaseEvent}
              disabled={!tmr.isReady}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:bg-gray-300"
            >
              Purchase Event
            </button>
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2 text-gray-700">Code Examples</h3>
          <div className="text-sm bg-gray-100 p-3 rounded font-mono space-y-2">
            <div className="text-gray-600">// Оригинальный код VK Ads адаптирован для React:</div>
            <div>tmr.pageView({`{ source: 'manual' }`})</div>
            <div>tmr.goal('purchase_intent', {`{ value: 1000 }`})</div>
            <div>tmr.event({`{ type: 'reachGoal', goal: 'signup' }`})</div>
            <br />
            <div className="text-gray-600">// Автоматическое отслеживание:</div>
            <div>- Просмотры страниц отслеживаются автоматически</div>
            <div>- Скрипт загружается асинхронно</div>
            <div>- Поддержка noscript fallback</div>
          </div>
        </div>

        {/* Integration Info */}
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h3 className="font-semibold mb-2 text-blue-800">Integration Details</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <div>✅ Адаптированный официальный код VK Ads</div>
            <div>✅ Поддержка всех функций оригинального скрипта</div>
            <div>✅ SSR-безопасная реализация для Next.js</div>
            <div>✅ TypeScript типизация</div>
            <div>✅ Автоматическая обработка ошибок</div>
            <div>✅ Noscript fallback для пользователей без JS</div>
          </div>
        </div>
      </div>
    </div>
  )
}
