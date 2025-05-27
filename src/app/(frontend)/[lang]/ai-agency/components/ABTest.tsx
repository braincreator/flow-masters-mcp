'use client'

import React, { useEffect, useState } from 'react'
import { useAnalytics } from '@/providers/AnalyticsProvider'

interface ABTestProps {
  testName: string
  variants: {
    name: string
    weight?: number
    component: React.ReactNode
  }[]
  children?: React.ReactNode
}

interface ABTestResult {
  testName: string
  variant: string
  timestamp: number
  sessionId: string
}

export function ABTest({ testName, variants, children }: ABTestProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    // Generate or get session ID
    let sessionId = sessionStorage.getItem('ab_session_id')
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15)
      sessionStorage.setItem('ab_session_id', sessionId)
    }

    // Check if user already has a variant for this test
    const existingTest = localStorage.getItem(`ab_test_${testName}`)
    if (existingTest) {
      const testData: ABTestResult = JSON.parse(existingTest)
      setSelectedVariant(testData.variant)
      setIsLoading(false)
      return
    }

    // Calculate weights
    const totalWeight = variants.reduce((sum, variant) => sum + (variant.weight || 1), 0)
    const random = Math.random() * totalWeight

    let currentWeight = 0
    let selected = variants[0].name

    for (const variant of variants) {
      currentWeight += variant.weight || 1
      if (random <= currentWeight) {
        selected = variant.name
        break
      }
    }

    // Store the test result
    const testResult: ABTestResult = {
      testName,
      variant: selected,
      timestamp: Date.now(),
      sessionId,
    }

    localStorage.setItem(`ab_test_${testName}`, JSON.stringify(testResult))
    setSelectedVariant(selected)
    setIsLoading(false)

    // Track the test assignment
    trackEvent('experiment', 'ab_test_assigned', `${testName}_${selected}`)

    // Store for analytics
    const allTests = JSON.parse(localStorage.getItem('ab_tests_history') || '[]')
    allTests.push(testResult)
    localStorage.setItem('ab_tests_history', JSON.stringify(allTests))
  }, [testName, variants, trackEvent])

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-20 rounded" />
  }

  const activeVariant = variants.find((v) => v.name === selectedVariant)

  return (
    <div data-ab-test={testName} data-ab-variant={selectedVariant}>
      {activeVariant?.component || children}
    </div>
  )
}

// Hook for tracking A/B test conversions
export function useABTestConversion() {
  const { trackEvent } = useAnalytics()

  const trackConversion = (testName: string, conversionType: string = 'conversion') => {
    const testData = localStorage.getItem(`ab_test_${testName}`)
    if (testData) {
      const { variant }: ABTestResult = JSON.parse(testData)

      trackEvent('experiment', 'ab_test_conversion', `${testName}_${variant}_${conversionType}`)

      // Store conversion data
      const conversions = JSON.parse(localStorage.getItem('ab_conversions') || '[]')
      conversions.push({
        testName,
        variant,
        conversionType,
        timestamp: Date.now(),
      })
      localStorage.setItem('ab_conversions', JSON.stringify(conversions))
    }
  }

  return { trackConversion }
}

// Predefined A/B test components
export function HeadlineABTest() {
  const headlines = [
    {
      name: 'original',
      weight: 50,
      component: (
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            ИИ уже меняет бизнес.
          </span>
          <br />
          <span className="text-white">Ваш — следующий.</span>
        </h1>
      ),
    },
    {
      name: 'benefit_focused',
      weight: 50,
      component: (
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Увеличьте прибыль на 25%
          </span>
          <br />
          <span className="text-white">с помощью ИИ за 6-8 недель</span>
        </h1>
      ),
    },
  ]

  return <ABTest testName="hero_headline" variants={headlines} />
}

export function CTATextABTest({ section }: { section: string }) {
  const ctaVariants = [
    {
      name: 'audit',
      weight: 40,
      component: 'Получить бесплатный аудит',
    },
    {
      name: 'consultation',
      weight: 30,
      component: 'Получить консультацию эксперта',
    },
    {
      name: 'strategy',
      weight: 30,
      component: 'Получить стратегию внедрения ИИ',
    },
  ]

  return <ABTest testName={`cta_text_${section}`} variants={ctaVariants} />
}

export function PricingABTest() {
  const pricingVariants = [
    {
      name: 'standard',
      weight: 50,
      component: (
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">180 000 ₽</div>
          <div className="text-lg text-gray-600">Полная стоимость</div>
        </div>
      ),
    },
    {
      name: 'monthly',
      weight: 50,
      component: (
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">15 000 ₽/мес</div>
          <div className="text-lg text-gray-600">12 месяцев</div>
          <div className="text-sm text-gray-500">Общая стоимость: 180 000 ₽</div>
        </div>
      ),
    },
  ]

  return <ABTest testName="pricing_display" variants={pricingVariants} />
}
