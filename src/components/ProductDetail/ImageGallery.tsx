import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface ImageGalleryProps {
  images: Array<{ id: string; url: string; alt: string }>
  className?: string
  locale?: string
}

export function ImageGallery({ images: rawImages, className, locale = 'en' }: ImageGalleryProps) {
  // Additional validation to filter out any invalid URLs
  const images = rawImages.filter((img) => img.url && img.url.trim() !== '')

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Reset current index if images change
  useEffect(() => {
    setCurrentIndex(0)
    setIsLoading(true)
  }, [images])

  const nextImage = () => {
    if (images.length <= 1) return
    setIsLoading(true)
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const previousImage = () => {
    if (images.length <= 1) return
    setIsLoading(true)
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    logError('Failed to load image:', images[currentIndex]?.url)
  }

  // Text for no images
  const noImagesText = locale === 'ru' ? 'Изображения отсутствуют' : 'No images available'

  if (!images || images.length === 0) {
    return (
      <div className={cn('relative group', className)}>
        <div className="aspect-square overflow-hidden rounded-2xl bg-muted/30 relative flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <ImageIcon className="h-12 w-12" />
            <span className="text-base">{noImagesText}</span>
          </div>
        </div>
      </div>
    )
  }

  // Only show navigation and thumbnails if there are multiple valid images
  const hasMultipleImages = images.length > 1

  return (
    <div className={cn('relative group', className)}>
      <div className="aspect-square overflow-hidden rounded-2xl bg-muted relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary/30 border-r-primary rounded-full" />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={images[currentIndex]?.id || 'placeholder'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn('relative h-full w-full', isZoomed && 'cursor-zoom-out')}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            {images[currentIndex]?.url ? (
              <Image
                src={images[currentIndex].url}
                alt={images[currentIndex].alt || ''}
                fill
                className={cn(
                  'object-cover transition-transform duration-500',
                  isZoomed ? 'scale-150' : 'scale-100',
                  isLoading ? 'opacity-0' : 'opacity-100',
                )}
                priority
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {images[currentIndex]?.url && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm z-20"
            onClick={(e) => {
              e.stopPropagation()
              setIsZoomed(!isZoomed)
            }}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        )}
      </div>

      {hasMultipleImages && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm"
            onClick={previousImage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm"
            onClick={nextImage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {hasMultipleImages && (
        <div className="grid grid-cols-4 gap-4 mt-4">
          {images.map((image, index) => (
            <button
              key={image.id}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg transition-all',
                index === currentIndex
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'opacity-70 hover:opacity-100',
              )}
              onClick={() => {
                setIsLoading(true)
                setCurrentIndex(index)
              }}
            >
              {image.url ? (
                <Image
                  src={image.url}
                  alt={image.alt || ''}
                  fill
                  className="object-cover"
                  onError={() => logError('Thumbnail failed to load:', image.url)}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
