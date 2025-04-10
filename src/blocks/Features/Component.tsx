'use client'

import React from 'react'
import Image from 'next/image'
import { FeaturesBlock } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { RichText } from '@/components/RichText'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Icons } from '@/components/ui/icons'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

type FeatureLayout = 'grid' | 'list' | 'carousel'
type FeatureSize = 'small' | 'medium' | 'large'

const layoutStyles: Record<FeatureLayout, string> = {
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
  list: 'space-y-8',
  carousel: 'flex overflow-x-auto snap-x snap-mandatory -mx-4 px-4 py-4 gap-6',
}

const sizeStyles: Record<FeatureSize, string> = {
  small: 'max-w-sm',
  medium: 'max-w-md',
  large: 'max-w-lg',
}

interface FeaturesProps extends FeaturesBlock {
  className?: string
  layout?: FeatureLayout
  size?: FeatureSize
}

const variants = {
  grid: {
    container: 'grid gap-8',
    cols: {
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-3',
      4: 'md:grid-cols-2 lg:grid-cols-4',
    },
    item: 'flex flex-col items-start p-6 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow duration-200',
    icon: 'mb-4 h-12 w-12 text-primary',
  },
  list: {
    container: 'space-y-8',
    item: 'flex gap-6 items-start p-6 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow duration-200',
    icon: 'h-8 w-8 text-primary shrink-0 mt-1',
  },
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export const Features: React.FC<FeaturesProps> = ({
  heading,
  description,
  features,
  layout = 'grid',
  size = 'medium',
  settings,
  className,
}) => {
  return (
    <GridContainer settings={settings}>
      <div className={cn('space-y-12', className)}>
        {(heading || description) && (
          <motion.div
            className="text-center max-w-3xl mx-auto space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {heading && <h2 className="text-3xl font-bold tracking-tight">{heading}</h2>}
            {description && (
              <div className="text-lg text-muted-foreground">
                <RichText data={description as SerializedEditorState} />
              </div>
            )}
          </motion.div>
        )}

        <div className={cn(layoutStyles[layout])}>
          {features.map((feature, index) => {
            const Icon = feature.icon ? Icons[feature.icon] : null

            return (
              <motion.div
                key={index}
                className={cn(
                  'group relative p-6 rounded-lg border bg-card transition-all duration-300 hover:shadow-lg',
                  sizeStyles[size],
                  layout === 'carousel' &&
                    'snap-center flex-shrink-0 w-[calc(100vw-2rem)] md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)]',
                  'animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both',
                  { 'delay-150': index === 1, 'delay-300': index === 2 },
                )}
              >
                {Icon && (
                  <div className="mb-4 text-primary transition-transform group-hover:scale-110">
                    <Icon className={variants[layout].icon} />
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  {feature.description && (
                    <div className="text-muted-foreground">
                      <RichText data={feature.description as SerializedEditorState} />
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </GridContainer>
  )
}

export default Features
