'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utilities/ui'
import { SocialShareButtons } from '@/components/shared/SocialShareButtons'
import type { SharingPlatform } from '@/utilities/share'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Локализованные тексты
const LOCALIZED_TEXTS = {
  en: {
    share: 'Share',
    copyLink: 'Copy link',
    linkCopied: 'Link copied!',
    shareDescription: (title: string) => `Check out this: ${title}`,
    linkCopiedWithTitle: (title: string) => `Link to ${title} copied!`,
  },
  ru: {
    share: 'Поделиться',
    copyLink: 'Копировать ссылку',
    linkCopied: 'Ссылка скопирована!',
    shareDescription: (title: string) => `Посмотрите это: ${title}`,
    linkCopiedWithTitle: (title: string) => `Ссылка на ${title} скопирована!`,
  },
}

export interface UniversalShareButtonProps {
  // Основные параметры
  url: string
  title: string
  description?: string
  image?: string

  // Настройки отображения
  className?: string
  buttonClassName?: string
  iconClassName?: string

  // Варианты отображения
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  iconOnly?: boolean
  showLabels?: boolean

  // Режим отображения
  displayMode?: 'inline' | 'dropdown' | 'grid'

  // Количество иконок в ряду для режима grid
  gridColumns?: 3 | 4 | 5

  // Платформы для шаринга
  platforms?: SharingPlatform[]

  // Локализация
  locale?: string

  // Аналитика
  trackShares?: boolean
  trackingId?: string
  postId?: string

  // Колбэки
  onShareComplete?: () => void
  showToastOnCopy?: boolean
  copyMessage?: string
}

export function UniversalShareButton({
  // Основные параметры
  url,
  title,
  description,
  image,

  // Настройки отображения
  className,
  buttonClassName,
  iconClassName,

  // Варианты отображения
  variant = 'outline',
  size = 'default',
  iconOnly = false,
  showLabels = true,

  // Режим отображения
  displayMode = 'dropdown',

  // Количество иконок в ряду для режима grid
  gridColumns = 4,

  // Платформы для шаринга
  platforms = ['facebook', 'x', 'linkedin', 'vk', 'telegram', 'whatsapp', 'email', 'copy'],

  // Локализация
  locale = 'en',

  // Аналитика
  trackShares = false,
  trackingId,
  postId,

  // Колбэки
  onShareComplete,
  showToastOnCopy = true,
  copyMessage,
}: UniversalShareButtonProps) {
  // Получаем локализованные тексты
  const texts = LOCALIZED_TEXTS[locale as keyof typeof LOCALIZED_TEXTS] || LOCALIZED_TEXTS.en

  // Ensure URL is absolute
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const fullUrl = url.startsWith('http') ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`

  // Determine the sharing description
  const sharingDescription = description || texts.shareDescription(title)

  // Функция для отслеживания шаринга (аналитика)
  const trackShare = async (platform: SharingPlatform) => {
    if (!trackShares) return

    // Если есть postId, отправляем аналитику для блога
    if (postId) {
      try {
        await fetch('/api/blog/share', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId,
            platform,
          }),
        })
      } catch (error) {
        logError('Failed to track blog share:', error)
      }
    }

    // Если есть trackingId, отправляем общую аналитику
    if (trackingId) {
      try {
        await fetch('/api/analytics/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackingId,
            platform,
            url: fullUrl,
            title,
          }),
        })
      } catch (error) {
        logError('Failed to track share:', error)
      }
    }
  }

  // Обработчик копирования ссылки
  const handleCopy = () => {
    if (showToastOnCopy) {
      toast.success(copyMessage || texts.linkCopiedWithTitle(title))
    }

    if (onShareComplete) {
      onShareComplete()
    }
  }

  // Обработчик шаринга
  const handleShare = (platform: SharingPlatform) => {
    // Отслеживаем шаринг
    trackShare(platform)

    // Если это копирование ссылки
    if (platform === 'copy') {
      handleCopy()
    }

    // Вызываем колбэк завершения шаринга
    if (onShareComplete && platform !== 'copy') {
      onShareComplete()
    }
  }

  return (
    <SocialShareButtons
      url={fullUrl}
      title={title}
      description={sharingDescription}
      image={image}
      className={className}
      buttonClassName={buttonClassName}
      iconClassName={iconClassName}
      variant={variant}
      size={size}
      iconOnly={iconOnly}
      showLabels={showLabels}
      displayMode={displayMode}
      gridColumns={gridColumns}
      platforms={platforms}
      locale={locale}
      trackShares={trackShares}
      trackingId={trackingId}
      onShare={handleShare}
      onCopy={handleCopy}
    />
  )
}

export default UniversalShareButton
