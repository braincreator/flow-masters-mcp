'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/utilities/cn'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
}

/**
 * Оптимизированный компонент изображения
 * Улучшенная версия с лучшим управлением памятью и производительностью
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75, // Оптимальное качество для веба
  placeholder = 'empty',
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  loading = 'lazy',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer для lazy loading
  useEffect(() => {
    if (priority || isInView) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px', // Загружаем за 50px до появления
        threshold: 0.1,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority, isInView])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  // Генерируем оптимизированный src
  const optimizedSrc = useCallback((originalSrc: string) => {
    // Для внешних URL возвращаем как есть
    if (originalSrc.startsWith('http')) {
      return originalSrc
    }

    // Для локальных изображений Next.js автоматически оптимизирует
    return originalSrc
  }, [])

  // Placeholder во время загрузки
  const renderPlaceholder = () => (
    <div
      className={cn(
        'bg-muted animate-pulse flex items-center justify-center',
        fill ? 'absolute inset-0' : '',
        className
      )}
      style={!fill ? { width, height } : undefined}
    >
      <svg
        className="w-8 h-8 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  )

  // Error state
  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'bg-muted flex items-center justify-center text-muted-foreground',
          fill ? 'absolute inset-0' : '',
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <span className="text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {!isInView && !priority ? (
        renderPlaceholder()
      ) : (
        <>
          {!isLoaded && renderPlaceholder()}
          <Image
            src={optimizedSrc(src)}
            alt={alt}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            fill={fill}
            priority={priority}
            quality={quality}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            sizes={sizes}
            loading={loading}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              fill ? 'object-cover' : '',
            )}
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </>
      )}
    </div>
  )
}

export default OptimizedImage
