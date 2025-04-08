import React from 'react'
import RichText from '@/components/RichText'
import { Action } from '@/components/Action'
import { cn } from '@/utilities/ui'

type ContentBlockProps = {
  columns: {
    size?: 'full' | 'half' | 'oneThird' | 'twoThirds'
    richText?: any
    enableActions?: boolean
    actions?: any[]
  }[]
}

const ContentBlock: React.FC<ContentBlockProps> = ({ columns }) => {
  if (!columns || !Array.isArray(columns)) {
    console.warn('ContentBlock: columns is not an array or is undefined', columns)
    return null
  }

  return (
    <div className="container my-16">
      <div className="grid grid-cols-12 gap-y-8 gap-x-8">
        {columns.map((col, index) => {
          if (!col) {
            console.warn('ContentBlock: column is undefined at index', index)
            return null
          }

          const { enableActions, actions, richText, size = 'full' } = col

          return (
            <div
              className={cn('col-span-12', {
                'md:col-span-4': size === 'oneThird',
                'md:col-span-6': size === 'half',
                'md:col-span-8': size === 'twoThirds',
                'md:col-span-12': size === 'full',
              })}
              key={index}
            >
              {richText && (
                <div className="prose dark:prose-invert max-w-none">
                  <RichText data={richText} />
                </div>
              )}
              {enableActions && actions && actions.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-4">
                  {actions.map((action, i) => (
                    <Action key={i} {...action} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ContentBlock }
export default ContentBlock
