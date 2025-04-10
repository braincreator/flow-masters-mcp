"use client"
import React, { useCallback, useEffect, useState } from 'react'
import { GridContainer } from '@/components/GridContainer'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { SliderBlock as SliderBlockType } from '@/types/blocks'
import { cn } from '@/lib/utils'
import useEmblaCarousel from 'embla-carousel-react'
import AutoPlay from 'embla-carousel-autoplay'
import { useSwipeable } from 'react-swipeable'

type SliderNavigation = 'arrows' | 'dots' | 'both' | 'none'
type SliderStyle = 'default' | 'cards' | 'fade'

const navigationStyles: Record<SliderNavigation, string> = {
  arrows: 'space-x-4',
  dots: 'flex-col space-y-4',
  both: 'space-y-4',
  none: '',
}

interface SliderProps extends SliderBlockType {
  className?: string
  navigation?: SliderNavigation
  style?: SliderStyle
  autoplayInterval?: number
}

export const Slider: React.FC<SliderProps> = ({
  slides,
  settings,
  className,
  navigation = 'both',
  style = 'default',
  autoplayInterval = 5000,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    AutoPlay({ delay: autoplayInterval, stopOnInteraction: true }),
  ])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi],
  )

  const handlers = useSwipeable({
    onSwipedLeft: () => scrollNext(),
    onSwipedRight: () => scrollPrev(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  })

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on('select', () => {
        setCurrentSlide(emblaApi.selectedScrollSnap())
      })
    }
  }, [emblaApi])

  const showArrows = navigation === 'arrows' || navigation === 'both'
  const showDots = navigation === 'dots' || navigation === 'both'

  return (
    <GridContainer settings={settings}>
      <div className={cn('w-full relative', className)}>
        <div {...handlers} className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={cn(
                  'flex-[0_0_100%] min-w-0',
                  'animate-in fade-in duration-1000',
                  style === 'cards' && 'px-4',
                )}
              >
                <div
                  className={cn(
                    'relative aspect-video overflow-hidden rounded-lg',
                    style === 'cards' && 'shadow-lg',
                  )}
                >
                  {slide.type === 'image' && (
                    <img
                      src={slide.url}
                      alt={slide.alt || ''}
                      className="w-full h-full object-cover"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  )}
                  {slide.type === 'video' && (
                    <video
                      src={slide.url}
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                      poster={slide.poster}
                    >
                      <track kind="captions" />
                    </video>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showArrows && (
          <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm pointer-events-auto"
              onClick={scrollPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm pointer-events-auto"
              onClick={scrollNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {showDots && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  currentSlide === index
                    ? 'bg-primary scale-125'
                    : 'bg-primary/20 hover:bg-primary/40',
                )}
                onClick={() => scrollTo(index)}
              />
            ))}
          </div>
        )}
      </div>
    </GridContainer>
  )
}

export const SliderBlock = Slider
export default Slider
