import React from 'react'
import { cn } from '@/utilities/ui'
import RichText from '@/components/RichText'
import { Action } from '@/components/Action'
import { SerializedEditorState } from '@payloadcms/richtext-lexical'

type CallToActionStyle = 'default' | 'centered' | 'split'
type CallToActionBackground = 'none' | 'light' | 'dark' | 'primary'

export interface CallToActionBlockProps {
  content?: SerializedEditorState
  actions?: {
    actionType: 'link' | 'button'
    label: string
    type?: 'reference' | 'custom'
    reference?: {
      relationTo: 'pages' | 'posts'
      value: string | { slug: string }
    }
    url?: string
    appearance?: 'default' | 'outline'
    newTab?: boolean
  }[]
  style?: CallToActionStyle
  background?: CallToActionBackground
  className?: string
}

export const CallToActionBlock: React.FC<CallToActionBlockProps> = ({
  content,
  actions,
  style = 'default',
  background = 'none',
  className,
}) => {
  return (
    <div
      className={cn(
        'py-12',
        {
          'bg-background': background === 'none',
          'bg-muted': background === 'light',
          'bg-secondary/90 text-secondary-foreground': background === 'dark',
          'bg-primary text-primary-foreground': background === 'primary',
        },
        className,
      )}
    >
      <div
        className={cn('container', {
          'text-center': style === 'centered',
          'grid grid-cols-2 gap-8 items-center': style === 'split',
        })}
      >
        <div className={cn({ 'max-w-2xl mx-auto': style === 'centered' })}>
          {content && <RichText data={content} />}
          {Array.isArray(actions) && actions.length > 0 && (
            <div
              className={cn('mt-8 flex gap-4', {
                'justify-center': style === 'centered',
                'flex-col sm:flex-row': style === 'default',
              })}
            >
              {actions.map((action, i) => (
                <Action
                  key={i}
                  {...action}
                  className={cn({
                    'w-full sm:w-auto': style === 'default',
                  })}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
