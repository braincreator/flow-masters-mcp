'use client'

import React from 'react'
import type { Footer as FooterType } from '@/payload-types'
import { CMSLink } from '@/components/Link'

interface FooterNavProps {
  data?: FooterType
  variant: 'main' | 'bottom'
}

export const FooterNav: React.FC<FooterNavProps> = ({ data, variant }) => {
  // Safely get nav items with proper type checking
  const getNavItems = () => {
    if (!data) return []

    if (variant === 'main') {
      return Array.isArray(data.mainNavItems) ? data.mainNavItems : []
    }

    return Array.isArray(data.bottomNavItems) ? data.bottomNavItems : []
  }

  const navItems = getNavItems()

  if (variant === 'main') {
    return (
      <div className="space-y-2">
        <ul className="space-y-2">
          {navItems.map(({ link }, i) => (
            <li key={i}>
              <CMSLink
                {...link}
                type={link?.type || 'custom'}
                reference={
                  link?.type === 'reference' && link?.reference
                    ? {
                        relationTo: link.reference.relationTo,
                        value: link.reference.value,
                      }
                    : undefined
                }
                url={link?.type === 'custom' ? link?.url : undefined}
                newTab={link?.newTab || false}
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
      {navItems.map(({ link }, i) => (
        <CMSLink
          key={i}
          {...link}
          type={link?.type || 'custom'}
          reference={
            link?.type === 'reference' && link?.reference
              ? {
                  relationTo: link.reference.relationTo,
                  value: link.reference.value,
                }
              : undefined
          }
          url={link?.type === 'custom' ? link?.url : undefined}
          newTab={link?.newTab || false}
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
