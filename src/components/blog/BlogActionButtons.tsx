'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Share, MessageCircle, ArrowUp, Share2, X, Send, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utilities/ui'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { SiFacebook, SiX, SiVk, SiInstagram, SiThreads, SiPinterest } from 'react-icons/si'
import { TenChatIcon } from '@/components/icons/TenChatIcon'
import { shareContent, type SharingPlatform } from '@/utilities/share'

// Локализованные тексты
const LOCALIZED_TEXTS = {
  en: {
    share: 'Share',
    copyLink: 'Copy link',
    linkCopied: 'Link copied!',
    comment: 'Comment',
    backToTop: 'Back to top',
    close: 'Close',
    shareOn: (platform: string) => `Share on ${platform}`,
    shareVia: (platform: string) => `Share via ${platform}`,
  },
  ru: {
    share: 'Поделиться',
    copyLink: 'Копировать ссылку',
    linkCopied: 'Ссылка скопирована!',
    comment: 'Комментировать',
    backToTop: 'Наверх',
    close: 'Закрыть',
    shareOn: (platform: string) => `Поделиться в ${platform}`,
    shareVia: (platform: string) => `Отправить через ${platform}`,
  },
}

interface BlogActionButtonsProps {
  postId: string
  postSlug: string
  locale: string
  className?: string
}

export function BlogActionButtons({ postId, postSlug, locale, className }: BlogActionButtonsProps) {
  const router = useRouter()
  const [isShareOpen, setIsShareOpen] = useState(false)

  // Получаем тексты для локализации
  const texts = LOCALIZED_TEXTS[locale] || LOCALIZED_TEXTS.en

  const handleCopyLink = () => {
    // Получаем URL текущей страницы
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      // Показываем уведомление
      toast.success(texts.linkCopied)
    })
    setIsShareOpen(false)
  }

  const handleShare = async (platform: SharingPlatform) => {
    const url = window.location.href
    const title = document.title

    // Подготавливаем данные для шаринга
    const shareData = {
      url,
      title,
      description: title,
      image: '', // Можно добавить изображение для шаринга, например, изображение поста
    }

    // Если Web Share API доступен и платформа не указана, используем его
    if (!platform && navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        })
        toast.success(locale === 'ru' ? 'Спасибо за шеринг!' : 'Thanks for sharing!')
        return
      } catch (error) {
        // Пользователь отменил шеринг
        console.log('Share cancelled')
      }
    }

    // Используем shareContent для конкретных платформ
    if (platform) {
      await shareContent(platform, shareData)

      if (platform === 'copy') {
        toast.success(texts.linkCopied)
      }

      setIsShareOpen(false)
    }
  }

  const handleComment = () => {
    // Скроллим к секции комментариев
    const commentsSection = document.getElementById('comments-list')
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Если элемент с id comments-list не найден, пробуем использовать элемент с id comments
      const comments = document.getElementById('comments')
      if (comments) {
        comments.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={cn('flex flex-col space-y-1', className)}>
      <Popover open={isShareOpen} onOpenChange={setIsShareOpen}>
        <PopoverTrigger asChild>
          <button className="action-button" aria-label={texts.share}>
            <Share2 size={18} />
            <span>{texts.share}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">{texts.share}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsShareOpen(false)}
                aria-label={texts.close}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {/* Facebook */}
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => handleShare('facebook')}
                aria-label={texts.shareOn('Facebook')}
                title={texts.shareOn('Facebook')}
              >
                <SiFacebook className="h-5 w-5 text-blue-600" />
              </Button>

              {/* X (Twitter) */}
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => handleShare('x')}
                aria-label={texts.shareOn('X')}
                title={texts.shareOn('X')}
              >
                <SiX className="h-5 w-5" />
              </Button>

              {/* VK */}
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => handleShare('vk')}
                aria-label={texts.shareOn('VK')}
                title={texts.shareOn('VK')}
              >
                <SiVk className="h-5 w-5 text-blue-500" />
              </Button>

              {/* Telegram */}
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => handleShare('telegram')}
                aria-label={texts.shareOn('Telegram')}
                title={texts.shareOn('Telegram')}
              >
                <Send className="h-5 w-5 text-blue-400" />
              </Button>

              {/* WhatsApp */}
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => handleShare('whatsapp')}
                aria-label={texts.shareOn('WhatsApp')}
                title={texts.shareOn('WhatsApp')}
              >
                <MessageCircle className="h-5 w-5 text-green-500" />
              </Button>

              {/* Email */}
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => handleShare('email')}
                aria-label={texts.shareVia('Email')}
                title={texts.shareVia('Email')}
              >
                <Mail className="h-5 w-5 text-red-500" />
              </Button>

              {/* Instagram */}
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => handleShare('instagram')}
                aria-label={texts.shareOn('Instagram')}
                title={texts.shareOn('Instagram')}
              >
                <SiInstagram className="h-5 w-5 text-pink-600" />
              </Button>

              {/* Threads */}
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => handleShare('threads')}
                aria-label={texts.shareOn('Threads')}
                title={texts.shareOn('Threads')}
              >
                <SiThreads className="h-5 w-5" />
              </Button>
            </div>

            <Button
              variant="secondary"
              className="mt-2 w-full"
              onClick={handleCopyLink}
              aria-label={texts.copyLink}
              title={texts.copyLink}
            >
              <Copy className="h-4 w-4 mr-2" />
              {texts.copyLink}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <button onClick={handleComment} className="action-button" aria-label={texts.comment}>
        <MessageCircle size={18} />
        <span>{texts.comment}</span>
      </button>

      <button onClick={handleScrollToTop} className="action-button" aria-label={texts.backToTop}>
        <ArrowUp size={18} />
        <span>{texts.backToTop}</span>
      </button>
    </div>
  )
}
