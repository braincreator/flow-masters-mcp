'use client'

import React, { useEffect } from 'react'

type CalendlyBookingProps = {
  username: string
  eventType: string
  hideEventTypeDetails?: boolean
  hideGdprBanner?: boolean
  prefill?: {
    name?: string
    email?: string
    customAnswers?: Record<string, string>
  }
  className?: string
  height?: number
  onEventScheduled?: () => void
}

export const CalendlyBooking: React.FC<CalendlyBookingProps> = ({
  username,
  eventType,
  hideEventTypeDetails = true,
  hideGdprBanner = true,
  prefill,
  className = '',
  height = 630,
  onEventScheduled,
}) => {
  useEffect(() => {
    // Загружаем скрипт Calendly
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)

    // Добавляем обработчик события бронирования
    const handleMessage = (e: MessageEvent) => {
      if (e.data.event && e.data.event.indexOf('calendly') === 0) {
        if (e.data.event === 'calendly.event_scheduled' && onEventScheduled) {
          onEventScheduled()
        }
      }
    }

    if (onEventScheduled) {
      window.addEventListener('message', handleMessage)
    }

    return () => {
      // Удаляем скрипт при размонтировании компонента
      const existingScript = document.querySelector(
        'script[src="https://assets.calendly.com/assets/external/widget.js"]',
      )
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript)
      }

      // Удаляем обработчик события
      if (onEventScheduled) {
        window.removeEventListener('message', handleMessage)
      }
    }
  }, [onEventScheduled])

  // Формируем URL для Calendly
  const calendlyUrl = `https://calendly.com/${username}/${eventType}`

  // Формируем параметры
  const params = new URLSearchParams()

  if (hideEventTypeDetails) {
    params.append('hide_event_type_details', '1')
  }

  if (hideGdprBanner) {
    params.append('hide_gdpr_banner', '1')
  }

  // Добавляем prefill параметры, если они есть
  if (prefill?.name) {
    params.append('name', prefill.name)
  }

  if (prefill?.email) {
    params.append('email', prefill.email)
  }

  if (prefill?.customAnswers) {
    Object.entries(prefill.customAnswers).forEach(([key, value]) => {
      params.append(`a1=${key}`, value)
    })
  }

  const fullUrl = `${calendlyUrl}?${params.toString()}`

  return (
    <div
      className={`calendly-inline-widget rounded-lg overflow-hidden shadow-md ${className}`}
      data-url={fullUrl}
      style={{ minWidth: '320px', height: `${height}px` }}
    />
  )
}

export default CalendlyBooking
