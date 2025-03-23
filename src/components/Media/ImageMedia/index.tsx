'use client'

import type { StaticImageData } from 'next/image'
import { cn } from '@/utilities/ui'
import NextImage from 'next/image'
import React, { memo, useState } from 'react'
import type { Props as MediaProps } from '../types'
import type { Media } from '@/payload-types'

const ImageMedia = memo(function ImageMedia({
  resource,
  src,
  alt,
  width,
  height,
  priority = false,
  fill = false,
  sizes: sizeFromProps,
  loading: loadingFromProps,
  imgClassName,
  onLoad,
}: MediaProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  // Handle resource prop (Payload media)
  const imageSrc = (() => {
    if (src) return src
    if (!resource) return null
    if (typeof resource === 'string') return resource
    if (typeof resource === 'object' && 'url' in resource) return resource.url
    return null
  })()

  // Don't render anything if no valid source is found
  if (!imageSrc) {
    return null
  }

  const imageAlt = alt || (typeof resource === 'object' && resource?.alt) || ''
  const loading = loadingFromProps || (!priority ? 'lazy' : undefined)
  const sizes = sizeFromProps || '(max-width: 768px) 100vw, 50vw'

  return (
    <picture>
      <NextImage
        alt={imageAlt}
        className={cn(imgClassName, !isLoaded && 'blur-up')}
        fill={fill}
        height={!fill ? height : undefined}
        loading={loading}
        sizes={sizes}
        src={imageSrc}
        width={!fill ? width : undefined}
        quality={80}
        onLoadingComplete={() => {
          setIsLoaded(true)
          onLoad?.()
        }}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
      />
    </picture>
  )
})

export default ImageMedia
