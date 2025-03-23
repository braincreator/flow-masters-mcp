import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { linkVariants } from "./link-variants"
import NextLink from "next/link"

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  href: string
  external?: boolean
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, size, href, external, children, ...props }, ref) => {
    if (external) {
      return (
        <a
          ref={ref}
          href={href}
          className={cn(linkVariants({ variant, size }), className)}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      )
    }

    return (
      <NextLink
        ref={ref}
        href={href}
        className={cn(linkVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </NextLink>
    )
  }
)
Link.displayName = "Link"

export { Link, linkVariants }