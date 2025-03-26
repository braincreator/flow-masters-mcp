import { cva } from 'class-variance-authority'

export const linkVariants = cva(
  [
    'inline-flex items-center gap-2',
    'rounded-md text-sm font-medium',
    'ring-offset-background transition-colors',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'text-foreground/80 relative h-fit', // Base color with 80% opacity
          'dark:text-foreground/95', // Lighter text in dark mode (95% opacity)
          'hover:text-accent dark:hover:text-accent', // Accent color on hover for both modes
          'after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[1px]',
          'after:bg-gradient-to-r after:from-accent/0 after:via-accent after:to-accent/0',
          'after:opacity-0 after:transform after:scale-x-0',
          'hover:after:opacity-100 hover:after:scale-x-100',
          'after:transition-all after:duration-300',
        ].join(' '),

        primary: [
          'bg-accent text-accent-foreground',
          'shadow-sm hover:bg-accent/90',
          'dark:bg-accent/90 dark:hover:bg-accent', // Increased contrast for dark mode
          'active:scale-[0.98]',
          'px-4 py-2',
        ].join(' '),

        secondary: [
          'bg-secondary text-secondary-foreground',
          'shadow-sm hover:bg-secondary/80',
          'dark:bg-secondary/90 dark:hover:bg-secondary', // Increased contrast for dark mode
          'active:scale-[0.98]',
          'px-4 py-2',
        ].join(' '),

        outline: [
          'border-2 border-input bg-background',
          'hover:bg-accent/10 hover:text-accent hover:border-accent',
          'dark:text-accent/90 dark:hover:text-accent', // Increased contrast for dark mode
          'dark:border-accent/30 dark:hover:border-accent/90',
          'px-4 py-2',
        ].join(' '),

        ghost: [
          'hover:bg-accent/10 hover:text-accent',
          'dark:text-accent/90 dark:hover:text-accent', // Increased contrast for dark mode
          'dark:hover:bg-accent/20',
          'px-4 py-2',
        ].join(' '),

        inline: [
          'text-accent relative h-fit',
          'dark:text-accent/95', // Increased contrast for dark mode
          'after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[1px]',
          'after:bg-gradient-to-r after:from-accent/0 after:via-accent after:to-accent/0',
          'after:opacity-0 after:transform after:scale-x-0',
          'hover:after:opacity-100 hover:after:scale-x-100',
          'after:transition-all after:duration-300',
        ].join(' '),

        accent: [
          'bg-accent text-accent-foreground',
          'shadow-sm hover:bg-accent/90',
          'dark:bg-accent/90 dark:hover:bg-accent', // Increased contrast for dark mode
          'active:scale-[0.98]',
          'px-4 py-2',
        ].join(' '),
      },
      size: {
        default: 'px-4',
        sm: 'px-3 text-xs',
        lg: 'px-6 text-base',
        icon: 'w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
