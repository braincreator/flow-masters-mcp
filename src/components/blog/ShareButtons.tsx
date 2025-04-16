'use client'

import React from 'react'
import { UniversalShareButton } from '@/components/shared/UniversalShareButton'
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
  return (
    <UniversalShareButton
      url={url}
      title={title}
      description={description}
      className={className}
      variant={variant}
      size={size}
      iconOnly={iconOnly}
      platforms={platforms}
      locale={locale}
      trackShares={trackShares}
      postId={postId}
      displayMode="inline"
      gridColumns={4}
    />
  )
}

export default ShareButtons
