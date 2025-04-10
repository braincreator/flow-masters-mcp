"use client"
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { BaseBlock } from '@/components/BaseBlock'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { GalleryBlock as GalleryBlockType } from '@/types/blocks'
import type { BlockStyleProps } from '@/types/block-styles'
import { blockSizeStyles, blockStyleVariants, blockAnimationStyles } from '@/styles/block-styles'
import { cn } from '@/lib/utils'
import { useSwipeable } from 'react-swipeable'

const gridColumns = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

const masonryColumns = {
  2: 'columns-1 sm:columns-2',
  3: 'columns-1 sm:columns-2 lg:columns-3',
  4: 'columns-1 sm:columns-2 lg:columns-4',
}

const gridSpacing = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
}

interface GalleryProps extends GalleryBlockType, BlockStyleProps {}

export const Gallery: React.FC<GalleryProps> = ({
  items,
  settings,
  className,
  style = 'default',
  size = 'md',
  layout = 'grid',
  columns = 3,
  spacing = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const sizeVariant = blockSizeStyles[size]
  const styleVariant = blockStyleVariants[style]

  const handlePrevious = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex((current) => (current === 0 ? items.length - 1 : current - 1))
    setTimeout(() => setIsAnimating(false), 300)
  }, [isAnimating, items.length])

  const handleNext = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setActiveIndex((current) => (current === items.length - 1 ? 0 : current + 1))
    setTimeout(() => setIsAnimating(false), 300)
  }, [isAnimating, items.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'ArrowLeft') handlePrevious()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handlePrevious, handleNext])

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrevious,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  })

  const renderGrid = () => (
    <div
      className={cn(
        'grid',
        gridColumns[columns],
        gridSpacing[spacing],
        blockAnimationStyles.fadeIn,
      )}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer"
          onClick={() => {
            setActiveIndex(index)
            setIsOpen(true)
          }}
        >
          <Image
            src={item.url}
            alt={item.alt || ''}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={`(min-width: 1280px) ${100 / columns}vw, (min-width: 768px) ${100 / Math.min(columns, 2)}vw, 100vw`}
          />
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
          {item.caption && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="text-sm text-white">{item.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const renderMasonry = () => (
    <div
      className={cn(
        masonryColumns[columns],
        'gap-4 space-y-4 [&>*]:mb-4',
        blockAnimationStyles.fadeIn,
      )}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className="group relative break-inside-avoid overflow-hidden rounded-lg cursor-pointer"
          onClick={() => {
            setActiveIndex(index)
            setIsOpen(true)
          }}
        >
          <div className="relative">
            <Image
              src={item.url}
              alt={item.alt || ''}
              width={item.width || 800}
              height={item.height || 600}
              className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            {item.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-sm text-white">{item.caption}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderCarousel = () => (
    <div className="relative overflow-hidden" {...swipeHandlers}>
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {items.map((item, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <div className="relative aspect-video">
              <Image
                src={item.url}
                alt={item.alt || ''}
                fill
                className="object-cover"
                sizes="100vw"
                priority={Math.abs(activeIndex - index) <= 1}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            className={cn(
              'h-2 w-2 rounded-full transition-colors',
              index === activeIndex ? 'bg-white' : 'bg-white/50',
            )}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  )

  const renderContent = () => {
    switch (layout) {
      case 'masonry':
        return renderMasonry()
      case 'carousel':
        return renderCarousel()
      default:
        return renderGrid()
    }
  }

  return (
    <BaseBlock settings={settings}>
      <div
        className={cn(
          'w-full',
          styleVariant.background,
          styleVariant.text,
          styleVariant.border,
          styleVariant.shadow,
          sizeVariant.container,
          className,
        )}
      >
        {renderContent()}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-screen-lg p-0">
          <div className="relative aspect-[16/10]" {...swipeHandlers}>
            <Image
              src={items[activeIndex].url}
              alt={items[activeIndex].alt || ''}
              fill
              className="object-contain"
              priority
            />
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-4 bg-white/90 hover:bg-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {items[activeIndex].caption && (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">{items[activeIndex].caption}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </BaseBlock>
  )
}

export const GalleryBlock = Gallery
export default Gallery
