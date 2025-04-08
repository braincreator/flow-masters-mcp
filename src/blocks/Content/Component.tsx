import React from 'react'
import RichText from '@/components/RichText'
import { Action } from '@/components/Action'
import { cn } from '@/utilities/ui'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

type ContentBlockSettings = {
  backgroundColor?: 'transparent' | 'light' | 'dark' | 'accent'
  textAlignment?: 'left' | 'center' | 'right'
  paddingTop?: 'none' | 'small' | 'medium' | 'large'
  paddingBottom?: 'none' | 'small' | 'medium' | 'large'
  containerWidth?: 'default' | 'narrow' | 'wide' | 'full'
}

type ContentAction = {
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
}

type ContentColumn = {
  size?: 'full' | 'half' | 'oneThird' | 'twoThirds'
  richText?: SerializedEditorState
  enableActions?: boolean
  actions?: ContentAction[]
  verticalAlignment?: 'top' | 'center' | 'bottom'
  horizontalAlignment?: 'left' | 'center' | 'right'
}

interface ContentBlockProps {
  heading?: string
  subheading?: string
  columns: ContentColumn[]
  settings?: ContentBlockSettings
}

const ContentBlock: React.FC<ContentBlockProps> = ({ heading, subheading, columns, settings }) => {
  if (!columns || !Array.isArray(columns)) {
    console.warn('ContentBlock: columns is not an array or is undefined', columns)
    return null
  }

  // Настройки по умолчанию
  const {
    backgroundColor = 'transparent',
    textAlignment = 'left',
    paddingTop = 'medium',
    paddingBottom = 'medium',
    containerWidth = 'default',
  } = settings || {}

  // Классы для фона
  const backgroundClasses = {
    'bg-transparent': backgroundColor === 'transparent',
    'bg-muted': backgroundColor === 'light',
    'bg-secondary text-secondary-foreground': backgroundColor === 'dark',
    'bg-primary text-primary-foreground': backgroundColor === 'accent',
  }

  // Классы для отступов
  const paddingClasses = {
    'pt-0': paddingTop === 'none',
    'pt-4': paddingTop === 'small',
    'pt-8': paddingTop === 'medium',
    'pt-16': paddingTop === 'large',
    'pb-0': paddingBottom === 'none',
    'pb-4': paddingBottom === 'small',
    'pb-8': paddingBottom === 'medium',
    'pb-16': paddingBottom === 'large',
  }

  // Классы для ширины контейнера
  const containerClasses = {
    container: containerWidth === 'default',
    'container max-w-3xl': containerWidth === 'narrow',
    'container max-w-7xl': containerWidth === 'wide',
    'w-full px-4': containerWidth === 'full',
  }

  return (
    <section className={cn('my-16', backgroundClasses, paddingClasses)}>
      <div className={cn('mx-auto', containerClasses)}>
        {/* Заголовок и подзаголовок */}
        {(heading || subheading) && (
          <div style={{ textAlign: textAlignment }} className="mb-8">
            {heading && <h2 className="text-3xl font-bold mb-2">{heading}</h2>}
            {subheading && <p className="text-xl text-muted-foreground">{subheading}</p>}
          </div>
        )}

        {/* Колонки с контентом */}
        <div className="grid grid-cols-12 gap-y-8 gap-x-8">
          {columns.map((col, index) => {
            if (!col) {
              console.warn('ContentBlock: column is undefined at index', index)
              return null
            }

            const {
              enableActions,
              actions,
              richText,
              size = 'full',
              verticalAlignment,
              horizontalAlignment,
            } = col

            return (
              <div
                className={cn('col-span-12', {
                  'md:col-span-4 lg:col-span-4': size === 'oneThird',
                  'md:col-span-6': size === 'half',
                  'md:col-span-8': size === 'twoThirds',
                  'md:col-span-12': size === 'full',
                })}
                key={index}
              >
                <div
                  className={cn('h-full flex flex-col', {
                    'justify-start': verticalAlignment === 'top' || !verticalAlignment,
                    'justify-center': verticalAlignment === 'center',
                    'justify-end': verticalAlignment === 'bottom',
                    'items-start': horizontalAlignment === 'left' || !horizontalAlignment,
                    'items-center': horizontalAlignment === 'center',
                    'items-end': horizontalAlignment === 'right',
                  })}
                >
                  {richText && (
                    <div
                      className={cn('prose dark:prose-invert', {
                        'w-full': horizontalAlignment === 'center',
                        'text-left': horizontalAlignment === 'left' || !horizontalAlignment,
                        'text-center': horizontalAlignment === 'center',
                        'text-right': horizontalAlignment === 'right',
                      })}
                    >
                      <RichText data={richText} />
                    </div>
                  )}
                  {enableActions && actions && actions.length > 0 && (
                    <div
                      className={cn('mt-6 flex flex-wrap gap-4', {
                        'justify-start': horizontalAlignment === 'left' || !horizontalAlignment,
                        'justify-center': horizontalAlignment === 'center',
                        'justify-end': horizontalAlignment === 'right',
                      })}
                    >
                      {actions.map((action, i) => (
                        <Action key={i} {...action} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export { ContentBlock }
