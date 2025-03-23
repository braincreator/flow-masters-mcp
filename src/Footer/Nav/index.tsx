'use client'

import React from 'react'
import type { Footer as FooterType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Button } from '@/components/ui/button'

interface FooterNavProps {
  data: FooterType
  variant: 'main' | 'bottom'
}

export const FooterNav: React.FC<FooterNavProps> = ({ data, variant }) => {
  const navItems = variant === 'main' 
    ? data?.mainNavItems || []
    : data?.bottomNavItems || []

  if (variant === 'main') {
    return (
      <div className="space-y-2">
        <ul className="space-y-2">
          {navItems?.map(({ link }, i) => (
            <li key={i}>
              <CMSLink
                {...link}
                reference={link.reference?.value ? {
                  relationTo: link.reference.relationTo,
                  value: typeof link.reference.value === 'string' 
                    ? link.reference.value 
                    : link.reference.value.slug
                } : undefined}
                newTab={link.newTab || false}
                className="relative text-muted-foreground hover:text-accent transition-all duration-300
                  after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px 
                  after:bg-gradient-to-r after:from-accent/0 after:via-accent after:to-accent/0
                  after:opacity-0 after:transform after:scale-x-0
                  hover:after:opacity-100 hover:after:scale-x-100
                  after:transition-all after:duration-300"
              />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      {navItems?.map(({ link }, i) => (
        <CMSLink
          key={i}
          {...link}
          className="text-sm text-muted-foreground hover:text-accent transition-all duration-300
            relative after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px 
            after:bg-gradient-to-r after:from-accent/0 after:via-accent after:to-accent/0
            after:opacity-0 after:transform after:scale-x-0
            hover:after:opacity-100 hover:after:scale-x-100
            after:transition-all after:duration-300"
        />
      ))}
    </div>
  )
}
