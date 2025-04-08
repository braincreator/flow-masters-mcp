import React from 'react'
import { cn } from '@/utilities/ui'
import RichText from '@/components/RichText'
import { Action } from '@/components/Action'
import { SerializedEditorState } from '@payloadcms/richtext-lexical'

type CallToActionStyle = 'default' | 'centered'
type CallToActionBackground = 'none' | 'light' | 'dark'

export interface CallToActionBlockProps {
  richText?: SerializedEditorState
  actions?: {
    link: {
      type?: 'reference' | 'custom'
      label: string
      reference?: {
        relationTo: 'pages' | 'posts'
        value: string
      }
      url?: string
      newTab?: boolean
      appearance?: 'default' | 'outline'
    }
  }[]
  style?: CallToActionStyle
  background?: CallToActionBackground
  className?: string
}

export const CallToActionBlock: React.FC<CallToActionBlockProps> = ({
  richText,
  actions,
  style = 'default',
  background = 'none',
  className,
}) => {
  return (
    <div
      className={cn(
        'py-10',
        {
          'text-center': style === 'centered',
          'bg-gray-50 dark:bg-gray-900': background === 'light',
          'bg-gray-900 dark:bg-gray-800 text-white': background === 'dark',
        },
        className,
      )}
    >
      <div className="container">
        <div className="max-w-2xl mx-auto">
          {richText && <RichText data={richText} />}
          {Array.isArray(actions) && actions.length > 0 && (
            <ul className={cn('mt-6 flex gap-4', style === 'centered' && 'justify-center')}>
              {actions.map((action, i) => (
                <li key={i}>
                  <Action {...action} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
