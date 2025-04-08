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
import { Facebook, Twitter, Linkedin, Link2, Share2 } from 'lucide-react'

export interface ShareButtonsProps {
  url: string
  title: string
  description?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  iconOnly?: boolean
  platforms?: ('twitter' | 'facebook' | 'linkedin' | 'copy')[]
  trackShares?: boolean
  postId?: string
}

export function ShareButtons({
  url,
  title,
  description = '',
  className,
  variant = 'outline',
  size = 'default',
  iconOnly = false,
  platforms = ['twitter', 'facebook', 'linkedin', 'copy'],
  trackShares = false,
  postId,
}: ShareButtonsProps) {
  const [copied, setCopied] = React.useState(false)

  // Ensure URL is absolute
  const fullUrl = url.startsWith('http') ? url : `${window?.location.origin || ''}${url}`

  // Track shares
  const trackShare = async (platform: string) => {
    if (!trackShares || !postId) return

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
      console.error('Failed to track share:', error)
    }
  }

  // Share handlers
  const shareOnTwitter = () => {
    trackShare('twitter')
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
      '_blank',
    )
  }

  const shareOnFacebook = () => {
    trackShare('facebook')
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      '_blank',
    )
  }

  const shareOnLinkedIn = () => {
    trackShare('linkedin')
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
      '_blank',
    )
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true)
      trackShare('copy')
      setTimeout(() => setCopied(false), 2000)
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

  const buttonsConfig = {
    twitter: {
      label: 'Twitter',
      icon: <Twitter className="h-4 w-4" />,
      onClick: shareOnTwitter,
    },
    facebook: {
      label: 'Facebook',
      icon: <Facebook className="h-4 w-4" />,
      onClick: shareOnFacebook,
    },
    linkedin: {
      label: 'LinkedIn',
      icon: <Linkedin className="h-4 w-4" />,
      onClick: shareOnLinkedIn,
    },
    copy: {
      label: copied ? 'Copied!' : 'Copy link',
      icon: <Link2 className="h-4 w-4" />,
      onClick: copyToClipboard,
    },
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {/* Native Share button for mobile devices */}
      {navigator?.share && (
        <Button variant={variant} size={size} onClick={nativeShare} aria-label="Share">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      )}

      {/* Individual platform buttons */}
      {!navigator?.share && (
        <TooltipProvider>
          {platforms.map((platform) => {
            const config = buttonsConfig[platform]

            return (
              <Tooltip key={platform}>
                <TooltipTrigger asChild>
                  <Button
                    variant={variant}
                    size={size}
                    onClick={config.onClick}
                    aria-label={`Share on ${config.label}`}
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
                          ? 'Copied!'
                          : 'Copy link'
                        : `Share on ${config.label}`}
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
