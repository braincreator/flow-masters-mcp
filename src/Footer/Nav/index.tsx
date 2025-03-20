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
                appearance="secondary"
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
          appearance="ghost"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        />
      ))}
    </div>
  )
}
