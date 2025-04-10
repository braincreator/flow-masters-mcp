import type { BaseBlockSize } from '@/components/BaseBlock'
import type {
  BlockStyle,
  BlockHover,
  BlockSizeConfig,
  BlockStyleConfig,
} from '@/types/block-styles'

export const blockSizeStyles: Record<BaseBlockSize, BlockSizeConfig> = {
  sm: {
    container: 'p-4',
    title: 'text-lg font-semibold tracking-tight',
    content: 'text-sm text-muted-foreground',
  },
  md: {
    container: 'p-6',
    title: 'text-xl font-semibold tracking-tight',
    content: 'text-base text-muted-foreground',
  },
  lg: {
    container: 'p-8',
    title: 'text-2xl font-semibold tracking-tight',
    content: 'text-lg text-muted-foreground',
  },
}

export const blockStyleVariants: Record<BlockStyle, BlockStyleConfig> = {
  default: {
    background: 'bg-card',
    text: 'text-card-foreground',
  },
  bordered: {
    background: 'bg-background',
    text: 'text-foreground',
    border: 'border-2 border-primary',
  },
  minimal: {
    background: 'bg-transparent',
    text: 'text-foreground',
  },
  elevated: {
    background: 'bg-card',
    text: 'text-card-foreground',
    shadow: 'shadow-lg',
  },
  gradient: {
    background: 'bg-gradient-to-br from-primary to-primary/80',
    text: 'text-primary-foreground',
  },
}

export const blockHoverStyles: Record<BlockHover, string> = {
  none: '',
  lift: 'transition-transform hover:-translate-y-1',
  glow: 'transition-shadow hover:shadow-xl hover:shadow-primary/20',
  scale: 'transition-transform hover:scale-[1.02]',
}

export const blockAnimationStyles = {
  fadeIn: 'animate-in fade-in duration-700',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-700',
  scaleUp: 'animate-in zoom-in duration-700',
}
