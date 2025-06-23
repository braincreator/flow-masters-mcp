'use client'
import React, { useEffect, useState } from 'react'
import { formatPrice, formatItemPrice, getLocalePrice } from '@/utilities/formatPrice'
import { Service } from '@/payload-types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
type ServicePriceProps = {
  service: Service
  locale: string
  className?: string
}

export default function ServicePrice({ service, locale, className = '' }: ServicePriceProps) {
  const [localizedPrice, setLocalizedPrice] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const price = getLocalePrice(service, locale)

      if (price <= 0) {
        setLocalizedPrice(locale === 'ru' ? 'Бесплатно' : 'Free')
        setIsLoaded(true)
        return
      }

      // Use formatItemPrice to respect isStartingFrom parameter
      setLocalizedPrice(formatItemPrice(service, locale))
    } catch (error) {
      logError('Error formatting price:', error)
      // Fallback to basic price formatting
      const fallbackPrice = getLocalePrice(service, locale)
      setLocalizedPrice(formatPrice(fallbackPrice, locale))
    } finally {
      setIsLoaded(true)
    }
  }, [service, locale])

  if (!isLoaded) {
    return (
      <span
        className={`inline-block w-16 h-5 bg-primary/10 animate-pulse rounded ${className}`}
      ></span>
    )
  }

  const price = getLocalePrice(service, locale)
  if (price <= 0) {
    return <span className={className}>{locale === 'ru' ? 'Бесплатно' : 'Free'}</span>
  }

  return <span className={className}>{localizedPrice}</span>
}
