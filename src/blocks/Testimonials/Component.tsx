"use client"
'use client'

import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import { BaseBlock } from '@/components/BaseBlock'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import type { TestimonialsBlock as TestimonialsBlockType } from '@/types/blocks'
import type { BlockStyleProps } from '@/types/block-styles'
import { blockSizeStyles, blockStyleVariants, blockAnimationStyles } from '@/styles/block-styles'
import { cn } from '@/lib/utils'
import { useSwipeable } from 'react-swipeable'

const gridColumns = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
}

interface TestimonialsProps extends TestimonialsBlockType, BlockStyleProps {}

const TestimonialCard = ({ item, style = 'card' }) => {
  const renderRating = () => {
    if (!item.rating) return null
    return (
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              i < (item.rating || 0) ? 'fill-primary text-primary' : 'fill-muted text-muted',
            )}
          />
        ))}
      </div>
    )
  }

  if (style === 'minimal') {
    return (
      <div className="space-y-4">
        {renderRating()}
        <blockquote className="text-lg text-muted-foreground italic">"{item.content}"</blockquote>
        <footer className="flex items-center gap-4">
          {item.avatar?.url && (
            <Image
              src={item.avatar.url}
              alt={item.avatar.alt || `${item.author}'s avatar`}
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <div>
            <cite className="not-italic font-medium">{item.author}</cite>
            {(item.role || item.company) && (
              <p className="text-sm text-muted-foreground">
                {[item.role, item.company].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>
        </footer>
      </div>
    )
  }

  if (style === 'quote') {
    return (
      <figure className="relative">
        <svg
          className="absolute -top-6 -left-6 h-16 w-16 text-muted-foreground/20"
          fill="currentColor"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
        </svg>
        <blockquote className="relative space-y-6">
          <p className="text-xl leading-relaxed">{item.content}</p>
          <footer>
            <div className="flex items-center gap-4">
              {item.avatar?.url && (
                <Image
                  src={item.avatar.url}
                  alt={item.avatar.alt || `${item.author}'s avatar`}
                  width={56}
                  height={56}
                  className="rounded-full"
                />
              )}
              <div>
                <cite className="not-italic font-semibold text-lg">{item.author}</cite>
                {(item.role || item.company) && (
                  <p className="text-muted-foreground">
                    {[item.role, item.company].filter(Boolean).join(' • ')}
                  </p>
                )}
              </div>
            </div>
          </footer>
        </blockquote>
      </figure>
    )
  }

  return (
    <div className="relative h-full rounded-lg border bg-card p-6 shadow-sm">
      {renderRating()}
      <blockquote className="space-y-4">
        <p className="text-muted-foreground">{item.content}</p>
        <footer className="flex items-center gap-4">
          {item.avatar?.url && (
            <Image
              src={item.avatar.url}
              alt={item.avatar.alt || `${item.author}'s avatar`}
              width={48}
              height={48}
              className="rounded-full"
            />
          )}
          <div>
            <cite className="not-italic font-medium">{item.author}</cite>
            {(item.role || item.company) && (
              <p className="text-sm text-muted-foreground">
                {[item.role, item.company].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>
        </footer>
      </blockquote>
    </div>
  )
}

export const Testimonials: React.FC<TestimonialsProps> = ({
  heading,
  description,
  items,
  settings,
  className,
  style = 'default',
  size = 'md',
  layout = 'grid',
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const sizeVariant = blockSizeStyles[size]
  const styleVariant = blockStyleVariants[style]

  const handlePrevious = useCallback(() => {
    setActiveIndex((current) => (current === 0 ? items.length - 1 : current - 1))
  }, [items.length])

  const handleNext = useCallback(() => {
    setActiveIndex((current) => (current === items.length - 1 ? 0 : current + 1))
  }, [items.length])

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrevious,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  })

  const renderHeader = () => {
    if (!heading && !description) return null
    return (
      <div className="text-center mb-12 space-y-4">
        {heading && (
          <h2 className={cn('font-bold tracking-tight', sizeVariant.title)}>{heading}</h2>
        )}
        {description && (
          <p className={cn('mx-auto max-w-2xl', sizeVariant.content)}>{description}</p>
        )}
      </div>
    )
  }

  const renderGrid = () => (
    <div className={cn('grid gap-8', gridColumns[Math.min(items.length, 3)])}>
      {items.map((item, index) => (
        <div
          key={index}
          className={blockAnimationStyles.fadeIn}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <TestimonialCard item={item} style={style} />
        </div>
      ))}
    </div>
  )

  const renderCarousel = () => (
    <div className="relative" {...swipeHandlers}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div key={index} className="w-full flex-shrink-0 px-4">
              <TestimonialCard item={item} style={style} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" className="rounded-full" onClick={handlePrevious}>
          <span className="sr-only">Previous testimonial</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
        <div className="flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                index === activeIndex ? 'bg-primary' : 'bg-primary/20',
              )}
              onClick={() => setActiveIndex(index)}
            >
              <span className="sr-only">Go to testimonial {index + 1}</span>
            </button>
          ))}
        </div>
        <Button variant="outline" size="icon" className="rounded-full" onClick={handleNext}>
          <span className="sr-only">Next testimonial</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  )

  const renderFeatured = () => (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <TestimonialCard item={items[0]} style="quote" />
      </div>
      <div className="space-y-8">
        {items.slice(1, 3).map((item, index) => (
          <TestimonialCard key={index} item={item} style="minimal" />
        ))}
      </div>
    </div>
  )

  const renderContent = () => {
    switch (layout) {
      case 'carousel':
        return renderCarousel()
      case 'featured':
        return renderFeatured()
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
        {renderHeader()}
        {renderContent()}
      </div>
    </BaseBlock>
  )
}

export const TestimonialsBlock = Testimonials
export default Testimonials
