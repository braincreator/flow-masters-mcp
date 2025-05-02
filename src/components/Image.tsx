'use client'
import React, { useState } from 'react'
import NextImage, { ImageProps as NextImageProps } from 'next/image'
import { cn } from '@/lib/utils'
import { formatImageSize } from '@/lib/utils'
// import AnimateInView from '@/components/AnimateInView' // Component is empty

interface ImageProps extends Omit<NextImageProps, 'width' | 'height'> {
  width: number
  height: number
  wrapperClassName?: string
  animate?: boolean
  maxWidth?: number
}

export const Image = ({
  src,
  alt,
  width,
  height,
  wrapperClassName,
  className,
  animate = false,
  maxWidth,
  ...props
}: ImageProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const {
    width: optimizedWidth,
    height: optimizedHeight,
    aspectRatio,
  } = formatImageSize(width, height, maxWidth)

  const image = (
    <div
      className={cn(
        'overflow-hidden relative',
        isLoading && 'animate-pulse bg-muted',
        hasError && 'bg-destructive',
        wrapperClassName,
      )}
      style={{ aspectRatio }}
    >
      <NextImage
        src={src}
        alt={alt}
        width={optimizedWidth}
        height={optimizedHeight}
        className={cn(
          'object-cover transition-all',
          isLoading && 'scale-110 blur-xl',
          hasError && 'opacity-0',
          className,
        )}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        {...props}
      />
    </div>
  )

  // if (animate) { // AnimateInView component is empty
  //   return <AnimateInView>{image}</AnimateInView>
  // }

  return image
}

Image.displayName = 'Image'
