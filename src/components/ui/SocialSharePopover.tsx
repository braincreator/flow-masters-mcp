'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Facebook, Twitter, Mail, Link2, Copy, Share2, X, MessageCircle } from 'lucide-react'
import { shareContent, type SharingPlatform } from '@/utilities/share'
import { useTranslations } from '@/hooks/useTranslations'
import { cn } from '@/utilities/ui'

interface SocialSharePopoverProps {
  url: string
  title: string
  description?: string
  image?: string
  lang?: string
  triggerClassName?: string
  contentClassName?: string
}

export function SocialSharePopover({
  url,
  title,
  description = '',
  image = '',
  lang = 'en',
  triggerClassName = '',
  contentClassName = '',
}: SocialSharePopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations(lang)

  const handleShare = async (platform: SharingPlatform) => {
    const success = await shareContent(platform, { url, title, description, image })

    if (platform === 'copy' && success) {
      toast.success(t.sharing?.linkCopied || 'Link copied to clipboard')
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
          size="lg"
          className={cn('flex-none p-0 aspect-square', triggerClassName)}
          aria-label={t.sharing?.share || 'Share'}
          onClick={handleTriggerClick}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`w-64 p-2 ${contentClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">{t.sharing?.share || 'Share'}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
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
              aria-label="Facebook"
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
              aria-label="Twitter"
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
              aria-label="Email"
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
              aria-label="WhatsApp"
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
          >
            <Copy className="h-4 w-4 mr-2" />
            {t.sharing?.copyLink || 'Copy link'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
