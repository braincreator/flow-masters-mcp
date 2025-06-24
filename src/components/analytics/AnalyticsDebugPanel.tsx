'use client'

/**
 * Analytics Debug Panel - Modern replacement for analytics testing components
 */

import React, { useState, useEffect } from 'react'
import {
  useAnalyticsDebug,
  useYandexMetrica,
  useVKPixel,
  useTopMailRu,
  useEventTracking,
  useEcommerceTracking
} from '@/lib/analytics'

export function AnalyticsDebugPanel() {
  const debug = useAnalyticsDebug()
  const ym = useYandexMetrica()
  const vk = useVKPixel()
  const tmr = useTopMailRu()
  const { trackEvent, trackGoal } = useEventTracking()
  const { trackPurchase, trackAddToCart } = useEcommerceTracking()
  
  const [health, setHealth] = useState(debug.getHealth())
  const [events, setEvents] = useState(debug.getRecentEvents())

  // Update health and events periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setHealth(debug.getHealth())
      setEvents(debug.getRecentEvents())
    }, 2000)

    return () => clearInterval(interval)
  }, [debug])

  const testYandexMetrica = () => {
    ym.goal('test_goal', { source: 'debug_panel' })
    ym.hit('/test-page')
  }

  const testVKPixel = () => {
    vk.event('test_event', { source: 'debug_panel' })
    vk.goal('test_goal', { source: 'debug_panel' })
  }

  const testTopMailRu = () => {
    tmr.pageView({ source: 'debug_panel' })
    tmr.goal('test_goal', { source: 'debug_panel' })
    tmr.event({
      type: 'reachGoal',
      goal: 'debug_test',
      params: { source: 'debug_panel' }
    })
  }

  const testUniversalTracking = () => {
    trackEvent('universal_test', { timestamp: Date.now() })
    trackGoal('universal_goal', { source: 'debug_panel' })
  }

  const testEcommerce = () => {
    trackAddToCart([
      {
        id: 'test-product-1',
        name: 'Test Product',
        category: 'Test Category',
        price: 100,
        quantity: 1
      }
    ])

    trackPurchase([
      {
        id: 'test-product-1',
        name: 'Test Product',
        category: 'Test Category',
        price: 100,
        quantity: 1
      }
    ], 'test-transaction-' + Date.now(), 100)
  }

  if (!debug.config.debug) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Analytics Debug Panel</h3>
        <button
          onClick={() => debug.clearEvents()}
          className="text-sm bg-red-500 text-white px-2 py-1 rounded"
        >
          Clear Events
        </button>
      </div>

      {/* Health Status */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Service Health</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${health.yandexMetrica.loaded ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>Yandex Metrica: {health.yandexMetrica.loaded ? 'Ready' : 'Not Ready'}</span>
            {health.yandexMetrica.counterId && (
              <span className="ml-2 text-gray-500">({health.yandexMetrica.counterId})</span>
            )}
          </div>
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${health.vkPixel.loaded ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>VK Pixel: {health.vkPixel.loaded ? 'Ready' : 'Not Ready'}</span>
            {health.vkPixel.pixelIds.length > 0 && (
              <span className="ml-2 text-gray-500">({health.vkPixel.pixelIds.join(', ')})</span>
            )}
          </div>
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${health.topMailRu.loaded ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>Top.Mail.Ru: {health.topMailRu.loaded ? 'Ready' : 'Not Ready'}</span>
            {health.topMailRu.counterId && (
              <span className="ml-2 text-gray-500">({health.topMailRu.counterId})</span>
            )}
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Test Functions</h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={testYandexMetrica}
            disabled={!ym.isReady}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded disabled:bg-gray-300"
          >
            Test YM
          </button>
          <button
            onClick={testVKPixel}
            disabled={!vk.isReady}
            className="text-xs bg-purple-500 text-white px-2 py-1 rounded disabled:bg-gray-300"
          >
            Test VK
          </button>
          <button
            onClick={testTopMailRu}
            disabled={!tmr.isReady}
            className="text-xs bg-red-500 text-white px-2 py-1 rounded disabled:bg-gray-300"
          >
            Test TMR
          </button>
          <button
            onClick={testUniversalTracking}
            disabled={!debug.isReady}
            className="text-xs bg-green-500 text-white px-2 py-1 rounded disabled:bg-gray-300"
          >
            Test Universal
          </button>
          <button
            onClick={testEcommerce}
            disabled={!debug.isReady}
            className="text-xs bg-orange-500 text-white px-2 py-1 rounded disabled:bg-gray-300"
          >
            Test Ecommerce
          </button>
        </div>
      </div>

      {/* Recent Events */}
      <div>
        <h4 className="font-medium mb-2">Recent Events ({events.length})</h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {events.slice(0, 10).map((event) => (
            <div key={event.id} className="text-xs bg-gray-100 p-2 rounded">
              <div className="flex justify-between">
                <span className="font-medium">{event.type}</span>
                <span className="text-gray-500">{event.service}</span>
              </div>
              <div className="text-gray-600 mt-1">
                {JSON.stringify(event.data, null, 2).slice(0, 100)}
                {JSON.stringify(event.data).length > 100 && '...'}
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {new Date(event.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="text-gray-500 text-xs">No events tracked yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
