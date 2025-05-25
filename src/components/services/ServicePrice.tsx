'use client'
import React, { useEffect, useState } from 'react'
import { formatPrice } from '@/utilities/formatPrice'

type ServicePriceProps = {
  price: number
  locale: string
  className?: string
}

export default function ServicePrice({ price, locale, className = '' }: ServicePriceProps) {
  const [localizedPrice, setLocalizedPrice] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      if (price <= 0) {
        setLocalizedPrice(locale === 'ru' ? 'Бесплатно' : 'Free')
        setIsLoaded(true)
        return
      }

      setLocalizedPrice(formatPrice(price, locale))
    } catch (error) {
      console.error('Error formatting price:', error)
      setLocalizedPrice(formatPrice(price, locale))
    } finally {
      setIsLoaded(true)
    }
  }, [price, locale])

  if (!isLoaded) {
    return (
      <span
        className={`inline-block w-16 h-5 bg-primary/10 animate-pulse rounded ${className}`}
      ></span>
    )
  }

  if (price <= 0) {
    return <span className={className}>Бесплатно</span>
  }

  return <span className={className}>{localizedPrice}</span>
}
