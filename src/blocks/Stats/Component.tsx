'use client'

import React from 'react'
import { StatsBlock } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { cn } from '@/utilities/ui'

export const StatsBlock: React.FC<StatsBlock> = ({
  heading,
  subheading,
  stats,
  columns = 4,
  settings,
}) => {
  // Map columns to column classes
  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
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

      {/* Stats grid */}
      <div className={cn('grid gap-8', columnClasses[columns])}>
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-6 rounded-lg border border-border bg-card"
          >
            {/* Icon if present */}
            {stat.icon && (
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <span className="text-2xl">{stat.icon}</span>
              </div>
            )}

            {/* Value */}
            <div className="text-4xl font-bold mb-2">{stat.value}</div>

            {/* Label */}
            <div className="text-lg font-medium mb-2 text-foreground">{stat.label}</div>

            {/* Description */}
            {stat.description && (
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            )}
          </div>
        ))}
      </div>
    </GridContainer>
  )
}
