import React from 'react'
import { GridContainer } from '@/components/GridContainer'
import type { BlockquoteBlock as BlockquoteBlockType } from '@/types/blocks'
import { cn } from '@/lib/utils'

type BlockquoteAlignment = 'left' | 'center' | 'right'

const alignmentStyles: Record<BlockquoteAlignment, string> = {
  left: 'text-left border-l-4 border-primary pl-6',
  center: 'text-center border-l-0 border-t-4 border-b-4 py-6 px-6',
  right: 'text-right border-l-0 border-r-4 pr-6 pl-0',
}

interface BlockquoteProps extends BlockquoteBlockType {
  className?: string
}

export const Blockquote: React.FC<BlockquoteProps> = ({
  quote,
  author,
  source,
  alignment = 'left',
  settings,
  className,
}) => {
  return (
    <GridContainer settings={settings}>
      <figure className={cn('w-full max-w-3xl mx-auto my-8', className)}>
        <blockquote
          className={cn(
            'relative text-xl md:text-2xl italic font-medium py-2',
            alignmentStyles[alignment as BlockquoteAlignment],
          )}
        >
          <span className="text-4xl text-primary absolute -top-4 -left-1 opacity-20 transition-opacity hover:opacity-40">
            "
          </span>
          <p className="relative z-10">{quote}</p>
          <span className="text-4xl text-primary absolute -bottom-10 -right-1 opacity-20 transition-opacity hover:opacity-40">
            "
          </span>
        </blockquote>

        {(author || source) && (
          <figcaption
            className={cn(
              'mt-4 text-sm text-muted-foreground',
              alignmentStyles[alignment as BlockquoteAlignment],
            )}
          >
            {author && <span className="font-medium">{author}</span>}
            {author && source && <span className="mx-1">—</span>}
            {source && <cite className="not-italic">{source}</cite>}
          </figcaption>
        )}
      </figure>
    </GridContainer>
  )
}

export const BlockquoteBlock = Blockquote
export default Blockquote
