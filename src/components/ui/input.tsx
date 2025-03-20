import * as React from "react"
import { cn } from "@/utilities/ui"
import { inputVariants } from "./styles"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: "default" | "sm" | "lg"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          inputVariants({ size }),
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
