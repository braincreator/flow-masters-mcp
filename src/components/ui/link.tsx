import * as React from 'react'
import NextLink from 'next/link'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utilities/ui'
import { linkVariants } from './link-variants'

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  href: string
  external?: boolean
  asChild?: boolean
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, size, href, external, asChild, children, ...props }, ref) => {
    const Comp = asChild ? Slot : external ? 'a' : NextLink

    return (
      <Comp
        ref={ref}
        href={href}
        className={cn(linkVariants({ variant, size, className }))}
        {...(external && {
          target: "_blank",
          rel: "noopener noreferrer",
        })}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Link.displayName = 'Link'

export { Link, linkVariants }
