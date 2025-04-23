'use client'
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { BaseBlock } from '@/components/BaseBlock'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSwipeable } from 'react-swipeable'
import type { CarouselBlock as CarouselBlockType } from '@/types/blocks'
import type { BlockStyleProps } from '@/types/block-styles'
import { blockSizeStyles, blockStyleVariants, blockAnimationStyles } from '@/styles/block-styles'
import { cn } from '@/lib/utils'

interface CarouselProps extends CarouselBlockType, BlockStyleProps {}

const variants = {
  default: 'space-x-4',
  compact: 'space-x-2',
  overlap: '-space-x-4',
}

const indicators = {
  dots: 'flex gap-2 mt-4',
  lines: 'flex gap-1 mt-4',
  numbers: 'flex gap-2 mt-4',
  none: 'hidden',
}

export const Carousel: React.FC<CarouselProps> = ({
  items,
  settings,
  className,
  style = 'default',
  size = 'md',
  variant = 'default',
  autoPlay = false,
  autoPlayInterval = 5000,
  pauseOnHover = true,
  indicatorType = 'dots',
  infinite = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoPlayTimer = useRef<NodeJS.Timeout>()

  const itemCount = items?.length || 0
  const sizeVariant = blockSizeStyles[size]
  const styleVariant = blockStyleVariants[style]

  const nextSlide = useCallback(() => {
    if (!infinite && currentIndex === itemCount - 1) return
    setCurrentIndex((prev) => (prev + 1) % itemCount)
  }, [currentIndex, itemCount, infinite])

  const prevSlide = useCallback(() => {
    if (!infinite && currentIndex === 0) return
    setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount)
  }, [currentIndex, itemCount, infinite])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  useEffect(() => {
    // Очищаем существующий интервал при изменении зависимостей
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current)
      autoPlayTimer.current = undefined
    }

    if (autoPlay && !isHovered && !isDragging) {
      autoPlayTimer.current = setInterval(nextSlide, autoPlayInterval)
    }

    return () => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current)
        autoPlayTimer.current = undefined
      }
    }
  }, [autoPlay, autoPlayInterval, isHovered, isDragging, nextSlide])

  const handlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    onSwiping: () => setIsDragging(true),
    onSwiped: () => setIsDragging(false),
    trackMouse: true,
  })

  const renderIndicators = () => {
    if (indicatorType === 'none' || !items?.length) return null

    return (
      <div className={indicators[indicatorType]}>
        {items.map((_, index) => {
          if (indicatorType === 'dots') {
            return (
              <button
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentIndex
                    ? 'bg-primary scale-125'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50',
                )}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            )
          }
          if (indicatorType === 'lines') {
            return (
              <button
                key={index}
                className={cn(
                  'w-8 h-1 rounded-full transition-all',
                  index === currentIndex
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50',
                )}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            )
          }
          if (indicatorType === 'numbers') {
            return (
              <button
                key={index}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all',
                  index === currentIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted-foreground/10',
                )}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              >
                {index + 1}
              </button>
            )
          }
        })}
      </div>
    )
  }

  if (!items?.length) {
    return null
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
        onMouseEnter={() => {
          setIsHovered(true)
          if (pauseOnHover && autoPlayTimer.current) {
            clearInterval(autoPlayTimer.current)
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          if (pauseOnHover && autoPlay) {
            autoPlayTimer.current = setInterval(nextSlide, autoPlayInterval)
          }
        }}
      >
        <div className="relative" {...handlers}>
          <div
            ref={containerRef}
            className={cn(
              'flex transition-transform duration-300 ease-out',
              variants[variant],
              blockAnimationStyles.slideIn,
            )}
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {items.map((item, index) => (
              <div
                key={index}
                className={cn(
                  'flex-none w-full',
                  variant === 'overlap' && 'hover:translate-y-[-4px] transition-transform',
                )}
              >
                {item}
              </div>
            ))}
          </div>

          {itemCount > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90',
                  !infinite && currentIndex === 0 && 'opacity-50 cursor-not-allowed',
                )}
                onClick={prevSlide}
                disabled={!infinite && currentIndex === 0}
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90',
                  !infinite && currentIndex === itemCount - 1 && 'opacity-50 cursor-not-allowed',
                )}
                onClick={nextSlide}
                disabled={!infinite && currentIndex === itemCount - 1}
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {renderIndicators()}
      </div>
    </BaseBlock>
  )
}

export const CarouselBlock = Carousel
export default Carousel
