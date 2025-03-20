import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utilities/ui"

const buttonVariants = cva(
  "button-base inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300",
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground",
          "hover:from-primary/90 hover:via-primary/90 hover:to-primary/80",
          "shadow-md shadow-primary/10",
          "hover:shadow-lg hover:shadow-primary/20",
          "dark:shadow-none dark:hover:shadow-primary/20"
        ],
        destructive: [
          "bg-gradient-to-br from-destructive via-destructive to-destructive/90 text-destructive-foreground",
          "hover:from-destructive/90 hover:via-destructive/90 hover:to-destructive/80",
          "shadow-md shadow-destructive/10",
          "hover:shadow-lg hover:shadow-destructive/20"
        ],
        outline: [
          "border-2 border-input bg-background",
          "hover:bg-accent/5 hover:text-accent-foreground hover:border-accent",
          "dark:border-border/40",
          "dark:hover:bg-accent/10",
          "dark:hover:border-accent/60",
          "shadow-sm hover:shadow-md"
        ],
        secondary: [
          "bg-gradient-to-br from-secondary via-secondary to-secondary/90 text-secondary-foreground",
          "hover:from-secondary/90 hover:via-secondary/90 hover:to-secondary/80",
          "dark:from-secondary/20 dark:via-secondary/20 dark:to-secondary/10",
          "dark:hover:from-secondary/30 dark:hover:via-secondary/30 dark:hover:to-secondary/20",
          "shadow-sm shadow-secondary/10",
          "hover:shadow-md hover:shadow-secondary/20"
        ],
        ghost: [
          "hover:bg-accent/5 hover:text-accent-foreground",
          "dark:text-foreground dark:hover:bg-accent/10",
          "border border-transparent",
          "hover:border-accent/20",
          "dark:hover:border-accent/20"
        ],
        link: [
          "text-primary underline-offset-4 hover:underline",
          "dark:text-primary"
        ],
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-md px-4",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
