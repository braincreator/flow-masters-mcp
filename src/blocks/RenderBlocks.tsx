import React from 'react'
import dynamic from 'next/dynamic'

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
  if (!Array.isArray(blocks)) return null

  return (
    <>
      {blocks.map((block, i) => {
        const Block = blockComponents[block.blockType]
        if (!Block) return null
        return <Block key={i} {...block} />
      })}
    </>
  )
}
