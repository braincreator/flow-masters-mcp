'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

// Block settings interfaces
export interface BlockSettings {
  padding?: {
    top?: 'none' | 'small' | 'medium' | 'large'
    bottom?: 'none' | 'small' | 'medium' | 'large'
    left?: 'none' | 'small' | 'medium' | 'large'
    right?: 'none' | 'small' | 'medium' | 'large'
  }
  margin?: {
    top?: 'none' | 'small' | 'medium' | 'large'
    bottom?: 'none' | 'small' | 'medium' | 'large'
  }
  width?: 'small' | 'medium' | 'large' | 'full'
  fullWidth?: boolean
  background?: {
    color?: string
    image?: Media
    overlay?: boolean
    overlayOpacity?: number
  }
  verticalAlign?: 'top' | 'center' | 'bottom'
  horizontalAlign?: 'left' | 'center' | 'right' | 'stretch'
  gap?: 'none' | 'small' | 'medium' | 'large'
}

export interface Media {
  url: string
  alt?: string
}

interface GridContainerProps {
  children: React.ReactNode
  settings?: BlockSettings
  className?: string
}

export function GridContainer({ children, settings, className }: GridContainerProps) {
  // Default settings
  const {
    fullWidth = false,
    width = 'medium',
    padding = { top: 'medium', bottom: 'medium', left: 'medium', right: 'medium' },
    margin = { top: 'medium', bottom: 'medium' },
    background,
    verticalAlign = 'top',
    horizontalAlign = 'left',
    gap = 'medium',
  } = settings || {}

  // Map padding values to Tailwind classes
  const paddingClasses = {
    top: {
      none: 'pt-0',
      small: 'pt-4',
      medium: 'pt-8',
      large: 'pt-16',
    },
    bottom: {
      none: 'pb-0',
      small: 'pb-4',
      medium: 'pb-8',
      large: 'pb-16',
    },
    left: {
      none: 'pl-0',
      small: 'pl-4',
      medium: 'pl-8',
      large: 'pl-16',
    },
    right: {
      none: 'pr-0',
      small: 'pr-4',
      medium: 'pr-8',
      large: 'pr-16',
    },
  }

  // Map margin values to Tailwind classes
  const marginClasses = {
    top: {
      none: 'mt-0',
      small: 'mt-4',
      medium: 'mt-8',
      large: 'mt-16',
    },
    bottom: {
      none: 'mb-0',
      small: 'mb-4',
      medium: 'mb-8',
      large: 'mb-16',
    },
  }

  // Map container width to Tailwind classes
  const containerClasses = {
    small: 'max-w-3xl',
    medium: 'max-w-5xl',
    large: 'max-w-7xl',
    full: 'max-w-full',
  }

  // Map vertical alignment to Tailwind classes
  const verticalAlignClasses = {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end',
  }

  // Map horizontal alignment to Tailwind classes
  const horizontalAlignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    stretch: 'justify-stretch',
  }

  // Map gap values to Tailwind classes
  const gapClasses = {
    none: 'gap-0',
    small: 'gap-4',
    medium: 'gap-8',
    large: 'gap-12',
  }

  return (
    <div
      className={cn(
        'relative w-full',
        marginClasses.top[margin.top || 'medium'],
        marginClasses.bottom[margin.bottom || 'medium'],
        className,
      )}
    >
      {/* Background layer */}
      {background && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {background.color && (
            <div className="absolute inset-0" style={{ backgroundColor: background.color }} />
          )}
          {background.image && (
            <div className="absolute inset-0">
              <Image
                src={background.image.url}
                alt={background.image.alt || ''}
                fill
                className="object-cover"
              />
              {background.overlay && (
                <div
                  className="absolute inset-0 bg-black"
                  style={{ opacity: background.overlayOpacity || 0.5 }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Content container */}
      <div
        className={cn(
          'mx-auto',
          fullWidth ? 'w-full' : containerClasses[width],
          paddingClasses.top[padding.top || 'medium'],
          paddingClasses.bottom[padding.bottom || 'medium'],
          paddingClasses.left[padding.left || 'medium'],
          paddingClasses.right[padding.right || 'medium'],
          verticalAlignClasses[verticalAlign],
          horizontalAlignClasses[horizontalAlign],
          gapClasses[gap],
        )}
      >
        {children}
      </div>
    </div>
  )
}
