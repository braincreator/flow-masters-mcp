'use client'

import React, { useState, useEffect } from 'react'
import { Newsletter } from '@/components/Newsletter'

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
        console.error('Error parsing subscription status:', e)
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
    <div className={`rounded-xl border border-border p-6 shadow-sm bg-gradient-to-br from-card to-card/80 ${className || ''}`}>
      <Newsletter
        title={
          locale === 'ru' ? 'Подпишитесь на рассылку' : 'Subscribe to our newsletter'
        }
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
