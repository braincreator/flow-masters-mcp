import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { BaseBlock } from '@/components/BaseBlock'
import type { CardBlock as CardBlockType } from '@/types/blocks'
import type { BlockStyleProps } from '@/types/block-styles'
import {
  blockSizeStyles,
  blockStyleVariants,
  blockHoverStyles,
  blockAnimationStyles,
} from '@/styles/block-styles'
import { cn } from '@/lib/utils'

interface CardProps extends CardBlockType, BlockStyleProps {
  isLink?: boolean
}

export const Card: React.FC<CardProps> = ({
  title,
  content,
  media,
  action,
  settings,
  className,
  style = 'default',
  size = 'md',
  hover = 'none',
  isLink = false,
}) => {
  const sizeVariant = blockSizeStyles[size]
  const styleVariant = blockStyleVariants[style]
  const CardWrapper = isLink ? Link : 'div'
  const wrapperProps = isLink ? { href: action?.href || '#' } : {}

  const cardContent = (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden',
        styleVariant.background,
        styleVariant.text,
        styleVariant.border,
        styleVariant.shadow,
        blockHoverStyles[hover],
        sizeVariant.container,
        className,
      )}
    >
      {media?.url && (
        <div className={cn('relative w-full mb-6 overflow-hidden rounded-md aspect-[16/10]')}>
          <Image
            src={media.url}
            alt={media.alt || ''}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      <div className={cn('space-y-4', blockAnimationStyles.fadeIn)}>
        {title && <h3 className={sizeVariant.title}>{title}</h3>}

        {content && (
          <div className={sizeVariant.content}>
            <RichText content={content} />
          </div>
        )}

        {action && !isLink && (
          <div className="pt-2">
            <Button
              variant={action.style === 'secondary' ? 'outline' : 'default'}
              href={action.href}
              className="group"
            >
              {action.label}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <BaseBlock settings={settings}>
      <CardWrapper
        {...wrapperProps}
        className={cn(
          'block group',
          isLink &&
            'hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        )}
      >
        {cardContent}
      </CardWrapper>
    </BaseBlock>
  )
}

export const CardBlock = Card
export default Card
