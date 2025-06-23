'use client'

import React, { useState } from 'react'
import NextImage from 'next/image'
import { cn } from '@/utilities/ui'
import type { Props } from '../types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Функция для проверки валидности URL
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

const ImageMedia: React.FC<Props> = ({
  resource,
  src,
  alt = 'Image',
  width = 800,
  height = 600,
  fill = false,
  sizes,
  priority = false,
  imgClassName,
  className,
  onClick,
  quality = 80,
  placeholder,
  ...rest
}) => {
  const [error, setError] = useState(false)

  // Получаем URL изображения
  const imageSrc = (() => {
    if (src) return typeof src === 'string' ? src : src.src
    if (!resource) return null
    if (typeof resource === 'string') return resource
    if (typeof resource === 'object' && 'url' in resource) return resource.url
    return null
  })()

  // Получаем alt текст
  const imageAlt =
    alt ||
    (typeof resource === 'object' &&
    resource &&
    'alt' in resource &&
    typeof resource.alt === 'string'
      ? resource.alt
      : 'Image')

  // Если URL невалидный или произошла ошибка загрузки, показываем заглушку
  if (!imageSrc || !isValidURL(imageSrc) || error) {
    if (process.env.NODE_ENV === 'development' && imageSrc) {
      logWarn('Invalid image URL or loading error:', imageSrc)
    }

    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted/30 rounded border border-border',
          imgClassName,
        )}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
        onClick={onClick}
      >
        <span className="text-sm text-muted-foreground">Изображение недоступно</span>
      </div>
    )
  }

  // Рендер через next/image
  return (
    <div className={cn('image-wrapper relative', className)}>
      {fill ? (
        <NextImage
          className={cn('object-cover', imgClassName)}
          src={imageSrc}
          alt={imageAlt}
          fill={true}
          sizes={sizes || '100vw'}
          priority={priority}
          quality={quality}
          placeholder={placeholder as any}
          onClick={onClick}
          onError={() => setError(true)}
          {...rest}
        />
      ) : (
        <NextImage
          className={cn(imgClassName)}
          src={imageSrc}
          alt={imageAlt}
          width={typeof width === 'string' ? parseInt(width) : width}
          height={typeof height === 'string' ? parseInt(height) : height}
          priority={priority}
          quality={quality}
          placeholder={placeholder as any}
          onClick={onClick}
          onError={() => setError(true)}
          {...rest}
        />
      )}
    </div>
  )
}

export { ImageMedia }
export default ImageMedia
