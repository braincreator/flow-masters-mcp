import React from 'react'
import { cn } from '@/lib/utils'
import { BlockSize, BlockStyle, BlockBackground, BlockAnimation } from '@/types/blocks'

export interface BaseBlockProps {
  children: React.ReactNode
  size?: BlockSize
  style?: BlockStyle
  background?: BlockBackground
  animation?: BlockAnimation
  className?: string
  settings?: any
}

export const BaseBlock: React.FC<BaseBlockProps> = ({
  children,
  size = 'md',
  style = 'default',
  background = 'none',
  animation = 'none',
  className,
}) => {
  return (
    <div
      className={cn(
        'relative w-full',
        {
          'py-6': size === 'sm',
          'py-10': size === 'md',
          'py-16': size === 'lg',
          'bg-background': background === 'none',
          'bg-muted': background === 'muted',
          'bg-primary': background === 'primary',
          'bg-secondary': background === 'secondary',
          'animate-fade-in': animation === 'fade-in',
          'animate-slide-in': animation === 'slide-in',
          'animate-scale-in': animation === 'scale-in',
        },
        className,
      )}
    >
      {children}
    </div>
  )
}

export default BaseBlock
