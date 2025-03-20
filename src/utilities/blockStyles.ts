import { cva } from 'class-variance-authority'
import type { BlockAppearance } from '@/types/appearance'

export const blockVariants = cva(
  'block-base w-full transition-colors duration-200',
  {
    variants: {
      appearance: {
        default: [
          'bg-background',
          'text-foreground',
        ],
        primary: [
          'bg-primary',
          'text-primary-foreground',
        ],
        secondary: [
          'bg-secondary',
          'text-secondary-foreground',
        ],
        outline: [
          'bg-transparent',
          'border-2',
          'border-primary',
          'text-foreground',
        ],
        ghost: [
          'bg-transparent',
          'text-foreground',
          'hover:bg-muted/50',
        ],
        subtle: [
          'bg-muted',
          'text-muted-foreground',
        ],
        transparent: [
          'bg-transparent',
          'text-foreground',
        ],
      },
      padding: {
        none: '',
        small: 'py-4 px-6',
        medium: 'py-8 px-8',
        large: 'py-12 px-10',
      },
    },
    defaultVariants: {
      appearance: 'default',
      padding: 'medium',
    },
  }
)

export interface BlockStyleProps {
  appearance?: BlockAppearance
  padding?: 'none' | 'small' | 'medium' | 'large'
  className?: string
}