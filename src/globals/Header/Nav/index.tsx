'use client'

import React from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/providers/CartProvider'
import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/ui'

interface HeaderNavProps {
  data: HeaderType
  mobile?: boolean
  onMobileMenuClose?: () => void
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ data, mobile = false, onMobileMenuClose }) => {
  // Ensure navItems is an array with proper type checking
  const navItems = Array.isArray(data?.navItems) ? data.navItems : []
  const { itemCount = 0 } = useCart()
  const pathname = usePathname()
  const currentLocale = pathname?.split('/')[1] || 'en'

  if (mobile) {
    return (
      <nav className="flex flex-col items-start gap-4">
        {navItems.map(({ link }, i) => (
          <CMSLink
            key={i}
            {...link}
            size="lg"
            className="relative text-foreground/90 active:text-accent active:scale-98 transition-all duration-300
              text-xl font-medium py-3 w-full border-b border-border/10 flex items-center"
            onClick={() => {
              // Закрываем мобильное меню при клике на ссылку
              if (onMobileMenuClose) {
                onMobileMenuClose()
              }
            }}
          />
        ))}
      </nav>
    )
  }

  return (
    <nav className="flex items-center gap-4">
      {navItems.map(({ link }, i) => (
        <CMSLink
          key={i}
          {...link}
          size="default"
          className="relative text-foreground/80 hover:text-accent transition-all duration-300
            after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px 
            after:bg-gradient-to-r after:from-accent/0 after:via-accent after:to-accent/0
            after:opacity-0 after:transform after:scale-x-0
            hover:after:opacity-100 hover:after:scale-x-100
            after:transition-all after:duration-300
            hover:translate-y-[-1px] px-1"
        />
      ))}
    </nav>
  )
}
