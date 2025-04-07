'use client'

import { useState, useEffect } from 'react'

export function useNewsletterSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    // Проверяем статус подписки в localStorage только на клиенте
    if (typeof window !== 'undefined') {
      const subscriptionStatus = localStorage.getItem('newsletter_subscribed')
      setIsSubscribed(subscriptionStatus === 'true')
    }
  }, [])

  // Функция для сохранения статуса подписки
  const setSubscribed = (value: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('newsletter_subscribed', value ? 'true' : 'false')
      setIsSubscribed(value)
    }
  }

  return { isSubscribed, setSubscribed }
}
