'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/utilities/ui'
import { shareContent, type SharingPlatform } from '@/utilities/share'
import { toast } from 'sonner'

// Lucide icons
import { Copy, Check, Share2, X, Mail, MessageCircle, Send } from 'lucide-react'

// React icons
import {
  SiFacebook,
  SiX,
  SiVk,
  SiInstagram,
  SiThreads,
  SiPinterest,
  SiTelegram,
  SiWhatsapp,
  SiLinkedin,
} from 'react-icons/si'

// Custom icons
import { TenChatIcon } from '@/components/icons/TenChatIcon'

// Локализованные тексты
const LOCALIZED_TEXTS = {
  en: {
    share: 'Share',
    copyLink: 'Copy link',
    linkCopied: 'Link copied!',
    close: 'Close',
    shareOn: (platform: string) => `Share on ${platform}`,
    shareVia: (platform: string) => `Share via ${platform}`,
  },
  ru: {
    share: 'Поделиться',
    copyLink: 'Копировать ссылку',
    linkCopied: 'Ссылка скопирована!',
    close: 'Закрыть',
    shareOn: (platform: string) => `Поделиться в ${platform}`,
    shareVia: (platform: string) => `Отправить через ${platform}`,
  },
}

// Конфигурация иконок и цветов для платформ
const PLATFORM_CONFIG: Record<
  SharingPlatform,
  {
    icon: React.ReactNode
    label: string
    color?: string
  }
> = {
  facebook: {
    icon: <SiFacebook />,
    label: 'Facebook',
    color: 'text-blue-600',
  },
  x: {
    icon: <SiX />,
    label: 'X',
    color: 'text-black dark:text-white',
  },
  linkedin: {
    icon: <SiLinkedin />,
    label: 'LinkedIn',
    color: 'text-blue-700',
  },
  pinterest: {
    icon: <SiPinterest />,
    label: 'Pinterest',
    color: 'text-red-600',
  },
  vk: {
    icon: <SiVk />,
    label: 'VK',
    color: 'text-blue-500',
  },
  instagram: {
    icon: <SiInstagram />,
    label: 'Instagram',
    color: 'text-pink-600',
  },
  threads: {
    icon: <SiThreads />,
    label: 'Threads',
    color: 'text-gray-800 dark:text-gray-200',
  },
  tenchat: {
    icon: <TenChatIcon />,
    label: 'TenChat',
    color: 'text-blue-500',
  },
  whatsapp: {
    icon: <SiWhatsapp />,
    label: 'WhatsApp',
    color: 'text-green-500',
  },
  telegram: {
    icon: <SiTelegram />,
    label: 'Telegram',
    color: 'text-blue-400',
  },
  email: {
    icon: <Mail />,
    label: 'Email',
    color: 'text-red-500',
  },
  copy: {
    icon: <Copy />,
    label: 'Copy',
    color: 'text-gray-500',
  },
}

export interface SocialShareButtonsProps {
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

  // Колбэки
  onShare?: (platform: SharingPlatform) => void
  onCopy?: () => void
}

