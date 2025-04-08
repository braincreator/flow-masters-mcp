import React from 'react'
import dynamic from 'next/dynamic'

// Fix imports to handle both default and named exports
const ContentBlock = dynamic(() => import('./Content/Component').then((mod) => mod.ContentBlock))
const CTABlock = dynamic(() => import('./CTA/Component').then((mod) => mod.CTABlock))
const HeroBlock = dynamic(() => import('./Hero/Component').then((mod) => mod.HeroBlock))
const BlogBlock = dynamic(() => import('./Blog/Component').then((mod) => mod.BlogBlock))

const blockComponents = {
  content: ContentBlock,
  cta: CTABlock,
  hero: HeroBlock,
  blog: BlogBlock,
} as const

type Props = {
  blocks?: {
    blockType: keyof typeof blockComponents
    [key: string]: any
  }[]
}

export const RenderBlocks: React.FC<Props> = ({ blocks = [] }) => {
  if (!Array.isArray(blocks)) {
    console.warn('RenderBlocks: blocks is not an array', blocks)
    return null
  }

  if (blocks.length === 0) {
    console.info('RenderBlocks: blocks array is empty')
  }

  return (
    <>
      {blocks.map((block, i) => {
        const blockType = block.blockType
        const Block = blockComponents[blockType]

        if (!Block) {
          console.warn(`RenderBlocks: No component found for blockType '${blockType}'`, block)
          return (
            <div key={i} className="p-4 border border-red-300 bg-red-50 text-red-700 rounded my-4">
              <p>Unknown block type: {blockType}</p>
            </div>
          )
        }

        try {
          return <Block key={i} {...block} />
        } catch (error) {
          console.error(`Error rendering block of type '${blockType}':`, error)
          return (
            <div key={i} className="p-4 border border-red-300 bg-red-50 text-red-700 rounded my-4">
              <p>Error rendering {blockType} block</p>
            </div>
          )
        }
      })}
    </>
  )
}
