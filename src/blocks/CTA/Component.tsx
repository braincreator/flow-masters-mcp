import React from 'react'
import { RichText } from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { BaseBlock } from '@/components/BaseBlock'
import type { CTABlock as CTABlockType } from '@/types/blocks'
import type { BlockStyleProps } from '@/types/block-styles'
import { blockSizeStyles, blockStyleVariants, blockAnimationStyles } from '@/styles/block-styles'
import { cn } from '@/lib/utils'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface CTAProps extends CTABlockType, BlockStyleProps {}

export const CTA: React.FC<CTAProps> = ({
  heading,
  content,
  actions,
  settings,
  className,
  style = 'default',
  size = 'md',
}) => {
  const sizeVariant = blockSizeStyles[size]
  const styleVariant = blockStyleVariants[style] || blockStyleVariants.default

  if (!blockStyleVariants[style]) {
    logWarn(`[CTA Block] Invalid style '${style}' provided. Falling back to default style.`)
  }

  return (
    <BaseBlock settings={settings}>
      <div
        className={cn(
          'w-full rounded-lg px-6',
          styleVariant.background,
          styleVariant.text,
          styleVariant.border,
          styleVariant.shadow,
          sizeVariant.container,
          style === 'gradient' && 'relative overflow-hidden',
          className,
        )}
      >
        {style === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent mix-blend-overlay" />
        )}

        <div className="relative text-center">
          <div className={cn('mx-auto space-y-4', blockAnimationStyles.slideUp)}>
            {heading && <h2 className={cn(sizeVariant.title, 'max-w-3xl mx-auto')}>{heading}</h2>}

            {content && (
              <div className={cn(sizeVariant.content, 'max-w-2xl mx-auto')}>
                <RichText content={content} />
              </div>
            )}

            {actions && (
              <div className="flex justify-center items-center gap-4 pt-4">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.style === 'secondary' ? 'secondary' : 'default'}
                    href={action.href}
                    className={cn(
                      'group',
                      style === 'default' || style === 'gradient'
                        ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                        : '',
                    )}
                  >
                    {action.label}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseBlock>
  )
}

export const CTABlock = CTA
export default CTA
