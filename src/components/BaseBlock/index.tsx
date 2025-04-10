import React from 'react'
import { BaseBlockProps } from '../../types/blocks'
import { cn } from '@/utilities/cn'

export const BaseBlock: React.FC<BaseBlockProps> = ({
  blockType,
  blockName,
  settings = {},
  className,
  style,
  children,
}) => {
  const {
    size = 'md',
    style: blockStyle = 'default',
    background = 'none',
    animation = 'none',
    className: settingsClassName,
  } = settings

  const blockClasses = cn(
    'block relative w-full',
    // Size variants
    {
      'max-w-5xl mx-auto px-4': size === 'md',
      'max-w-7xl mx-auto px-6': size === 'lg',
      'container mx-auto px-8': size === 'xl',
      'w-full': size === 'full',
      'max-w-3xl mx-auto px-4': size === 'sm',
    },
    // Style variants
    {
      'border rounded-lg': blockStyle === 'bordered',
      'shadow-lg rounded-lg': blockStyle === 'elevated',
      'bg-transparent': blockStyle === 'minimal',
    },
    // Background variants
    {
      'bg-gray-50': background === 'light',
      'bg-gray-900 text-white': background === 'dark',
      'bg-primary-50': background === 'primary',
      'bg-gradient-to-r from-primary-500 to-secondary-500 text-white': background === 'gradient',
    },
    // Animation variants
    {
      'animate-fade-in': animation === 'fade',
      'animate-slide-in': animation === 'slide',
      'animate-scale-in': animation === 'scale',
    },
    className,
    settingsClassName,
  )

  return (
    <section
      className={blockClasses}
      style={style}
      data-block-type={blockType}
      data-block-name={blockName}
    >
      {children}
    </section>
  )
}

export default BaseBlock
