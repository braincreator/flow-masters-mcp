import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utilities/ui"

const buttonVariants = cva(
  "button-base inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300",
  {
    variants: {
      variant: {
        default: [
          // Modern gradient with subtle depth
          "bg-gradient-to-br from-primary to-primary/90",
          "text-primary-foreground",
          "shadow-lg shadow-primary/20",
          // Hover state
          "hover:from-primary/95 hover:to-primary/85",
          "hover:shadow-xl hover:shadow-primary/30",
          "hover:scale-[1.02]",
          // Dark mode adjustments
          "dark:shadow-primary/30",
          "dark:hover:shadow-primary/40"
        ],
        destructive: [
          // Error/danger style
          "bg-gradient-to-br from-destructive to-destructive/90",
          "text-destructive-foreground",
          "shadow-lg shadow-destructive/20",
          // Hover state
          "hover:from-destructive/95 hover:to-destructive/85",
          "hover:shadow-xl hover:shadow-destructive/30",
          "hover:scale-[1.02]",
          // Dark mode
          "dark:shadow-destructive/30",
          "dark:hover:shadow-destructive/40"
        ],
        outline: [
          // Clean outline style
          "border-2",
          "bg-background/50",
          "backdrop-blur-sm",
          "border-input",
          "text-foreground",
          "shadow-sm",
          // Hover state
          "hover:bg-accent/10",
          "hover:border-accent",
          "hover:text-accent-foreground",
          "hover:shadow-md",
          // Dark mode
          "dark:bg-background/5",
          "dark:border-border/40",
          "dark:hover:border-accent/60",
          "dark:hover:bg-accent/20"
        ],
        secondary: [
          // Subtle secondary style
          "bg-gradient-to-br from-secondary to-secondary/90",
          "text-secondary-foreground",
          "shadow-md shadow-secondary/10",
          // Hover state
          "hover:from-secondary/95 hover:to-secondary/85",
          "hover:shadow-lg hover:shadow-secondary/20",
          "hover:scale-[1.02]",
          // Dark mode
          "dark:from-secondary/20 dark:to-secondary/10",
          "dark:hover:from-secondary/30 dark:hover:to-secondary/20"
        ],
        ghost: [
          // Minimal ghost style
          "bg-transparent",
          "text-foreground/80",
          "border border-transparent",
          // Hover state
          "hover:bg-accent/10",
          "hover:text-accent-foreground",
          "hover:border-accent/20",
          // Dark mode
          "dark:text-foreground/70",
          "dark:hover:bg-accent/20",
          "dark:hover:text-foreground"
        ],
        link: [
          // Enhanced link style
          "text-primary",
          "underline-offset-4",
          "hover:underline",
          "hover:text-primary/80",
          // Dark mode
          "dark:text-primary/90",
          "dark:hover:text-primary/70"
        ],
      },
      size: {
        default: "h-12 px-6 py-3 text-base md:text-lg rounded-lg",
        sm: "h-10 px-4 py-2 text-sm md:text-base rounded-md",
        lg: "h-14 px-8 py-4 text-lg md:text-xl rounded-lg",
        icon: "h-12 w-12 rounded-lg text-base md:text-lg",
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
