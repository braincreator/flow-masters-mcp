'use client'

import React from 'react'
import { Media } from '@/components/Media'
import { MediaResource } from '@/components/Media/types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Функция для проверки валидности медиа
const isValidMedia = (media: any): media is MediaResource => {
  if (media === null || media === undefined) return false
  
  // Если это строка URL
  if (typeof media === 'string') return media.trim().length > 0
  
  // Если это объект с url свойством
  if (typeof media === 'object' && media !== null) {
    if ('url' in media && typeof media.url === 'string' && media.url.trim().length > 0) {
      return true
    }
  }
  
  // Если это массив, проверяем первый элемент
  if (Array.isArray(media) && media.length > 0) {
    const firstItem = media[0]
    if (typeof firstItem === 'string') return firstItem.trim().length > 0
    if (typeof firstItem === 'object' && firstItem !== null && 'url' in firstItem) {
      return typeof firstItem.url === 'string' && firstItem.url.trim().length > 0
    }
  }
  
  return false
}

// Получаем media из разных форматов данных
const getProcessedMedia = (media: any): MediaResource => {
  if (media === null || media === undefined) return null
  
  // Если это строка, считаем её URL-ом
  if (typeof media === 'string') return media
  
  // Если это массив, берем первый элемент
  if (Array.isArray(media) && media.length > 0) {
    return media[0]
  }
  
  // Если это объект и у него есть url
  if (typeof media === 'object' && 'url' in media) {
    return media
  }
  
  return null
}

export const MediaBlock: React.FC<{
  blockType?: 'media'
  blockName?: string
  media?: any
  caption?: any
  position?: 'default' | 'fullscreen'
  mediaWidth?: number
  mediaHeight?: number
}> = ({ 
  media, 
  caption, 
  position = 'default', 
  mediaWidth = 1000,
  mediaHeight = 650
}) => {
  // Логируем информацию о медиа в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    logDebug('MediaBlock component received:', {
      mediaType: media ? typeof media : null,
      mediaIsArray: Array.isArray(media),
      mediaValue: media
    })
  }

  // Проверяем валидность медиа
  if (!isValidMedia(media)) {
    return (
      <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded border border-border">
        Медиа-контент недоступен или неверного формата
      </div>
    )
  }

  // Обрабатываем различные форматы данных media
  const validMedia = getProcessedMedia(media)

  // Извлекаем описание (caption) если оно есть
  let captionText = ''
  try {
    if (caption) {
      if (typeof caption === 'string') {
        captionText = caption
      } else if (Array.isArray(caption) && caption.length > 0) {
        const firstChild = caption[0]
        if (typeof firstChild === 'object' && 'children' in firstChild) {
          const textNode = firstChild.children?.find((child: any) => child.text)
          captionText = textNode?.text || ''
        }
      }
    }
  } catch (error) {
    logError('Error extracting caption:', error)
  }

  return (
    <div className="content-width my-8">
      <div className={position === 'fullscreen' ? 'w-full' : 'w-full'}>
        <Media 
          resource={validMedia} 
          imgClassName="w-full h-auto rounded-md"
          width={mediaWidth}
          height={mediaHeight}
        />
        {captionText && (
          <div className="mt-2 text-sm text-muted-foreground italic">
            {captionText}
          </div>
        )}
      </div>
    </div>
  )
}
