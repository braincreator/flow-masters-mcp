import * as React from "react"
import { cn } from "@/utilities/ui"

const Grid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    cols?: 1 | 2 | 3 | 4 | 5 | 6
    gap?: 'sm' | 'md' | 'lg'
  }
>(({ className, cols = 3, gap = 'md', ...props }, ref) => {
  const gapClass = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  }[gap]

  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
  }[cols]

  return (
    <div
      ref={ref}
      className={cn(
        "grid",
        colsClass,
        gapClass,
        className
      )}
      {...props}
    />
  )
})
Grid.displayName = "Grid"

const GridItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(className)}
    {...props}
  />
))
GridItem.displayName = "GridItem"

export { Grid, GridItem }
