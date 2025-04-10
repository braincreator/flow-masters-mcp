'use client'

import React from 'react'
import type { ContentBlock as ContentBlockType } from '@/types/blocks'
import { GridContainer } from '@/components/GridContainer'
import { RichText } from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

type ContentStyle = 'default' | 'narrow' | 'wide'

const contentStyles: Record<ContentStyle, string> = {
  default: 'max-w-4xl',
  narrow: 'max-w-2xl',
  wide: 'max-w-6xl',
}

interface ContentProps extends ContentBlockType {
  className?: string
  style?: ContentStyle
}

const columnSizeClasses = {
  full: 'col-span-12',
  half: 'col-span-12 md:col-span-6',
  oneThird: 'col-span-12 md:col-span-4',
  twoThirds: 'col-span-12 md:col-span-8',
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export const Content: React.FC<ContentProps> = ({
  columns,
  settings,
  className,
  style = 'default',
}) => {
  return (
    <GridContainer settings={settings}>
      <div
        className={cn(
          'w-full mx-auto my-8 animate-in fade-in duration-500 slide-in-from-bottom-4',
          contentStyles[style],
          className,
        )}
      >
        <div className="grid grid-cols-12 gap-8">
          {columns.map((column, index) => (
            <motion.div
              key={index}
              className={cn(columnSizeClasses[column.size || 'full'], 'space-y-6')}
              {...fadeInUp}
              transition={{ delay: index * 0.2 }}
            >
              {column.richText && (
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <RichText data={column.richText as SerializedEditorState} />
                </div>
              )}

              {column.enableActions && column.actions && column.actions.length > 0 && (
                <motion.div
                  className="flex flex-wrap gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                >
                  {column.actions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      variant={action.style === 'secondary' ? 'secondary' : 'default'}
                      size="lg"
                      href={action.href}
                    >
                      {action.label}
                    </Button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </GridContainer>
  )
}

export const ContentBlock = Content
export default Content
