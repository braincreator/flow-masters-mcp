import React from 'react'
import { GridContainer } from '@/components/GridContainer'
import { BlockquoteBlock } from '@/types/blocks'
import { cn } from '@/lib/utils'

export const BlockquoteBlock: React.FC<BlockquoteBlock> = ({
  quote,
  author,
  source,
  alignment = 'left',
  settings,
}) => {
  return (
    <GridContainer settings={settings}>
      <figure className="w-full max-w-3xl mx-auto my-8">
        <blockquote
          className={cn(
            'relative text-xl md:text-2xl italic font-medium border-l-4 border-primary pl-6 py-2',
            {
              'text-left': alignment === 'left',
              'text-center border-l-0 border-t-4 border-b-4 py-6 px-6': alignment === 'center',
              'text-right border-l-0 border-r-4 pr-6 pl-0': alignment === 'right',
            },
          )}
        >
          <span className="text-4xl text-primary absolute -top-4 -left-1 opacity-20">"</span>
          <p>{quote}</p>
          <span className="text-4xl text-primary absolute -bottom-10 -right-1 opacity-20">"</span>
        </blockquote>

        {(author || source) && (
          <figcaption
            className={cn('mt-4 text-sm text-muted-foreground', {
              'text-left': alignment === 'left',
              'text-center': alignment === 'center',
              'text-right': alignment === 'right',
            })}
          >
            {author && <span className="font-medium">{author}</span>}
            {author && source && <span>, </span>}
            {source && <cite>{source}</cite>}
          </figcaption>
        )}
      </figure>
    </GridContainer>
  )
}
