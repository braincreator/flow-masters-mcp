'use client'

/**
 * Example component showing how to use the new analytics hooks
 */

import React from 'react'
import {
  useAnalytics,
  useYandexMetrica,
  useVKPixel,
  useTopMailRu,
  useEventTracking,
  useEcommerceTracking,
  useUserTracking
} from '@/lib/analytics'

export function AnalyticsExample() {
  // Main analytics hook with all functionality
  const analytics = useAnalytics()
  
  // Specialized hooks for specific services
  const ym = useYandexMetrica()
  const vk = useVKPixel()
  const tmr = useTopMailRu()
  
  // Specialized hooks for different tracking types
  const { trackEvent, trackGoal } = useEventTracking()
  const { trackPurchase, trackAddToCart } = useEcommerceTracking()
  const { identifyUser } = useUserTracking()

  // Example: Track button click with all services
  const handleUniversalButtonClick = () => {
    trackEvent('button_click', { 
      button: 'cta',
      location: 'hero_section',
      timestamp: Date.now()
    })
  }

  // Example: Track goal with all services
  const handleUniversalGoal = () => {
    trackGoal('newsletter_signup', {
      source: 'homepage',
      method: 'email'
    })
  }

  // Example: Yandex Metrica specific tracking
  const handleYandexSpecific = () => {
    ym.goal('yandex_specific_goal', { custom_param: 'value' })
    ym.hit('/custom-page', { custom_option: true })
  }

  // Example: VK Pixel specific tracking
  const handleVKSpecific = () => {
    vk.event('vk_custom_event', { event_value: 100 })
    vk.goal('vk_conversion', { conversion_type: 'lead' })
  }

  // Example: Top.Mail.Ru (VK Ads) specific tracking
  const handleTopMailRuSpecific = () => {
    tmr.pageView({ source: 'example_component' })
    tmr.goal('tmr_conversion', { conversion_type: 'lead' })
    tmr.event({
      type: 'reachGoal',
      goal: 'custom_goal',
      params: { value: 100 }
    })
  }

  // Example: Ecommerce tracking
  const handlePurchase = () => {
    trackPurchase([
      {
        id: 'product-123',
        name: 'Premium Service',
        category: 'Services',
        price: 1000,
        quantity: 1,
        brand: 'FlowMasters'
      }
    ], 'order-' + Date.now(), 1000)
  }

  const handleAddToCart = () => {
    trackAddToCart([
      {
        id: 'product-456',
        name: 'Consultation',
        category: 'Services',
        price: 500,
        quantity: 1
      }
    ])
  }

  // Example: User identification
  const handleUserLogin = () => {
    identifyUser('user-123', {
      email: 'user@example.com',
      name: 'John Doe',
      plan: 'premium',
      signup_date: '2024-01-01'
    })
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Analytics Integration Examples</h2>
      
      <div className="space-y-4">
        {/* Service Status */}
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2">Service Status</h3>
          <div className="text-sm space-y-1">
            <div>Analytics Ready: {analytics.isReady ? '✅' : '❌'}</div>
            <div>Yandex Metrica: {ym.isReady ? '✅' : '❌'}</div>
            <div>VK Pixel: {vk.isReady ? '✅' : '❌'}</div>
            <div>Top.Mail.Ru: {tmr.isReady ? '✅' : '❌'}</div>
          </div>
        </div>

        {/* Universal Tracking */}
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2">Universal Tracking (All Services)</h3>
          <div className="space-x-2">
            <button
              onClick={handleUniversalButtonClick}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Track Button Click
            </button>
            <button
              onClick={handleUniversalGoal}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Track Goal
            </button>
          </div>
        </div>

        {/* Service-Specific Tracking */}
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2">Service-Specific Tracking</h3>
          <div className="space-x-2 space-y-2">
            <button
              onClick={handleYandexSpecific}
              disabled={!ym.isReady}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-300"
            >
              Yandex Metrica Only
            </button>
            <button
              onClick={handleVKSpecific}
              disabled={!vk.isReady}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-300"
            >
              VK Pixel Only
            </button>
            <button
              onClick={handleTopMailRuSpecific}
              disabled={!tmr.isReady}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
            >
              Top.Mail.Ru Only
            </button>
          </div>
        </div>

        {/* Ecommerce Tracking */}
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2">Ecommerce Tracking</h3>
          <div className="space-x-2">
            <button
              onClick={handleAddToCart}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Add to Cart
            </button>
            <button
              onClick={handlePurchase}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Complete Purchase
            </button>
          </div>
        </div>

        {/* User Tracking */}
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2">User Identification</h3>
          <button
            onClick={handleUserLogin}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            Identify User
          </button>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="mt-6 bg-white p-4 rounded border">
        <h3 className="font-semibold mb-2">Code Examples</h3>
        <div className="text-sm bg-gray-100 p-3 rounded font-mono">
          <div>// Universal tracking</div>
          <div>trackEvent('button_click', {`{ button: 'cta' }`})</div>
          <div>trackGoal('conversion', {`{ source: 'homepage' }`})</div>
          <br />
          <div>// Service-specific</div>
          <div>ym.goal('yandex_goal')</div>
          <div>vk.event('vk_event')</div>
          <br />
          <div>// Ecommerce</div>
          <div>trackPurchase(items, transactionId, value)</div>
          <div>trackAddToCart(items)</div>
        </div>
      </div>
    </div>
  )
}
