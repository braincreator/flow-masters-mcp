import React from 'react'
import RichText from '@/components/RichText'
import { Action } from '@/components/Action'
import { cn } from '@/utilities/ui'

type CTABlockProps = {
  content?: any
  actions?: {
    actionType: 'link'
    label: string
    type: 'reference' | 'custom'
    reference?: {
      relationTo: 'pages' | 'posts'
      value: string | { slug: string }
    }
    url?: string
    appearance?: 'default' | 'outline'
    newTab?: boolean
    icon?: 'none'
  }[]
}

export const CTABlock: React.FC<CTABlockProps> = ({ content, actions }) => {
  return (
    <div className="container mx-auto px-4 py-12">
      {content && (
        <div className="prose mx-auto max-w-[65ch] text-center">
          <RichText data={content} />
        </div>
      )}
      
      {actions && actions.length > 0 && (
        <div className={cn(
          "mt-8 flex flex-wrap items-center justify-center gap-4",
          !content && "mt-0"
        )}>
          {actions.map((action, i) => (
            <Action key={i} {...action} />
          ))}
        </div>
      )}
    </div>
  )
}