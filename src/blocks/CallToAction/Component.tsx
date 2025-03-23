import React from 'react'
import RichText from '@/components/RichText'
import { Action } from '@/components/Action'
import { cn } from '@/utilities/ui'

type Props = {
  richText: any
  actions: any[]
  style?: 'default' | 'centered' | 'split'
  background?: 'none' | 'light' | 'dark' | 'primary'
  className?: string
}

export const CallToActionBlock: React.FC<Props> = ({
  richText,
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
        className
      )}
    >
      <div
        className={cn('container', {
          'text-center': style === 'centered',
          'grid grid-cols-2 gap-8 items-center': style === 'split',
        })}
      >
        <div className={cn({ 'max-w-2xl mx-auto': style === 'centered' })}>
          <RichText content={richText} />
        </div>
        
        {actions && actions.length > 0 && (
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
  )
}
