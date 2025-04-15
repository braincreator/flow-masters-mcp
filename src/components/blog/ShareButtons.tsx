import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from '@/components/ui/tooltip'
import { cn } from '@/utilities/ui'
import { Facebook, Twitter, Linkedin, Link2, Share2, MessageCircle, Mail, Send } from 'lucide-react'
import { SiFacebook, SiX, SiVk, SiInstagram, SiThreads, SiPinterest } from 'react-icons/si'
import { TenChatIcon } from '@/components/icons/TenChatIcon'
import { shareContent, type SharingPlatform } from '@/utilities/share'

export interface ShareButtonsProps {
  url: string
  title: string
  description?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  iconOnly?: boolean
  platforms?: SharingPlatform[]
  trackShares?: boolean
  postId?: string
  locale?: string
}

export function ShareButtons({
  url,
  title,
  description = '',
  className,
  variant = 'outline',
  size = 'default',
  iconOnly = false,
  platforms = ['x', 'facebook', 'linkedin', 'vk', 'telegram', 'whatsapp', 'copy'],
  trackShares = false,
  postId,
  locale = 'en',
}: ShareButtonsProps) {
  const [copied, setCopied] = React.useState(false)

  // Ensure URL is absolute
  const fullUrl = url.startsWith('http') ? url : `${window?.location.origin || ''}${url}`

  // Track shares
  const trackShare = async (platform: string) => {
    if (!trackShares || !postId) return

    try {
      await fetch('/api/v1/blog/share', {
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
      console.error('Failed to track share:', error)
    }
  }

  // Обработчик шаринга для всех платформ
  const handleShare = async (platform: SharingPlatform) => {
    // Отслеживаем шаринг
    trackShare(platform)

    // Используем общую функцию shareContent для всех платформ
    await shareContent(platform, {
      url: fullUrl,
      title,
      description,
    })
  }

  // Native share API (mobile devices)
  const nativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title,
          text: description,
          url: fullUrl,
        })
        .then(() => trackShare('native'))
        .catch(console.error)
    }
  }

  // Локализованные тексты
  const texts = {
    share: locale === 'ru' ? 'Поделиться' : 'Share',
    copyLink: locale === 'ru' ? 'Копировать ссылку' : 'Copy link',
    copied: locale === 'ru' ? 'Скопировано!' : 'Copied!',
    shareOn: (platform: string) =>
      locale === 'ru' ? `Поделиться в ${platform}` : `Share on ${platform}`,
  }

  // Конфигурация кнопок для всех поддерживаемых платформ
  const buttonsConfig: Record<
    SharingPlatform,
    { label: string; icon: React.ReactNode; onClick: () => void }
  > = {
    x: {
      label: 'X',
      icon: <SiX className="h-4 w-4" />,
      onClick: () => handleShare('x'),
    },
    facebook: {
      label: 'Facebook',
      icon: <SiFacebook className="h-4 w-4" />,
      onClick: () => handleShare('facebook'),
    },
    linkedin: {
      label: 'LinkedIn',
      icon: <Linkedin className="h-4 w-4" />,
      onClick: () => handleShare('linkedin'),
    },
    pinterest: {
      label: 'Pinterest',
      icon: <SiPinterest className="h-4 w-4" />,
      onClick: () => handleShare('pinterest'),
    },
    vk: {
      label: 'VK',
      icon: <SiVk className="h-4 w-4" />,
      onClick: () => handleShare('vk'),
    },
    instagram: {
      label: 'Instagram',
      icon: <SiInstagram className="h-4 w-4" />,
      onClick: () => handleShare('instagram'),
    },
    threads: {
      label: 'Threads',
      icon: <SiThreads className="h-4 w-4" />,
      onClick: () => handleShare('threads'),
    },
    tenchat: {
      label: 'TenChat',
      icon: <TenChatIcon className="h-4 w-4" />,
      onClick: () => handleShare('tenchat'),
    },
    whatsapp: {
      label: 'WhatsApp',
      icon: <MessageCircle className="h-4 w-4" />,
      onClick: () => handleShare('whatsapp'),
    },
    telegram: {
      label: 'Telegram',
      icon: <Send className="h-4 w-4" />,
      onClick: () => handleShare('telegram'),
    },
    email: {
      label: 'Email',
      icon: <Mail className="h-4 w-4" />,
      onClick: () => handleShare('email'),
    },
    copy: {
      label: copied ? texts.copied : texts.copyLink,
      icon: <Link2 className="h-4 w-4" />,
      onClick: () => {
        handleShare('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      },
    },
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {/* Native Share button for mobile devices */}
      {navigator?.share && (
        <Button variant={variant} size={size} onClick={nativeShare} aria-label={texts.share}>
          <Share2 className="h-4 w-4 mr-2" />
          {texts.share}
        </Button>
      )}

      {/* Individual platform buttons */}
      {!navigator?.share && (
        <TooltipProvider>
          {platforms.map((platform) => {
            // Проверяем, что платформа существует в конфигурации
            const config = buttonsConfig[platform as SharingPlatform]
            if (!config) return null

            return (
              <Tooltip key={platform}>
                <TooltipTrigger asChild>
                  <Button
                    variant={variant}
                    size={size}
                    onClick={config.onClick}
                    aria-label={texts.shareOn(config.label)}
                  >
                    {config.icon}
                    {!iconOnly && <span className="ml-2">{config.label}</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent>
                    <p>
                      {platform === 'copy'
                        ? copied
                          ? texts.copied
                          : texts.copyLink
                        : texts.shareOn(config.label)}
                    </p>
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      )}
    </div>
  )
}
