import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'

interface ImageGalleryProps {
  images: Array<{ id: string; url: string; alt: string }>
  className?: string
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className={cn('relative group', className)}>
      <div className="aspect-square overflow-hidden rounded-2xl bg-muted relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'relative h-full w-full',
              isZoomed && 'cursor-zoom-out'
            )}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <Image
              src={images[currentIndex].url}
              alt={images[currentIndex].alt}
              fill
              className={cn(
                'object-cover transition-transform duration-300',
                isZoomed && 'scale-150'
              )}
              priority
            />
          </motion.div>
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            setIsZoomed(!isZoomed)
          }}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={previousImage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={nextImage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      <div className="grid grid-cols-4 gap-4 mt-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            className={cn(
              'relative aspect-square overflow-hidden rounded-lg transition-all',
              index === currentIndex
                ? 'ring-2 ring-primary ring-offset-2'
                : 'hover:opacity-75'
            )}
            onClick={() => setCurrentIndex(index)}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}