export function SocialShareButtons({
  // Основные параметры
  url,
  title,
  description = '',
  image = '',

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
  displayMode = 'inline',

  // Количество иконок в ряду для режима grid
  gridColumns = 4,

  // Платформы для шаринга
  platforms = ['facebook', 'x', 'linkedin', 'vk', 'telegram', 'whatsapp', 'email', 'copy'],

  // Локализация
  locale = 'en',

  // Аналитика
  trackShares = false,
  trackingId,

  // Колбэки
  onShare,
  onCopy,
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Получаем локализованные тексты
  const texts = LOCALIZED_TEXTS[locale as keyof typeof LOCALIZED_TEXTS] || LOCALIZED_TEXTS.en

  // Ensure URL is absolute
  const fullUrl = url.startsWith('http')
    ? url
    : `${typeof window !== 'undefined' ? window.location.origin : ''}${url}`

  // Функция для отслеживания шаринга (аналитика)
  const trackShare = async (platform: SharingPlatform) => {
    if (!trackShares) return

    // Здесь можно добавить код для отправки аналитики
    console.log(`Shared on ${platform}`, { trackingId, url: fullUrl, title })

    // Пример отправки аналитики через API
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
        console.error('Failed to track share:', error)
      }
    }
  }

  // Обработчик шаринга
  const handleShare = async (platform: SharingPlatform) => {
    // Отслеживаем шаринг
    trackShare(platform)

    // Вызываем пользовательский колбэк
    onShare?.(platform)

    // Если это копирование ссылки
    if (platform === 'copy') {
      const success = await shareContent(platform, { url: fullUrl, title, description, image })

      if (success) {
        setCopied(true)
        toast.success(texts.linkCopied)
        onCopy?.()
        setTimeout(() => setCopied(false), 2000)
      }

      if (displayMode === 'dropdown') {
        setIsOpen(false)
      }

      return
    }

    // Для остальных платформ используем общую функцию shareContent
    await shareContent(platform, {
      url: fullUrl,
      title,
      description,
      image,
    })

    // Закрываем дропдаун после шаринга
    if (displayMode === 'dropdown') {
      setIsOpen(false)
    }
  }

  // Native share API (mobile devices)
  const nativeShare = () => {
    if (navigator?.share) {
      navigator
        .share({
          title,
          text: description,
          url: fullUrl,
        })
        .then(() => {
          trackShare('x') // Используем x как дефолтную платформу для нативного шаринга
          onShare?.('x')
        })
        .catch(console.error)
    }
  }

  // Рендер кнопки для конкретной платформы
  const renderButton = (platform: SharingPlatform) => {
    const config = PLATFORM_CONFIG[platform]

    if (!config) {
      console.warn(`Missing config for platform: ${platform}`)
      return null
    }

    // Специальная обработка для кнопки копирования
    const isCopy = platform === 'copy'
    const icon = isCopy && copied ? <Check /> : config.icon
    const label = isCopy && copied ? texts.linkCopied : config.label

    return (
      <Tooltip key={platform}>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={() => handleShare(platform)}
            aria-label={isCopy ? texts.copyLink : texts.shareOn(config.label)}
            className={cn(buttonClassName)}
          >
            <span className={cn('flex items-center justify-center', iconClassName)}>
              {React.cloneElement(icon as React.ReactElement, {
                className: cn(
                  'h-4 w-4',
                  config.color && !config.color.startsWith('#') ? config.color : '',
                ),
                style: {
                  fill: config.color?.startsWith('#') ? config.color : undefined,
                },
              })}
            </span>
            {showLabels && !iconOnly && <span className="ml-2">{label}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isCopy ? (copied ? texts.linkCopied : texts.copyLink) : texts.shareOn(config.label)}
          </p>
        </TooltipContent>
      </Tooltip>
    )
  }

  // Рендер кнопок в режиме inline
  const renderInlineButtons = () => (
    <TooltipProvider>
      <div className={cn('flex flex-wrap gap-2', className)}>
        {/* Native Share button for mobile devices */}
        {navigator?.share && (
          <Button variant={variant} size={size} onClick={nativeShare} aria-label={texts.share}>
            <Share2 className="h-4 w-4 mr-2" />
            {texts.share}
          </Button>
        )}

        {/* Individual platform buttons */}
        {!navigator?.share &&
          platforms.map((platform) => renderButton(platform as SharingPlatform))}
      </div>
    </TooltipProvider>
  )

  // Рендер кнопок в режиме dropdown
  const renderDropdown = () => (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(buttonClassName)}
          aria-label={texts.share}
        >
          <Share2 className="h-4 w-4" />
          {showLabels && !iconOnly && <span className="ml-2">{texts.share}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">{texts.share}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
              aria-label={texts.close}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className={`grid grid-cols-${gridColumns} gap-2`}>
            {platforms
              .filter((p) => p !== 'copy')
              .map((platform) => {
                const config = PLATFORM_CONFIG[platform as SharingPlatform]
                if (!config) return null

                return (
                  <Button
                    key={platform}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 flex items-center justify-center"
                    onClick={() => handleShare(platform as SharingPlatform)}
                    aria-label={texts.shareOn(config.label)}
                    title={texts.shareOn(config.label)}
                  >
                    {React.cloneElement(config.icon as React.ReactElement, {
                      className: cn(
                        'h-5 w-5',
                        config.color && !config.color.startsWith('#') ? config.color : '',
                      ),
                      style: {
                        fill: config.color?.startsWith('#') ? config.color : undefined,
                      },
                    })}
                  </Button>
                )
              })}
          </div>

          {platforms.includes('copy') && (
            <Button
              variant="secondary"
              className="mt-2 w-full"
              onClick={() => handleShare('copy')}
              aria-label={texts.copyLink}
              title={texts.copyLink}
            >
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? texts.linkCopied : texts.copyLink}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )

  // Рендер кнопок в режиме grid
  const renderGrid = () => (
    <TooltipProvider>
      <div className={cn(`grid grid-cols-${gridColumns} gap-2`, className)}>
        {platforms.map((platform) => renderButton(platform as SharingPlatform))}
      </div>
    </TooltipProvider>
  )

  // Выбор режима отображения
  switch (displayMode) {
    case 'dropdown':
      return renderDropdown()
    case 'grid':
      return renderGrid()
    case 'inline':
    default:
      return renderInlineButtons()
  }
}

export default SocialShareButtons
