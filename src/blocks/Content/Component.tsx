import React from 'react'
import RichText from '@/components/RichText' // Changed from { RichText }
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

export const ContentBlock: React.FC<ContentBlockProps> = ({ columns }) => {
  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <div className="container my-16">
      <div className="grid grid-cols-12 gap-y-8 gap-x-8">
        {columns?.map((col, index) => {
          const { enableActions, actions, richText, size } = col

          return (
            <div
              className={cn(`col-span-12 md:col-span-${colsSpanClasses[size!]}`, {
                'lg:col-span-4': size === 'oneThird',
                'lg:col-span-6': size === 'half',
                'lg:col-span-8': size === 'twoThirds',
                'lg:col-span-12': size === 'full',
              })}
              key={index}
            >
              {richText && <RichText data={richText} enableGutter={false} />}
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
