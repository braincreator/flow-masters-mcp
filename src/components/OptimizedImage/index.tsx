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
 * Оптимизированный компонент изображения с управлением памятью
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75, // Снижено с 100 до 75 для экономии памяти
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
  const [isInView, setIsInView] = useState(priority) // Загружаем сразу если priority
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer для ленивой загрузки
  useEffect(() => {
    if (priority || isInView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // Начинаем загрузку за 50px до появления
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

  // Генерируем оптимизированный src с параметрами
  const optimizedSrc = useCallback((originalSrc: string, w?: number, h?: number) => {
    // Если это внешний URL, возвращаем как есть
    if (originalSrc.startsWith('http')) {
      return originalSrc
    }

    // Для локальных изображений добавляем параметры оптимизации
    const params = new URLSearchParams()
    if (w) params.set('w', w.toString())
    if (h) params.set('h', h.toString())
    params.set('q', quality.toString())
    
    return `${originalSrc}${params.toString() ? `?${params.toString()}` : ''}`
  }, [quality])

  // Placeholder для загрузки
  const renderPlaceholder = () => (
    <div
      className={cn(
        'bg-gray-200 animate-pulse flex items-center justify-center',
        className
      )}
      style={{ width, height }}
    >
      <svg
        className="w-8 h-8 text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )

  // Ошибка загрузки
  const renderError = () => (
    <div
      className={cn(
        'bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center',
        className
      )}
      style={{ width, height }}
    >
      <div className="text-center text-gray-500">
        <svg
          className="w-8 h-8 mx-auto mb-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-xs">Ошибка загрузки</p>
      </div>
    </div>
  )

  if (hasError) {
    return renderError()
  }

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {!isInView && !priority ? (
        renderPlaceholder()
      ) : (
        <>
          {!isLoaded && renderPlaceholder()}
          <Image
            src={optimizedSrc(src, width, height)}
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
              className
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

/**
 * Хук для предзагрузки изображений с управлением памятью
 */
export const useImagePreloader = (urls: string[], maxConcurrent = 2) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const loadingQueue = useRef<string[]>([])
  const activeLoads = useRef<Set<string>>(new Set())

  const preloadImage = useCallback((url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, url]))
        activeLoads.current.delete(url)
        resolve()
      }
      
      img.onerror = () => {
        activeLoads.current.delete(url)
        reject(new Error(`Failed to load image: ${url}`))
      }
      
      // Оптимизированные параметры для предзагрузки
      img.src = url
      img.loading = 'eager'
    })
  }, [])

  const processQueue = useCallback(async () => {
    while (loadingQueue.current.length > 0 && activeLoads.current.size < maxConcurrent) {
      const url = loadingQueue.current.shift()
      if (!url || loadedImages.has(url) || activeLoads.current.has(url)) continue

      activeLoads.current.add(url)
      
      try {
        await preloadImage(url)
      } catch (error) {
        console.warn('Failed to preload image:', error)
      }
    }

    if (loadingQueue.current.length === 0 && activeLoads.current.size === 0) {
      setIsLoading(false)
    }
  }, [preloadImage, maxConcurrent, loadedImages])

  const preloadImages = useCallback((imagesToLoad: string[]) => {
    const newImages = imagesToLoad.filter(url => !loadedImages.has(url))
    if (newImages.length === 0) return

    loadingQueue.current.push(...newImages)
    setIsLoading(true)
    processQueue()
  }, [loadedImages, processQueue])

  useEffect(() => {
    if (urls.length > 0) {
      preloadImages(urls)
    }
  }, [urls, preloadImages])

  return {
    loadedImages,
    isLoading,
    preloadImages,
  }
}

export default OptimizedImage
