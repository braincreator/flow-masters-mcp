'use client'

import React from 'react'
import { cn } from '@/utilities/ui'
import { SocialShareButtons } from '@/components/shared/SocialShareButtons'
import type { SharingPlatform } from '@/utilities/share'

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
  // Track shares
  const trackShare = async (platform: SharingPlatform) => {
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

  return (
    <SocialShareButtons
      url={url}
      title={title}
      description={description}
      className={className}
      variant={variant}
      size={size}
      iconOnly={iconOnly}
      platforms={platforms}
      locale={locale}
      onShare={trackShare}
    />
  )
}

export default ShareButtons
