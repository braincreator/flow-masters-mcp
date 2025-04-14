'use client'

import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Facebook,
  Mail,
  Link2,
  Copy,
  Share2,
  X as XIcon,
  MessageCircle,
  Send,
  Vk,
  Instagram,
  AtSign,
  Briefcase,
  X as CloseIcon,
} from 'lucide-react'
import { SiFacebook, SiX, SiVk, SiInstagram, SiThreads, SiPinterest } from 'react-icons/si'
import { TenChatIcon } from '@/components/icons/TenChatIcon'
import { shareContent, type SharingPlatform } from '@/utilities/share'
import { useTranslations } from '@/hooks/useTranslations'
import { cn } from '@/utilities/ui'

// Define localized texts for each supported locale
const LOCALIZED_TEXTS = {
  en: {
    share: 'Share',
    copyLink: 'Copy link',
    linkCopied: 'Link copied to clipboard',
    close: 'Close',
    shareDescription: (productName: string) => `Check out this product: ${productName}`,
    linkCopiedWithProduct: (productName: string) => `Link to ${productName} copied!`,
    facebook: 'Share on Facebook',
    x: 'Share on X',
    email: 'Share via Email',
    whatsapp: 'Share on WhatsApp',
    vk: 'Share on VK',
    instagram: 'Share on Instagram',
    threads: 'Share on Threads',
    tenchat: 'Share on TenChat',
  },
  ru: {
    share: 'Поделиться',
    copyLink: 'Копировать ссылку',
    linkCopied: 'Ссылка скопирована',
    close: 'Закрыть',
    shareDescription: (productName: string) => `Посмотрите этот товар: ${productName}`,
    linkCopiedWithProduct: (productName: string) => `Ссылка на ${productName} скопирована!`,
    facebook: 'Поделиться в Facebook',
    x: 'Поделиться в X',
    email: 'Отправить по Email',
    whatsapp: 'Поделиться в WhatsApp',
    vk: 'Поделиться в VK',
    instagram: 'Поделиться в Instagram',
    threads: 'Поделиться в Threads',
    tenchat: 'Поделиться в TenChat',
  },
  // Add other languages here following the same pattern
}

interface SocialSharePopoverProps {
  url: string
  title: string
  description?: string
  image?: string
  lang?: string
  triggerClassName?: string
  contentClassName?: string
  onLinkCopied?: () => void
  platforms?: SharingPlatform[]
}

export function SocialSharePopover({
  url,
  title,
  description = '',
  image = '',
  lang = 'en',
  triggerClassName = '',
  contentClassName = '',
  onLinkCopied,
  platforms = [
    'facebook',
    'x',
    'email',
    'whatsapp',
    'vk',
    'instagram',
    'threads',
    'tenchat',
    'copy',
  ],
}: SocialSharePopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations(lang)

  // Get the appropriate localized texts, falling back to English if not supported
  const texts = LOCALIZED_TEXTS[lang] || LOCALIZED_TEXTS.en

  // Ensure we have a good description for sharing
  const shareDescription = description || texts.shareDescription(title)

  const handleShare = async (platform: SharingPlatform) => {
    // Log sharing attempt for debugging
    console.log('Sharing content:', { platform, url, title, description: shareDescription, image })

    // Подготавливаем данные для шаринга
    const shareData = {
      url,
      title,
      description: shareDescription,
      image,
    }

    // Если платформа Facebook, убедимся, что данные оптимизированы для нее
    if (platform === 'facebook') {
      // Для Facebook лучше всего работает OpenGraph, который уже должен быть на странице
      // Однако можно также добавить дополнительные параметры в shareContent
      console.log('Facebook sharing:', shareData)
    }

    const success = await shareContent(platform, shareData)

    if (platform === 'copy' && success) {
      toast.success(texts.linkCopied)

      // Call the onLinkCopied callback if provided
      if (onLinkCopied) {
        onLinkCopied()
      }
    }

    setIsOpen(false)
  }

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Map platforms to icons, labels, and colors
  const platformConfig: Partial<
    Record<SharingPlatform, { icon: React.ReactNode; label: string; color?: string }>
  > = {
    facebook: { icon: <SiFacebook />, label: texts.facebook, color: 'text-blue-600' },
    x: { icon: <SiX />, label: texts.x, color: 'text-black' },
    email: { icon: <Mail />, label: texts.email, color: 'text-red-500' },
    whatsapp: { icon: <MessageCircle />, label: texts.whatsapp, color: 'text-green-500' },
    vk: { icon: <SiVk />, label: texts.vk, color: 'text-blue-500' },
    instagram: { icon: <SiInstagram />, label: texts.instagram, color: 'text-pink-600' },
    threads: { icon: <SiThreads />, label: texts.threads, color: 'text-gray-800' },
    tenchat: { icon: <TenChatIcon />, label: texts.tenchat, color: '#272e43' },
    copy: { icon: <Copy className="h-4 w-4 mr-2" />, label: texts.copyLink },
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className={cn('p-0', triggerClassName)}
          aria-label={texts.share}
          title={texts.share}
          onClick={handleTriggerClick}
        >
          <Share2 className="h-5 w-5" />
          <span className="sr-only">{texts.share}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`w-auto p-2 ${contentClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">{texts.share}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
              aria-label={texts.close}
            >
              <CloseIcon className="h-4 w-4" />
            </Button>
          </div>

          <div
            className={cn(
              'grid gap-2',
              platforms.filter((p) => p !== 'copy').length <= 4
                ? 'grid-cols-4'
                : platforms.filter((p) => p !== 'copy').length <= 8
                  ? 'grid-cols-4'
                  : 'grid-cols-5',
            )}
          >
            {platforms
              .filter((p) => p !== 'copy')
              .map((platform) => {
                const config = platformConfig[platform]
                if (!config) {
                  console.warn(`Missing config for platform: ${platform}`)
                  return null
                }

                return (
                  <Button
                    key={platform}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare(platform)
                    }}
                    aria-label={config.label}
                    title={config.label}
                    style={
                      platform === 'tenchat'
                        ? {
                            /* Add inline styles if needed */
                          }
                        : {}
                    }
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
              onClick={(e) => {
                e.stopPropagation()
                handleShare('copy')
              }}
              aria-label={texts.copyLink}
              title={texts.copyLink}
            >
              {platformConfig.copy?.icon}
              {texts.copyLink}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
