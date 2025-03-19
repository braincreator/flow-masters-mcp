'use client'

import { cn } from '@/utilities/ui'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import * as React from 'react'

const Separator: React.FC<
  { ref?: React.Ref<HTMLDivElement> } & React.ComponentProps<typeof SeparatorPrimitive.Root>
> = ({ className, decorative = true, orientation = 'horizontal', ref, ...props }) => (
  <SeparatorPrimitive.Root
    className={cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      className,
    )}
    decorative={decorative}
    orientation={orientation}
    ref={ref}
    {...props}
  />
)

export { Separator }