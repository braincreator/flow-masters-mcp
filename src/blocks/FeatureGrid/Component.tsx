'use client'

import React from 'react'
import { FeatureGridBlock } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { cn } from '@/utilities/ui'
import { Action } from '@/components/Action'
import Image from 'next/image'

export const FeatureGridBlock: React.FC<FeatureGridBlock> = ({
  heading,
  subheading,
  features,
  columns = 3,
  settings,
}) => {
  // Map columns to column classes
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <GridContainer settings={settings}>
      {/* Section heading */}
      {(heading || subheading) && (
        <div className="text-center mb-12">
          {heading && <h2 className="text-3xl font-bold mb-4">{heading}</h2>}
          {subheading && <p className="text-lg text-muted-foreground">{subheading}</p>}
        </div>
      )}

      {/* Features grid */}
      <div className={cn('grid gap-8', columnClasses[columns])}>
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col p-6 rounded-lg border border-border bg-card">
            {/* Feature image or icon */}
            {feature.media && (
              <div className="mb-4 overflow-hidden rounded-md">
                <Image
                  src={feature.media.url}
                  alt={feature.media.alt || feature.title || ''}
                  width={feature.media.width || 400}
                  height={feature.media.height || 300}
                  className="object-cover w-full h-auto"
                />
              </div>
            )}
            {!feature.media && feature.icon && (
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary mb-4">
                <span className="text-2xl">{feature.icon}</span>
              </div>
            )}

            {/* Feature content */}
            <div className="flex-1">
              {feature.title && <h3 className="text-xl font-medium mb-2">{feature.title}</h3>}
              {feature.description && (
                <p className="text-muted-foreground mb-4">{feature.description}</p>
              )}
            </div>

            {/* Feature actions */}
            {feature.actions && feature.actions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {feature.actions.map((action, i) => (
                  <Action key={i} {...action} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </GridContainer>
  )
}
