'use client'

import React, { useState } from 'react'
import { GalleryBlock } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import Image from 'next/image'
import { cn } from '@/utilities/ui'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export const GalleryBlock: React.FC<GalleryBlock> = ({
  heading,
  images,
  layout = 'grid',
  columns = 3,
  lightbox = true,
  settings,
}) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  // Column classes for different layouts
  const columnClasses = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 md:grid-cols-3',
    4: 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }

  // Handle lightbox navigation
  const handlePrevious = () => {
    if (selectedImage === null || !images.length) return
    setSelectedImage((selectedImage - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    if (selectedImage === null || !images.length) return
    setSelectedImage((selectedImage + 1) % images.length)
  }

  // Close lightbox
  const handleClose = () => {
    setSelectedImage(null)
  }

  return (
    <GridContainer settings={settings}>
      {/* Heading */}
      {heading && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">{heading}</h2>
        </div>
      )}

      {/* Gallery grid */}
      <div
        className={cn(
          'grid grid-cols-1 gap-4',
          layout === 'grid' && columnClasses[columns],
          layout === 'masonry' && 'columns-1 sm:columns-2 md:columns-3 space-y-4',
        )}
      >
        {images.map((image, index) =>
          layout === 'grid' ? (
            // Grid layout
            <div
              key={index}
              className={cn(
                'aspect-square overflow-hidden rounded-lg border border-border relative',
                lightbox && 'cursor-pointer hover:opacity-90 transition-opacity',
              )}
              onClick={() => lightbox && setSelectedImage(index)}
            >
              <Image src={image.url} alt={image.alt || ''} fill className="object-cover" />
            </div>
          ) : (
            // Masonry layout
            <div
              key={index}
              className={cn(
                'break-inside-avoid overflow-hidden rounded-lg border border-border mb-4 relative',
                lightbox && 'cursor-pointer hover:opacity-90 transition-opacity',
              )}
              onClick={() => lightbox && setSelectedImage(index)}
            >
              <Image
                src={image.url}
                alt={image.alt || ''}
                width={image.width || 800}
                height={image.height || 600}
                className="w-full h-auto"
              />
            </div>
          ),
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Dialog open={selectedImage !== null} onOpenChange={handleClose}>
          <DialogContent className="max-w-5xl p-0 bg-transparent border-none">
            <div className="relative bg-background rounded-lg overflow-hidden p-1">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute right-2 top-2 z-50 bg-background/80 rounded-full p-1 hover:bg-primary hover:text-primary-foreground"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Navigation buttons */}
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-50 bg-background/80 rounded-full p-1 hover:bg-primary hover:text-primary-foreground"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-50 bg-background/80 rounded-full p-1 hover:bg-primary hover:text-primary-foreground"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Current image */}
              {selectedImage !== null && images[selectedImage] && (
                <div className="flex justify-center items-center">
                  <Image
                    src={images[selectedImage].url}
                    alt={images[selectedImage].alt || ''}
                    width={1200}
                    height={800}
                    className="max-h-[80vh] w-auto h-auto object-contain"
                  />
                </div>
              )}

              {/* Caption */}
              {selectedImage !== null && images[selectedImage]?.alt && (
                <div className="p-4 text-center">
                  <p className="text-muted-foreground">{images[selectedImage].alt}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </GridContainer>
  )
}
