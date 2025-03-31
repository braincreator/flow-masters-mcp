'use client'

import React from 'react'
import { ContainerBlock } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { RenderBlocks } from '@/blocks/RenderBlocks'

export const ContainerBlock: React.FC<ContainerBlock> = ({ blocks, settings }) => {
  return (
    <GridContainer settings={settings} className="container-block">
      <RenderBlocks blocks={blocks} />
    </GridContainer>
  )
}
