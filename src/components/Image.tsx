'use client'
import React, { useState } from 'react'
import NextImage, { ImageProps as NextImageProps } from 'next/image'
import { cn } from '@/lib/utils'
import { formatImageSize } from '@/lib/utils'
import AnimateInView from '@/components/AnimateInView'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface ImageProps extends Omit<NextImageProps, 'width' | 'height' | 'fill'> {
  width?: number // Made optional
  height?: number // Made optional
  fill?: boolean // Added fill prop
  wrapperClassName?: string
  animate?: boolean
  maxWidth?: number
  animationDirection?: 'up' | 'down' | 'left' | 'right' | 'none'
  animationDelay?: number
}

export const Image = ({
  src,
  alt,
  width, // Optional
  height, // Optional
  fill, // New
  wrapperClassName,
  className,
  animate = false,
  maxWidth,
  animationDirection = 'up',
  animationDelay = 0,
  ...props
}: ImageProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const nextImageFinalProps: Partial<NextImageProps> = { ...props }
  const wrapperStyle: React.CSSProperties = {}

  if (fill) {
    nextImageFinalProps.fill = true
    // When fill is true, NextImage handles dimensions based on parent.
    // The parent div in page.tsx should have `position: relative` and dimensions/aspect-ratio.
  } else if (width && height) {
    const {
      width: optimizedWidth,
      height: optimizedHeight,
      aspectRatio,
    } = formatImageSize(width, height, maxWidth)
    nextImageFinalProps.width = optimizedWidth
    nextImageFinalProps.height = optimizedHeight
    wrapperStyle.aspectRatio = aspectRatio
  } else {
    // This case should ideally be prevented by prop validation or clear usage guidelines.
    // If not `fill`, then `width` and `height` are expected.
    logWarn(
      'Image component: `fill` is not true, and `width` or `height` are missing or invalid. Rendering with 0x0.',
    )
    nextImageFinalProps.width = 0
    nextImageFinalProps.height = 0
    // Potentially set hasError to true or render a placeholder
    // setHasError(true); // Or handle differently
  }

  const image = (
    <div
      className={cn(
        'overflow-hidden relative', // `relative` is important for `fill` on NextImage
        fill && 'w-full h-full', // Ensure wrapper fills its parent when fill is true
        isLoading && 'animate-pulse bg-muted',
        hasError && 'bg-destructive flex items-center justify-center text-destructive-foreground', // Added styling for error state
        wrapperClassName,
      )}
      style={wrapperStyle} // Apply conditional aspectRatio
    >
      {hasError ? (
        <span>Error</span> // Simple error indicator
      ) : (
        <NextImage
          src={src}
          alt={alt}
          className={cn(
            'transition-all duration-500', // `object-cover` should be passed via `className` prop from usage if `fill` is true
            isLoading && 'scale-110 blur-xl',
            // hasError handled by conditional rendering above
            className,
          )}
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
          {...nextImageFinalProps}
        />
      )}
    </div>
  )

  if (animate) {
    return (
      <AnimateInView direction={animationDirection} delay={animationDelay}>
        {image}
      </AnimateInView>
    )
  }

  return image
}

Image.displayName = 'Image'
