'use client'

import React, { useState, useEffect } from 'react'
import { formatPrice, formatItemPrice, getLocalePrice } from '@/utilities/formatPrice'
import { Locale } from '@/constants'
import { Service } from '@/payload-types'

interface ServicePriceProps {
  service: Service
  locale: Locale
  className?: string
  showPrefix?: boolean
}

export default function ServicePrice({
  service,
  locale,
  className = '',
  showPrefix = true,
}: ServicePriceProps) {
  const [formattedPrice, setFormattedPrice] = useState<string>('')

  useEffect(() => {
    // Используем новую функцию форматирования с поддержкой префикса "от"
    setFormattedPrice(formatItemPrice(service, locale))
  }, [service, locale])

  return <div className={className}>{formattedPrice}</div>
}
