'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/utilities/ui'

interface BlurImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  sizes?: string
}

export const BlurImage: React.FC<BlurImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px',
}) => {
  const [isLoading, setIsLoading] = useState(true)

  // Используем useEffect для очистки состояния при размонтировании
  useEffect(() => {
    return () => {
      // Очищаем состояние при уничтожении компонента
      setIsLoading(false)
    }
  }, [])

  return (
    <div
      className={cn(
        'overflow-hidden relative',
        isLoading ? 'animate-pulse bg-muted/30' : '',
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={cn(
          'duration-700 ease-in-out',
          isLoading ? 'scale-105 blur-sm grayscale' : 'scale-100 blur-0 grayscale-0',
        )}
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  )
}
