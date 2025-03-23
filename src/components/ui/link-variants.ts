import { cva } from "class-variance-authority"

export const linkVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-full", // Rounded corners by default
    "text-sm font-medium ring-offset-background",
    "transition-colors focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "text-primary underline-offset-4",
          "hover:underline",
        ].join(" "),
        
        primary: [
          "bg-primary text-primary-foreground",
          "shadow-sm hover:bg-primary/90",
          "active:scale-[0.98]",
          "px-4 py-2",
        ].join(" "),
        
        secondary: [
          "bg-secondary text-secondary-foreground",
          "shadow-sm hover:bg-secondary/80",
          "active:scale-[0.98]",
          "px-4 py-2",
        ].join(" "),
        
        outline: [
          "border-2 border-input bg-background",
          "hover:bg-accent hover:text-accent-foreground",
          "px-4 py-2",
        ].join(" "),
        
        ghost: [
          "hover:bg-accent hover:text-accent-foreground",
          "px-4 py-2",
        ].join(" "),
        
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/90",
          "px-4 py-2",
        ].join(" "),

        card: [
          "bg-card text-card-foreground",
          "border shadow-sm",
          "hover:shadow-md hover:border-accent/50",
          "transition-shadow duration-200",
          "px-4 py-2",
        ].join(" "),

        glass: [
          "backdrop-blur-md bg-background/60",
          "border border-border/50",
          "hover:bg-accent/10 hover:border-accent/50",
          "px-4 py-2",
        ].join(" "),

        subtle: [
          "bg-muted text-muted-foreground",
          "hover:bg-muted/80",
          "px-4 py-2",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)