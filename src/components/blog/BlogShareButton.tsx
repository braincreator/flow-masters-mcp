'use client'

import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Facebook, Twitter, Mail, Link2, Copy, Share2, X, MessageCircle } from 'lucide-react'
import { shareContent, type SharingPlatform } from '@/utilities/share'
import { cn } from '@/utilities/ui'

// Локализованные тексты
const LOCALIZED_TEXTS = {
  en: {
    share: 'Share',
    copyLink: 'Copy link',
    linkCopied: 'Link copied to clipboard',
    close: 'Close',
    shareDescription: (postTitle: string) => `Check out this article: ${postTitle}`,
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
    shareDescription: (postTitle: string) => `Прочитайте эту статью: ${postTitle}`,
    facebook: 'Поделиться в Facebook',
    twitter: 'Поделиться в Twitter',
    email: 'Отправить по Email',
    whatsapp: 'Поделиться в WhatsApp',
  },
}

interface BlogShareButtonProps {
  postUrl: string
  postTitle: string
  locale: string
  className?: string
  successMessage?: string
}

export function BlogShareButton({
  postUrl,
  postTitle,
  locale,
  className,
  successMessage,
}: BlogShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Определяем локализованные тексты
  const texts = LOCALIZED_TEXTS[locale] || LOCALIZED_TEXTS.en

  // Подготавливаем описание для шаринга
  const shareDescription = texts.shareDescription(postTitle)

  const handleShare = async (platform: SharingPlatform) => {
    const shareData = {
      url: postUrl,
      title: postTitle,
      description: shareDescription,
      image: '', // Можно добавить изображение для шаринга
    }

    const success = await shareContent(platform, shareData)

    if (platform === 'copy' && success) {
      toast.success(successMessage || texts.linkCopied)
    }

    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn('gap-2 w-full justify-start', className)}>
          <Share2 className="h-4 w-4" />
          <span>{texts.share}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" onClick={(e) => e.stopPropagation()}>
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

          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => handleShare('facebook')}
              aria-label={texts.facebook}
              title={texts.facebook}
            >
              <Facebook className="h-5 w-5 text-blue-600" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => handleShare('twitter')}
              aria-label={texts.twitter}
              title={texts.twitter}
            >
              <Twitter className="h-5 w-5 text-sky-500" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => handleShare('email')}
              aria-label={texts.email}
              title={texts.email}
            >
              <Mail className="h-5 w-5 text-red-500" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => handleShare('whatsapp')}
              aria-label={texts.whatsapp}
              title={texts.whatsapp}
            >
              <MessageCircle className="h-5 w-5 text-green-500" />
            </Button>
          </div>

          <Button
            variant="secondary"
            className="mt-2 w-full"
            onClick={() => handleShare('copy')}
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
