import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utilities/ui'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap rounded-md',
    'text-sm font-medium ring-offset-background transition-colors duration-300',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-primary text-primary-foreground',
          'shadow-sm hover:bg-primary/90',
          'active:scale-[0.98]',
          'dark:bg-primary dark:text-primary-foreground',
          'dark:hover:bg-primary/80',
        ].join(' '),
        destructive: [
          'bg-destructive text-destructive-foreground',
          'shadow-sm hover:bg-destructive/90',
          'active:scale-[0.98]',
          'dark:hover:bg-destructive/80',
        ].join(' '),
        outline: [
          'border-2 border-input bg-background',
          'hover:bg-accent/10 hover:text-accent hover:border-accent',
          'dark:border-input dark:bg-background',
          'dark:hover:bg-accent/20 dark:hover:text-accent-foreground',
        ].join(' '),
        secondary: [
          'bg-secondary text-secondary-foreground',
          'shadow-sm hover:bg-secondary/80',
          'active:scale-[0.98]',
          'dark:bg-secondary dark:text-secondary-foreground',
          'dark:hover:bg-secondary/70',
        ].join(' '),
        ghost: [
          'hover:bg-accent/10 hover:text-accent',
          'dark:hover:bg-accent/20 dark:hover:text-accent-foreground',
        ].join(' '),
        link: [
          'text-primary underline-offset-4',
          'hover:underline',
        ].join(' '),
        accent: [
          'bg-accent text-accent-foreground',
          'shadow-sm hover:bg-accent/90',
          'active:scale-[0.98]',
        ].join(' '),
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
