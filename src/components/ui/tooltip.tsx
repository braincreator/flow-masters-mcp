'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import { cn } from '@/utilities/ui'

// Улучшенный TooltipProvider c настройками задержки
const TooltipProvider = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Provider>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>
>(({ delayDuration = 300, skipDelayDuration = 300, ...props }, ref) => (
  <TooltipPrimitive.Provider
    delayDuration={delayDuration}
    skipDelayDuration={skipDelayDuration}
    {...props}
  />
))
TooltipProvider.displayName = TooltipPrimitive.Provider.displayName

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

// Экспортируем TooltipPortal для корректного размещения вне родительских контейнеров
const TooltipPortal = TooltipPrimitive.Portal

// Улучшенный TooltipContent с порталом по умолчанию
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    container?: HTMLElement
  }
>(({ className, sideOffset = 4, container, avoidCollisions = true, ...props }, ref) => (
  <TooltipPortal container={container}>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      collisionPadding={10}
      avoidCollisions={avoidCollisions}
      className={cn(
        'z-[9999] overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </TooltipPortal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipPortal }
