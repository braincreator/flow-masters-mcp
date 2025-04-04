'use client'

import React from 'react'
import { cn } from '@/utilities/ui'
import type { Props } from './types'

const VideoMedia: React.FC<Props> = ({
  resource,
  src,
  width,
  height,
  fill = false,
  imgClassName,
}) => {
  // Получаем URL видео
  const videoUrl = (() => {
    if (src) return src
    if (!resource) return null
    if (typeof resource === 'string') return resource
    if (typeof resource === 'object' && 'url' in resource) return resource.url
    return null
  })()

  // Проверяем валидность URL
  const isValidURL = (url: string): boolean => {
    try {
      if (!url) return false

      // Проверка абсолютных URL
      if (url.startsWith('http://') || url.startsWith('https://')) {
        new URL(url)
        return true
      }

      // Проверка относительных URL
      if (url.startsWith('/')) {
        return true
      }

      return false
    } catch (e) {
      return false
    }
  }

  if (!videoUrl || !isValidURL(videoUrl)) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted/30 rounded border border-border',
          imgClassName,
        )}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
      >
        <span className="text-sm text-muted-foreground">Видео недоступно</span>
      </div>
    )
  }

  return (
    <div className={cn('video-wrapper rounded overflow-hidden', imgClassName)}>
      <video
        controls
        width={fill ? '100%' : width}
        height={fill ? '100%' : height}
        className="w-full rounded border border-border"
      >
        <source src={videoUrl} />
        Ваш браузер не поддерживает видео
      </video>
    </div>
  )
}

export { VideoMedia }
export default VideoMedia
