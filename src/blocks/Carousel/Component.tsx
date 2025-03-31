'use client'

import React, { useState, useEffect } from 'react'
import { CarouselBlock } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import Image from 'next/image'
import { Action } from '@/components/Action'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselIndicators,
} from '@/components/ui/carousel'

export const CarouselBlock: React.FC<CarouselBlock> = ({
  items,
  autoplay = true,
  interval = 5000,
  showControls = true,
  showIndicators = true,
  settings,
}) => {
  const [api, setApi] = useState<any>(null)

  // Setup autoplay
  useEffect(() => {
    if (!api || !autoplay) return

    const intervalId = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext()
      } else {
        api.scrollTo(0)
      }
    }, interval)

    return () => clearInterval(intervalId)
  }, [api, autoplay, interval])

  if (!items || items.length === 0) return null

  return (
    <GridContainer settings={settings}>
      <div className="w-full py-4">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {items.map((item, index) => (
              <CarouselItem key={index}>
                <div className="relative flex flex-col md:flex-row rounded-lg overflow-hidden border border-border">
                  {/* Item media */}
                  {item.media && (
                    <div className="md:w-1/2 overflow-hidden">
                      <Image
                        src={item.media.url}
                        alt={item.media.alt || item.heading || ''}
                        width={item.media.width || 800}
                        height={item.media.height || 600}
                        className="w-full h-[300px] md:h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Item content */}
                  <div
                    className={cn(
                      'flex flex-col justify-center p-8',
                      item.media ? 'md:w-1/2' : 'w-full',
                    )}
                  >
                    {item.heading && <h3 className="text-2xl font-bold mb-2">{item.heading}</h3>}

                    {item.caption && <p className="text-muted-foreground mb-4">{item.caption}</p>}

                    {typeof item.content === 'string' ? (
                      <p>{item.content}</p>
                    ) : item.content ? (
                      <RichText data={item.content} />
                    ) : null}

                    {/* Item actions */}
                    {item.actions && item.actions.length > 0 && (
                      <div className="mt-6 flex flex-wrap gap-3">
                        {item.actions.map((action, i) => (
                          <Action key={i} {...action} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {showControls && (
            <>
              <CarouselPrevious className="md:-left-12 bg-background" />
              <CarouselNext className="md:-right-12 bg-background" />
            </>
          )}
        </Carousel>

        {showIndicators && <CarouselIndicators className="mt-4" count={items.length} />}
      </div>
    </GridContainer>
  )
}
