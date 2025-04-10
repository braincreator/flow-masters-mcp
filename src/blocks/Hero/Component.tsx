'use client'

import React from 'react'
import Image from 'next/image'
import { GridContainer } from '@/components/GridContainer'
import { RichText } from '@/components/RichText'
import { Button } from '@/components/ui/button'
import type { HeroBlock as HeroBlockType } from '@/types/blocks'
import { cn } from '@/lib/utils'

type HeroLayout = 'default' | 'centered' | 'split' | 'minimal'
type HeroSize = 'sm' | 'md' | 'lg' | 'xl'

const layoutStyles: Record<HeroLayout, string> = {
  default: 'flex flex-col lg:flex-row items-center gap-8 lg:gap-12',
  centered: 'flex flex-col items-center text-center max-w-3xl mx-auto',
  split: 'grid lg:grid-cols-2 items-center gap-8 lg:gap-12',
  minimal: 'flex flex-col items-center text-center max-w-2xl mx-auto',
}

const sizeStyles: Record<HeroSize, string> = {
  sm: 'py-12',
  md: 'py-16',
  lg: 'py-20',
  xl: 'py-24',
}

interface HeroProps extends HeroBlockType {
  className?: string
  layout?: HeroLayout
  size?: HeroSize
}

export const Hero: React.FC<HeroProps> = ({
  heading,
  description,
  media,
  actions,
  settings,
  className,
  layout = 'default',
  size = 'lg',
}) => {
  const hasMedia = media && media.url
  const hasActions = actions && actions.length > 0

  return (
    <GridContainer settings={settings}>
      <div className={cn('relative w-full overflow-hidden', sizeStyles[size], className)}>
        {/* Градиент фона */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background/0" />

        <div className={cn(layoutStyles[layout])}>
          <div className="relative z-10 flex-1 animate-in slide-in-from-left duration-700">
            {heading && (
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6 animate-in fade-in duration-500">
                {heading}
              </h1>
            )}

            {description && (
              <div className="text-xl text-muted-foreground mb-8 animate-in fade-in duration-500 delay-150">
                <RichText content={description} />
              </div>
            )}

            {hasActions && (
              <div className="flex flex-wrap gap-4 animate-in fade-in duration-500 delay-300">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.style === 'secondary' ? 'secondary' : 'default'}
                    size="lg"
                    href={action.href}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {hasMedia && layout !== 'minimal' && (
            <div
              className={cn(
                'relative flex-1 animate-in slide-in-from-right duration-700',
                layout === 'centered' && 'w-full max-w-2xl mx-auto',
              )}
            >
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={media.url}
                  alt={media.alt || ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </GridContainer>
  )
}

export const HeroBlock = Hero
export default Hero
