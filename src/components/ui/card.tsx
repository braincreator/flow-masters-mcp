import * as React from "react"
import { cn } from "@/utilities/ui"
import { cardVariants } from "./styles"

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "sm" | "lg"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ size }),
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

export { Card }
