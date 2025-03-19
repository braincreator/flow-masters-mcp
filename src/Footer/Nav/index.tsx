'use client'

import React from 'react'
import type { Footer as FooterType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Button } from '@/components/ui/button'

interface FooterNavProps {
  data: FooterType
  variant?: 'main' | 'bottom'
}

export const FooterNav: React.FC<FooterNavProps> = ({ data, variant = 'main' }) => {
  const navItems = data?.navItems || []

  if (variant === 'main') {
    return (
      <div className="space-y-2">
        <ul className="space-y-2">
          {navItems?.map(({ link }, i) => (
            <li key={i}>
              <CMSLink
                {...link}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
        <Button key={i} variant="ghost" size="sm" asChild>
          <CMSLink {...link} />
        </Button>
      ))}
    </div>
  )
}
