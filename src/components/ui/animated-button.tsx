'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button, ButtonProps } from './button'
import { cn } from '@/utilities/ui'

export interface AnimatedButtonProps extends ButtonProps {
  animateOnHover?: boolean
  animateOnTap?: boolean
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animateOnHover = true, 
    animateOnTap = true, 
    asChild = false, 
    ...props 
  }, ref) => {
    const Comp = asChild ? motion.div : motion.button

    return (
      <Comp
        ref={ref}
        className={cn('inline-flex items-center justify-center rounded-full', className)}
        whileHover={animateOnHover ? { scale: 1.02 } : undefined}
        whileTap={animateOnTap ? { scale: 0.98 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Button
          variant={variant}
          size={size}
          className="pointer-events-none w-full h-full"
          {...props}
        />
      </Comp>
    )
  }
)
AnimatedButton.displayName = 'AnimatedButton'

export { AnimatedButton }
