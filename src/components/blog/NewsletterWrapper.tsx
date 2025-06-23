'use client'

import React, { useState, useEffect } from 'react'
import { Newsletter } from '@/components/Newsletter'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface NewsletterWrapperProps {
  locale: string
  storageKey: string
  className?: string
}

/**
 * Компонент-обертка для блока рассылки, который проверяет статус подписки
 * и скрывает весь блок, если пользователь уже подписан
 */
export const NewsletterWrapper: React.FC<NewsletterWrapperProps> = ({
  locale,
  storageKey,
  className,
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Проверяем статус подписки при монтировании компонента
  useEffect(() => {
    setIsClient(true)
    const subscriptionStatus = localStorage.getItem(storageKey)

    if (subscriptionStatus) {
      try {
        const data = JSON.parse(subscriptionStatus)
        if (data.subscribed) {
          setIsSubscribed(true)
        }
      } catch (e) {
        logError('Error parsing subscription status:', e)
        localStorage.removeItem(storageKey)
      }
    }
  }, [storageKey])

  // Если пользователь уже подписан или мы на сервере, не рендерим блок
  if (!isClient || isSubscribed) {
    return null
  }

  // Рендерим блок рассылки только если пользователь не подписан
  return (
    <div
      className={`rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-secondary/5 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:from-primary/10 hover:to-secondary/10 ${className || ''}`}
    >
      <Newsletter
        title={locale === 'ru' ? 'Подпишитесь на рассылку' : 'Subscribe to our newsletter'}
        description={
          locale === 'ru'
            ? 'Получайте наши новости и статьи на почту'
            : 'Stay updated with our latest news and articles'
        }
        buttonText={locale === 'ru' ? 'Подписаться' : 'Subscribe'}
        placeholderText={locale === 'ru' ? 'Ваш email' : 'Enter your email'}
        storageKey={storageKey}
      />
    </div>
  )
}

export default NewsletterWrapper
