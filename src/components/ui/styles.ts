import { cva } from "class-variance-authority"

// Input base styles
export const inputVariants = cva(
  "w-full rounded-lg border border-input bg-background transition-all duration-200",
  {
    variants: {
      size: {
        default: "h-12 px-4 py-3 text-base md:text-lg",
        sm: "h-10 px-3 py-2 text-sm md:text-base",
        lg: "h-14 px-6 py-4 text-lg md:text-xl",
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

// Card base styles
export const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      size: {
        default: "p-6 text-base md:text-lg",
        sm: "p-4 text-sm md:text-base",
        lg: "p-8 text-lg md:text-xl"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

// Navigation item styles
export const navItemVariants = cva(
  "transition-colors duration-200",
  {
    variants: {
      size: {
        default: "text-base md:text-lg",
        sm: "text-sm md:text-base",
        lg: "text-lg md:text-xl"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

// Heading styles
export const headingVariants = cva(
  "font-bold tracking-tight",
  {
    variants: {
      level: {
        h1: "text-3xl md:text-4xl lg:text-5xl",
        h2: "text-2xl md:text-3xl lg:text-4xl",
        h3: "text-xl md:text-2xl lg:text-3xl",
        h4: "text-lg md:text-xl lg:text-2xl",
        h5: "text-base md:text-lg lg:text-xl",
        h6: "text-sm md:text-base lg:text-lg"
      }
    },
    defaultVariants: {
      level: "h1"
    }
  }
)

// Badge styles
export const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium transition-colors",
  {
    variants: {
      size: {
        default: "px-4 py-2 text-base md:text-lg",
        sm: "px-3 py-1 text-sm md:text-base",
        lg: "px-6 py-3 text-lg md:text-xl"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)