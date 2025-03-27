'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Facebook, Twitter, Mail, Link2, Copy, Share2, X, MessageCircle } from 'lucide-react'
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
    twitter: 'Share on Twitter',
    email: 'Share via Email',
    whatsapp: 'Share on WhatsApp',
  },
  ru: {
    share: 'Поделиться',
    copyLink: 'Копировать ссылку',
    linkCopied: 'Ссылка скопирована',
    close: 'Закрыть',
    shareDescription: (productName: string) => `Посмотрите этот товар: ${productName}`,
    linkCopiedWithProduct: (productName: string) => `Ссылка на ${productName} скопирована!`,
    facebook: 'Поделиться в Facebook',
    twitter: 'Поделиться в Twitter',
    email: 'Отправить по Email',
    whatsapp: 'Поделиться в WhatsApp',
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
        className={`w-64 p-2 ${contentClassName}`}
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
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={(e) => {
                e.stopPropagation()
                handleShare('facebook')
              }}
              aria-label={texts.facebook}
              title={texts.facebook}
            >
              <Facebook className="h-5 w-5 text-blue-600" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={(e) => {
                e.stopPropagation()
                handleShare('twitter')
              }}
              aria-label={texts.twitter}
              title={texts.twitter}
            >
              <Twitter className="h-5 w-5 text-sky-500" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={(e) => {
                e.stopPropagation()
                handleShare('email')
              }}
              aria-label={texts.email}
              title={texts.email}
            >
              <Mail className="h-5 w-5 text-red-500" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={(e) => {
                e.stopPropagation()
                handleShare('whatsapp')
              }}
              aria-label={texts.whatsapp}
              title={texts.whatsapp}
            >
              <MessageCircle className="h-5 w-5 text-green-500" />
            </Button>
          </div>

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
            <Copy className="h-4 w-4 mr-2" />
            {texts.copyLink}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
