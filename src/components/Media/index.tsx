'use client'

import React, { isValidElement } from 'react'
import { Props, MediaResource, MediaType } from './types'
import ImageMedia from './ImageMedia'
import VideoMedia from './VideoMedia'
import PDFMedia from './PDFMedia'

// Функция для проверки валидности медиа-ресурса
const isValidMediaResource = (resource: any): resource is MediaResource => {
  if (resource === null || resource === undefined) return false

  // Проверка строки
  if (typeof resource === 'string') return resource.trim().length > 0

  // Проверка объекта с URL
  if (typeof resource === 'object' && resource !== null) {
    return 'url' in resource && typeof resource.url === 'string' && resource.url.trim().length > 0
  }

  return false
}

// Определение типа медиа по расширению файла или MIME-типу
const determineMediaType = (resource: MediaResource): MediaType => {
  let url = ''

  if (typeof resource === 'string') {
    url = resource
  } else if (resource && typeof resource === 'object' && 'url' in resource) {
    url = resource.url
  } else {
    return MediaType.Unknown
  }

  const lowercasedUrl = url.toLowerCase()

  if (/\.(jpg|jpeg|png|gif|webp|svg|avif)($|\?)/.test(lowercasedUrl)) {
    return MediaType.Image
  } else if (/\.(mp4|webm|ogg|mov)($|\?)/.test(lowercasedUrl)) {
    return MediaType.Video
  } else if (/\.(pdf)($|\?)/.test(lowercasedUrl)) {
    return MediaType.PDF
  }

  // Проверка по MIME-типу, если есть в объекте
  if (typeof resource === 'object' && resource.mimeType) {
    const mimeType = resource.mimeType.toLowerCase()

    if (mimeType.startsWith('image/')) {
      return MediaType.Image
    } else if (mimeType.startsWith('video/')) {
      return MediaType.Video
    } else if (mimeType === 'application/pdf') {
      return MediaType.PDF
    }
  }

  // По умолчанию считаем, что это изображение
  return MediaType.Image
}

export const Media: React.FC<Props> = (props) => {
  const { resource, src, alt, Component, fill, imgClassName, ...rest } = props

  // Если передан готовый компонент, рендерим его
  if (Component) {
    return <Component {...props} />
  }

  // Если передан валидный React элемент, возвращаем его
  if (isValidElement(resource)) {
    return resource
  }

  // Логирование в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    console.log('Media component received:', {
      resource,
      src,
      resourceType: resource ? typeof resource : null,
    })
  }

  // Если нет ресурса и нет src, то нечего отображать
  if (!isValidMediaResource(resource) && !src) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/30 rounded border border-border ${imgClassName || ''}`}
        style={{ width: '100%', height: '300px' }}
      >
        <span className="text-sm text-muted-foreground">Медиа недоступно</span>
      </div>
    )
  }

  // Определяем тип медиа на основе ресурса или src
  const mediaType = determineMediaType(resource || (src as string))

  // Рендерим соответствующий компонент в зависимости от типа медиа
  switch (mediaType) {
    case MediaType.Video:
      return (
        <VideoMedia
          resource={resource}
          src={src}
          alt={alt}
          fill={fill}
          imgClassName={imgClassName}
          {...rest}
        />
      )
    case MediaType.PDF:
      return (
        <PDFMedia
          resource={resource}
          src={src}
          alt={alt}
          fill={fill}
          imgClassName={imgClassName}
          {...rest}
        />
      )
    case MediaType.Image:
    default:
      return (
        <ImageMedia
          resource={resource}
          src={src}
          alt={alt}
          fill={fill}
          imgClassName={imgClassName}
          {...rest}
        />
      )
  }
}
