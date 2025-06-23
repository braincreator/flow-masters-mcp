'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
declare global {
  interface Window {
    ym?: (counterId: number, action: string, url?: string, options?: any) => void
  }
}

interface YandexMetrikaTrackerProps {
  counterId: string
}

export function YandexMetrikaTracker({ counterId }: YandexMetrikaTrackerProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!counterId || typeof window === 'undefined' || !window.ym) {
      return
    }

    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    
    // Отправляем информацию о просмотре страницы при SPA-переходах
    window.ym(parseInt(counterId), 'hit', url)
    
    logDebug('Yandex Metrika: SPA page view tracked:', url)
  }, [pathname, searchParams, counterId])

  return null
}
