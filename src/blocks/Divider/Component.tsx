'use client'

import React from 'react'
import { DividerBlock } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { cn } from '@/utilities/ui'

export const DividerBlock: React.FC<DividerBlock> = ({
  style = 'solid',
  color,
  width = 'full',
  settings,
}) => {
  // Map width values to max-width classes
  const widthClasses = {
    narrow: 'max-w-xs',
    medium: 'max-w-md',
    wide: 'max-w-3xl',
    full: 'max-w-none',
  }

  // Map style to border style
  const borderStyles = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  }

  return (
    <GridContainer settings={settings}>
      <div className="w-full flex justify-center">
        <hr
          className={cn('w-full border-t', borderStyles[style], widthClasses[width])}
          style={{ borderColor: color || 'var(--border)' }}
        />
      </div>
    </GridContainer>
  )
}
