'use client'
import React, { useEffect, useState } from 'react'
import { formatPrice, convertPrice, getLocaleCurrency } from '@/utilities/formatPrice'

type ServicePriceProps = {
  price: number
  locale: string
  className?: string
}

export default function ServicePrice({ price, locale, className = '' }: ServicePriceProps) {
  const [localizedPrice, setLocalizedPrice] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const fetchLocalizedPrice = async () => {
      try {
        if (price <= 0) {
          setLocalizedPrice('Бесплатно')
          setIsLoaded(true)
          return
        }

        await getLocaleCurrency(locale)
        const sourceLocaleForPrice = 'en'
        const priceInTargetCurrency = convertPrice(price, sourceLocaleForPrice, locale)
        setLocalizedPrice(formatPrice(priceInTargetCurrency, locale))
      } catch (error) {
        console.error('Error formatting price:', error)
        setLocalizedPrice(formatPrice(price, locale))
      } finally {
        setIsLoaded(true)
      }
    }

    fetchLocalizedPrice()
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
