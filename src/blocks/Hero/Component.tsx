import React from 'react'
import RichText from '@/components/RichText'
import { Action } from '@/components/Action'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

type HeroBlockProps = {
  title?: string
  content?: any
  media?: {
    url: string
    alt: string
    width: number
    height: number
  }
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
  }[]
}

export const HeroBlock: React.FC<HeroBlockProps> = ({ 
  title,
  content,
  media,
  actions 
}) => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
        <div className="space-y-6">
          {title && (
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {title}
            </h1>
          )}
          
          {content && (
            <div className="prose prose-lg">
              <RichText data={content} />
            </div>
          )}

          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {actions.map((action, i) => (
                <Action 
                  key={i} 
                  {...action} 
                  className={cn(
                    i === 0 && "bg-primary text-primary-foreground hover:bg-primary/90",
                    i !== 0 && "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {media && (
          <div className="relative aspect-square lg:aspect-auto">
            <Media 
              {...media}
              className="rounded-lg object-cover"
              fill
              priority
            />
          </div>
        )}
      </div>
    </div>
  )
}